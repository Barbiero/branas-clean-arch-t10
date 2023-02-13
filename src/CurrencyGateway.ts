export default interface CurrencyGateway {
  getCurrencies(): Promise<Record<string, number>>;
}
