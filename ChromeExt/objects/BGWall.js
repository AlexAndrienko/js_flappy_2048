/**
 * Created by Alex on 5/27/14.
 */


function BGWall() {
    this.x = SIZE_X;
    this.height = Math.floor(Math.random() * 9) * 28 + 28;
    this.y = WALL_LENGTH * 4 - this.height;

    DrawableBlock.call(this, WALL_LENGTH, this.height);

    this.t_ctx.fillStyle = "rgba(187,173,160,0.3)";
    this.t_ctx.fillRect(0, 0, WALL_LENGTH, this.height);
}
BGWall.prototype = new DrawableBlock();
delete BGWall.prototype.t_canvas;
delete BGWall.prototype.t_ctx;