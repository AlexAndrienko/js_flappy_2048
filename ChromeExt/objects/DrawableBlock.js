/**
 * Created by Alex on 5/27/14.
 */


function DrawableBlock(width, height) {
    var t_canvas = document.createElement('canvas');
    t_canvas.width = width || 0;
    t_canvas.height = height || width || 0;

    this.t_canvas = t_canvas;
    this.t_ctx = this.t_canvas.getContext('2d');
}
DrawableBlock.prototype.draw = function (ctx) {
    ctx.drawImage(this.t_canvas, Math.floor(this.x), Math.floor(this.y) || 0);
};

