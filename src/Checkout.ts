import crypto from 'node:crypto';
import CurrencyGateway from './CurrencyGateway.js';
import Coupon from './domain/entity/Coupon.js';
import Order from './domain/entity/Order.js';
import CouponRepository from './repository/CouponRepository.js';
import ProductRepository from './repository/ProductRepository.js';

type Input = {
  cpf: string;
  orders: {
    idProduct: number;
    count: number;
  }[];
  coupon?: string;
};

type Output = { total: number; freight: number };

export default class Checkout {
  constructor(
    readonly productRepository: ProductRepository,
    readonly couponRepository: CouponRepository,
    readonly currencyGateway: CurrencyGateway,
  ) {}

  async execute(input: Input, distanceKm: number): Promise<Output> {
    const seenIds = new Set<number>();

    const currencies = await this.currencyGateway.getCurrencies();

    const order = new Order(crypto.randomUUID(), input.cpf, currencies);

    for (const orderItem of input.orders) {
      if (seenIds.has(orderItem.idProduct)) {
        throw new Error('Duplicate item');
      }
      seenIds.add(orderItem.idProduct);

      const product = await this.productRepository.getById(orderItem.idProduct);
      order.addItem(product, orderItem.count);
    }

    let coupon: Coupon | null = null;
    if (input.coupon) {
      coupon = await this.couponRepository.getByCode(input.coupon);
      order.addCoupon(coupon);
    }

    return {
      total: order.getTotalCost(distanceKm),
      freight: order.getTotalFreightCost(distanceKm),
    };
  }
}
