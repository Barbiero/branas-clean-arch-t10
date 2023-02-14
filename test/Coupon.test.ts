import { Temporal } from '@js-temporal/polyfill';
import { expect, test } from 'vitest';
import Coupon from '../src/domain/entity/Coupon.js';

test('Deve criar um cupom de desconto válido', () => {
  const coupon = new Coupon(
    0.1,
    'VALE10',
    Temporal.PlainDate.from('2022-02-13'),
  );
  expect(coupon.isExpired(Temporal.PlainDate.from('2022-02-14'))).toBeTruthy();
});

test('Deve criar um cupom de desconto inválido', () => {
  const coupon = new Coupon(
    0.1,
    'VALE10',
    Temporal.PlainDate.from('2022-02-13'),
  );
  expect(coupon.isExpired(Temporal.PlainDate.from('2022-02-12'))).toBeFalsy();
});

test('Deve calcular o desconto', () => {
  const coupon = new Coupon(
    0.1,
    'VALE10',
    Temporal.PlainDate.from('2022-02-13'),
  );
  expect(coupon.calculateDiscount(1000)).toBe(100);
});

test('Não pode criar um cupom de desconto com um desconto que não faça sentido', () => {
  expect(() => {
    new Coupon(1000, 'VALE10', Temporal.PlainDate.from('2022-02-13'));
  }).toThrow();
});
