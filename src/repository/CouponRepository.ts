import Coupon from '../Coupon.js';

export default interface CouponRepository {
  getByCode(code: string): Promise<Coupon>;
}
