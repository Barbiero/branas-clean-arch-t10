export default class CurrencyTable {
  #values = new Map<string, number>([['BRL', 1]]);

  constructor(entries: Record<string, number> = {}) {
    for (const [currency, value] of Object.entries(entries)) {
      this.addCurrency(currency, value);
    }
  }

  addCurrency(currency: string, value: number) {
    this.#values.set(currency.toUpperCase(), value);
  }

  getCurrencyValue(currency: string): number {
    const value = this.#values.get(currency.toUpperCase());
    if (typeof value !== 'number') {
      throw new Error('Currency not found');
    }
    return value;
  }
}
