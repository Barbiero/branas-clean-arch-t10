import axios from 'axios';
import CurrencyGateway from './CurrencyGateway.js';

export default class CurrencyGatewayHttp implements CurrencyGateway {
  async getCurrencies() {
    const response = await axios.get<Record<string, number>>('http://localhost:3001/currencies');
    return response.data;
  }
}
