import { expect, test } from 'vitest';
import Cpf from '../src/Cpf.js';
import Order from '../src/Order.js';
import Product from '../src/Product.js';
import SaleItem from '../src/SaleItem.js';

test('Deve criar um pedido com 3 produtos (com descrição, preço e quantidade) e calcular o valor total ', () => {
  const products = [new Product('banana', 9.0), new Product('feijao', 22.0), new Product('arroz', 25.3)];

  const sale = new Order('088.833.820-13', [
    new SaleItem(products[0], 1.0),
    new SaleItem(products[1], 1.0),
    new SaleItem(products[2], 1.0),
  ]);

  expect(sale.getTotalCost()).toBe(56.3);
});

test('Deve criar um pedido com 3 produtos, associar um cupom de desconto e calcular o total (percentual sobre o total do pedido) ', () => {
  const products = [new Product('banana', 9.0), new Product('feijao', 22.0), new Product('arroz', 25.3)];

  const sale = new Order(
    new Cpf('088.833.820-13'),
    [new SaleItem(products[0], 1.0), new SaleItem(products[1], 1.0), new SaleItem(products[2], 1.0)],
    0.3,
  );

  expect(sale.getTotalCost()).toBe(39.41);
});

test('Não deve criar um pedido com cpf inválido (lançar algum tipo de erro)', () => {
  expect(() => {
    new Order('088.833.820-00', []);
  }).toThrowError('Invalid CPF string');
});
