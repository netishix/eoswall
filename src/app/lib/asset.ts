import { Symbol } from '../types';

class Asset {

  public amount: string;
  public symbol: Symbol;

  constructor(amount: number, symbol: Symbol) {
    this.symbol = symbol;
    this.amount = amount.toFixed(this.symbol.precision);
  }

  public static fromString(input: string): Asset {
    const parts = input.split(' ');
    const amount = parseFloat(parts[0]);
    const symbol = { name: parts[1], precision: parts[0].split('.')[1].length };
    return new Asset(amount, symbol);
  }

  public toString(): string {
    return `${this.amount} ${this.symbol.name}`;
  }

}

export { Asset };
