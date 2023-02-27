import pgp from 'pg-promise';
import CurrencyGatewayHttp from '../CurrencyGatewayHttp.js';
import Checkout from '../domain/usecase/Checkout.js';
import CouponRepositoryDatabase from '../repository/CouponRepositoryDatabase.js';
import OrderRepositoryDatabase from '../repository/OrderRepositoryDatabase.js';
import ProductRepositoryDatabase from '../repository/ProductRepositoryDatabase.js';

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

const input: Input = { cpf: '', orders: [], from: '68900-102', to: '68900-102' };

process.stdin.on('data', async (chunk) => {
  const command = chunk.toString().replace(/\n/g, '');
  if (command.startsWith('set-cpf')) {
    input.cpf = command.replace('set-cpf ', '');
  }

  if (command.startsWith('add-item')) {
    const [idProduct, count] = command.replace('add-item ', '').split(' ');
    input.orders.push({
      idProduct: parseInt(idProduct),
      count: parseInt(count),
    });
  }

  if (command.startsWith('checkout')) {
    const connection = pgp()(
      'postgres://postgres:123456@localhost:5432/postgres',
    );
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
      const output = await checkout.execute(input);

      console.info(output.total);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      await connection.$pool.end();
    }
  }

  if (command.startsWith('exit')) {
    process.exit(0);
  }
});
