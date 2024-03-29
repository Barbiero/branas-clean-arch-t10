import CurrencyGateway from '../../CurrencyGateway.js';
import CouponRepository from '../../repository/CouponRepository.js';
import OrderRepository from '../../repository/OrderRepository.js';
import ProductRepository from '../../repository/ProductRepository.js';
import Coupon from '../entity/Coupon.js';
import Order from '../entity/Order.js';
import CalculateDistance from './CalculateDistance.js';

type Input = {
  cpf: string;
  orders: {
    idProduct: number;
    count: number;
  }[];
  coupon?: string;
  from: string;
  to: string;
};

type Output = { total: number; freight: number; serialNumber: string };

export default class Checkout {
  constructor(
    readonly productRepository: ProductRepository,
    readonly couponRepository: CouponRepository,
    readonly currencyGateway: CurrencyGateway,
    readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const seenIds = new Set<number>();

    const currencies = await this.currencyGateway.getCurrencies();

    const order = new Order(input.cpf, currencies);

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

    const resultOrder = await this.orderRepository.createOrder(order);

    const distanceKm = await new CalculateDistance().calculate(
      input.from,
      input.to,
    );

    return {
      total: order.getTotalCost(distanceKm),
      freight: order.getTotalFreightCost(distanceKm),
      serialNumber: resultOrder.serialNumber,
    };
  }
}
