import pg from 'pg-promise';
import sinon from 'sinon';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import Checkout from '../src/Checkout.js';
import CurrencyGateway from '../src/CurrencyGateway.js';
import CurrencyGatewayHttp from '../src/CurrencyGatewayHttp.js';
import Product, { ProductDimensions } from '../src/Product.js';
import CouponRepositoryDatabase from '../src/repository/CouponRepositoryDatabase.js';
import ProductRepository from '../src/repository/ProductRepository.js';
import ProductRepositoryDatabase from '../src/repository/ProductRepositoryDatabase.js';

let checkout: Checkout;
let conn: pg.IDatabase<{}>;
beforeAll(() => {
  conn = pg()('postgres://postgres:123456@localhost:5432/postgres');
});

beforeEach(function () {
  checkout = new Checkout(
    new ProductRepositoryDatabase(conn),
    new CouponRepositoryDatabase(conn),
    new CurrencyGatewayHttp(),
  );
});

afterAll(() => {
  conn.$pool.end();
});

test('Não deve aceitar um pedido com cpf inválido', async function () {
  const input = {
    cpf: '406.302.170-27',
    orders: [],
  };
  expect(() => checkout.execute(input, 1000)).rejects.toThrow(
    new Error('Invalid CPF string'),
  );
});

test('Deve criar um pedido vazio', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [],
  };
  const output = await checkout.execute(input, 1000);
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
  };
  const output = await checkout.execute(input, 1000);
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
  };
  const output = await checkout.execute(input, 1000);
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
  };
  const output = await checkout.execute(input, 1000);
  expect(output.total).toBe(47365);
});

test('Não deve criar um pedido com quantidade negativa', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 1, count: -1 }],
  };
  expect(() => checkout.execute(input, 1000)).rejects.toThrow(
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
  };
  expect(() => checkout.execute(input, 1000)).rejects.toThrow(
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
  const output = await checkout.execute(input, 1000);
  expect(output.freight).toBe(30);
  expect(output.total).toBe(3780);
});

test('Não deve criar um pedido se o produto tiver alguma dimensão negativa', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 4, count: 1 }],
  };
  expect(() => checkout.execute(input, 1000)).rejects.toThrow(
    new Error('Product must have positive dimensions'),
  );
});

test('Deve criar um pedido com 1 produto calculando o frete com valor mínimo', async function () {
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 3, count: 1 }],
  };
  const output = await checkout.execute(input, 1000);
  expect(output.freight).toBe(400);
  expect(output.total).toBe(15400);
});

test('Deve criar um pedido com 1 produto em dólar usando um stub', async function () {
  const stubCurrencyGateway = sinon
    .stub(CurrencyGatewayHttp.prototype, 'getCurrencies')
    .resolves({
      usd: 3,
    });
  const stubProductRepository = sinon
    .stub(ProductRepositoryDatabase.prototype, 'getById')
    .resolves(
      new Product(5, 'A', 1000, new ProductDimensions(10, 10, 10, 10), 'USD'),
    );
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 5, count: 1 }],
  };
  const output = await checkout.execute(input, 1000);
  expect(output.total).toBe(1100);
  stubCurrencyGateway.restore();
  stubProductRepository.restore();
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
  const input = {
    cpf: '407.302.170-27',
    orders: [
      { idProduct: 1, count: 1 },
      { idProduct: 2, count: 1 },
      { idProduct: 3, count: 3 },
    ],
    coupon: 'VALE20',
  };
  const output = await checkout.execute(input, 1000);
  expect(output.total).toBe(42240);
  expect(spyCouponRepository.calledOnce).toBeTruthy();
  expect(spyCouponRepository.calledWith('VALE20')).toBeTruthy();
  expect(spyProductRepository.calledThrice).toBeTruthy();
  spyCouponRepository.restore();
  spyProductRepository.restore();
});

test('Deve criar um pedido com 1 produto em dólar usando um mock', async function () {
  const mockCurrencyGateway = sinon.mock(CurrencyGatewayHttp.prototype);
  mockCurrencyGateway.expects('getCurrencies').once().resolves({
    usd: 3,
  });
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 5, count: 1 }],
  };
  const output = await checkout.execute(input, 1000);
  expect(output.total).toBe(2000);
  mockCurrencyGateway.verify();
  mockCurrencyGateway.restore();
});

test('Deve criar um pedido com 1 produto em dólar usando um fake', async function () {
  const currencyGateway: CurrencyGateway = {
    async getCurrencies(): Promise<any> {
      return {
        usd: 3,
      };
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
  checkout = new Checkout(
    productRepository,
    new CouponRepositoryDatabase(conn),
    currencyGateway,
  );
  const input = {
    cpf: '407.302.170-27',
    orders: [{ idProduct: 6, count: 1 }],
  };
  const output = await checkout.execute(input, 1000);
  expect(output.total).toBe(1100);
});