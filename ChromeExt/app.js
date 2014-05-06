
//////------------util--------------

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};
//------------global-------------------------
var requestAnimationFrame = window.webkitRequestAnimationFrame;

var ctx, then;
var SIZE_X = 840;
var SIZE_Y = 560;
var WALL_LENGTH = 70;
var WALL_SPEED = 200;
var keysDown = false;
var start = false;
var bird;
var points = [];
var birds = [];
var walls = [];
var fallItems = [];
var events = [];

var colors = {
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b179",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e",
    4096: "#5fda93"
};
var result = {
    score: 0,
    walls: 0
};


addEventListener("keydown", function () {
    keysDown = true;
}, false);

addEventListener("keyup", function () {
    keysDown = false;
}, false);

addEventListener("mousedown", function () {
    keysDown = true;
}, false);

addEventListener("mouseup", function () {
    keysDown = false;
}, false);


//------------objects---------------------------------------

function Bird() {
    this.say = null;
    this.smash = false;
    this.active = true;
    this.x = SIZE_X / 3;
    this.y = SIZE_Y / 2;
    this.w = 40;
    this.count = 2;
    this.jumpSpeed = 230;
    this.vertSpeed = 50;
    this.fallingConstant = 32;
}
Bird.prototype.draw = function () {
    ctx.fillStyle = colors[this.count.toString()];
    if (ctx.fillStyle == undefined) {
        ctx.fillStyle = "#bc9410";
    }
    ctx.roundRect(this.x, this.y, this.w, this.w, 5).fill();


    if (this.count < 8) {
        ctx.fillStyle = "776e65";
    } else {
        ctx.fillStyle = "f9f6f2";
    }

    var _font = 25;
    if (this.count / 100 > 1) {
        _font = 20;
    }
    if (this.count / 1000 > 1) {
        _font = 16;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold " + _font + "px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(this.say || this.count, this.x + (this.w / 2), this.y + (this.w / 2));
};


function Point() {
    this.x = SIZE_X + WALL_LENGTH * 4.5;
    this.gate = 2 + Math.floor(Math.random() * 4);
    this.y = this.gate * WALL_LENGTH;
    this.w = 40;
    this.active = true;
    if (Math.random() > 0.5)
        this.count = 4;
    else
        this.count = 2;
}
Point.prototype.draw = Bird.prototype.draw;

Point.concat = function () {
    if (birds.length <= 0)
        return;
    var lastChild = birds[0];
    if (bird.count == lastChild.count) {
        var _i = events.length;
        lastChild.active = false;
        events.push(function (timeDelta) {
            lastChild.y += (bird.y - lastChild.y) * timeDelta * 15;
            lastChild.x += (bird.x - lastChild.x) * timeDelta * 15;

            if (Math.abs(lastChild.y - bird.y) < 5 && Math.abs(lastChild.x - bird.x) < 5) {
                bird.count += lastChild.count;
                birds.splice(0, 1);
                events.splice(_i, 1);
                Point.concat();
            }
        });
    }
};


Point.prototype.eat = function () {
    if (this.x < bird.x + bird.w && this.x + this.w > bird.x) {
        if (this.y <= bird.y + bird.w && this.y + this.w >= bird.y) {
            if (bird.count == this.count) {
                var _point = this;
                var _i = events.length;
                _point.active = false;
                events.push(function(timeDelta){
                    _point.y += (bird.y - _point.y) * timeDelta * 15;
                    _point.x += (bird.x - _point.x) * timeDelta * 15;

                    if (Math.abs(_point.y - bird.y) < 5 && Math.abs(_point.x - bird.x) < 5){
                        bird.count += _point.count;
                        events.splice(_i, 1);
                        var _index = points.indexOf(_point);
                        if (_index > -1) {
                            points.splice(_index, 1);
                        }
                        Point.concat();
                    }
                });
            }
            else {
                var newBird = new Bird();
                newBird.count = bird.count;
                newBird.y = bird.y;
                newBird.x = bird.x;

                birds.splice(0, 0, newBird);

                bird.count = this.count;
                bird.x = this.x;
                bird.y = this.y;

                var _index = points.indexOf(this);
                if (_index > -1) {
                    points.splice(_index, 1);
                }

                events.push(function(timeDelta){
                    bird.x -= timeDelta * WALL_SPEED * 0.4;

                    if (bird.x <= SIZE_X / 3){
                        events.splice(_i, 1);
                        bird.x = SIZE_X / 3;
                    }
                });
            }
        }
    }
};


function Wall() {
    this.gate = 1 + Math.floor(Math.random() * 4);
    this.x = SIZE_X;
    this.passed = false;
}
Wall.prototype.draw = function () {
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(this.x, 0, WALL_LENGTH, SIZE_Y);
    ctx.fillStyle = "#ccc0b3";
    ctx.fillRect(this.x - 2, this.gate * WALL_LENGTH, WALL_LENGTH + 4, WALL_LENGTH * 2);
};
Wall.prototype.kill = function () {
    if (this.x <= bird.x + bird.w && this.x + WALL_LENGTH >= bird.x) {
        if (this.gate * WALL_LENGTH >= bird.y || (this.gate * WALL_LENGTH + WALL_LENGTH * 2) <= bird.y + bird.w) {
            fallItems = birds.slice(0, birds.length);
            fallItems.push(bird);
            bird.smash = true;
            bird.say = 'x_x';
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
//-----------logic-----------------------------------------------
function resultScreen() {
    ctx.fillStyle = "#ccc0b3";
    ctx.fillRect(0, 0, SIZE_X, SIZE_Y);
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(0, SIZE_Y - WALL_LENGTH, SIZE_X, WALL_LENGTH);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold 30px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#bbada0";
    ctx.fillText("Score: " + result.score, SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2 - WALL_LENGTH / 2);
    ctx.fillText("Walls: " + result.walls, SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2 + WALL_LENGTH / 2);
}

function startScreen() {
    ctx.fillStyle = "#ccc0b3";
    ctx.fillRect(0, 0, SIZE_X, SIZE_Y);
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(0, SIZE_Y - WALL_LENGTH, SIZE_X, WALL_LENGTH);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold 40px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#776e65";
    ctx.fillText("Flappy 2048", SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2);
    ctx.font = "bold 15px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText("flap to begin", SIZE_X / 2 + WALL_LENGTH / 1.5, SIZE_Y / 2 + WALL_LENGTH / 2);
}


function main() {
    if (start) {

        var now = Date.now();
        var delta = now - then;

        update(delta / 1000);
        render();
        then = now;
    } else {
        wait();
    }
    requestAnimationFrame(main);
}

function reset() {
    start = false;
    bird = new Bird();
    walls = [];
    points = [];
    birds = [];
    fallItems = [];
    events = [];
}

function wait() {
    if (result.walls < 1)
        startScreen();
    else
        resultScreen();

    bird.say = '\\^o^/';
    bird.draw();
    if (bird.y < WALL_LENGTH * 3 || bird.y > WALL_LENGTH * 4)
        bird.vertSpeed = -bird.vertSpeed;

    bird.y += bird.vertSpeed * 0.07;

    if (keysDown) {
        start = true;
        then = Date.now();
        result.score = 0;
        result.walls = 0;
        bird.say = null;
    }
}


function render() {
    var i;

    ctx.fillStyle = "#ccc0b3";
    ctx.fillRect(0, 0, SIZE_X, SIZE_Y);
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(0, SIZE_Y - WALL_LENGTH, SIZE_X, WALL_LENGTH);

    for (i = 0; i < walls.length; i++) {
        var _w = walls[i];
        _w.draw();
    }
    for (i = 0; i < points.length; i++) {
        var _p = points[i];
        _p.draw();
    }
    for (i = 0; i < birds.length; i++) {
        var _b = birds[i];
        _b.draw();
    }
    for (i = 0; i < fallItems.length; i++) {
        var _f = fallItems[i];
        _f.say = 'x_x';
        _f.draw();
    }

    bird.draw();
}

function update(timeDelta) {
    var i;
    
    result.score = bird.count;
    for (i = birds.length - 1; i > -1; i--) {
        if (birds[i].count > result.score)
            result.score = birds[i].count;
    }

    if (keysDown && !bird.smash) {
        bird.vertSpeed = bird.jumpSpeed;
    }
    if (bird.y >= SIZE_Y - bird.w - WALL_LENGTH) {
        reset();
    }


    if (points.length == 0 || points[points.length - 1].x < SIZE_X - WALL_LENGTH * 4.5) {
        var _point = new Point();
        points.push(_point);
    }
    if (walls.length == 0 || walls[walls.length - 1].x < SIZE_X - WALL_LENGTH * 9) {
        var _wall = new Wall();
        walls.push(_wall);
    }
    if (walls[0].x < -WALL_LENGTH) {
        walls.splice(0, 1);
    }


    for (i = 0; i < events.length; i++) {
        events[i](timeDelta);
    }

    for (i = 0; i < points.length; i++) {
        var _p = points[i];
        if(!_p.active) continue;
        _p.x -= WALL_SPEED * timeDelta;
        _p.eat();

    }
    for (i = 0; i < walls.length; i++) {
        var _w = walls[i];
        _w.x -= WALL_SPEED * timeDelta;
        _w.kill();
    }
    for (i = 0; i < fallItems.length; i++) {
        var _f = fallItems[i];
        if (_f.y >= SIZE_Y) {
            fallItems.splice(i, 1);
        }

        _f.y += WALL_SPEED * timeDelta;
        _f.x -= WALL_SPEED * timeDelta;
    }

    bird.y -= bird.vertSpeed * timeDelta;
    bird.vertSpeed -= bird.fallingConstant * bird.fallingConstant * timeDelta;


    for (i = birds.length - 1; i > -1; i--) {
        var _b = birds[i];
        if(!_b.active) continue;
        var _parent;

        if (i != 0) {
            _parent = birds[i - 1];
        } else {
            _parent = bird;
        }

        _b.y += (_parent.y - _b.y) * timeDelta * 5;
        _b.x = _parent.x - bird.w - 10;
    }


}

(function init() {
    var canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    canvas.width = SIZE_X;
    canvas.height = SIZE_Y;
    document.body.appendChild(canvas);

    reset();
    main();
})();