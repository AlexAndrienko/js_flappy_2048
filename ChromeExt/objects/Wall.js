/**
 * Created by Alex on 5/27/14.
 */


function Wall() {
    this.gate = 1 + Math.floor(Math.random() * 4);
    this.x = SIZE_X;
    this.passed = false;

    DrawableBlock.call(this, WALL_LENGTH, SIZE_Y - WALL_LENGTH);

    this.t_ctx.fillStyle = "#bbada0";
    this.t_ctx.fillRect(0, 0, WALL_LENGTH, SIZE_Y - WALL_LENGTH);
    this.t_ctx.clearRect(0, this.gate * WALL_LENGTH, WALL_LENGTH, WALL_LENGTH * 2);
}
Wall.prototype = new DrawableBlock();
delete Wall.prototype.t_canvas;
delete Wall.prototype.t_ctx;

Wall.prototype.kill = function () {
    if (this.x - bird.x > bird.w)
        return;

    if (this.x <= bird.x + bird.w && this.x + WALL_LENGTH >= bird.x) {
        if (this.gate * WALL_LENGTH >= bird.y || (this.gate * WALL_LENGTH + WALL_LENGTH * 2) <= bird.y + bird.w) {
            fallItems = birds.slice(0, birds.length);
            fallItems.push(bird);
            bird.smash = true;
            bird.setWord('x_x');
        }
        if (!this.passed) {
            this.passed = true;
            result.walls++;
        }
    }


    for (var i = 0; i < birds.length; i++) {
        var _b = birds[i];
        if (this.x <= _b.x + _b.w && this.x + WALL_LENGTH >= _b.x) {
            if (this.gate * WALL_LENGTH >= _b.y || (this.gate * WALL_LENGTH + WALL_LENGTH * 2) <= _b.y + _b.w) {
                fallItems = birds.slice(i, birds.length);
                birds.splice(i, birds.length);
            }
        }
    }
};