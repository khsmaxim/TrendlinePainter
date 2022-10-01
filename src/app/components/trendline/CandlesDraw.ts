import { IPoint } from 'src/app/models/Point';
import { EventDispatcher, Handler } from 'src/app/models/EventDispatcher';
import { Draw } from 'src/app/utils/Draw';
import { ICandles, ICandle, Candles } from 'src/app/models/Candles';
import { Axies } from 'src/app/models/Axies';
import MathUtil from 'src/app/utils/MathUtil';

// https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse

export enum CandlesDrawRevalidateEventType {
  Draw,
  Candles
}

export interface CandlesDrawRevalidateEvent {
  type: CandlesDrawRevalidateEventType;
}

class CircuitPath {
  prev!: IPoint;
  curr!: IPoint;
  minX!: number;
  points!: Array<IPoint>;

  constructor() {
    this.reset();
  }

  reset() {
    this.prev = {x: 0, y: 0};
    this.curr = {x: 0, y: 0};
    this.minX = 0;
    this.points = new Array<IPoint>();
  }
}

export class CandlesDraw {

  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  private _COLORS = {
    marker: "rgba(49,165,219,0.5)",
    line: 'rgba(106,106,106,0.1)',
    circuit: 'rgba(0,252,255,1)'
  };

  private _circuitPath: CircuitPath;
  private _candles: Candles;

  private _drawFlag = false;
  private _entryFlag = false;

  private _axies: Axies;

  constructor(axies: Axies) {
    this._axies = axies;
    this._circuitPath = new CircuitPath();
    this._candles = new Candles();
    this._canvas = document.createElement('canvas');
    this._canvas.width = this._axies.time.width;
    this._canvas.height = this._axies.price.height;
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;

    // let length = Math.min(this._vcells.cellsCount, this._hcells.cellsCount);
    // for (let ii = 1; ii < length; ii++) {
    //   this._circuitPath.points.push({x: this._hcells.cellSize * ii, y: this._vcells.cellsSize - (this._vcells.cellSize * ii)});
    // }
    // this.initChartPoints();
    // this.fireRevalidate({type: CandlesDrawRevalidateEventType.Candles});

    // this.intersectTest();
  }

  get info() {
    return {
    }
  }

  get image(): CanvasImageSource {
    return this._canvas;
  }

  set axies(axies: Axies) {
    this._axies = axies;
    this._canvas.width = this._axies.time.width;
    this._canvas.height = this._axies.price.height;
  }

  get candles(): Candles { return this._candles; }
  set candles(candles:Candles) {
    this._candles = candles; // new Candles(candles);
  }

  private onRevalidateDispatcher = new EventDispatcher<CandlesDrawRevalidateEvent>();
  public onRevalidate(handler: Handler<CandlesDrawRevalidateEvent>) {
    this.onRevalidateDispatcher.register(handler);
  }
  private fireRevalidate(event: CandlesDrawRevalidateEvent) {
    this.onRevalidateDispatcher.fire(event);
  }

  onDown(event:MouseEvent) { this.findxy('down', event); }
  onMove(event:MouseEvent) { this.findxy('move', event); }
  onUp(event:MouseEvent)   { this.findxy('up', event);   }
  onOut(event:MouseEvent)  { this.findxy('out', event);  }

