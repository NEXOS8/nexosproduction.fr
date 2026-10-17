export function calculateAcquisition({ budget, leads, customers, basket, margin }) {
  const values = [budget, leads, customers, basket, margin];
  if (values.some(value => !Number.isFinite(value) || value < 0)
      || !Number.isInteger(leads) || !Number.isInteger(customers)
      || customers > leads || margin > 100) {
    throw new RangeError('Vérifiez les montants, les volumes et le taux de marge.');
  }
  const revenue = customers * basket;
  const grossMargin = revenue * margin / 100;
  return {
    costPerLead: leads > 0 ? budget / leads : null,
    costPerCustomer: customers > 0 ? budget / customers : null,
    conversion: leads > 0 ? customers / leads : null,
    revenue,
    grossMargin,
    contribution: grossMargin - budget,
  };
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#acquisition-calculator');
  if (form) {
    form.hidden = false;
    const result = document.querySelector('#acquisition-results');
    const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
    const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
    const hideResult = () => {
      result.hidden = true;
      form.elements.customers.setCustomValidity('');
    };
    form.addEventListener('input', hideResult);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = Object.fromEntries(['budget', 'leads', 'customers', 'basket', 'margin']
        .map(name => [name, form.elements[name].valueAsNumber]));
      const customers = form.elements.customers;
      customers.setCustomValidity(input.customers > input.leads
        ? 'Le nombre de clients doit être inférieur ou égal au nombre de demandes du même groupe.' : '');
      if (!form.reportValidity()) return;
      const metrics = calculateAcquisition(input);
      const entries = {
        'cost-per-lead': metrics.costPerLead,
        'cost-per-customer': metrics.costPerCustomer,
        'estimated-revenue': metrics.revenue,
        'gross-margin': metrics.grossMargin,
        'contribution': metrics.contribution,
      };
      for (const [id, value] of Object.entries(entries)) {
        document.getElementById(id).textContent = value === null ? 'Non calculable' : money.format(value);
      }
      document.getElementById('conversion-rate').textContent = metrics.conversion === null
        ? 'Non calculable' : percent.format(metrics.conversion);
      document.getElementById('calculator-interpretation').textContent = metrics.contribution >= 0
        ? 'La marge estimée couvre le budget d’acquisition saisi. Les autres charges restent à déduire pour calculer le bénéfice.'
        : 'La marge estimée ne couvre pas le budget d’acquisition saisi sur ce groupe de prospects. Vérifiez le coût, la transformation, la marge et le délai de vente.';
      result.hidden = false;
    });
    document.querySelector('#calculator-example').addEventListener('click', () => {
      hideResult();
      const example = { budget: 500, leads: 20, customers: 5, basket: 1000, margin: 40 };
      Object.entries(example).forEach(([name, value]) => { form.elements[name].value = value; });
      form.requestSubmit();
    });
  }
}
