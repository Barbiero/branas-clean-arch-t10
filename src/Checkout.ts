import Coupon from './Coupon.js';
import Cpf from './Cpf.js';
import Order from './Order.js';
import CouponRepository from './repository/CouponRepository.js';
import ProductRepository from './repository/ProductRepository.js';
import SaleItem from './SaleItem.js';

type Input = {
  cpf: string;
  orders: {
    idProduct: number;
    count: number;
  }[];
  coupon?: string;
};

type Output = { total: number };

export default class Checkout {
  constructor(
    readonly productRepository: ProductRepository,
    readonly couponRepository: CouponRepository,
  ) {}

  async execute(input: Input, distanceKm: number): Promise<Output> {
    const cpf = new Cpf(input.cpf);
    const seenIds = new Set<number>();

    const saleItems: SaleItem[] = [];
    for (const order of input.orders) {
      if (seenIds.has(order.idProduct)) {
        throw new Error('Duplicate item');
      }
      seenIds.add(order.idProduct);

      const product = await this.productRepository.getById(order.idProduct);

      saleItems.push(new SaleItem(product, order.count));
    }

    let coupon: Coupon | null = null;
    if (input.coupon) {
      coupon = await this.couponRepository.getByCode(input.coupon);
    }

    const order = new Order(cpf, saleItems, coupon ? [coupon] : []);

    return { total: order.getTotalCost(distanceKm) };
  }
}
