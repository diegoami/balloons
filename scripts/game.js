
var BALLOON_FREQUENCY = 0.1;
var BALLOON_SPEED = 5.5;
var MAX_BALLOONS = 20;
var RATIO_SIZE = 1;
var MAX_LOST_BALLOONS = 15;
var ESCAPE_COORDS = -10;

RATIO_DECREASE = 2000;
SPEED_INCREASE = 500;
SPEED_MODIFIER = 0.0015;
DIFF_LEVEL = "E";

const START_TEXT_BEGIN_X = 0.1;
const START_TEXT_BEGIN_Y = 0.35;

const DIFF_0 = "Select ", DIFF_1 = "E: Easy", DIFF_2 = "S: Standard", DIFF_3 = "H: Hard", DIFF_4 = "V: VHard";
const DIFF_TOTAL = DIFF_0 + DIFF_1 + ", " + DIFF_2 + ", " + DIFF_3 + ", " + DIFF_4;
const DIFF_OFFSET_1 = DIFF_0.length, DIFF_LENGTH_1 =  DIFF_1.length;
const DIFF_OFFSET_2 = DIFF_OFFSET_1 + DIFF_LENGTH_1 + 2, DIFF_LENGTH_2 = DIFF_2.length
const DIFF_OFFSET_3 = DIFF_OFFSET_2 + DIFF_LENGTH_2 + 2, DIFF_LENGTH_3 = DIFF_3.length
const DIFF_OFFSET_4 = DIFF_OFFSET_3 + DIFF_LENGTH_3 + 2, DIFF_LENGTH_4 = DIFF_4.length
const DIFFICULTY_CHOICE = DIFF_TOTAL;

const DIFF_LENGTH_TOTAL = DIFF_TOTAL.length;
const DEFAULT_FONT_SIZE = 30;


var balloonConstructor = function(xcoord, ycoord, size, color, xmax, speed) {
    var that;
    that = {};
    that.xcoord = xcoord ;
    that.ycoord = ycoord ;
    that.size = size;
    that.color = color;
    that.delta = -1 * ((Math.random()*speed)+0.25);
    that.xdelta = -.5+ Math.random();
    that.xmax = xmax;

    that.tick = function(accelerate) {
        if (accelerate) {
            that.delta *= 1.01
        }
        that.ycoord = that.ycoord +that.delta;
        that.xcoord = that.xcoord +that.xdelta;
        if (that.xcoord < 0) {
            that.xdelta = -that.xdelta;
        }
        if (that.xcoord > that.xmax) {
            that.xdelta = -that.xdelta;
        }

    };

    that.draw = function() {
        if (this.ycoord > ESCAPE_COORDS) {
            var balloon = new CANVASBALLOON.Balloon('balloon_canvas', this.xcoord, this.ycoord, this.size, this.color);
            balloon.draw();
        }
    };

    that.collision = function(x,y) {
        var balloon = new CANVASBALLOON.Balloon('balloon_canvas', this.xcoord, this.ycoord, this.size, this.color);
        return balloon.check_hit(x,y)

    };
    return that;
};



var Game = { };
Game.fps = 30;
var css_items = Object.keys(cssKeywords);

function getRandomCssColor() {
    return css_items[Math.floor(Math.random() * css_items.length)];
}

Game.do_click = function() {
    $(document).unbind();
    var that = this;
    $('#balloon_canvas').unbind();
    $('#balloon_canvas').click( function(event) {
        var sender = event.target;
        var bounding_rect = sender.getBoundingClientRect();
        var canvas_ratio_x = bounding_rect.width / sender.width;
        var canvas_ratio_y = bounding_rect.height / sender.height;
        var x = event.clientX / canvas_ratio_x,
            y = event.clientY / canvas_ratio_y;
        var balls_caught = undefined;
        if (x && y) {
            for (var i = that.balloons.length - 1; i >= 0; i--) {
                if (that.balloons[i].collision(x , y)) {
                    that.balloons.splice(i, 1);
                    if (!that.isrestart) {
                        that.balloons_caught++;
                    }
                    break;
                }
            }
        }
    });
};


