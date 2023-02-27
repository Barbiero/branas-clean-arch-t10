import { Temporal } from '@js-temporal/polyfill';
import ValidateCoupon from '../usecase/ValidateCoupon.js';
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
    buyer: Cpf | string,
    readonly currencyTable: CurrencyTable = new CurrencyTable(),
    public idOrder?: number,
    public createdAt?: Temporal.Instant,
  ) {
    if (!(buyer instanceof Cpf)) {
      this.buyer = new Cpf(buyer);
    } else {
      this.buyer = buyer;
    }
  }

  /**
   * Returns a serial number in the form YYYYPPPPPPPP
   */
  get serialNumber(): string {
    const yr = (this.createdAt ?? Temporal.Now.instant()).toZonedDateTimeISO(
      Temporal.Now.timeZone(),
    ).year;
    const currentId = this.idOrder ?? 0;
    return `${yr}${currentId.toString().padStart(8, '0')}`;
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

  getCoupon() {
    return this.#coupon?.name ?? null;
  }

  getTotal(): number {
    let total = 0;
    for (const item of this.saleItems) {
      total += item.getTotalCost(this.currencyTable);
    }
    return total;
  }

  getTotalFreightCost(distanceKm: number) {
    return this.saleItems.reduce(
      (acc, curr) =>
        acc +
        FreightCalculator.calculate(curr.product, distanceKm, curr.quantity),
      0.0,
    );
  }

  getTotalCost(distanceKm: number) {
    if (this.#coupon && !ValidateCoupon.isValid(this.#coupon)) {
      throw new Error('Invalid coupon');
    }

    const rawCost = this.getTotal();
    const discount = this.#coupon?.calculateDiscount(rawCost) ?? 0;

    return rawCost - discount + this.getTotalFreightCost(distanceKm);
  }
}
