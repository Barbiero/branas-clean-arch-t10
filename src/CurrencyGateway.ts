import CurrencyTable from "./domain/entity/CurrencyTable.js";

export default interface CurrencyGateway {
  getCurrencies(): Promise<CurrencyTable>;
}
