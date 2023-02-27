import pg from 'pg-promise';
import sinon from 'sinon';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
} from 'vitest';
import CurrencyGateway from '../src/CurrencyGateway.js';
import CurrencyGatewayHttp from '../src/CurrencyGatewayHttp.js';
import CurrencyTable from '../src/domain/entity/CurrencyTable.js';
import Order from '../src/domain/entity/Order.js';
import Product, { ProductDimensions } from '../src/domain/entity/Product.js';
import Checkout from '../src/domain/usecase/Checkout.js';
import CouponRepositoryDatabase from '../src/repository/CouponRepositoryDatabase.js';
import OrderRepository from '../src/repository/OrderRepository.js';
import OrderRepositoryDatabase from '../src/repository/OrderRepositoryDatabase.js';
import ProductRepository from '../src/repository/ProductRepository.js';
import ProductRepositoryDatabase from '../src/repository/ProductRepositoryDatabase.js';

let checkout: Checkout;
let conn: pg.IDatabase<{}>;

beforeEach(() => {
  conn = pg()('postgres://postgres:123456@localhost:5432/postgres');
  checkout = new Checkout(
    new ProductRepositoryDatabase(conn),
    new CouponRepositoryDatabase(conn),
    new CurrencyGatewayHttp(),
    new OrderRepositoryDatabase(conn),
  );
});

afterEach(() => {
  conn.$pool.end();
});

test('Não deve aceitar um pedido com cpf inválido', async function () {
  const input = {
    cpf: '406.302.170-27',
    orders: [],
    from: '68900-102',
    to: '68900-102',
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error('Invalid CPF string'),
  );
});

test('Deve criar um pedido vazio', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [],
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(0);
});

test('Deve criar um pedido com 3 produtos', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [
      { idProduct: 1, count: 1 },
      { idProduct: 2, count: 1 },
      { idProduct: 3, count: 3 },
    ],
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(52490);
});

test('Deve criar um pedido com 3 produtos com cupom de desconto', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [
      { idProduct: 1, count: 1 },
      { idProduct: 2, count: 1 },
      { idProduct: 3, count: 3 },
    ],
    coupon: 'VALE20',
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(42240);
});

test('Deve criar um pedido com 3 produtos com cupom de desconto expirado', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [
      { idProduct: 1, count: 1 },
      { idProduct: 2, count: 1 },
      { idProduct: 3, count: 3 },
    ],
    coupon: 'VALE10',
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(47365);
});

test('Não deve criar um pedido com quantidade negativa', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 1, count: -1 }],
    from: '68900-102',
    to: '68900-102',
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error('Sale Item must have some positive quantity'),
  );
});

test('Não deve criar um pedido com item duplicado', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [
      { idProduct: 1, count: 1 },
      { idProduct: 1, count: 1 },
    ],
    from: '68900-102',
    to: '68900-102',
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error('Duplicate item'),
  );
});

test('Deve criar um pedido com 1 produto calculando o frete', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 1, count: 3 }],
    from: '22060030',
    to: '88015600',
  };
  const output = await checkout.execute(input);
  expect(output.freight).toBe(30);
  expect(output.total).toBe(3780);
});

test('Não deve criar um pedido se o produto tiver alguma dimensão negativa', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 4, count: 1 }],
    from: '68900-102',
    to: '68900-102',
  };
  expect(() => checkout.execute(input)).rejects.toThrow(
    new Error('Product must have positive dimensions'),
  );
});

test('Deve criar um pedido com 1 produto calculando o frete com valor mínimo', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 3, count: 1 }],
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);
  expect(output.freight).toBe(400);
  expect(output.total).toBe(15400);
});

test('Deve criar um pedido com 1 produto em dólar usando um stub', async function () {
  const stubCurrencyGateway = sinon
    .stub(CurrencyGatewayHttp.prototype, 'getCurrencies')
    .resolves(new CurrencyTable({ usd: 3 }));
  const stubProductRepository = sinon
    .stub(ProductRepositoryDatabase.prototype, 'getById')
    .resolves(
      new Product(5, 'A', 1000, new ProductDimensions(10, 10, 10, 10), 'USD'),
    );
  try {
    const input = {
      cpf: '407.302.170-27',
      orders: [{ idProduct: 5, count: 1 }],
      from: '68900-102',
      to: '68900-102',
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(3100);
  } finally {
    stubCurrencyGateway.restore();
    stubProductRepository.restore();
  }
});

test('Deve criar um pedido com 3 produtos com cupom de desconto com spy', async function () {
  const spyProductRepository = sinon.spy(
    ProductRepositoryDatabase.prototype,
    'getById',
  );
  const spyCouponRepository = sinon.spy(
    CouponRepositoryDatabase.prototype,
    'getByCode',
  );
  try {
    const input = {
      cpf: '407.302.170-27',
      orders: [
        { idProduct: 1, count: 1 },
        { idProduct: 2, count: 1 },
        { idProduct: 3, count: 3 },
      ],
      coupon: 'VALE20',
      from: '68900-102',
      to: '68900-102',
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(42240);
    expect(spyCouponRepository.calledOnce).toBeTruthy();
    expect(spyCouponRepository.calledWith('VALE20')).toBeTruthy();
    expect(spyProductRepository.calledThrice).toBeTruthy();
  } finally {
    spyCouponRepository.restore();
    spyProductRepository.restore();
  }
});

test('Deve criar um pedido com 1 produto em dólar usando um mock', async function () {
  const mockCurrencyGateway = sinon.mock(CurrencyGatewayHttp.prototype);
  mockCurrencyGateway
    .expects('getCurrencies')
    .once()
    .resolves(
      new CurrencyTable({
        usd: 3,
      }),
    );
  try {
    const input = {
      cpf: '407.302.170-27',
      orders: [{ idProduct: 5, count: 1 }],
      from: '68900-102',
      to: '68900-102',
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(2000);
  } finally {
    mockCurrencyGateway.verify();
    mockCurrencyGateway.restore();
  }
});

test('Deve criar um pedido com 1 produto em dólar usando um fake', async function () {
  const currencyGateway: CurrencyGateway = {
    async getCurrencies(): Promise<CurrencyTable> {
      return new CurrencyTable({
        usd: 3,
      });
    },
  };
  const productRepository: ProductRepository = {
    async getById(_idProduct: number): Promise<Product> {
      return new Product(
        6,
        'A',
        1000,
        new ProductDimensions(10, 10, 10, 10),
        'USD',
      );
    },
  };
  const orderRepository: OrderRepository = {
    async getById(idOrder: number) {
      return {} as Order;
    },

    async createOrder(order: Order): Promise<Order> {
      order.idOrder = 1;
      return order;
    },
  };

  checkout = new Checkout(
    productRepository,
    new CouponRepositoryDatabase(conn),
    currencyGateway,
    orderRepository,
  );
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 6, count: 1 }],
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);
  expect(output.total).toBe(3100);
});

test('Deve fazer um pedido, salvando no banco de dados', async () => {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 3, count: 1 }],
    from: '68900-102',
    to: '68900-102',
  };
  const output = await checkout.execute(input);

  const order = await checkout.orderRepository.getById(
    +output.serialNumber.slice(4),
  );
  expect(order).toBeTruthy();
  expect(order?.serialNumber).toEqual(output.serialNumber);
});
