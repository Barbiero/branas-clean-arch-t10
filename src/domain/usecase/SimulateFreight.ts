import ProductRepository from '../../repository/ProductRepository.js';
import FreightCalculator from '../entity/FreightCalculator.js';
import CalculateDistance from './CalculateDistance.js';

type Input = {
  orders: {
    idProduct: number;
    count: number;
  }[];
  cepFrom: string;
  cepTo: string;
};
export default class SimulateFreight {
  constructor(readonly productRepository: ProductRepository) {}
  async calculate(input: Input): Promise<number> {
    const distanceKm = await new CalculateDistance().calculate(
      input.cepFrom,
      input.cepTo,
    );

    const items = await Promise.all(
      input.orders.map(async (order) => {
        return {
          product: await this.productRepository.getById(order.idProduct),
          count: order.count,
        };
      }),
    );

    const totalFreight = items.reduce(
      (curr, { product, count }) =>
        curr + FreightCalculator.calculate(product, distanceKm, count),
      0.0,
    );

    return totalFreight;
  }
}
