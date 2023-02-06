export default class Product {
  constructor(readonly name: string, readonly price: number) {
    if (price <= 0) {
      throw new Error('Product must have a positive price');
    }
  }
}
