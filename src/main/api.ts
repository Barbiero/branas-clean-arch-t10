import express, { Request } from 'express';
import pgp from 'pg-promise';
import Cpf from '../Cpf.js';
import SaleItem from '../SaleItem.js';
import CouponRepository from '../repository/CouponRepository.js';
import CouponRepositoryDatabase from '../repository/CouponRepositoryDatabase.js';
import ProductRepositoryDatabase from '../repository/ProductRepositoryDatabase.js';
import Coupon from '../Coupon.js';
import Order from '../Order.js';

const app = express();
const port = 3000;
app.use(express.json());

type Input = {
  cpf: string;
  orders: {
    idProduct: number;
    count: number;
  }[];
  coupon: string;
};

type Output =
  | {
      message: string;
    }
  | { total: number };

app.route('/health').get((req, res) => {
  res.json({ status: 'OK' }).end();
});

app.route('/checkout').post<{}, Output, Input>(async (req, res) => {
  const connection = pgp()(
    'postgres://postgres:123456@localhost:5432/postgres',
  );
  try {
    const cpf = new Cpf(req.body.cpf);
    const seenIds = new Set<number>();
    const productRepository = new ProductRepositoryDatabase(connection);

    const saleItems: SaleItem[] = [];
    for (const order of req.body.orders) {
      if (seenIds.has(order.idProduct)) {
        throw new Error('Duplicate item');
      }
      seenIds.add(order.idProduct);

      const product = await productRepository.getById(order.idProduct);

      saleItems.push(new SaleItem(product, order.count));
    }

    let coupon: Coupon | null = null;
    if (req.body.coupon) {
      const couponRepository: CouponRepository = new CouponRepositoryDatabase(
        connection,
      );

      coupon = await couponRepository.getByCode(req.body.coupon);
    }

    const order = new Order(cpf, saleItems, coupon ? [coupon] : []);

    res.json({ total: order.getTotalCost(1000) });
    res.end();
  } catch (err: any) {
    res.status(422).json({ message: err.message }).end();
  } finally {
    await connection.$pool.end();
  }
});

app.listen(port, 'localhost');
