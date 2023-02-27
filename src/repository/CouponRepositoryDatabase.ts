import { Temporal } from '@js-temporal/polyfill';
import pg from 'pg-promise';
import Coupon from '../domain/entity/Coupon.js';
import CouponRepository from './CouponRepository.js';

export default class CouponRepositoryDatabase implements CouponRepository {
  constructor(readonly conn: pg.IBaseProtocol<{}>) {}

  async getByCode(code: string): Promise<Coupon> {
    return this.conn.task(async (t) => {
      const couponData = await t.oneOrNone<{
        code: string;
        percentage: number;
        expiresat: string;
      }>(
        'select code, percentage, expiresat::text from cccat10.coupon where code = $1',
        [code],
      );

      if (!couponData) {
        throw new Error('Coupon not found.');
      }

      return new Coupon(
        couponData.percentage / 100,
        couponData.code,
        Temporal.PlainDate.from(couponData.expiresat),
      );
    });
  }
}
