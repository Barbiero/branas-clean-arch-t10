import { Temporal } from '@js-temporal/polyfill';
import Coupon from './Coupon.js';
import Cpf from './Cpf.js';
import SaleItem from './SaleItem.js';

export default class Order {
  readonly buyer: Cpf;

  constructor(
    buyer: Cpf | string,
    readonly saleItems: SaleItem[],
    readonly coupons: Coupon[] = [],
  ) {
    if (!(buyer instanceof Cpf)) {
      this.buyer = new Cpf(buyer);
    } else {
      this.buyer = buyer;
    }
  }

  getRawCost(currencies: Record<string, number> = {}) {
    return this.saleItems.reduce(
      (acc, curr) => acc + curr.getTotalCost(currencies),
      0.0,
    );
  }

  getTotalFreightCost(distanceKm: number, currencies: Record<string, number> = {}) {
    return this.saleItems.reduce(
      (acc, curr) => acc + curr.getFreightCost(distanceKm, currencies),
      0.0,
    );
  }

  getTotalCost(distanceKm: number, currencies: Record<string, number> = {}) {
    const finalDiscount = this.coupons.reduce((acc, curr) => {
      if (curr.isExpired(Temporal.Now.plainDateISO())) {
        throw new Error('Invalid coupon');
      }
      return curr.discountRate + acc;
    }, 0);

    if (finalDiscount > 1) {
      return 0;
    }
    const rawCost = this.getRawCost(currencies);
    const discount = rawCost * finalDiscount;
    return (
      rawCost - discount + this.getTotalFreightCost(distanceKm, currencies)
    );
  }
}
