export class ProductDimensions {
  constructor(
    readonly weightKg: number,
    readonly heightMeters: number,
    readonly widthMeters: number,
    readonly depthMeters: number,
  ) {
    if (
      weightKg <= 0 ||
      heightMeters <= 0 ||
      widthMeters <= 0 ||
      depthMeters <= 0
    ) {
      throw new Error('Product must have positive dimensions');
    }
  }

  toString(): string {
    return `dimensions: ${this.heightMeters}m x ${this.widthMeters}m x ${this.depthMeters}m ; weigth: ${this.weightKg}Kg`;
  }

  /**
   * m^3
   */
  get volume(): number {
    return this.heightMeters * this.widthMeters * this.depthMeters;
  }

  /**
   * kg/m^3
   */
  get density(): number {
    return this.weightKg / this.volume;
  }
}

export default class Product {
  static MIN_FREIGHT = 10;
  constructor(
    readonly id: number,
    readonly name: string,
    readonly price: number,
    readonly dimensions: ProductDimensions,
    readonly currency: string = "BRL",
  ) {
    if (price <= 0) {
      throw new Error('Product must have a positive price');
    }
  }

  getFreightCost(distanceKm: number): number {
    const calculatedCost =
      distanceKm * this.dimensions.volume * (this.dimensions.density / 100);
    if (calculatedCost < Product.MIN_FREIGHT) {
      return Product.MIN_FREIGHT;
    }
    return calculatedCost;
  }
}
