
//------------util-------------------------
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
var GS = {
    then: Date.now(),
    SIZE_X: 840,
    SIZE_Y: 560,
    WALL_LENGTH: 70,
    WALL_SPEED: 200,
    keysDown: false,
    start: false
};

var ctx;
var bird;
var points = [];
var birds = [];
var walls = [];
var fallItems = [];
var events = [];
var requestAnimationFrame =  window.webkitRequestAnimationFrame;

addEventListener("keydown", function () {
    GS.keysDown = true;
}, false);

addEventListener("keyup", function () {
    GS.keysDown = false;
}, false);

addEventListener("mousedown", function () {
    GS.keysDown = true;
}, false);

addEventListener("mouseup", function () {
    GS.keysDown = false;
}, false);


//------------objects---------------------------------------

function Bird() {
    this.say = null;
    this.smash = false;
    this.active = true;
    this.x = GS.SIZE_X / 3;
    this.y = GS.SIZE_Y / 2;
    this.w = 40;
    this.count = 2;
    this.jumpSpeed = 230;
    this.vertSpeed = 50;
    this.fallingConstant = 32;
}
Bird.prototype.draw = function () {
    ctx.fillStyle = Game.colors[this.count.toString()];
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
    this.x = GS.SIZE_X + GS.WALL_LENGTH * 4.5;
    this.gate = 2 + Math.floor(Math.random() * 4);
    this.y = this.gate * GS.WALL_LENGTH;
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

                events.push(function (timeDelta) {
                    _point.y += (bird.y - _point.y) * timeDelta * 15;
                    _point.x += (bird.x - _point.x) * timeDelta * 15;

                    if (Math.abs(_point.y - bird.y) < 5 && Math.abs(_point.x - bird.x) < 5) {
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

                events.push(function (timeDelta) {
                    bird.x -= timeDelta * GS.WALL_SPEED * 0.4;

                    if (bird.x <= GS.SIZE_X / 3) {
                        events.splice(_i, 1);
                        bird.x = GS.SIZE_X / 3;
                    }
                });
            }
        }
    }
};


function Wall() {
    this.gate = 1 + Math.floor(Math.random() * 4);
    this.x = GS.SIZE_X;
    this.passed = false;
}
Wall.prototype.draw = function () {
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(this.x, 0, GS.WALL_LENGTH, GS.SIZE_Y);
    ctx.fillStyle = "#ccc0b3";
    ctx.fillRect(this.x - 2, this.gate * GS.WALL_LENGTH, GS.WALL_LENGTH + 4, GS.WALL_LENGTH * 2);
};
Wall.prototype.kill = function () {
    if (this.x <= bird.x + bird.w && this.x + GS.WALL_LENGTH >= bird.x) {
        if (this.gate * GS.WALL_LENGTH >= bird.y || (this.gate * GS.WALL_LENGTH + GS.WALL_LENGTH * 2) <= bird.y + bird.w) {
            fallItems = birds.slice(0, birds.length);
            fallItems.push(bird);
            bird.smash = true;
            bird.say = 'x_x';
        }
        if (!this.passed) {
            this.passed = true;
            Game.result.walls++;
        }
    }

    for (var i = 0; i < birds.length; i++) {
        var _b = birds[i];
        if (this.x <= _b.x + _b.w && this.x + GS.WALL_LENGTH >= _b.x) {
            if (this.gate * GS.WALL_LENGTH >= _b.y || (this.gate * GS.WALL_LENGTH + GS.WALL_LENGTH * 2) <= _b.y + _b.w) {
                fallItems = birds.slice(i, birds.length);
                birds.splice(i, birds.length);
            }
        }
    }
};


//---------------------------------------------------------------


