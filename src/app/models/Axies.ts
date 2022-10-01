


/**
 * Cells interface
 *
 * @interface ICell
 */
export interface ICell {
  size: number,
  suffix: string
}
class Cell {
  private _size: number;
  private _suffix: string;
  private _count: number;
  private _step: number;

  constructor(icell: ICell, length: number, ticks: number | undefined = undefined) {
    this._size = icell.size;
    this._suffix = icell.suffix;
    this._count = Math.floor(length / this._size);
    this._step = ticks ? ticks / this._count : 1;
  }

  get data(): ICell {
    return {
      size: this._size,
      suffix: this._suffix
    }
  }

  /**
   * Get size of cell in pixel
   */
  get size(): number { return this._size; }

  /**
   * Get ticker suffix
   */
  get suffix(): string { return this._suffix; }

  /**
   * Get count of cells on axis
   */
  get count(): number { return this._count; }

  /**
   * Get the ticker step size for cell
   */
  get step(): number { return this._step; }
}


/**
 * Candle interface
 *
 * @interface ICandle
 * @member {number} size size of candle in pixels
 * @member {number} interval size of candle in minutes
 */
export interface ICandle {
  size: number
  interval: number;
}
class Candle {
  private _size: number;
  private _interval: number;
  private _count: number;

  constructor(icandles: ICandle, width: number) {
    this._size = icandles.size;
    this._interval = icandles.interval;
    this._count = Math.floor(width / this._size);
  }

  get data(): ICandle {
    return {
      size: this._size,
      interval: this._interval
    }
  }

  /**
   * Return interval for every candle in minutes
   */
  get interval(): number { return this._interval; }

  /**
   * Return size of for every candle in pixel
   */
  get size(): number { return this._size; }

  /**
   * Get the total count of candles on axis
   */
  get count(): number { return this._count; }

  /**
   * Get the total minutes on the axis
   */
  get duration(): number { return this._count * this._interval; }
}

/**
 * TimeAxis interface
 *
 * @interface ITimeAxis
 */
export interface ITimeAxis {
  width: number,
  cell: ICell,
  candle: ICandle
}
class TimeAxis {
  private _width: number;
  private _candle: Candle;
  private _cell: Cell;

  constructor(itime: ITimeAxis) {
    this._width = itime.width;
    this._candle = new Candle(itime.candle, this._width);
    this._cell = new Cell(itime.cell, this._width, this._candle.duration);
  }

  get data(): ITimeAxis {
    return {
      width: this._width,
      cell: this._cell.data,
      candle: this._candle.data
    }
  }

  /**
   * Get width of axis in pixel
   * @return {number} of axis in pixel
   */
  get width(): number { return this._width; }

  /**
   * Get cell of axis
   * @return {number} cell of axis
   */
  get cell(): Cell { return this._cell; }

  /**
   * Get candle of axis
   * @return {number} candle of axis
   */
  get candle(): Candle { return this._candle; }

  get kfd2o(): number  { return this._candle.duration / this._width; }
  get kfo2d(): number  { return this._width / this._candle.duration; }

  /**
   * Convert horizontal display X value to origin time X value
   * @param {number} x value of display
   * @return {number} time value of origin
   */
  d2o(x: number): number  {
    return x * this.kfd2o;
  }

  /**
   * Convert origin time X value to horizontal display X value
   * @param {number} time value of origin
   * @return {number} x value of display
   */
  o2d(time: number): number  {
    return time * this.kfo2d;
  }
}

/**
 * PriceAxis interface
 *
 * @interface IPriceAxis
 */
export interface IPriceAxis {
  height: number,
  cell: ICell
}
class PriceAxis {
  private _height: number;
  private _cell: Cell;

  constructor(iprice: IPriceAxis) {
    this._height = iprice.height;
    this._cell = new Cell(iprice.cell, this._height);
  }

  get data(): IPriceAxis {
    return {
      height: this._height,
      cell: this._cell.data
    }
  }

  /**
   * Get height of axis in pixel
   * @return {number} of axis in pixel
   */
  get height(): number { return this._height; }

  /**
   * Get cell of axis
   * @return {number} cell of axis
   */
  get cell(): Cell { return this._cell; }

  /**
   * Convert vertical display Y value to origin opposite price Y value
   * @param {number} y value of display
   * @return {number} price value of origin
   */
  d2o(y: number): number  {
    // translate display Y to opposite origin Y
    let diff = 100 - (y * 100 / this._height)
    return this.cell.count * diff / 100;
  }

  /**
   * Convert origin price Y value to vertical display opposite Y value
   * @param {number} price value of origin
   * @return {number} y value of display
   */
  o2d(price: number): number  {
    let diff = 100 - (price * 100 / this.cell.count)
    return this._height * diff / 100;
  }
}

/**
 * Axies interface
 *
 * @interface IAxies
 */
export interface IAxies {
  time: ITimeAxis,
  price: IPriceAxis
}
export class Axies {
  private _time: TimeAxis;
  private _price: PriceAxis;

  constructor(iaxies: IAxies) {
    this._time = new TimeAxis(iaxies.time);
    this._price = new PriceAxis(iaxies.price);
  }

  get time(): TimeAxis { return this._time; }
  get price(): PriceAxis { return this._price; }

  get data(): IAxies {
    return {
      time: this._time.data,
      price: this._price.data
    }
  }
}
