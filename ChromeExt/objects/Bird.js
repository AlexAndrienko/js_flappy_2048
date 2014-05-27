/**
 * Created by Alex on 5/27/14.
 */


function Bird() {
    this.say = null;
    this.smash = false;
    this.active = true;
    this.x = SIZE_X / 3;
    this.y = SIZE_Y / 2;
    this.w = 40;
    this.count = 2;
    this.jumpSpeed = 260;
    this.vertSpeed = 50;
    this.fallingConstant = 30;

    DrawableBlock.call(this, this.w);
    this.redraw();
}
Bird.prototype = new DrawableBlock();
delete Bird.prototype.t_canvas;
delete Bird.prototype.t_ctx;
Bird.prototype.redraw = function () {
    this.t_ctx.clearRect(0, 0, this.w, this.w);

    this.t_ctx.fillStyle = colors[this.count.toString()] || "#3c3a32";
    this.t_ctx.roundRect(0, 0, this.w, this.w, 5).fill();


    if (this.count < 8) {
        this.t_ctx.fillStyle = "#776e65";
    } else {
        this.t_ctx.fillStyle = "#f9f6f2";
    }

    var _font = 25;
    if (this.count / 100 > 1) {
        _font = 20;
    }
    if (this.count / 1000 > 1) {
        _font = 16;
    }
    this.t_ctx.textAlign = 'center';
    this.t_ctx.textBaseline = 'middle';
    this.t_ctx.font = "bold " + _font + "px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    this.t_ctx.fillText(this.say || this.count, this.w / 2, this.w / 2);
};
Bird.prototype.setCount = function (cnt) {
    this.count = cnt;
    this.redraw();
};
Bird.prototype.incCount = function (cnt) {
    this.setCount(this.count + cnt);
};
Bird.prototype.setWord = function (say) {
    this.say = say;
    this.redraw();
};