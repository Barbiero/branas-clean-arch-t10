import Product from './Product.js';

export default class SaleItem {
  constructor(readonly product: Product, readonly quantity: number) {
    if (this.quantity <= 0) {
      throw new Error('Sale Item must have some positive quantity');
    }
  }

  getTotalCost() {
    return this.product.price * this.quantity;
  }

  getFreightCost(distanceKm: number) {
    return this.product.getFreightCost(distanceKm) * this.quantity;
  }
}
