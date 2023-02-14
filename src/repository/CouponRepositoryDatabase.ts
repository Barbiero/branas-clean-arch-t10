import { Temporal } from '@js-temporal/polyfill';
import pg from 'pg-promise';
import Coupon from '../domain/entity/Coupon.js';
import CouponRepository from './CouponRepository.js';

export default class CouponRepositoryDatabase implements CouponRepository {
  constructor(readonly conn: pg.IDatabase<{}>) {}

  async getByCode(code: string): Promise<Coupon> {
    const couponData = await this.conn.oneOrNone<{
      code: string;
      percentage: number;
    }>('select code, percentage from cccat10.coupon where code = $1', [code]);

    if (!couponData) {
      throw new Error('Coupon not found.');
    }

    return new Coupon(
      couponData.percentage/100,
      couponData.code,
      // TODO: coupon expiration on db
      Temporal.PlainDate.from('2999-12-31'),
    );
  }
}
