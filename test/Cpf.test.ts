import { expect, test } from 'vitest';
import Cpf from '../src/Cpf.js';

test.each(['460.126.470-77', '927.683.660-80', '153.781.230-3'])('funciona com %s ', (cpfValido) => {
  expect(() => new Cpf(cpfValido)).not.toThrow();
});

test.each([
  '000.000.000-00',
  '111.111.111-11',
  '222.222.222-22',
  '333.333.333-33',
  '444.444.444-44',
  '555.555.555-55',
  '666.666.666-66',
  '777.777.777-77',
  '888.888.888-88',
  '999.999.999-99',
])('%s deve ser invalido', (cpfInvalido) => {
  expect(() => new Cpf(cpfInvalido)).toThrow();
});

test.each(['460.126.470-76', '460.126.470-67'])('falha com %s', (cpfInvalido) => {
  expect(() => new Cpf(cpfInvalido)).toThrow();
});
test('falha com string que nao é CPF', () => {
  const cpfInvalido = 'not-a-cpf';
  expect(() => new Cpf(cpfInvalido)).toThrow();
});

test.each([
  { input: '46012647077', expected: '460.126.470-77' },
  { input: '1537812303', expected: '153.781.230-03' },
])('receber $input resulta em $expected', ({ input, expected }) => {
  const cpf = new Cpf(input);
  expect(cpf.toString()).toEqual(expected);
});
