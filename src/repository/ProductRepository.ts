import Product from '../Product.js';

export default interface ProductRepository {
  getById(id: number): Promise<Product>;
}
