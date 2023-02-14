import { Temporal } from '@js-temporal/polyfill';
import Coupon from './Coupon.js';
import Cpf from './Cpf.js';
import CurrencyTable from './CurrencyTable.js';
import FreightCalculator from './FreightCalculator.js';
import Product from './Product.js';
import SaleItem from './SaleItem.js';

export default class Order {
  readonly buyer: Cpf;
  readonly saleItems: SaleItem[] = [];
  #coupon: Coupon | null = null;

  constructor(
    readonly idOrder: string,
    buyer: Cpf | string,
    readonly currencyTable: CurrencyTable = new CurrencyTable(),
  ) {
    if (!(buyer instanceof Cpf)) {
      this.buyer = new Cpf(buyer);
    } else {
      this.buyer = buyer;
    }
  }

  addItem(product: Product, quantity: number) {
    if (this.saleItems.some((item) => item.product.id === product.id)) {
      throw new Error('Duplicate item');
    }

    this.saleItems.push(new SaleItem(product, quantity));
  }

  addCoupon(coupon: Coupon) {
    this.#coupon = coupon;
  }

  getTotal(): number {
    let total = 0;
    for (const item of this.saleItems) {
      total += item.getTotalCost(this.currencyTable);
    }
    return total;
  }

  getRawCost() {
    return this.saleItems.reduce(
      (acc, curr) => acc + curr.getTotalCost(this.currencyTable),
      0.0,
    );
  }

  getTotalFreightCost(distanceKm: number) {
    return this.saleItems.reduce(
      (acc, curr) =>
        acc +
        FreightCalculator.calculate(curr.product, distanceKm) * curr.quantity,
      0.0,
    );
  }

  getTotalCost(distanceKm: number) {
    if (this.#coupon?.isExpired(Temporal.Now.plainDateISO())) {
      throw new Error('Invalid coupon');
    }

    const rawCost = this.getRawCost();
    const discount = this.#coupon?.calculateDiscount(rawCost) ?? 0;

    return rawCost - discount + this.getTotalFreightCost(distanceKm);
  }
}
