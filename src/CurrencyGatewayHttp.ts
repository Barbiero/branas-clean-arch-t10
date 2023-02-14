import axios from 'axios';
import CurrencyGateway from './CurrencyGateway.js';
import CurrencyTable from "./domain/entity/CurrencyTable.js";

export default class CurrencyGatewayHttp implements CurrencyGateway {
  async getCurrencies(): Promise<CurrencyTable> {
    const response = await axios.get<Record<string, number>>(
      'http://localhost:3001/currencies',
    );
    const { data } = response;
    const cTable = new CurrencyTable(data);

    return cTable;
  }
}
