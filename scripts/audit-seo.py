"""Audit reproductible des pages statiques ; --live vérifie aussi leur publication."""

import argparse
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://www.nexoslocal.fr"


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = []
        self.refs = []
        self.headings = []
        self.title = ""
        self.meta = defaultdict(list)
        self.canonicals = []
        self.schemas = []
        self.images = []
        self.ctas = []
        self.capture = None
        self.json_capture = None
        self.link_capture = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "html":
            self.lang = attrs.get("lang")
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property", ""))].append(attrs.get("content", ""))
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "title" or re.fullmatch(r"h[1-6]", tag):
            self.capture = [tag, ""]
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.json_capture = ""
        if tag == "a":
            self.link_capture = [attrs.get("href", ""), ""]
        if tag in ("a", "link") and attrs.get("href"):
            self.refs.append(attrs["href"])
        if tag in ("script", "img", "iframe") and attrs.get("src"):
            self.refs.append(attrs["src"])
        if tag == "img":
            self.images.append(attrs)
            if attrs.get("srcset"):
                self.refs.extend(candidate.strip().split()[0] for candidate in attrs["srcset"].split(","))

    def handle_data(self, data):
        if self.capture:
            self.capture[1] += data
        if self.json_capture is not None:
            self.json_capture += data
        if self.link_capture:
            self.link_capture[1] += data

    def handle_endtag(self, tag):
        if self.capture and tag == self.capture[0]:
            if tag == "title":
                self.title = self.capture[1].strip()
            else:
                self.headings.append((tag, self.capture[1].strip()))
            self.capture = None
        if tag == "script" and self.json_capture is not None:
            self.schemas.append(json.loads(self.json_capture))
            self.json_capture = None
        if tag == "a" and self.link_capture:
            self.ctas.append(tuple(self.link_capture))
            self.link_capture = None


def route_file(path):
    relative = unquote(path).lstrip("/") or "index.html"
    result = ROOT / relative
    return result if result.suffix else result.with_suffix(".html")