Game.restart = function(diff_level) {
    if (diff_level == 'E' )  {
        MAX_LOST_BALLOONS = 15;
        RATIO_DECREASE = 2000;
        SPEED_INCREASE =  500;
        DIFF_LEVEL = 'EASY';
    } else if (diff_level == 'S') {
        MAX_LOST_BALLOONS = 7;
        RATIO_DECREASE = 1200;
        SPEED_INCREASE =  200;
        DIFF_LEVEL= 'STANDARD';
    } else if (diff_level == 'H') {
        MAX_LOST_BALLOONS = 3;
        RATIO_DECREASE = 700;
        SPEED_INCREASE =  120;
        DIFF_LEVEL= 'HARD';
    } else if (diff_level == 'V') {
        MAX_LOST_BALLOONS = 1;
        RATIO_DECREASE = 300;
        SPEED_INCREASE =  80;
        DIFF_LEVEL= 'VHARD';
    }

    this.diff_level = diff_level;
    this.do_click();
    if (this.tick_interval) {
        clearInterval(this.tick_interval);
    }
    this.isrestart = false;
    this.clear();
    this.balloons = [];
    this.balloons_caught = 0;
    this.lostBalloons = 0;
    that = this;

    setTimeout(function() {
        that.start = Date.now();
        that.tick_interval = setInterval(Game.run, 1000 / Game.fps);
    }, 2000);

};