  private initChartPoints() {
    let pt0: IPoint = this._circuitPath.points[0],
        pt1: IPoint,
        nextX: number = Math.ceil(pt0.x / this._axies.time.candle.size) * this._axies.time.candle.size,
        prev: IPoint | null = null,
        curr: IPoint | null = null,
        count: number,
        dist: number,
        dx: number,
        dy: number,
        l: number,
        // dirX: number,
        dirY: number,
        alpha: number,
        time: number,
        open: number,
        close: number,
        high: number,
        low: number;
    // this.nextX = nextX;
    // this.drawCircuitPt(pt0.x, pt0.y);
    for (let jj = 1; jj < this._circuitPath.points.length; jj++) {
      pt0 = this._circuitPath.points[jj - 1];
      pt1 = this._circuitPath.points[jj];
      // this.drawCircuitPt(pt1.x, pt1.y);
      if (pt1.x >= nextX) {
        count = Math.floor((pt1.x - nextX) / this._axies.time.candle.size) + 1;
        for (let ii = 0; ii < count; ii++) {
          // https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B5_%D1%82%D1%80%D0%B5%D1%83%D0%B3%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2
          // https://poschitat.online/storony-pryamougolnogo-treugolnika
          // находим длину исходного прямоугольного треугольника
          dx = pt1.x - pt0.x;
          dy = pt1.y - pt0.y;
          // находим гипотенузу по катетам
          l = Math.sqrt((dx * dx) + (dy * dy)); // c = √(a² + b²)
          // находим угол α исходного прямоугольного треугольника
          alpha = Math.atan(dy/dx);
          // находим гипотенузу по катету b и угла alpha
          dist = Math.abs(nextX - pt0.x) / Math.cos(alpha); // b/cos(α)
          // находим направляющий вектор и на длину и прибавляем к началу
          // dirX = pt0.x + ((dx / l) * dist); == nextX
          dirY = pt0.y + ((dy / l) * dist);
          // console.info(`[${jj}][${ii}]: α(${MathUtil.radians2degrees(alpha)}), гипотенуза(${dist}) pt(${nextX})`);
          if (curr) {
            prev = {x: curr.x, y: curr.y};
          }
          curr = {x: nextX, y: dirY};
          if (prev) {
            this.drawLine(prev.x, prev.y, curr.x, curr.y);
            time = this._axies.time.d2o(prev.x);
            open = this._axies.price.d2o(prev.y);
            close = this._axies.price.d2o(curr.y);
            this._candles.extend(time, {
              open: open,
              close: close,
              high: Math.max(open, close) + MathUtil.randFloat(0, Math.abs(open - close)) * MathUtil.randFloat(0, 1),
              low: Math.min(open, close) - MathUtil.randFloat(0, Math.abs(open - close)) * MathUtil.randFloat(0, 1)
            });
            // console.info(`prev.x(${prev.x}) => time(${time}), prev.y(${prev.y}) => open(${this._candles[time].open}), curr.y(${curr.y}) => close(${this._candles[time].close})`);
            this.drawCandle(time, this._candles.data[time]);
          }
          this.drawMarkpoint(curr.x, curr.y);
          nextX += this._axies.time.candle.size;
        }
      }
    }
    // console.info(this._candles);
  }

  redraw() {
    this.clearCtx();
    let prev: IPoint | null = null;
    let curr: IPoint | null = null;
    let time: number | null = null;
    for (let key in this._candles.data) {
      time = Number(key);
      if (curr) {
        prev = {x: curr.x, y: curr.y };
      }
      curr = {
        x: this._axies.time.o2d(time),
        y: this._axies.price.o2d(this._candles.data[time].open)
      };
      if (prev) {
        this.drawLine(prev.x, prev.y, curr.x, curr.y);
      }
      this.drawMarkpoint(curr.x, curr.y);
      this.drawCandle(time, this._candles.data[time]);
    }
    if (curr && time) {
      prev = {x: curr.x, y: curr.y };
      curr = {
        x: this._axies.time.o2d(time + this._axies.time.candle.interval),
        y: this._axies.price.o2d(this._candles.data[time].close)
      };
      this.drawLine(prev.x, prev.y, curr.x, curr.y);
      this.drawMarkpoint(curr.x, curr.y);
    }
    // this.fireRevalidate({type: CandlesDrawRevalidateEventType.Candles});
  }

