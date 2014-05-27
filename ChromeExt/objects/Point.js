/**
 * Created by Alex on 5/27/14.
 */

function Point() {
    this.x = SIZE_X + WALL_LENGTH * 4.5;
    var gate = 2 + Math.floor(Math.random() * 4);
    this.y = gate * WALL_LENGTH;
    this.w = 40;
    this.active = true;

    if (bird.count <= 8)
        this.count = (Math.random() > 0.3) ? 2 : 4;
    else
        this.count = Math.pow(2, 2 + Math.floor(Math.random() * Math.sqrt(bird.count) / 2));

    DrawableBlock.call(this, this.w);
    this.redraw();
}
Point.prototype = new DrawableBlock();
delete Point.prototype.t_canvas;
delete Point.prototype.t_ctx;
Point.prototype.redraw = Bird.prototype.redraw;

Point.merge = function () {
    if (birds.length == 0)
        return;
    var lastChild = birds[0];
    if (bird.count == lastChild.count) {
        var _i = events.length;
        lastChild.active = false;
        events.push(function (timeDelta) {
            lastChild.y += (bird.y - lastChild.y) * timeDelta * 25;
            lastChild.x += (bird.x - lastChild.x) * timeDelta * 10;

            if (Math.abs(lastChild.y - bird.y) < 5 && Math.abs(lastChild.x - bird.x) < 5) {
                bird.incCount(lastChild.count);
                birds.splice(0, 1);
                events.splice(_i, 1);
                Point.merge();
            }
        });
    }
};


Point.prototype.eat = function () {
    if (Math.abs(this.x - bird.x) > bird.w)
        return;

    if (this.x < bird.x + bird.w && this.x + this.w > bird.x) {
        if (this.y <= bird.y + bird.w && this.y + this.w >= bird.y) {

            if (bird.count == this.count) {
                var _point = this;
                var _i = events.length;
                _point.active = false;
                events.push(function (timeDelta) {
                    _point.y += (bird.y - _point.y) * timeDelta * 25;
                    _point.x += (bird.x - _point.x) * timeDelta * 10;

                    if (Math.abs(_point.y - bird.y) < 5 && Math.abs(_point.x - bird.x) < 5) {
                        bird.incCount(_point.count);
                        events.splice(_i, 1);
                        var _index = points.indexOf(_point);
                        if (_index > -1) {
                            points.splice(_index, 1);
                        }
                        Point.merge();
                    }
                });
            }
            else {
                var newBird = new Bird();
                newBird.y = bird.y;
                newBird.x = bird.x;
                newBird.setCount(bird.count);

                birds.splice(0, 0, newBird);

                bird.x = this.x;
                bird.y = this.y;
                bird.setCount(this.count);

                var _index = points.indexOf(this);
                if (_index > -1) {
                    points.splice(_index, 1);
                }

                events.push(function (timeDelta) {
                    bird.x -= timeDelta * WALL_SPEED;

                    if (bird.x <= SIZE_X / 3) {
                        events.splice(_i, 1);
                        bird.x = SIZE_X / 3;
                    }
                });
            }

        }
    }
};