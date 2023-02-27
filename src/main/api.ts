import express from 'express';
import pgp from 'pg-promise';
import CurrencyGatewayHttp from '../CurrencyGatewayHttp.js';
import Checkout from '../domain/usecase/Checkout.js';
import ValidateCoupon from '../domain/usecase/ValidateCoupon.js';
import SimulateFreight from '../domain/usecase/SimulateFreight.js';
import CouponRepositoryDatabase from '../repository/CouponRepositoryDatabase.js';
import OrderRepositoryDatabase from '../repository/OrderRepositoryDatabase.js';
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
  from: string;
  to: string;
};

type Output =
  | {
      message: string;
    }
  | { total: number };

app.route('/health').get((req, res) => {
  res.json({ status: 'OK' }).end();
});

const makeConnection = () =>
  pgp({ noWarnings: true })(
    'postgres://postgres:123456@localhost:5432/postgres',
  );

app.route('/checkout').post<{}, Output, Input>(async (req, res) => {
  const connection = makeConnection();
  try {
    const productRepository = new ProductRepositoryDatabase(connection);
    const couponRepository = new CouponRepositoryDatabase(connection);
    const currencyGateway = new CurrencyGatewayHttp();
    const orderRepository = new OrderRepositoryDatabase(connection);

    const checkout = new Checkout(
      productRepository,
      couponRepository,
      currencyGateway,
      orderRepository,
    );

    const result = await checkout.execute(req.body);

    res.json(result).end();
  } catch (err: any) {
    res.status(422).json({ message: err.message }).end();
  } finally {
    await connection.$pool.end();
  }
});

type InputFreight = {
  orders: {
    idProduct: number;
    count: number;
  }[];
  cepFrom: string;
  cepTo: string;
};

app.route('/freight').get<
  {},
  | number
  | {
      message: string;
    },
  null,
  InputFreight
>(async (req, res) => {
  const connection = makeConnection();
  try {
    const productRepository = new ProductRepositoryDatabase(connection);
    const simulateFreight = new SimulateFreight(productRepository);

    const query = req.query;
    const result = await simulateFreight.calculate(query);
    res.json(result).end();
  } catch (err: any) {
    res.status(422).json({ message: err.message }).end();
  } finally {
    await connection.$pool.end();
  }
});

app
  .route('/coupon/valid')
  .get<{}, boolean, null, { coupon: string }>(async (req, res) => {
    const connection = makeConnection();
    try {
      const coupon = req.query.coupon;
      const couponValidator = new ValidateCoupon(
        new CouponRepositoryDatabase(connection),
      );
      console.info(coupon);
      const isValid = await couponValidator.isValid(coupon);
      res.json(isValid).end();
    } finally {
      await connection.$pool.end();
    }
  });

app.listen(port, 'localhost');