def request(url):
    try:
        with urlopen(Request(url, headers={"User-Agent": "NexosLocal-SEO-Audit/1.0"}), timeout=20) as response:
            body = response.read()
            return url, response.status, response.url, response.headers, body
    except Exception as error:
        return url, getattr(error, "code", 0), "", {}, str(error).encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true")
    args = parser.parse_args()
    sources = {p: p.read_text() for p in sorted(ROOT.glob("*.html"))}
    pages = {p: Page(source) for p, source in sources.items()}
    errors = []
    inbound = defaultdict(set)
    assets = set()
    urls = {}
    titles = Counter(p.title for p in pages.values())
    descriptions = Counter(p.meta["description"][0] for p in pages.values() if p.meta["description"])
    for path, page in pages.items():
        label = path.name
        expected = ORIGIN + ("/" if label == "index.html" else "/" + path.stem)
        urls[expected] = path
        if page.lang != "fr":
            errors.append(f"{label}: langue HTML incorrecte")
        if not page.title or titles[page.title] != 1:
            errors.append(f"{label}: titre vide ou dupliqué")
        if len(page.meta["description"]) != 1 or descriptions[page.meta["description"][0]] != 1:
            errors.append(f"{label}: description manquante ou dupliquée")
        if len([h for h in page.headings if h[0] == "h1"]) != 1:
            errors.append(f"{label}: nombre de H1 différent de 1")
        if page.canonicals != [expected]:
            errors.append(f"{label}: canonique incohérente")
        if "noindex" in " ".join(page.meta["robots"]):
            errors.append(f"{label}: page bloquée par noindex")
        if not page.meta["viewport"]:
            errors.append(f"{label}: viewport manquant")
        if len(page.ids) != len(set(page.ids)):
            errors.append(f"{label}: identifiants HTML dupliqués")
        for image in page.images:
            if "alt" not in image or not image.get("width") or not image.get("height"):
                errors.append(f"{label}: image sans alt ou dimensions : {image.get('src')}")
        for href, text in page.ctas:
            if re.search(r"Théo|\bme contacter\b", text, re.I):
                errors.append(f"{label}: libellé personnel : {text}")
        for ref in page.refs + page.meta["og:image"] + page.meta["twitter:image"]:
            resolved = urlsplit(urljoin(expected, ref))
            if resolved.netloc != urlsplit(ORIGIN).netloc:
                continue
            target = route_file(resolved.path)
            if not target.is_file():
                errors.append(f"{label}: référence locale absente : {ref}")
                continue
            if target in pages:
                if target != path:
                    inbound[target].add(path)
                if resolved.fragment and unquote(resolved.fragment) not in pages[target].ids:
                    errors.append(f"{label}: ancre absente : {ref}")
            else:
                assets.add(ORIGIN + resolved.path + ("?" + resolved.query if resolved.query else ""))
        if page.schemas:
            nodes = [node for schema in page.schemas for node in schema.get("@graph", [schema])]
            ids = {n.get("@id"): n for n in nodes if n.get("@id")}
            org = ids.get(ORIGIN + "/#business", {})
            if org.get("@type") != "Organization" or org.get("name") != "NexosLocal":
                errors.append(f"{label}: organisation absente ou incohérente")
            for node in nodes:
                if node.get("@type") == "Service":
                    if node.get("url") != expected or node.get("provider", {}).get("@id") not in ids:
                        errors.append(f"{label}: service ou fournisseur incohérent")
                if node.get("@type") == "Article":
                    if node.get("author", {}).get("@id") not in ids:
                        errors.append(f"{label}: auteur de l’article non défini")
                if node.get("@type") == "BreadcrumbList":
                    items = node["itemListElement"]
                    if [i["position"] for i in items] != list(range(1, len(items) + 1)) or items[-1]["item"] != expected:
                        errors.append(f"{label}: fil d’Ariane incohérent")
            for key in ("og:title", "og:description", "og:url", "og:image", "twitter:card"):
                if len(page.meta[key]) != 1:
                    errors.append(f"{label}: métadonnée sociale absente ou dupliquée : {key}")
            if page.meta["og:url"] != [expected] or page.meta["og:title"] != [page.title]:
                errors.append(f"{label}: partage social incohérent")

    for path in pages:
        if path.name != "index.html" and not inbound[path]:
            errors.append(f"{path.name}: page orpheline")
    tree = ET.parse(ROOT / "sitemap.xml")
    sitemap_urls = [node.text for node in tree.findall(".//{*}loc")]
    if len(sitemap_urls) != len(set(sitemap_urls)) or set(sitemap_urls) != set(urls):
        errors.append("Sitemap : URL absente, inconnue ou dupliquée")
    if f"Sitemap: {ORIGIN}/sitemap.xml" not in (ROOT / "robots.txt").read_text():
        errors.append("Robots : déclaration du sitemap absente")
    manifest = json.loads((ROOT / "site.webmanifest").read_text())
    for icon in manifest.get("icons", []):
        icon_url = urljoin(ORIGIN, icon["src"])
        if not route_file(urlsplit(icon_url).path).is_file():
            errors.append(f"Manifeste : icône absente : {icon_url}")
        assets.add(icon_url)
    # Les imports de modules et ressources CSS doivent aussi être contrôlés en production.
    pending = list(assets)
    inspected = set()
    while pending:
        asset_url = pending.pop()
        if asset_url in inspected:
            continue
        inspected.add(asset_url)
        asset_file = route_file(urlsplit(asset_url).path)
        if asset_file.suffix not in (".js", ".mjs", ".css"):
            continue
        source = asset_file.read_text()
        refs = (re.findall(r"url\(\s*['\"]?([^\s)'\"]+)", source)
                if asset_file.suffix == ".css" else
                re.findall(r"\b(?:import|export)\s+(?:[^;\n]*?\s+from\s+)?['\"]([^'\"]+)['\"]", source))
        for ref in refs:
            imported = urljoin(asset_url, ref)
            if urlsplit(imported).netloc != urlsplit(ORIGIN).netloc:
                continue
            if not route_file(urlsplit(imported).path).is_file():
                errors.append(f"Import local absent : {imported}")
            elif imported not in assets:
                assets.add(imported)
                pending.append(imported)
    live_count = 0
    if args.live:
        targets = list(urls) + sorted(assets) + [ORIGIN + "/robots.txt", ORIGIN + "/sitemap.xml"]
        with ThreadPoolExecutor(max_workers=6) as pool:
            for url, status, final, headers, body in pool.map(request, targets):
                live_count += 1
                if status != 200 or final != url:
                    errors.append(f"HTTP {status}: {url} → {final}")
                if url in urls and body != sources[urls[url]].encode():
                    errors.append(f"Publication différente des fichiers locaux : {url}")
                if url in assets or url in (ORIGIN + "/robots.txt", ORIGIN + "/sitemap.xml"):
                    if body != route_file(urlsplit(url).path).read_bytes():
                        errors.append(f"Ressource publiée différente du fichier local : {url}")
                if "noindex" in headers.get("X-Robots-Tag", ""):
                    errors.append(f"X-Robots-Tag noindex : {url}")
    print(json.dumps({"pages": len(pages), "sitemap_urls": len(sitemap_urls), "references": sum(len(p.refs) for p in pages.values()), "schemas": sum(len(p.schemas) for p in pages.values()), "live_requests": live_count, "errors": errors, "status": "PASS" if not errors else "FAIL"}, ensure_ascii=False, indent=2))
    raise SystemExit(bool(errors))


if __name__ == "__main__":
    main()
