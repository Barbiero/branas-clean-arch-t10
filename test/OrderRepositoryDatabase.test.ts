import pg from 'pg-promise';
import { afterAll, describe, expect, test } from 'vitest';
import Order from '../src/domain/entity/Order.js';
import Product, { ProductDimensions } from '../src/domain/entity/Product.js';
import OrderRepositoryDatabase from '../src/repository/OrderRepositoryDatabase.js';

const products = [
  new Product(1, 'camera', 1250, new ProductDimensions(1, 0.15, 0.2, 0.1)),
  new Product(2, 'guitarra', 5000, new ProductDimensions(3, 1, 0.3, 0.1)),
  new Product(3, 'geladeira', 15000, new ProductDimensions(40, 2, 1, 0.5)),
];

describe('OrderRepository Database tests', () => {
  const conn: pg.IDatabase<{}> = pg()(
    'postgres://postgres:123456@localhost:5432/postgres',
  );

  afterAll(() => {
    conn.$pool.end();
  });
  test('Saves order on db and generates an ID', async () => {
    const orderRepository = new OrderRepositoryDatabase(conn);
    const order = new Order('764.551.280-60');
    const savedOrder = await orderRepository.createOrder(order);
    expect(savedOrder.idOrder).toBeTruthy();

    const fetchedOrder = await orderRepository.getById(savedOrder.idOrder!);
    expect(fetchedOrder).toBeTruthy();
    expect(fetchedOrder?.idOrder).toEqual(savedOrder.idOrder);
    expect(fetchedOrder?.buyer).toEqual(savedOrder.buyer);
    expect(fetchedOrder?.createdAt).toBeTruthy();
    const currentYear = new Date().getFullYear();

    expect(fetchedOrder?.serialNumber).toEqual(
      `${currentYear}${fetchedOrder?.idOrder?.toString().padStart(8, '0')}`,
    );
  });
  test('Saves order on db with products and generates an ID', async () => {
    const orderRepository = new OrderRepositoryDatabase(conn);
    const order = new Order('764.551.280-60');
    order.addItem(products[0], 1);
    order.addItem(products[1], 1);
    order.addItem(products[2], 1);

    const savedOrder = await orderRepository.createOrder(order);
    expect(savedOrder.idOrder).toBeTruthy();
    const fetchedOrder = await orderRepository.getById(savedOrder.idOrder!);
    expect(fetchedOrder).toBeTruthy();
    expect(fetchedOrder?.idOrder).toEqual(savedOrder.idOrder);
    expect(fetchedOrder!.buyer).toEqual(savedOrder.buyer);
    expect(fetchedOrder!.saleItems.length).toEqual(3);
  });
});
