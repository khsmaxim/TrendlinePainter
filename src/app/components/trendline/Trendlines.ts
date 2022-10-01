import { IPoint } from 'src/app/models/Point';
import { Draw } from 'src/app/utils/Draw';
import { EventDispatcher, Handler } from 'src/app/models/EventDispatcher';
import { Axies } from 'src/app/models/Axies';
import { Candles, ICandle, ICandles } from 'src/app/models/Candles';
import { ITimeRange } from 'src/app/models/TimeRange';
import { Trendline, TrendlineGrade } from 'src/app/models/Tendline';

interface IDrawTrendColors {
  general: {
    color: string,
    width: number
  },
  high: {
    color: string,
    width: number
  },
  low: {
    color: string,
    width: number
  },
  diagonal: {
    color: string,
    width: number
  },
  min: {
    color: string,
    size: number,
    width: number
  },
  max: {
    color: string,
    size: number,
    width: number
  }
}

interface RevalidateEvent {}

export class Trendlines {

  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  private _axies: Axies;

  private _tg12h: TrendlineGrade | undefined;

  constructor(axies: Axies) {
    this._axies = axies;
    this._canvas = document.createElement('canvas');
    this._canvas.width = this._axies.time.width;
    this._canvas.height = this._axies.price.height;
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  set axies(axies: Axies) {
    this._axies = axies;
    this._canvas.width = this._axies.time.width;
    this._canvas.height = this._axies.price.height;
  }

  get image(): CanvasImageSource {
    return this._canvas;
  }

  get tg12h(): TrendlineGrade | undefined {
    return this._tg12h;
  }

  private onRevalidateDispatcher = new EventDispatcher<RevalidateEvent>();
  public onRevalidate(handler: Handler<RevalidateEvent>) {
    this.onRevalidateDispatcher.register(handler);
  }
  private fireRevalidate(event: RevalidateEvent) {
    this.onRevalidateDispatcher.fire(event);
  }

  private clearCtx() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  get info() {
    return {}
  }

  /**
   * Просчитывает и выресовывает линии тренда в рамках запроса времени
   * @param {Candles} candles all candles on the chart
   */
  apply(candles:Candles) { // , timeRange: ITimeRange
    this.clearCtx();

    // текущая точка/свеча позиции времени на графике (timeRange.end)
    let time: number = candles.end;
    let candle: ICandle = candles.data[time];
    let pt: IPoint = {
      x: this._axies.time.o2d(candles.end),
      y: this._axies.price.o2d(candle.open)
    };
    Draw.strokepoint(this._ctx, pt.x, pt.y, 3, 1, 'rgba(49,165,219,1)');

    this._tg12h = this.estimateTrend(candles, 0);
    this.drawTrend(this.tg12h!, {
      general: { color: 'rgba(255,0,255,1)', width: 1 },
      high: { color: 'rgba(255,0,0,1)', width: 1 },
      low: { color: 'rgba(26,155,0,1)', width: 1 },
      diagonal: { color: 'rgba(31,0,247,1)', width: 1 },
      min: { color: 'rgba(26,155,0,1)',size: 10, width: 1 },
      max: { color: 'rgba(255,0,0,1)',size: 10, width: 1 }
    });
  }

  private estimateTrend(candles: Candles, minDuration: number): TrendlineGrade {
    let tg = new TrendlineGrade();
    tg.general.validate(candles.start);
    let low: number = NaN;
    let high: number = NaN;
    let x: number;
    let chigh: number, clow: number;
    let time: number | null = null;
    for (let key in candles.data) {
      time = Number(key);
      x = this._axies.time.o2d(time);
      chigh = candles.data[time].high;
      clow = candles.data[time].low;
      tg.change.ticker = candles.data[time].close;
      // new minimum point
      if (isNaN(low) || clow <= low) {
        low = high = chigh = clow;
        tg.low.validate(time);
        tg.change.low = low;
      }
      // new maximum point
      if (chigh >= high) {
        high = chigh;
        tg.high.validate(time);
        tg.change.high = high;
        // в случае когда новый максимум, надо расчитать линию до закрытия этой же свечи
        if (chigh != low) {
          tg.high.line = {
            start: {x: x, y: this._axies.price.o2d(chigh)},
            end: {x: x, y: this._axies.price.o2d(candles.data[time].close)}
          }
        }
      }
      tg.low.push(time, {x: x, y: this._axies.price.o2d(clow)});
      tg.high.push(time, {x: x, y: this._axies.price.o2d(chigh)});
      tg.general.push(time, {x: x, y: this._axies.price.o2d(candles.data[time].open)});
    }
    tg.estimate(minDuration);
    return tg;
  }

  drawTrend(tg: TrendlineGrade, idtc: IDrawTrendColors) {
    if (tg.general.line) {
      Draw.line(this._ctx, tg.general.line.start.x, tg.general.line.start.y, tg.general.line.end.x, tg.general.line.end.y, idtc.general.width, idtc.general.color);
    }
    // самая максимальная точка на графике (начиная от самой минимальной)
    if (tg.high.points) {
      Draw.strokrect(this._ctx, tg.high.points[0].x, tg.high.points[0].y, idtc.max.size, idtc.max.width, idtc.max.color);
    }
    // самая минимальная точка на графике
    if (tg.low.points) {
      Draw.strokrhombus(this._ctx, tg.low.points[0].x, tg.low.points[0].y, idtc.min.size, idtc.min.width, idtc.min.color);
    }
    if (tg.high.line) {
      Draw.line(this._ctx, tg.high.line.start.x, tg.high.line.start.y, tg.high.line.end.x, tg.high.line.end.y, idtc.high.width, idtc.high.color);
    }
    if (tg.low.line) {
      Draw.line(this._ctx, tg.low.line.start.x, tg.low.line.start.y, tg.low.line.end.x, tg.low.line.end.y, idtc.low.width, idtc.low.color);
    }
    if (tg.diagonal.line) {
      Draw.line(this._ctx, tg.diagonal.line.start.x, tg.diagonal.line.start.y, tg.diagonal.line.end.x, tg.diagonal.line.end.y, idtc.diagonal.width, idtc.diagonal.color);
    }
  }

  reset() {
    this._tg12h = undefined;
    this.clearCtx();
  }
}
