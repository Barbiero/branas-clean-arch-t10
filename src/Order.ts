import Cpf from './Cpf.js';
import SaleItem from './SaleItem.js';

export default class Order {
  readonly buyer: Cpf;
  constructor(buyer: Cpf | string, readonly saleItems: SaleItem[], readonly discount: number = 0) {
    if (!(buyer instanceof Cpf)) {
      this.buyer = new Cpf(buyer);
    } else {
      this.buyer = buyer;
    }
    
    if (this.discount < 0 || this.discount > 1) {
      throw new Error('Sale discount must be between 0 and 100%');
    }
  }

  getTotalCost() {
    const basePrice = this.saleItems.reduce((acc, curr) => acc + curr.getTotalCost(), 0.0);
    const discount = basePrice * this.discount;
    return basePrice - discount;
  }
}