  private findxy(type:string, event:MouseEvent) {
    if (type == 'down') {
      if (!this._entryFlag) {
        this._circuitPath.curr.x = event.offsetX;
        this._circuitPath.curr.y = event.offsetY;
        this._circuitPath.minX = Math.max(this._circuitPath.minX, this._circuitPath.curr.x);
        this._circuitPath.points.push({x: this._circuitPath.curr.x, y: this._circuitPath.curr.y});
        this._entryFlag = true;
      }
      this._drawFlag = true;
    }
    if (type == 'up' || type == "out") {
      if (this._drawFlag && this._circuitPath.points.length) {
        this.clearCtx();
        this.initChartPoints();
        this._drawFlag = false;
        this.fireRevalidate({type: CandlesDrawRevalidateEventType.Candles});
      }
    }
    if (type == 'move') {
      if (this._drawFlag) {
        if (event.offsetX < this._circuitPath.minX) {
          this._circuitPath.curr.x = event.offsetX;
        }
        else {
          this._circuitPath.prev.x = this._circuitPath.curr.x;
          this._circuitPath.prev.y = this._circuitPath.curr.y;
          this._circuitPath.curr.x = event.offsetX;
          this._circuitPath.curr.y = event.offsetY;
          this._circuitPath.minX = Math.max(this._circuitPath.minX, this._circuitPath.curr.x);
          this._circuitPath.points.push({x: this._circuitPath.curr.x, y: this._circuitPath.curr.y});
          this.drawCircuit();
        }
        this.fireRevalidate({type: CandlesDrawRevalidateEventType.Draw});
      }
    }
  }

  reset() {
    this._entryFlag = false;
    // this.nextX = 0;
    // this.jj = 0;
    this._circuitPath.reset();
    this._candles.clean();
    this.clearCtx();
  }

  private clearCtx() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  private drawCandle(time: number, candle: ICandle) {
    let dx: number = this._axies.time.o2d(time);
    let dw: number = this._axies.time.candle.size;
    let dy0: number = this._axies.price.o2d(candle.open);
    let dy1: number = this._axies.price.o2d(candle.close);
    let dh: number = dy1 - dy0;
    // console.info(`time(${time}) => prev.x(${dx}), open(${candle.open}) => prev.y(${dy0}), close(${candle.close}) => curr.y(${dy1})`);
    let ly0 = this._axies.price.o2d(candle.high);
    let ly1 = this._axies.price.o2d(candle.low);
    Draw.line(this._ctx, dx, ly0, dx, dy0, 2, dh <= 0 ?  'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)');
    Draw.line(this._ctx, dx, dy1, dx, ly1, 2, dh <= 0 ?  'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)');
    Draw.fillrect(this._ctx, dx - dw/2, dy0, dw, dh, dh <= 0 ?  'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)');
  }

  private drawMarkpoint(x: number, y: number) {
    var radius = 1.2;
    this._ctx.beginPath();
    this._ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this._ctx.fillStyle = this._COLORS.marker;
    this._ctx.lineWidth = 0;
    this._ctx.fill();
    this._ctx.closePath();
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    Draw.line(this._ctx, x1, y1, x2, y2, 1, 'rgba(106,106,106,0.4)')
  }

  private drawCircuit() {
    this._ctx.beginPath();
    this._ctx.strokeStyle = this._COLORS.circuit;
    this._ctx.lineWidth = 1;
    this._ctx.lineJoin = 'bevel';
    this._ctx.moveTo(this._circuitPath.prev.x, this._circuitPath.prev.y);
    this._ctx.lineTo(this._circuitPath.curr.x, this._circuitPath.curr.y);
    this._ctx.stroke();
    this._ctx.closePath();
  }

