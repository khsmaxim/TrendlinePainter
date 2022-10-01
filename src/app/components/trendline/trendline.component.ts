import { Component, Input, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { Draw } from 'src/app/utils/Draw';
import { Grid } from './Grid';
import { CandlesDraw, CandlesDrawRevalidateEvent, CandlesDrawRevalidateEventType } from './CandlesDraw';
import { Trendlines } from './Trendlines';
import { BoorkmarkService } from 'src/app/services/bookmark/bookmark.service';
import { BookmarksModalComponent } from 'src/app/modals/bookmarks-modal/bookmarks-modal.component';
import { Candles, ICandles } from 'src/app/models/Candles';
import { IPoint } from 'src/app/models/Point';
import { TrendlineGrade } from 'src/app/models/Tendline';
import { Axies, IAxies } from 'src/app/models/Axies';
import { DecimalPipe } from '@angular/common';

class CurrentBookmark {
  new: boolean = false;
  id: string | null = null;
  name: string = '';

  get isId(): boolean { return this.id !== null; }
  get isNew(): boolean { return this.new; }
}

@Component({
  selector: 'app-trendline',
  templateUrl: './trendline.component.html',
  styleUrls: ['./trendline.component.scss']
})
export class TrendlineComponent implements OnInit {

  @ViewChild('domCanvas', { static: true })
  domCanvas!: ElementRef<HTMLCanvasElement>;
  private domCtx!: CanvasRenderingContext2D;

  @ViewChild('cogPopover')
  cogPopover!: NgbPopover;

  public iaxies!: IAxies;
  private _axies: Axies = new Axies({
    time: {
      width: 880,
      cell: {
        size: 40,
        suffix: '\u2032'
      },
      candle: {
        size: 10, // size of candle in pixels
        interval: 1 // size of candles in minutes
      }
    },
    price: {
      height: 400,
      cell: {
        size: 50,
        suffix: '%'
      }
    }
  });

  private _grid!: Grid;
  private _draw!: CandlesDraw;
  private _trendlines!: Trendlines;

  private _currCandle!: number;
  private _prevCandle!: number;

  private _isPlaying: boolean;
  get isPlaying() { return this._isPlaying; }

  private _ttid!: any;

  private _currBookmark: CurrentBookmark = new CurrentBookmark();
  get currBookmark(): CurrentBookmark { return this._currBookmark; }

  // private _offrangeAnalize: OffrangeAnalize;

  constructor(
    private _decimalPipe: DecimalPipe,
    private _bookmarkService: BoorkmarkService,
    private _modalService: NgbModal
  ) {
    this.resetCurrPoint();
    this._isPlaying = false;
    this.initIAxis();
  }

  get info() {
    return {
      candlesDraw: this._draw.info,
      tendlines: this._trendlines.info
    }
  }

  get MIN_CANDLES() { return 1; }
  get MAX_CANDLES() { return Math.max(this.MIN_CANDLES, this._draw.candles.length); }

  set currCandle(value: number) { this._currCandle = Math.min(Math.max(this.MIN_CANDLES, value), this.MAX_CANDLES); }
  get currCandle(): number { return this._currCandle; }
  onChangePoint(event:any) {
    if (this._currCandle != Number(event.target.value)) {
      event.target.value = this._currCandle;
    }
    else {
      this.updateTendline(this._currCandle);
    }
  }

  initIAxis() {
    this.iaxies = this._axies.data;
  }

  resetIAxis() {
    this.initIAxis();
    this.cogPopover.close();
  }

  applyIAxis(iaxies: IAxies) {
    this.cogPopover.close();
    this._axies = new Axies(iaxies);
    this.domCanvas.nativeElement.width = this._axies.time.width;
    this.domCanvas.nativeElement.height = this._axies.price.height;
    this._grid.axies = this._axies;
    this._grid.redraw();
    this._draw.axies = this._axies;
    this._trendlines.axies = this._axies;
    this.reset();
  }

  resetCurrPoint() {
    this._prevCandle = 0;
    this._currCandle = this.MIN_CANDLES;
  }

  get candles(): ICandles {
    return this._draw.candles.data;
  }

  get hasChart(): boolean {
    return this._draw.candles.length > 1;
  }

  get tg12h(): TrendlineGrade | undefined {
    return this._trendlines.tg12h;
  }

  ngOnInit(): void {
    console.info(this._axies);
    this.domCanvas.nativeElement.width = this._axies.time.width;
    this.domCanvas.nativeElement.height = this._axies.price.height;
    this.domCtx = this.domCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    // console.info('canvas (w/h)px', this.domCanvas.nativeElement.width, this.domCanvas.nativeElement.height);
    this._grid = new Grid(this._axies, this._decimalPipe);
    this._grid.onRevalidate(() => this.redrawDom());
    this._draw = new CandlesDraw(this._axies);
    this._draw.onRevalidate((event: CandlesDrawRevalidateEvent) => {
      if (event.type == CandlesDrawRevalidateEventType.Candles) {
        this.updateTendline(this.currCandle);
      }
      else {
        this.redrawDom();
      }
    });
    this._trendlines = new Trendlines(this._axies);
    this._trendlines.onRevalidate(event => this.redrawDom());
    this.redrawDom();
  }

  mousedown(event:MouseEvent) { this._draw.onDown(event); }
  mousemove(event: MouseEvent) { this._draw.onMove(event); }
  mouseup(event: MouseEvent) { this._draw.onUp(event); }
  mouseout(event: MouseEvent) { this._draw.onOut(event); }

  private redrawDom() {
    this.domCtx.clearRect(0, 0, this.domCanvas.nativeElement.width, this.domCanvas.nativeElement.height);
    this.drawImage(this._grid.image);
    this.drawImage(this._draw.image);
    this.drawImage(this._trendlines.image);
  }

  private drawImage(image:CanvasImageSource) {
    this.domCtx.drawImage(image, 0, 0, this.domCanvas.nativeElement.width, this.domCanvas.nativeElement.height);
  }

  private updateTendline(to: number) {
    if (to == this._prevCandle) return;
    this._prevCandle = to;
    let start: number = this._draw.candles.start;
    let end: number = start + (this._axies.time.candle.interval * (to - 1));
    this._trendlines.apply(this._draw.candles.range(start, end));
    this.redrawDom();
  }

  private stepForward() {
    ++this.currCandle;
    this.updateTendline(this.currCandle);
  }

  private play() {
    if (this.currCandle < this.MAX_CANDLES) {
      this._isPlaying = true;
      this.stepForward();
      this._ttid = setInterval(() => {
        this.stepForward();
        if (this.currCandle >= this.MAX_CANDLES) {
          this.stop();
        }
      }, 400);
    }
  }

  private stop() {
    clearInterval(this._ttid);
    this._isPlaying = false;
  }

  release() {
    if (this._isPlaying)
      this.stop();
    else
      this.play();
  }

  step(key: number) {
    this.currCandle = key;
    this.updateTendline(this.currCandle);
  }

  reset() {
    this._currBookmark.name = '';
    this._currBookmark.id = null;
    this.resetCurrPoint();
    this._draw.reset();
    this._trendlines.reset();
    this.redrawDom();
  }

  newBookmark() {
    if (!this.hasChart) return;
    this._currBookmark.new = true;
  }

  saveBookmark() {
    let fw: number = this.domCanvas.nativeElement.width;
    let fh: number = this.domCanvas.nativeElement.height;
    let fcanvas = document.createElement('canvas');
    fcanvas.width = fw;
    fcanvas.height = fh;
    let fctx = fcanvas.getContext('2d') as CanvasRenderingContext2D;
    let prev: IPoint | null = null;
    let curr: IPoint | null = null;
    let time: number | null = null;
    let candles: ICandles = this._draw.candles.data;
    for (let key in candles) {
      time = Number(key);
      if (curr) {
        prev = {x: curr.x, y: curr.y };
      }
      curr = {
        x: this._axies.time.o2d(time),
        y: this._axies.price.o2d(candles[time].open)
      };
      if (prev) {
        Draw.line(fctx, prev.x, prev.y, curr.x, curr.y, 3, 'rgba(255,0,0,1)');
      }
    }
    if (curr && time) {
      prev = {x: curr.x, y: curr.y };
      curr = {
        x: this._axies.time.o2d(time + this._axies.time.candle.interval),
        y: this._axies.price.o2d(candles[time].close)
      };
      Draw.line(fctx, prev.x, prev.y, curr.x, curr.y, 3, 'rgba(255,0,0,1)');
    }
    let canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    let hRatio: number = canvas.width / fw;
    let vRatio: number = canvas.height / fh;
    let ratio: number = Math.min(hRatio, vRatio);
    let nw = fw * ratio;
    let nh = fh * ratio;
    let nx = (canvas.width - nw) / 2;
    let ny = (canvas.height - nh) / 2;
    ctx.drawImage(fcanvas,
      0, 0, fw, fh,
      nx, ny, fw * ratio, fh * ratio);
    this._currBookmark.id = this._currBookmark.id || uuidv4();
    this._bookmarkService.add({
      [this._currBookmark.id as string]: {
        name: this._currBookmark.name,
        axies: this._axies.data,
        candles: this._draw.candles.data,
        screenshot: canvas.toDataURL('image/png'),
        time: (new Date).getTime(),
        template: false
      }
    });
    this._currBookmark.new = false;
  }

  cancelBookmark() {
    this._currBookmark.new = false;
    if (!this._currBookmark.isId) {
      this._currBookmark.name = '';
      this._currBookmark.id = null;
    }
  }

  showBookmarks() {
    const modalRef = this._modalService.open(BookmarksModalComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      scrollable: true
    });
    modalRef.result.then((result) => {
        this.resetCurrPoint();
        this._draw.reset();
        this._trendlines.reset();
        this._currBookmark.id = result.id;
        this._currBookmark.name = result.item.name;
        this._axies = new Axies(result.item.axies);
        this.domCanvas.nativeElement.width = this._axies.time.width;
        this.domCanvas.nativeElement.height = this._axies.price.height;
        this._grid.axies = this._axies;
        this._grid.redraw();
        this._draw.axies = this._axies;
        this._draw.candles = new Candles(result.item.candles);
        this._draw.redraw();
        this._trendlines.axies = this._axies;
        this.updateTendline(this.currCandle);
      }, (reason) => {
        if (this._currBookmark.id && !reason.has) {
          this._currBookmark.name = '';
          this._currBookmark.id = null;
        }
      });
    modalRef.componentInstance.currid  = this._currBookmark.id;
  }
}
