import { Symbol } from '../types';

class Asset {

  public amount: number;
  public symbol: Symbol;

  constructor(amount, symbol) {
    this.amount = amount;
    this.symbol = symbol;
  }

  public static fromString(input: string): Asset {
    const parts = input.split(' ');
    const amount = parseFloat(parts[0]);
    const symbol = { name: parts[1], precision: parts[0].split('.')[1].length };
    const asset = new Asset(amount, symbol);
   return asset;
  }

  public toString(): string {
    return `${this.amount.toFixed(this.symbol.precision)} ${this.symbol.name}`;
  }

}

export { Asset };
