
export interface ITimeRange {
  start: number;
  end: number;
}

export class TimeRange implements ITimeRange {
  start: number = 0;
  end: number = 0;

  get length(): number {
    return this.end - this.start;
  }
}
