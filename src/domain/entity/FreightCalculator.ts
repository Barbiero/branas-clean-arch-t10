import Order from './Order.js';
import Product from './Product.js';

export default class FreightCalculator {
  static MIN_FREIGHT = 10;
  static calculate(product: Product, distanceKm: number) {
    const { density, volume } = product.dimensions;

    const itemFreight = distanceKm * volume * (density / 100);

    return itemFreight < FreightCalculator.MIN_FREIGHT
      ? FreightCalculator.MIN_FREIGHT
      : itemFreight;
  }

  static calculateOrder(order: Order, distanceKm: number) {
    return order.saleItems.reduce(
      (acc, curr) =>
        acc +
        FreightCalculator.calculate(curr.product, distanceKm) * curr.quantity,
      0.0,
    );
  }
}
