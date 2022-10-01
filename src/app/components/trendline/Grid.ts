import { DecimalPipe } from '@angular/common';
import { EventDispatcher, Handler } from 'src/app/models/EventDispatcher';
import { Axies } from 'src/app/models/Axies';

interface RevalidateEvent {}

export class Grid {

  private _decimalPipe!: DecimalPipe;

  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  private _axies: Axies;

  private h_zpos!: number;
  private v_zpos!: number;

  constructor(axies: Axies, _decimalPipe: DecimalPipe) {
    this._decimalPipe = _decimalPipe;
    this._axies = axies;
    this._canvas = document.createElement('canvas');
    this._canvas.width = this._axies.time.width;
    this._canvas.height = this._axies.price.height;
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this.redraw();
  }

  set axies(axies: Axies) {
    this._axies = axies;
    this._canvas.width = this._axies.time.width;
    this._canvas.height = this._axies.price.height;
  }

  get image():CanvasImageSource {
    return this._canvas;
  }

  private onRevalidateDispatcher = new EventDispatcher<RevalidateEvent>();
  public onRevalidate(handler: Handler<RevalidateEvent>) {
    this.onRevalidateDispatcher.register(handler);
  }
  private fireRevalidate(event: RevalidateEvent) {
    this.onRevalidateDispatcher.fire(event);
  }

  redraw() {
    let v_lines: number = this._axies.price.cell.count; // Math.floor(this._canvas.height/this._axies.price.cell.size); // no of vertical grid lines
    let h_lines: number = this._axies.time.cell.count; // Math.floor(this._canvas.width/this._axies.time.cell.size); // no of horizontal grid lines
    // console.info('lines (h/v)', h_lines, v_lines);

    let v_offset: number = v_lines;
    let h_offset: number = 0;
    // console.info('offset (h/v)', h_offset, v_offset);

    this.v_zpos = v_offset * this._axies.price.cell.size;
    this.h_zpos = h_offset * this._axies.time.cell.size;
    // console.info('zpos (h/v)', this.h_zpos, this.v_zpos);

    // Draw grid lines along Y-axis
    for(var i=0; i<=v_lines; i++) {
      this._ctx.beginPath();
      this._ctx.lineWidth = 1;
      // If line represents Y-axis draw in different color
      if(i == v_offset)
          this._ctx.strokeStyle = "#000000";
      else
          this._ctx.strokeStyle = "#e9e9e9";
      if(i == v_lines) {
          this._ctx.moveTo(0, this._axies.price.cell.size*i);
          this._ctx.lineTo(this._canvas.width, this._axies.price.cell.size*i);
      }
      else {
          this._ctx.moveTo(0, this._axies.price.cell.size*i+0.5);
          this._ctx.lineTo(this._canvas.width, this._axies.price.cell.size*i+0.5);
      }
      this._ctx.stroke();
    }

    // Draw grid lines along X-axis
    for(i=0; i<=h_lines; i++) {
      this._ctx.beginPath();
      this._ctx.lineWidth = 1;
      // If line represents X-axis draw in different color
      if(i == h_offset)
          this._ctx.strokeStyle = "#000000";
      else
          this._ctx.strokeStyle = "#e9e9e9";
      if(i == h_lines) {
          this._ctx.moveTo(this._axies.time.cell.size*i, 0);
          this._ctx.lineTo(this._axies.time.cell.size*i, this._canvas.height);
      }
      else {
          this._ctx.moveTo(this._axies.time.cell.size*i+0.5, 0);
          this._ctx.lineTo(this._axies.time.cell.size*i+0.5, this._canvas.height);
      }
      this._ctx.stroke();
    }

    // Translate to the new origin. Now Y-axis of the canvas is opposite to the Y-axis of the graph.
    // So the y-coordinate of each element will be negative of the actual
    this._ctx.translate(this.h_zpos, this.v_zpos);

    // Ticks marks along the positive X-axis
    for(i=1; i<(h_lines - h_offset); i++) {
      this._ctx.beginPath();
      this._ctx.lineWidth = 1;
      this._ctx.strokeStyle = "#000000";
      // Draw a tick mark 6px long (-3 to 3)
      this._ctx.moveTo(this._axies.time.cell.size*i+0.5, -3);
      this._ctx.lineTo(this._axies.time.cell.size*i+0.5, 3);
      this._ctx.stroke();
      // Text value at that point
      this._ctx.font = '9px Arial';
      this._ctx.textAlign = 'start';
      this._ctx.fillText(this._decimalPipe.transform(this._axies.time.cell.step*i, '1.0-2') + this._axies.time.cell.suffix, this._axies.time.cell.size*i-5, -10);
    }

    // Ticks marks along the negative Y-axis
    // Negative Y-axis of graph is positive Y-axis of the canvas
    for(i=1; i<v_offset; i++) {
      this._ctx.beginPath();
      this._ctx.lineWidth = 1;
      this._ctx.strokeStyle = "#000000";
      // Draw a tick mark 6px long (-3 to 3)
      this._ctx.moveTo(-3, -this._axies.price.cell.size*i+0.5);
      this._ctx.lineTo(3, -this._axies.price.cell.size*i+0.5);
      this._ctx.stroke();
      // Text value at that point
      this._ctx.font = '9px Arial';
      this._ctx.textAlign = 'start';
      this._ctx.fillText(this._decimalPipe.transform(this._axies.price.cell.step*i, '1.0-2') + this._axies.price.cell.suffix, 8, -this._axies.price.cell.size*i+3);
    }
  }

}
