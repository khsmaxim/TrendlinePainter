
export interface ICandle {
  high: number;
  open: number;
  close: number;
  low: number;
}

export interface ICandles {
  [time:number]: ICandle
}

export class Candles {
  private _icandles!: ICandles;
  private _start!: number;
  private _end!: number;
  private _length!: number;

  constructor (icandles: ICandles = {}) {
    this._icandles = icandles;
    let keys: Array<string> = Object.keys(this._icandles);
    this._length = keys.length;
    this._start = this._length ? Number(keys[0]) : 0;
    this._end = this._length ? Number(keys[keys.length - 1]) : 0;
  }

  get data(): ICandles {
    return this._icandles;
  }

  get length(): number { return this._length; }
  get start(): number { return this._start; }
  get end(): number { return this._end; }

  getTimeByIndex(index: number): number {
    let keys: Array<string> = Object.keys(this._icandles);
    index = Math.max(0, Math.min(index, keys.length - 1));
    return Number(keys[index]);
  }

  extend(time: number, candle: ICandle) {
    if (this._length == 0) this._start = time;
    this._icandles[time] = candle;
    this._length++;
    this._end = time;
  }

  reorder() {
    this._icandles = Object.keys(this._icandles).sort().reduce(
      (obj: ICandles, key: any) => {
        obj[key] = this._icandles[key];
        return obj;
      },
      {}
    );
  }

  range(from: any, to: any): Candles {
    let source: Candles = new Candles();
    let time: number;
    for (let key in this._icandles) {
      time = Number(key);
      if (time > to) {
        break;
      }
      if (time >= from) {
        source.extend(time, this._icandles[time]);
      }
    }
    return source;
  }

  cut(length: any): Candles {
    return this.range(this.getTimeByIndex(this.length - length), this.end);
  }

  clean() {
    this._icandles = <ICandles>{};
    this._length = 0;
    this._start = 0;
    this._end = 0;
  }
}