  /* private drawCircuitPt(x: number, y: number) {
    var radius = 1.4;
    this._ctx.beginPath();
    this._ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this._ctx.fillStyle = 'rgba(255,0,0,0.8)';
    this._ctx.lineWidth = 0;
    this._ctx.fill();
    this._ctx.closePath();
  }

  private drawCircuitPt2(x: number, y: number) {
    var radius = 2;
    this._ctx.beginPath();
    this._ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this._ctx.fillStyle = 'rgba(0,255,0,0.8)';
    this._ctx.lineWidth = 0;
    this._ctx.fill();
    this._ctx.closePath();
  }

  private nextX: number;
  private jj: number = 0;
  next() {
    this.jj++;
    let pt0: IPoint;
    let pt1: IPoint;
    let dist: number, dx: number, dy: number, l: number, dirX: number, dirY: number, alpha: number;
    pt0 = this._circuitPath.points[this.jj - 1];
    pt1 = this._circuitPath.points[this.jj];
    this.drawCircuitPt(pt1.x, pt1.y);
    if (pt1.x >= this.nextX) {
      let count = Math.floor((pt1.x - this.nextX) / this._axies.timeAxis.candle.size) + 1;
      for (let ii = 0; ii < count; ii++) {
        // https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B5_%D1%82%D1%80%D0%B5%D1%83%D0%B3%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2
        // https://poschitat.online/storony-pryamougolnogo-treugolnika
        // находим длину исходного прямоугольного треугольника
        dx = pt1.x - pt0.x;
        dy = pt1.y - pt0.y;
        // находим гипотенузу по катетам
        l = Math.sqrt((dx * dx) + (dy * dy)); // c = √(a² + b²)
        // находим угол α исходного прямоугольного треугольника
        alpha = Math.atan(dy/dx);
        // находим гипотенузу по катету b и угла alpha
        dist = Math.abs(this.nextX - pt0.x) / Math.cos(alpha); // b/cos(α)
        // находим точку (находим направляющий вектор и на длину и прибавляем к началу)
        // dirX = pt0.x + ((dx / l) * dist);
        dirY = pt0.y + ((dy / l) * dist);
        console.info(`[${this.jj}][${ii}]: α(${MathUtil.radians2degrees(alpha)}), гипотенуза(${dist}) pt(${this.nextX})`);
        this.drawCircuitPt2(this.nextX, dirY);
        this.nextX += this._axies.timeAxis.candle.size;
      }
    }
  } */

  /* intersectTest() {
    let pt0: IPoint = {x: 114, y: 348};
    let pt1: IPoint = {x: 265, y: 240};
    this._ctx.beginPath();
    this._ctx.strokeStyle = this._COLORS.circuit;
    this._ctx.lineWidth = 3;
    this._ctx.lineJoin = 'bevel';
    this._ctx.moveTo(pt0.x, pt0.y);
    this._ctx.lineTo(pt1.x, pt1.y);
    this._ctx.stroke();
    this._ctx.closePath();

    let pt3: IPoint = {x: 160, y: pt0.y};

    // https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B5_%D1%82%D1%80%D0%B5%D1%83%D0%B3%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2
    // https://poschitat.online/storony-pryamougolnogo-treugolnika
    // находим длину исходного прямоугольного треугольника
    var dx = pt1.x - pt0.x;
    var dy = pt1.y - pt0.y;
    // находим гипотенузу по катетам
    var l = Math.sqrt((dx * dx) + (dy * dy)); // c = √(a² + b²)
    // находим угол α исходного прямоугольного треугольника
    let alpha = Math.atan(dy/dx);
    // находим длину внутреннего прямоугольного треугольника по точке на оси х
    // let l2 = Math.sqrt(Math.pow(pt3.x - pt0.x, 2)); // c = √(a² + b²) где b=0
    // находим гипотенузу по катету b и угла alpha
    let dist = Math.abs(pt3.x - pt0.x) / Math.cos(alpha); // b/cos(α)
    console.info(`alpha(${MathUtil.radians2degrees(alpha)}) гипотенуза(${dist})`);
    // находим направляющий вектор
    var dirX = dx / l;
    var dirY = dy / l;
    // умножаем направляющий вектор на необх длину
    dirX *= dist;
    dirY *= dist;
    // находим точку
    var resX = dirX + pt0.x;
    var resY = dirY + pt0.y;
    console.info(resX, resY);
    this.drawMarkpoint(resX, resY);
    this.nextX += this._axies.timeAxis.candle.size;
  } */
}
