import { Temporal } from '@js-temporal/polyfill';
import pg from 'pg-promise';
import Coupon from '../domain/entity/Coupon.js';
import Order from '../domain/entity/Order.js';
import Product, { ProductDimensions } from '../domain/entity/Product.js';
import OrderRepository from './OrderRepository.js';

export default class OrderRepositoryDatabase implements OrderRepository {
  constructor(readonly conn: pg.IBaseProtocol<{}>) {}

  async getById(idOrder: number): Promise<Order | null> {
    return this.conn.tx(async (t) => {
      const selectOrder = new pg.ParameterizedQuery({
        text: `SELECT o.id_order,
                  o.buyer,
                  o.coupon_code,
                  o.total,
                  o.freight,
                  o.created_at::text,
                  c.percentage,
                  c.expiresAt::text
              FROM cccat10.order o
                  LEFT JOIN cccat10.coupon c ON o.coupon_code = c.code
              WHERE o.id_order = $1`,
      });
      type SelectOrderProjection = {
        id_order: number;
        buyer: string;
        total: number;
        freight: number;
        created_at: string;
      } & (
        | {
            coupon_code: null;
            percentage: null;
            expiresat: null;
          }
        | {
            coupon_code: string;
            percentage: number;
            expiresat: string;
          }
      );

      const fetchedOrder = await t.oneOrNone(
        selectOrder,
        [idOrder],
        (result: SelectOrderProjection) => {
          const o = new Order(
            result.buyer,
            undefined,
            result.id_order,
            Temporal.Instant.from(result.created_at),
          );
          if (result.coupon_code) {
            o.addCoupon(
              new Coupon(
                result.percentage,
                result.coupon_code,
                Temporal.PlainDate.from(result.expiresat),
              ),
            );
          }
          return o;
        },
      );
      if (!fetchedOrder) {
        return null;
      }

      const selectItems = new pg.ParameterizedQuery({
        text: `SELECT oi.id_order,
                  oi.id_product,
                  oi.price as totalPrice,
                  oi.quantity,
                  p.description,
                  p.price,
                  p.weight,
                  p.height,
                  p.width,
                  p.depth,
                  p.currency
              from cccat10.order_items oi
                  JOIN cccat10.product p ON oi.id_product = p.id_product
              WHERE oi.id_order = $1`,
      });
      type SelectItemProjection = {
        id_order: number;
        id_product: number;
        totalPrice: number;
        quantity: number;
        description: string;
        price: number;
        weight: number;
        height: number;
        width: number;
        depth: number;
        currency: string;
      };
      const saleItems = await t.map(
        selectItems,
        [fetchedOrder.idOrder],
        (row: SelectItemProjection) => {
          const product = new Product(
            row.id_product,
            row.description,
            row.price,
            new ProductDimensions(row.weight, row.height, row.width, row.depth),
            row.currency,
          );
          return { product, quantity: row.quantity };
        },
      );

      saleItems.forEach(({ product, quantity }) => {
        fetchedOrder.addItem(product, quantity);
      });

      return fetchedOrder;
    });
  }

  async createOrder(order: Order): Promise<Order> {
    return this.conn.tx(async (t) => {
      const orderQuery = `INSERT INTO cccat10.order (buyer, coupon_code, total, freight) VALUES ($1, $2, $3, $4) RETURNING id_order`;
      const idOrder = await t.one(
        orderQuery,
        [
          order.buyer.toString(),
          order.getCoupon(),
          order.getTotal(),
          order.getTotalFreightCost(1000),
        ],
        (order) => +order.id_order,
      );

      order.idOrder = idOrder;

      const itemQuery = `INSERT INTO cccat10.order_items (id_order, id_product, price, quantity) VALUES ($1, $2, $3, $4)`;
      await t.batch(
        order.saleItems.map((item) =>
          t.query(itemQuery, [
            idOrder,
            item.product.id,
            item.getTotalCost(order.currencyTable),
            item.quantity,
          ]),
        ),
      );

      return order;
    });
  }
}
