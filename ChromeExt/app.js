//------------global-------------------------
var requestAnimationFrame = window.webkitRequestAnimationFrame || window.requestAnimationFrame;

var game_ctx, movingbg_ctx;
var fps_on = false;
var then;
var SIZE_X = 840;
var SIZE_Y = 560;
var WALL_LENGTH = 70;
var WALL_SPEED = 200;


var keysDown = false;
var start = false;
var bird;
var boosts = [];
var points = [];
var birds = [];
var walls = [];
var fallItems = [];
var events = [];
var bg_walls = [];
var highScore;
var skip = false;
var boost_timer = 15;

var colors = {
    0: "#5fda93",
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


addEventListener("keydown", function (e) {
    if (e.keyCode == 17) {
        fps_on = !fps_on;
    }
    if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18 || e.keyCode >= 112) {
        return;
    }
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


//-----------logic-----------------------------------------------
function calcHighScore() {
    var current = result.score;

    if (highScore === undefined)
        highScore = 0;

    if (highScore > current) {
        return highScore;
    }
    try {
        if (localStorage) {
            localStorage.setItem("highScore", current);
        }
        if (chrome.storage) {
            chrome.storage.sync.set({"highScore": current}, function () {
                console.log("set: " + current);
            });
        }
    } catch (e) {
        console.log(e);
        return current;
    }

    highScore = current;
    return current;
}

function resultScreen() {
    game_ctx.clearRect(0, 0, SIZE_X, SIZE_Y - WALL_LENGTH);
    game_ctx.textAlign = 'center';
    game_ctx.textBaseline = 'middle';
    game_ctx.font = "bold 30px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    game_ctx.fillStyle = "#776e65";
    game_ctx.fillText("Score: " + result.score, SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2 - WALL_LENGTH / 2);
    game_ctx.fillText("Walls: " + result.walls, SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2);

    game_ctx.fillStyle = "#eee4da";
    game_ctx.fillText("High score: " + highScore || result.score, SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2 + WALL_LENGTH);
}

function startScreen() {
    game_ctx.clearRect(0, 0, SIZE_X, SIZE_Y - WALL_LENGTH);
    game_ctx.textAlign = 'center';
    game_ctx.textBaseline = 'middle';
    game_ctx.font = "bold 40px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    game_ctx.fillStyle = "#776e65";
    game_ctx.fillText("Flappy 2048", SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2);
    game_ctx.font = "bold 15px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    game_ctx.fillText("use keyboard or mouse to begin", SIZE_X / 2 + WALL_LENGTH / 2, SIZE_Y / 2 + WALL_LENGTH / 2);
}

var min_fps = 10000;
var max_fps = 0;

function renderFps(timeDelta) {
    var fps;

    if (!fps_on) return;
    fps = Math.floor(1000 / timeDelta);
    if (fps < min_fps) {
        min_fps = fps;
    }
    if (fps > max_fps) {
        max_fps = fps;
    }

    game_ctx.font = "bold 10px 'Clear Sans', 'Helvetica Neue', Arial, sans-serif";
    game_ctx.fillStyle = "#776e65";
    game_ctx.fillText("cur fps: " + fps, SIZE_X - WALL_LENGTH, WALL_LENGTH / 4);
    game_ctx.fillText("min fps: " + min_fps, SIZE_X - WALL_LENGTH, WALL_LENGTH / 2);
    game_ctx.fillText("max fps: " + max_fps, SIZE_X - WALL_LENGTH, WALL_LENGTH);
}

function main() {
    var timeDelta, now;

    if (start) {
        now = Date.now();
        timeDelta = now - then;
        if (update(timeDelta / 1000)) {
            render();
            renderBG(timeDelta / 1000);

            //show FPS meeter
            renderFps(timeDelta);
        }
        then = now;
    } else {
        wait();
    }
    requestAnimationFrame(main);
}

function reset() {
    skip = false;
    start = false;
    bird = new Bird();
    walls = [];
    points = [];
    birds = [];
    fallItems = [];
    events = [];
    boosts = [];
    boost_timer = 15;

    min_fps = 1000;
    max_fps = 0;

    if (result.walls < 1) {
        startScreen();
    } else {
        resultScreen();
    }
    bird.setWord('\\^o^/');
}

function wait() {
    game_ctx.clearRect(bird.x, 0, bird.w, SIZE_Y - WALL_LENGTH);

    bird.draw(game_ctx);
    if (bird.y < WALL_LENGTH * 3 || bird.y > WALL_LENGTH * 4)
        bird.vertSpeed = -bird.vertSpeed;

    bird.y += bird.vertSpeed * 0.07;

    if (keysDown) {
        start = true;
        result.score = 0;
        result.walls = 0;
        bird.say = null;
        bird.redraw();
        then = Date.now();
    }
}

function render() {
    var i;
    game_ctx.clearRect(0, 0, SIZE_X, SIZE_Y - WALL_LENGTH);

    for (i = 0; i < walls.length; i++) {
        walls[i].draw(game_ctx);
    }
    for (i = 0; i < points.length; i++) {
        points[i].draw(game_ctx);
    }
    if (boosts.length > 0)
        for (i = 0; i < boosts.length; i++) {
            boosts[i].draw(game_ctx);
        }
    for (i = 0; i < birds.length; i++) {
        birds[i].draw(game_ctx);
    }
    for (i = 0; i < fallItems.length; i++) {
        fallItems[i].setWord('x_x');
        fallItems[i].draw(game_ctx);
    }

    bird.draw(game_ctx);
}

function update(timeDelta) {
    var i, _b, _f;

    boost_timer -= timeDelta;

    //TODO
    if (boost_timer <= 0) {
        boost_timer = 15;
        Wall.color = '#bbada0';
        skip = false;
        for (var i = 0; i < walls.length; i++) {
            walls[i].redraw();
        }
    }
    ////////////

    result.score = bird.count;
    for (i = birds.length - 1; i > -1; i--) {
        if (birds[i].count > result.score)
            result.score = birds[i].count;
    }

    if (keysDown && !bird.smash) {
        bird.vertSpeed = bird.jumpSpeed;
    }
    if (bird.y >= SIZE_Y - bird.w - WALL_LENGTH) {
        calcHighScore();
        reset();
        return false;
    }


    if (walls.length == 0 || walls[walls.length - 1].x < SIZE_X - WALL_LENGTH * 9) {
        walls.push(new Wall());
    }
    if (walls[0].x < -WALL_LENGTH) {
        walls.splice(0, 1);
    }

    if (points.length == 0 || points[points.length - 1].x < SIZE_X - WALL_LENGTH * 4.5) {
        points.push(new Point());
    }
    if (points[0].x < -bird.w) {
        points.splice(0, 1);
    }


    if ((points[points.length - 1].x + WALL_LENGTH * 4.5 + bird.w)  - SIZE_X < 10) {
//        if (Math.random() > 0.3)
            boosts.push(new Boost());

    }
    if (boosts.length > 0)
        if (boosts[0].x < -bird.w) {
            boosts.splice(0, 1);
        }


    for (i = 0; i < points.length; i++) {
        if (!points[i].active) continue;
        points[i].x -= WALL_SPEED * timeDelta;
        points[i].eat();
    }
    if (boosts.length > 0)
        for (i = 0; i < boosts.length; i++) {
            if (!boosts[i].active) continue;
            boosts[i].x -= WALL_SPEED * timeDelta;
            boosts[i].eat();
        }
    for (i = 0; i < walls.length; i++) {
        walls[i].x -= WALL_SPEED * timeDelta;
        walls[i].kill();
    }
    for (i = 0; i < fallItems.length; i++) {
        _f = fallItems[i];
        if (_f.y >= SIZE_Y) {
            fallItems.splice(i, 1);
        }

        _f.y += WALL_SPEED * timeDelta;
        _f.x -= WALL_SPEED * timeDelta;
    }

    for (i = 0; i < events.length; i++) {
        events[i](timeDelta);
    }

    bird.y -= bird.vertSpeed * timeDelta;
    bird.vertSpeed -= bird.fallingConstant * bird.fallingConstant * timeDelta;


    for (i = birds.length - 1; i > -1; i--) {
        _b = birds[i];
        if (!_b.active) continue;
        var _parent = birds[i - 1] || bird;
        _b.y += (_parent.y - _b.y) * timeDelta * 5;
        _b.x = _parent.x - bird.w - 10;
    }
    return true;
}

var next_BG_wall_x = SIZE_X - WALL_LENGTH * (1 + Math.floor(Math.random() * 2));

function renderBG(timeDelta) {
    movingbg_ctx.clearRect(0, 0, SIZE_X, WALL_LENGTH * 4);

    if (bg_walls.length == 0 || bg_walls[bg_walls.length - 1].x <= next_BG_wall_x) {
        bg_walls.push(new BGWall());
        next_BG_wall_x = SIZE_X - WALL_LENGTH * (1 + Math.floor(Math.random() * 2));
    }
    if (bg_walls[0].x < -WALL_LENGTH) {
        bg_walls.splice(0, 1);
    }

    for (var i = 0; i < bg_walls.length; i++) {
        bg_walls[i].x -= WALL_SPEED * timeDelta / 4;
        bg_walls[i].draw(movingbg_ctx);
    }
}

function initBG() {
    var bg_canvas, bg_ctx, moving_bg;
    bg_canvas = document.querySelector('#background');
    bg_canvas.width = SIZE_X;
    bg_canvas.height = SIZE_Y;
    bg_ctx = bg_canvas.getContext("2d");

    bg_ctx.fillStyle = "#ccc0b3";
    bg_ctx.fillRect(0, 0, SIZE_X, SIZE_Y);
    bg_ctx.fillStyle = "#bbada0";
    bg_ctx.fillRect(0, SIZE_Y - WALL_LENGTH, SIZE_X, WALL_LENGTH);


    moving_bg = document.querySelector('#moving_background');
    moving_bg.width = SIZE_X;
    moving_bg.height = WALL_LENGTH * 4;
    movingbg_ctx = moving_bg.getContext("2d");
}

function loadHighScore() {
    try {
        if (chrome.storage) {
            chrome.storage.sync.get('highScore', function (item) {
                highScore = item.highScore;
                console.log("get: " + item.highScore);
            });
        }

        if (localStorage) {
            highScore = localStorage.getItem("highScore");
        }

    } catch (e) {
        console.log(e);
    }
}


(function init() {
    var game_canvas = document.querySelector('#game');
    game_canvas.width = SIZE_X;
    game_canvas.height = SIZE_Y - WALL_LENGTH;
    game_ctx = game_canvas.getContext("2d");

    loadHighScore();
    initBG();
    reset();
    main();
})();