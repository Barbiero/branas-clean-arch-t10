import { expect, test } from 'vitest';
import Product, { ProductDimensions } from '../src/Product.js';

test('Nenhuma dimensão do item pode ser negativa', () => {
  expect(() => {
    new Product(
      1,
      'camera',
      -1,
      new ProductDimensions(1, 0.15, 0.2, 0.1),
    );
  }).toThrow('Product must have a positive price');
  expect(() => {
    new Product(
      2,
      'camera',
      1250,
      new ProductDimensions(11, -0.15, 0.2, 0.1),
    );
  }).toThrow('Product must have positive dimensions');
});

test('O peso do item não pode ser negativo', () => {
  expect(() => {
    new Product(
      3,
      'camera',
      1250,
      new ProductDimensions(-1, 0.15, 0.2, 0.1),
    );
  }).toThrow('Product must have positive dimensions');
});

test('Deve calcular densidade corretamente', () => {
  const dimensions = new ProductDimensions(1, 0.15, 0.2, 0.1);
  expect(dimensions.volume).toEqual(0.003);
  expect(dimensions.density).to.approximately(333.3, 0.1);
});

test('Deve calcular o valor do frete com base nas dimensões (altura, largura e profundidade em cm) e o peso dos produtos (em kg)', () => {
  const products = [
    new Product(
      1,
      'camera',
      1250,
      new ProductDimensions(1, 0.15, 0.2, 0.1),
    ),
    new Product(
      2,
      'guitarra',
      5000,
      new ProductDimensions(3, 1, 0.3, 0.1),
    ),
    new Product(
      3,
      'geladeira',
      15000,
      new ProductDimensions(40, 2, 1, 0.5),
    ),
  ];

  test('Deve retornar o preço mínimo de frete caso ele seja superior ao valor calculado', () => {
    expect(products[0].getFreightCost(1000)).toBe(10);
  });
  expect(products[1].getFreightCost(1000)).toBe(30);
  expect(products[2].getFreightCost(1000)).toBe(400);
});
