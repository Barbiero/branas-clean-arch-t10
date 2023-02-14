import Product from '../domain/entity/Product.js';

export default interface ProductRepository {
  getById(id: number): Promise<Product>;
}
