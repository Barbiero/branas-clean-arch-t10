import { Temporal } from '@js-temporal/polyfill';

export default class Coupon {
  constructor(readonly discountRate: number, readonly name: string, readonly expiresAt: Temporal.PlainDate) {
    if (discountRate < 0 || discountRate > 1) {
      throw new Error('discount rate must be between 0 and 100%');
    }
  }

  isExpired(refDate: Temporal.PlainDate) {
    return Temporal.PlainDate.compare(this.expiresAt, refDate) < 0;
  }
}
