import Checkout from '../domain/usecase/Checkout.js';
import pgp from 'pg-promise';
import ProductRepositoryDatabase from '../repository/ProductRepositoryDatabase.js';
import CouponRepositoryDatabase from '../repository/CouponRepositoryDatabase.js';
import CurrencyGatewayHttp from '../CurrencyGatewayHttp.js';
import OrderRepositoryDatabase from '../repository/OrderRepositoryDatabase.js';

type Input = {
  cpf: string;
  orders: {
    idProduct: number;
    count: number;
  }[];
  coupon?: string;
};

const input: Input = { cpf: '', orders: [] };

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
      const output = await checkout.execute(input, 1000);

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
