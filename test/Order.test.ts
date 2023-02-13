import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, test } from 'vitest';
import Coupon from '../src/Coupon.js';
import Cpf from '../src/Cpf.js';
import Order from '../src/Order.js';
import Product, { ProductDimensions } from '../src/Product.js';
import SaleItem from '../src/SaleItem.js';

const products = [
  new Product(1, 'camera', 1250, new ProductDimensions(1, 0.15, 0.2, 0.1)),
  new Product(2, 'guitarra', 5000, new ProductDimensions(3, 1, 0.3, 0.1)),
  new Product(3, 'geladeira', 15000, new ProductDimensions(40, 2, 1, 0.5)),
];

describe('Criação de pedido', () => {
  test('Deve criar um pedido com 3 produtos (com descrição, preço e quantidade) e calcular o valor total ', () => {
    const sale = new Order('088.833.820-13', [
      new SaleItem(products[0], 1.0),
      new SaleItem(products[1], 1.0),
      new SaleItem(products[2], 1.0),
    ]);

    expect(sale.getTotalCost(1000)).toBe(21690);
  });

  test('Deve criar um pedido com 3 produtos, associar um cupom de desconto e calcular o total (percentual sobre o total do pedido) ', () => {
    const sale = new Order(
      new Cpf('088.833.820-13'),
      [
        new SaleItem(products[0], 1.0),
        new SaleItem(products[1], 1.0),
        new SaleItem(products[2], 1.0),
      ],
      [new Coupon(0.3, 'BANANA', Temporal.PlainDate.from('2030-10-10'))],
    );

    expect(sale.getTotalCost(1000)).toBe(15315);
  });

  test('Não deve criar um pedido com cpf inválido (lançar algum tipo de erro)', () => {
    expect(() => {
      new Order('088.833.820-00', []);
    }).toThrowError('Invalid CPF string');
  });

  test('Não deve aplicar cupom de desconto expirado', () => {
    const sale = new Order(
      new Cpf('088.833.820-13'),
      [
        new SaleItem(products[0], 1.0),
        new SaleItem(products[1], 1.0),
        new SaleItem(products[2], 1.0),
      ],
      [new Coupon(0.3, 'BANANA', Temporal.PlainDate.from('2003-10-10'))],
    );
    expect(() => sale.getTotalCost(1000)).toThrow('Invalid coupon');
  });

  test('Ao fazer um pedido, a quantidade de um item não pode ser negativa', () => {
    expect(() => {
      new Order(
        new Cpf('088.833.820-13'),
        [
          new SaleItem(products[0], -1.0),
          new SaleItem(products[1], 1.0),
          new SaleItem(products[2], 1.0),
        ],
        [new Coupon(0.3, 'BANANA', Temporal.PlainDate.from('2003-10-10'))],
      );
    }).toThrow('Sale Item must have some positive quantity');
  });

  test('Deve gerar o número de série do pedido', () => {});
  test('Deve fazer um pedido, salvando no banco de dados', () => {});
  test('Deve simular o frete, retornando o frete previsto para o pedido', () => {});
  test('Deve validar o cupom de desconto, indicando em um boolean se o cupom é válido', () => {});
});
