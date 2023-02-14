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
}
