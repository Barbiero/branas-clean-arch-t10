import Product from './Product.js';

export default class SaleItem {
  constructor(readonly product: Product, readonly quantity: number) {
    if (this.quantity <= 0) {
      throw new Error('Sale Item must have some positive quantity');
    }
  }

  get currency() {
    return this.product.currency;
  }

  getTotalCost(currencies: Record<string, number>) {
    return (
      this.product.price * this.quantity * (currencies[this.currency] ?? 1)
    );
  }

  getFreightCost(distanceKm: number, currencies: Record<string, number>) {
    return (
      this.product.getFreightCost(distanceKm) *
      this.quantity *
      (currencies[this.currency] ?? 1)
    );
  }
}
