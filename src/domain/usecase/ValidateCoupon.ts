import { Temporal } from '@js-temporal/polyfill';
import CouponRepository from '../../repository/CouponRepository.js';
import Coupon from '../entity/Coupon.js';

export default class ValidateCoupon {
  constructor(readonly couponRepository: CouponRepository) {}
  async isValid(couponName: string): Promise<boolean> {
    try {
      const coupon = await this.couponRepository.getByCode(couponName);
      return ValidateCoupon.isValid(coupon);
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  static isValid(coupon: Coupon): boolean {
    return !coupon.isExpired(Temporal.Now.plainDateISO())
  }
}
