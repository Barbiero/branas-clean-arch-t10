import Coupon from '../domain/entity/Coupon.js';

export default interface CouponRepository {
  getByCode(code: string): Promise<Coupon>;
}
