export interface Prices {
  [token: string]: number;
}

export interface PriceItem {
  currency: string;
  date: string;
  price: number;
}
