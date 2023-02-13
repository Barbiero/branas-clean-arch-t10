import express from 'express';
import pgp from 'pg-promise';
import Checkout from '../Checkout.js';
import CurrencyGatewayHttp from '../CurrencyGatewayHttp.js';
import CouponRepositoryDatabase from '../repository/CouponRepositoryDatabase.js';
import ProductRepositoryDatabase from '../repository/ProductRepositoryDatabase.js';

const app = express();
const port = 3000;
app.use(express.json());

type Input = {
  cpf: string;
  orders: {
    idProduct: number;
    count: number;
  }[];
  coupon?: string;
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
    const productRepository = new ProductRepositoryDatabase(connection);
    const couponRepository = new CouponRepositoryDatabase(connection);
    const currencyGateway = new CurrencyGatewayHttp();

    const checkout = new Checkout(
      productRepository,
      couponRepository,
      currencyGateway,
    );
    const result = await checkout.execute(req.body, 1000);

    res.json(result).end();
  } catch (err: any) {
    res.status(422).json({ message: err.message }).end();
  } finally {
    await connection.$pool.end();
  }
});

app.listen(port, 'localhost');
