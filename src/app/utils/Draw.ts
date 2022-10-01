
export class Draw {

  static line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number, style: string) {
    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.lineJoin = 'bevel';
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }

  static fillpoint(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, style: string) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = style;
    ctx.lineWidth = 0;
    ctx.fill();
    ctx.closePath();
  }

  static strokepoint(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, width: number, style: string) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
  }

  static strokrect(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, width: number, style: string) {
    ctx.beginPath();
    ctx.rect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
  }

  static strokrhombus(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, width: number, style: string) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.translate(x, y);
    ctx.rotate(45 * Math.PI / 180);
    ctx.rect(-size/2, -size/2, size, size);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  static fillrect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, style: string) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = style;
    ctx.lineWidth = 0;
    ctx.fill();
    ctx.closePath();
  }
}
