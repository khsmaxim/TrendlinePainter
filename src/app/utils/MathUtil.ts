
export default class MathUtil {

  static getPercentByRange(min:number, max:number, value:number) {
    if (min == max) return 50;
    return 100 - ((100/(max - min)) * (max - value));
  }

  static getRangeByPercent(min:number, max:number, percent:number) {
    return max - ((max - min)/100) * (100 - percent);
  }

  static max(...args:Array<number>) {
    return Math.max.apply(Math, args.map(o => { return o == null || o == undefined || isNaN(o) ? -Infinity : o; }));
  }

  static min(...args:Array<number>) {
    return Math.min.apply(Math, args.map(o => { return o == null || o == undefined || isNaN(o) ? Infinity : o; }));
  }

  static degrees2radians(degrees:number): number {
    return degrees * (Math.PI/180);
  }

  static radians2degrees(radians:number): number {
    return radians * (180/Math.PI);
  }

  static randFloat(min: number, max: number): number {
    return Number((Math.random() * (max - min) + min).toFixed(2));
  }

  static randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
