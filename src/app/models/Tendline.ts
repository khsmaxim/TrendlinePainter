import MathUtil from "src/app/utils/MathUtil";
import { IPoint } from "src/app/models/Point";
import { TimeRange } from "src/app/models/TimeRange";

export interface ILine {
  start: IPoint;
  end: IPoint;
}

export class Trendline {
  protected _line: ILine | undefined;
  protected _timeRange: TimeRange = new TimeRange();

  get entry(): IPoint | undefined {
    return this._line ? this._line.start : undefined;
  }

  get line(): ILine | undefined {
    return this._line;
  }

  set line(line: ILine | undefined) {
    this._line = line;
  }

  get length(): number {
    return this._line ? Math.hypot(this._line.end.x - this._line.start.x, this._line.end.y - this._line.start.y) : 0;
  }

  get radians() {
    if (!this._line) return 0;
    var dx = this._line.start.x - this._line.end.x;
    var dy = this._line.start.y - this._line.end.y;

    // var theta = Math.atan2(dy, dx);   // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = west
    // theta *= 180 / Math.PI;           // [0, 180] then [-180, 0]; clockwise; 0° = west
    // if (theta < 0) theta += 360;      // [0, 360]; clockwise; 0° = west

    // var theta = Math.atan2(-dy, dx);  // [0, Ⲡ] then [-Ⲡ, 0]; anticlockwise; 0° = west
    // theta *= 180 / Math.PI;           // [0, 180] then [-180, 0]; anticlockwise; 0° = west
    // if (theta < 0) theta += 360;      // [0, 360]; anticlockwise; 0° = west

    var theta = Math.atan2(dy, -dx);     // [0, Ⲡ] then [-Ⲡ, 0]; anticlockwise; 0° = east
    // theta *= 180 / Math.PI;              // [0, 180] then [-180, 0]; anticlockwise; 0° = east
    // if (theta < 0) theta += 360;      // [0, 360]; anticlockwise; 0° = east

    // var theta = Math.atan2(-dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
    // theta *= 180 / Math.PI;           // [0, 180] then [-180, 0]; clockwise; 0° = east
    // if (theta < 0) theta += 360;      // [0, 360]; clockwise; 0° = east

    return theta;
  }

  get angle() {
    return MathUtil.radians2degrees(this.radians);
  }

  get timeRange(): TimeRange {
    return this._timeRange;
  }

  set timeRange(timeRange: TimeRange) {
    this._timeRange.start = timeRange.start;
    this._timeRange.end = timeRange.end;
  }

  // https://www-formula.ru/2011-09-19-02-39-24/2011-09-19-03-41-01
  // площадь прямоугольного треугольника через катет и угол
  get kff(): number {
    return (Math.pow(this._timeRange.length, 2) * Math.tan(this.radians)) / 2;
  }
}

export class TrendlinePoints extends Trendline {
  private _points: Array<IPoint> | undefined; // tendline points

  get has1Entry(): boolean {
    return this._points ? this._points.length >= 1 : false;
  }

  get has2Entries(): boolean {
    return this._points ? this._points.length >= 2 : false;
  }

  constructor () {
    super();
    // this._points = undefined; // new Array<IPoint>();
  }

  get points(): Array<IPoint> | undefined {
    return this._points;
  }

  validate(time: number) {
    this._timeRange.start = this._timeRange.end = time;
    this._points = new Array<IPoint>();
  }

  push(time: number, point: IPoint) {
    if (!this._points) throw Error('The trendline line must be validated');
    this._timeRange.end = time;
    this._points.push(point);
  }

  // линия тренда точек
  estimate() {
    if (this._points) {
      if (this._points.length >= 2) {
        this._line = this.calculate(this._points);
      }
    }
  }

  private calculate(points: Array<IPoint>): ILine {
    let a, b, c, d, e, slope, yIntercept;
    let xSum = 0, ySum = 0, xySum = 0, xSquare = 0, length = points.length;
    for(let ii = 0; ii < length; ii++) {
      xySum += (points[ii].x * points[ii].y);
      xSum += points[ii].x;
      ySum += points[ii].y;
      xSquare += Math.pow(points[ii].x, 2);
    }
    a = xySum * length;
    b = xSum * ySum;
    c = length * xSquare;
    d = Math.pow(xSum, 2);
    slope = (a-b)/(c-d);
    e = slope * xSum;
    yIntercept = (ySum - e) / length;
    let line: ILine = {
      start: this.enjoin(points[0].x, slope, yIntercept),
      end: this.enjoin(points[length-1].x, slope, yIntercept)
    };
    return line;
  }

  private enjoin(x: number, slope: number, intercept: number): IPoint {
    return {x: x, y: ((slope * x) + intercept)};
  }
}

export interface Bar {
  high: number,
  low: number
}

export class Change {
  low: number;
  high: number;
  ticker: number;

  constructor () {
    this.low = this.high = this.ticker = 0;
  }

  invalidate() {
    this.low = this.high = this.ticker = 0;
  }

  get diff(): number { return this.ticker - this.low; }

  get position(): number | null { return this.low == this.high ? null : MathUtil.getPercentByRange(this.low, this.high, this.ticker); }
}

export class TrendlineGrade {
  general: TrendlinePoints;
  low: TrendlinePoints;
  high: TrendlinePoints;
  diagonal: Trendline;
  change: Change;

  constructor () {
    this.general = new TrendlinePoints(); // вся линия тренда (general) по позициям открытия свечи
    this.low = new TrendlinePoints(); // линия тренда от минимума (low)
    this.high = new TrendlinePoints(); // линия тренда от максимума (high)
    this.diagonal = new Trendline(); // общая линия тренда из минимальных и максимальных диний тренда
    this.change = new Change();
  }

  get bar(): Bar {
    let length = this.low.length + this.high.length; // 100%
    return {
      high: 100 * this.high.length / length,
      low: 100 * this.low.length / length
    };
  }

  estimate(minDuration: number) {
    if (this.low.timeRange.length < minDuration) {
      this.change.invalidate();
      return;
    }
    this.general.estimate();
    this.high.estimate();
    this.low.estimate();

    if (this.low.line && this.high.line) {
      let xof = this.low.line.start.x - this.high.line.end.x;
      let yof = this.low.line.start.y - this.high.line.end.y;
      this.diagonal.timeRange = this.low.timeRange;
      this.diagonal.line = <ILine>{
        start: {x: this.high.line.start.x + xof, y: this.high.line.start.y + yof},
        end: {x: this.low.line.end.x, y: this.low.line.end.y}
      };
    }
    else {
      if (this.low.line) {
        this.diagonal.timeRange = this.low.timeRange;
        this.diagonal.line = this.low.line;
      }
    }
  }
}
