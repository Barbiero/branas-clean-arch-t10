import axios from 'axios';
import { describe, expect, test } from 'vitest';

const LOCALCONN = 'http://localhost:3000';
axios.defaults.validateStatus = () => true;
let isApiDown = false;
try {
  const healthCheck = await axios.get(`${LOCALCONN}/health`);
  if (healthCheck.status > 299 || healthCheck.status < 200) {
    isApiDown = true;
  }
} catch (err) {
  isApiDown = true;
}

describe.skipIf(isApiDown).concurrent('api tests', async () => {
  test('pode pedir 1 produto', async () => {
    const resp = await axios.post(`${LOCALCONN}/checkout`, {
      cpf: '460.126.470-77',
      orders: [
        {
          idProduct: 1,
          count: 1,
        },
      ],
      from: '68900-102',
      to: '68900-102',
    });

    expect(resp.status).toBe(200);
    expect(resp.data.total).toBe(1260);
  });

  test('pode pedir 1 produto com cupom', async () => {
    const resp = await axios.post(`${LOCALCONN}/checkout`, {
      cpf: '460.126.470-77',
      orders: [
        {
          idProduct: 1,
          count: 1,
        },
      ],
      coupon: 'VALE20',
      from: '68900-102',
      to: '68900-102',
    });

    expect(resp.status).toBe(200);
    expect(resp.data.total).toBe(1010);
  });

  test('não pode pedir com cpf invalido', async () => {
    const resp = await axios.post(`${LOCALCONN}/checkout`, {
      cpf: '460.126.470-00',
      orders: [
        {
          idProduct: 1,
          count: 1,
        },
      ],
      from: '68900-102',
      to: '68900-102',
    });

    expect(resp.status).toBe(422);
    expect(resp.data.total).toBe(undefined);
  });

  test('não pode pedir com item duplicado', async () => {
    const resp = await axios.post(`${LOCALCONN}/checkout`, {
      cpf: '460.126.470-77',
      orders: [
        {
          idProduct: 1,
          count: 1,
        },
        {
          idProduct: 1,
          count: 3,
        },
      ],
      from: '68900-102',
      to: '68900-102',
    });

    expect(resp.status).toBe(422);
    expect(resp.data.total).toBe(undefined);
  });
  test('pode pedir 3 itens', async () => {
    const resp = await axios.post(`${LOCALCONN}/checkout`, {
      cpf: '460.126.470-77',
      orders: [
        {
          idProduct: 1,
          count: 1,
        },
        {
          idProduct: 2,
          count: 3,
        },
        {
          idProduct: 3,
          count: 4,
        },
      ],
      from: '68900-102',
      to: '68900-102',
    });

    expect(resp.status).toBe(200);
    expect(resp.data.total).toBe(77950);
  });

  test('consegue simular o frete', async () => {
    const queryParams = {
      orders: [
        { idProduct: '1', count: '10' },
        { idProduct: '2', count: '20' },
      ],
      cepFrom: '123456-011',
      cepTo: '123456-011',
    };
    const resp = await axios.get(`${LOCALCONN}/freight`, {
      params: queryParams,
    });

    expect(resp.status).toBe(200);
    expect(resp.data).toBe(700);
  });
  test('Deve validar o cupom de desconto, indicando em um boolean se o cupom é válido', async () => {
    const resp = await axios.get(`${LOCALCONN}/coupon/valid`, {
      params: { coupon: 'VALE20' },
    });

    expect(resp.status).toBe(200);
    expect(resp.data).toBe(true);
  });
});
