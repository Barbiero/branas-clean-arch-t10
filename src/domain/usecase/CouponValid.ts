import { Temporal } from '@js-temporal/polyfill';
import CouponRepository from '../../repository/CouponRepository.js';
import Coupon from '../entity/Coupon.js';

export default class CouponValidator {
  constructor(readonly couponRepository: CouponRepository) {}
  async isValid(couponName: string): Promise<boolean> {
    try {
      const coupon = await this.couponRepository.getByCode(couponName);
      console.info(coupon);
      return CouponValidator.isValid(coupon);
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  static isValid(coupon: Coupon): boolean {
    return !coupon.isExpired(Temporal.Now.plainDateISO())
  }
}
