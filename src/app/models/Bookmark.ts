import { ICandles } from 'src/app/models/Candles';
import { Axies, IAxies } from 'src/app/models/Axies';

export interface IBoorkmark {
  name: string,
  axies: IAxies,
  candles: ICandles,
  screenshot: string,
  time: number,
  template: boolean
}

export interface IBoorkmarks {
  [key:string]: IBoorkmark;
}

export class Boorkmark {
  name: string;
  axies: Axies;
  candles: ICandles;
  screenshot: string;
  time: number;
  template: boolean;

  constructor(item: IBoorkmark) {
    this.name = item.name;
    this.axies = new Axies(item.axies);
    this.candles = item.candles;
    this.screenshot = item.screenshot;
    this.time = item.time;
    this.template = item.template || false;
  }
}
