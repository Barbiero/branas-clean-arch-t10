import Order from '../domain/entity/Order.js';

export default interface OrderRepository {
  getById(idOrder: number): Promise<Order | null>;
  createOrder(order: Order): Promise<Order>;
}
