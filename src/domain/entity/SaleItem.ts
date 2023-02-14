import CurrencyTable from './CurrencyTable.js';
import Product from './Product.js';

export default class SaleItem {
  constructor(readonly product: Product, readonly quantity: number) {
    if (this.quantity <= 0) {
      throw new Error('Sale Item must have some positive quantity');
    }
  }

  getTotalCost(currencies: CurrencyTable) {
    return this.product.getPrice(currencies) * this.quantity;
  }
}