Game.init = function() {
    var search_substr = window.location.search.substr(1);
    if (search_substr) {
        MAX_LOST_BALLOONS =  parseInt(search_substr) || MAX_LOST_BALLOONS;
    }
    this.canvas = $('#balloon_canvas')[0];
    //this.canvasbackup = $('#balloon_canvas').clone(true)[0];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    this.ratio = this.canvas.width / 1000;

    this.fontSize = DEFAULT_FONT_SIZE * this.ratio ;
    this.ctx.font = (this.fontSize | DEFAULT_FONT_SIZE) + "px Verdana";

    // Create gradient
    var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    for (var i = 0; i < 1; i += 0.05) {
        gradient.addColorStop(i, getRandomCssColor());
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillText("Stop the balloons, before it is too late !!",this.canvas.width * 0.1,this.canvas.height * 0.15);
    this.diff_level = "E";

    this.ctx.fillText(DIFF_TOTAL,this.canvas.width * START_TEXT_BEGIN_X,this.canvas.height * START_TEXT_BEGIN_Y);
    this.setDifficulty();
};

Game.setDifficulty = function() {

    let bwidth =  this.ctx.measureText(DIFFICULTY_CHOICE).width;
    let bheight = this.ctx.measureText('M').width;


    that = this;
    var x_unit =  bwidth / DIFF_LENGTH_TOTAL;

    $('#balloon_canvas').click(function(event) {
        var sender = event.target;
        var bounding_rect = sender.getBoundingClientRect();
        var canvas_ratio_x = bounding_rect.width / sender.width;
        var canvas_ratio_y = bounding_rect.height / sender.height;
        var x = event.clientX / canvas_ratio_x,
            y = event.clientY / canvas_ratio_y;
        var tcv = that.canvas.width * START_TEXT_BEGIN_X ;
        var tch = that.canvas.height * START_TEXT_BEGIN_Y - bheight / 2;
        if ((y >= tch) && (y <= tch + bheight)) {
            if ((x >= tcv + x_unit * (DIFF_OFFSET_1-0.5) )  && (x <= tcv + x_unit * (DIFF_OFFSET_1 + DIFF_LENGTH_1)) ) {
                that.restart("E");
            } else if ((x >= tcv + x_unit * (DIFF_OFFSET_2-0.5))  && (x <= tcv + x_unit * (DIFF_OFFSET_2 + DIFF_LENGTH_2)) ) {
                that.restart("S");
            } else if ((x >= tcv + x_unit * (DIFF_OFFSET_3-0.5))  && (x <= tcv + x_unit * (DIFF_OFFSET_3 + DIFF_LENGTH_3)) ) {
                that.restart("H");
            } else if ((x >= tcv + x_unit * (DIFF_OFFSET_4 -0.5))  && (x <= tcv + x_unit * (DIFF_OFFSET_4 + DIFF_LENGTH_4)) ) {
                that.restart("V");
            }
        }
    });

    $(document).keydown( function(event) {
        if (event.keyCode == 32 || event.keyCode == 13) {
            that.restart();
        } else if (event.key == 'e' || event.key == 'E') {
            that.restart("E");
        } else if (event.key == 's' || event.key == 'S') {
            that.restart("S");
        } else if (event.key == 'h' || event.key == 'H') {
            that.restart("H");
        } else if (event.key == 'v' || event.key == 'V') {
            that.restart("V");
        }
    });
};

function getRandomItem(set) {
    let items = Array.from(cssKeywords);
    return items[Math.floor(Math.random() * items.length)];
}

Game.gameover = function() {
    if (!this.isrestart) {
        $('#balloon_canvas').unbind('click');
        this.end_time = this.time_to_show;
        var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        for (var i = 0; i < 1; i += 0.05) {
            gradient.addColorStop(i, getRandomCssColor());
        }
        this.ctx.fillStyle = gradient;
        that = this;
        this.isrestart = true;
        setTimeout(function () {
            that.setDifficulty();
        }, 5000);
    }
    if (this.end_time) {
        this.ctx.fillText("Game Over. Score: " + this.balloons_caught + ", Time: " + this.end_time, this.canvas.width * 0.2, this.canvas.height * 0.2);
        this.ctx.fillText(DIFF_TOTAL,this.canvas.width * START_TEXT_BEGIN_X,this.canvas.height * START_TEXT_BEGIN_Y);
    }
};

Game.randomBalloon = function() {
    var max_width = this.canvas.width;
    var max_height = this.canvas.height;
    var xcoord = (Math.floor(Math.random()*(max_width*0.9) )+max_width*0.05);
    var ycoord = max_height;
    var ratioSize = RATIO_SIZE - this.balloons_caught / RATIO_DECREASE ;
    console.log("Ratio Size: %f", ratioSize );
    var randomSize = (24+Math.floor(Math.random()*50))*this.ratio*ratioSize;

    var getRandomRGB = function() { return  Math.floor(Math.random()*255) };
    var randomColor = { r : getRandomRGB(), g : getRandomRGB(), b : getRandomRGB() };
    var balloonSpeed = BALLOON_SPEED + this.balloons_caught / SPEED_INCREASE ;
    console.log("Balloon Speed: %f", balloonSpeed );
    return balloonConstructor(xcoord, ycoord, randomSize , randomColor, max_width, balloonSpeed);
};


Game.tick = function() {
    for (var i = this.balloons.length-1; i >= 0; i--) {
        if (this.balloons[i].ycoord <= ESCAPE_COORDS) {
            this.balloons.splice(i,1);
            if (!this.isrestart) {
                this.lostBalloons++;
            }
        }
    }

    var balloonFrequency = BALLOON_FREQUENCY - SPEED_MODIFIER * this.balloons.length;
    if (!this.isrestart) {
        if (Math.random() < balloonFrequency && this.balloons.length < MAX_BALLOONS) {
            console.log("Balloon Frequency: %f", balloonFrequency );
            this.balloons.push(this.randomBalloon());
        }
    }

    for (var i in this.balloons) {
        this.balloons[i].tick(this.isrestart);
    }
    if (this.lostBalloons >= MAX_LOST_BALLOONS) {
        this.gameover();
    }
};

Game.draw = function() {
    for (var i in this.balloons) {
        this.balloons[i].draw();
    }
    if (this.ctx && !this.isrestart) {
        this.ctx.fillText(this.balloons_caught + "/" +this.lostBalloons, this.canvas.width * 0.1, this.canvas.height * 0.1);
        if (!this.isrestart) {
            this.time_to_show = ((Date.now() - this.start) / 1000).toFixed(2);
        }
        this.ctx.fillText(this.diff_level, this.canvas.width * 0.45, this.canvas.height * 0.1);
        this.ctx.fillText(this.time_to_show, this.canvas.width * 0.8, this.canvas.height * 0.1)
    }

};

Game.clear = function() {
    var self = this;
    self.ctx.clearRect( 0, 0, self.canvas.width, self.canvas.height);
    self.ctx.clearRect( 0, 0, self.canvas.width, self.canvas.height);
};



Game.update = function() {
    var self = this;
    self.clear();
    self.tick();
    self.draw();


};
Game.run = function() {
    if (!Game.stopped) { // While the game is running
        Game.update();        // Update Entities (e.g. Position)
    }
};

window.addEventListener('load', function () {
    Game.init();
}, false);