var Game = {
    colors: {
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
    },
    result: {
        score: 0,
        walls: 0
    },
    init: function () {
        var canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = GS.SIZE_X;
        canvas.height = GS.SIZE_Y;
        document.body.appendChild(canvas);
        Game.reset();
        Game.main();
    },

    resultScreen: function () {
        ctx.fillStyle = "#ccc0b3";
        ctx.fillRect(0, 0, GS.SIZE_X, GS.SIZE_Y);
        ctx.fillStyle = "#bbada0";
        ctx.fillRect(0, GS.SIZE_Y - GS.WALL_LENGTH, GS.SIZE_X, GS.WALL_LENGTH);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "bold 30px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
        ctx.fillStyle = "#776e65";
        ctx.fillText("Score: " + Game.result.score, GS.SIZE_X / 2 + GS.WALL_LENGTH / 2, GS.SIZE_Y / 2 - GS.WALL_LENGTH / 2);
        ctx.fillText("Walls: " + Game.result.walls, GS.SIZE_X / 2 + GS.WALL_LENGTH / 2, GS.SIZE_Y / 2 + GS.WALL_LENGTH / 2);
    },
    startScreen: function () {
        ctx.fillStyle = "#ccc0b3";
        ctx.fillRect(0, 0, GS.SIZE_X, GS.SIZE_Y);
        ctx.fillStyle = "#bbada0";
        ctx.fillRect(0, GS.SIZE_Y - GS.WALL_LENGTH, GS.SIZE_X, GS.WALL_LENGTH);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "bold 40px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
        ctx.fillStyle = "#776e65";
        ctx.fillText("FLAPPY 2048", GS.SIZE_X / 2 + GS.WALL_LENGTH / 1.5, GS.SIZE_Y / 2);
        ctx.font = "bold 15px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
        ctx.fillText("flap to begin", GS.SIZE_X / 2 + GS.WALL_LENGTH / 1.5, GS.SIZE_Y / 2 + GS.WALL_LENGTH / 2);
    },
    wait: function () {
        if (Game.result.walls < 1)
            Game.startScreen();
        else
            Game.resultScreen();
        bird.say = '\\^o^/';
        bird.draw();
        if (bird.y < GS.WALL_LENGTH * 3 || bird.y > GS.WALL_LENGTH * 4)
            bird.vertSpeed = -bird.vertSpeed;
        bird.y += bird.vertSpeed * 0.07;
        if (GS.keysDown) {
            GS.start = true;
            GS.then = Date.now();
            Game.result.score = 0;
            Game.result.walls = 0;
            bird.say = null;
        }
    },
    main: function () {
        if (GS.start) {
            var now = Date.now();
            var delta = now - GS.then;
            Game.update(delta / 1000);
            Game.render();
            GS.then = now;
        } else {
            Game.wait();
        }
        requestAnimationFrame(Game.main);
    },
    reset: function () {
        GS.start = false;
        bird = new Bird();
        walls = [];
        points = [];
        birds = [];
        fallItems = [];
        events = [];
    },
    render: function () {
        var i;

        ctx.fillStyle = "#ccc0b3";
        ctx.fillRect(0, 0, GS.SIZE_X, GS.SIZE_Y);
        ctx.fillStyle = "#bbada0";
        ctx.fillRect(0, GS.SIZE_Y - GS.WALL_LENGTH, GS.SIZE_X, GS.WALL_LENGTH);

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
    },
    update: function (timeDelta) {
        var i;

        Game.result.score = bird.count;
        for (i = birds.length - 1; i > -1; i--) {
            if (birds[i].count > Game.result.score)
                Game.result.score = birds[i].count;
        }

        if (GS.keysDown && !bird.smash) {
            bird.vertSpeed = bird.jumpSpeed;
        }
        if (bird.y >= GS.SIZE_Y - bird.w - GS.WALL_LENGTH) {
            Game.reset();
        }


        if (points.length == 0 || points[points.length - 1].x < GS.SIZE_X - GS.WALL_LENGTH * 4.5) {
            var _point = new Point();
            points.push(_point);
        }
        if (walls.length == 0 || walls[walls.length - 1].x < GS.SIZE_X - GS.WALL_LENGTH * 9) {
            var _wall = new Wall();
            walls.push(_wall);
        }
        if (walls[0].x < -GS.WALL_LENGTH) {
            walls.splice(0, 1);
        }


        for (i = 0; i < events.length; i++) {
            events[i](timeDelta);
        }

        for (i = 0; i < points.length; i++) {
            var _p = points[i];
            if (!_p.active) continue;
            _p.x -= GS.WALL_SPEED * timeDelta;
            _p.eat();

        }
        for (i = 0; i < walls.length; i++) {
            var _w = walls[i];
            _w.x -= GS.WALL_SPEED * timeDelta;
            _w.kill();
        }
        for (i = 0; i < fallItems.length; i++) {
            var _f = fallItems[i];
            if (_f.y >= GS.SIZE_Y) {
                fallItems.splice(i, 1);
            }

            _f.y += GS.WALL_SPEED * timeDelta;
            _f.x -= GS.WALL_SPEED * timeDelta;
        }

        bird.y -= bird.vertSpeed * timeDelta;
        bird.vertSpeed -= bird.fallingConstant * bird.fallingConstant * timeDelta;

        for (i = birds.length - 1; i > -1; i--) {
            var _b = birds[i];
            if (!_b.active) continue;
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
};

Game.init();