import pg from 'pg-promise';
import Product, { ProductDimensions } from '../domain/entity/Product.js';
import ProductRepository from './ProductRepository.js';

type ProductSchema = {
  id_product: number;
  description: string;
  price: number;
  weight: number;
  height: number;
  width: number;
  depth: number;
};

export default class ProductRepositoryDatabase implements ProductRepository {
  constructor(readonly conn: pg.IBaseProtocol<{}>) {}

  async getById(id: number): Promise<Product> {
    return this.conn.task(async () => {
      const productData = await this.conn.oneOrNone<ProductSchema>(
        'select * from cccat10.product where id_product = $1',
        [id],
      );
      if (!productData) {
        throw new Error('Product not found');
      }

      return new Product(
        productData.id_product,
        productData.description,
        productData.price,
        new ProductDimensions(
          productData.weight,
          productData.height,
          productData.width,
          productData.depth,
        ),
      );
    });
  }
}
