/**
 * Created by Alex on 5/27/14.
 */


function Boost() {
    var gate = 1 + Math.floor(Math.random() * 4);
    this.x = SIZE_X + gate * WALL_LENGTH;
    this.y = gate * WALL_LENGTH;
    this.w = 40;
    this.active = true;

    this.say = '?';
    this.count = 2;

    DrawableBlock.call(this, this.w);
    this.redraw();
}
Boost.prototype = new DrawableBlock();
delete Boost.prototype.t_canvas;
delete Boost.prototype.t_ctx;
Boost.prototype.redraw = Bird.prototype.redraw;

Boost.prototype.eat = function(){
    if (Math.abs(this.x - bird.x) > bird.w)
        return;

    if (this.x < bird.x + bird.w && this.x + this.w > bird.x) {
        if (this.y <= bird.y + bird.w && this.y + this.w >= bird.y) {
            skip = true;
            boost_timer = 10;
            boosts.splice(boosts.indexOf(this), 1);

            Wall.color = "rgba(187,173,160,0.5)";
            for (var i = 0; i < walls.length; i++) {
                walls[i].redraw();
            }
        }
    }
};