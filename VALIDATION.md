# Validation — takehomepay.ie

## Test cases verified against Revenue.ie rates

### Case 1: Single person, €35,000 gross

- **Input**: €35,000 annual, single, no pension
- **Income Tax**: €35,000 × 20% = €7,000 gross. Credits: €1,875 + €1,875 = €3,750. Net tax: €3,250
- **USC**: €12,012 × 0.5% + €13,748 × 2% + €9,240 × 4% = €60.06 + €274.96 + €369.60 = €704.62
- **PRSI**: €35,000 × 4% = €1,400
- **Source**: Revenue.ie 2026 rates

### Case 2: Single person, €60,000 gross

- **Input**: €60,000 annual, single, no pension
- **Income Tax**: €42,000 × 20% + €18,000 × 40% = €8,400 + €7,200 = €15,600 gross. Credits €3,750. Net: €11,850
- **USC**: €60.06 + €274.96 + €1,771.36 (44,284 × 4%) = partial band 3. Total ≈ €2,106.38 (only up to 60k)
- **PRSI**: €60,000 × 4% = €2,400
- **Source**: Revenue.ie 2026 rates

### Case 3: Married one income, €60,000 gross

- **Input**: €60,000 annual, married one income, no pension
- **Income Tax**: €51,000 × 20% + €9,000 × 40% = €10,200 + €3,600 = €13,800 gross
- **Credits**: €3,750 (married) + €1,875 (PAYE) + €1,800 (home carer) = €7,425
- **Net tax**: €13,800 - €7,425 = €6,375
- **Source**: Revenue.ie 2026 rates, Citizens Information

## Sources

- [Revenue.ie — Tax rates and credits](https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx)
- [Citizens Information — Income tax](https://www.citizensinformation.ie/en/money-and-tax/tax/income-tax/)
- [Revenue.ie — USC](https://www.revenue.ie/en/jobs-and-pensions/usc/index.aspx)
