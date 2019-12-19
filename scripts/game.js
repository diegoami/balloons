
BALLOON_FREQUENCY = 0.1;
BALLOON_SPEED = 5;
MAX_BALLOONS = 200;
RATIO_SIZE = 1;
MAX_LOST_BALLOONS = 5;
ESCAPE_COORDS = -10;

var balloonConstructor = function(xcoord, ycoord, size, color, xmax, speed) {
    var that;
    that = new Object();
    that.xcoord = xcoord ;
    that.ycoord = ycoord ;
    that.size = size;
    that.color = color;
    that.delta = -1 * ((Math.random()*speed)+0.25);
    that.xdelta = -.5+ Math.random();
    that.xmax = xmax;

    that.tick = function() {
        that.ycoord = that.ycoord +that.delta;
        that.xcoord = that.xcoord +that.xdelta;
        if (that.xcoord < 0) {
            that.xdelta = -that.xdelta;;
        }
        if (that.xcoord > that.xmax) {
            that.xdelta = -that.xdelta;
        }

    }


    that.draw = function(canvas) {
        if (this.ycoord > ESCAPE_COORDS) {
            var balloon = new CANVASBALLOON.Balloon('balloon_canvas', this.xcoord, this.ycoord, this.size, this.color);
            balloon.draw();
        }

    }

    that.collision = function(x,y) {
        var balloon = new CANVASBALLOON.Balloon('balloon_canvas', this.xcoord, this.ycoord, this.size, this.color);
        return balloon.check_hit(x,y)

    }
    return that;
}



var Game = { };
Game.fps = 30;
var css_items = Object.keys(cssKeywords);

function getRandomCssColor() {
    return css_items[Math.floor(Math.random() * css_items.length)];
}


Game.do_click = function() {

    var that = this;
    $('#balloon_canvas').unbind('click');
    $('#balloon_canvas').click( function(event) {
        var sender = event.target;
        var bounding_rect = sender.getBoundingClientRect();
        var canvas_ratio_x = bounding_rect.width / sender.width;
        var canvas_ratio_y = bounding_rect.height / sender.height;
        var x = event.clientX / canvas_ratio_x,
            y = event.clientY / canvas_ratio_y;
        var balls_caught = undefined;
        if (x && y) {
            for (var i = that.balloons.length - 1; i >= 0 && !balls_caught; i--) {
                if (that.balloons[i].collision(x , y)) {
                    that.balloons.splice(i, 1);
                    that.balloons_caught++;
                    break;
                }
            }
        }
    });
}

Game.restart = function() {
    this.do_click();
    if (this.tick_interval) {
        clearInterval(this.tick_interval);
    }
    this.isrestart = false;
    this.clear();
    this.balloons = [];
    this.balloons_caught = 0;
    this.lostBalloons = 0;

    this.fontSize = 30 * this.ratio ;
    this.ctx.font = (this.fontSize|30) + "px Verdana";

    // Create gradient
    var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    for (var i = 0; i < 1; i += 0.05) {
        gradient.addColorStop(i, getRandomCssColor());
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillText("Stop the balloons, before it is too late !!",this.canvas.width * 0.1,this.canvas.height * 0.15);
    that = this;

    setTimeout(function() {
        that.start = Date.now();
        that.tick_interval = setInterval(Game.run, 1000 / Game.fps);
    }, 2000);


}

Game.init = function() {
    this.canvas = $('#balloon_canvas')[0];
    //this.canvasbackup = $('#balloon_canvas').clone(true)[0];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    this.ratio = this.old_ratio = this.canvas.width / 1000;

    this.div = $('#div_canvas');


    this.restart();
}

function getRandomItem(set) {
    let items = Array.from(cssKeywords);
    return items[Math.floor(Math.random() * items.length)];
}

Game.gameover = function() {
    if (!this.isrestart) {
        this.end_time = this.time_to_show;
        var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        for (var i = 0; i < 1; i += 0.05) {
            gradient.addColorStop(i, getRandomCssColor());
        }
        this.ctx.fillStyle = gradient;
        that = this;
        this.isrestart = true;
        setTimeout(function () {
            $('#balloon_canvas').click( function(event) {
                that.restart();
            });
        }, 6000);
    }
    if (this.end_time) {
        this.ctx.fillText("Game Over. Score: " + this.balloons_caught + ", Time: " + this.end_time, this.canvas.width * 0.2, this.canvas.height * 0.2);
        this.ctx.fillText("Click to restart", this.canvas.width * 0.35, this.canvas.height * 0.35);

    }

}

Game.randomBalloon = function() {

    var max_width = this.canvas.width;
    var max_height = this.canvas.height;
    var xcoord = (Math.floor(Math.random()*(max_width*0.9) )+max_width*0.05);
    var ycoord = max_height;
    var ratioSize = RATIO_SIZE - this.balloons_caught / 300 + this.lostBalloons / 180;
    console.log("Ratio Size: %f", ratioSize )
    var randomSize = (24+Math.floor(Math.random()*50))*this.ratio*ratioSize;

    var getRandomRGB = function() { return  Math.floor(Math.random()*255) };
    var randomColor = { r : getRandomRGB(), g : getRandomRGB(), b : getRandomRGB() };
    var balloonSpeed = BALLOON_SPEED + this.balloons_caught / 100 - this.lostBalloons / 60;
    console.log("Balloon Speed: %f", balloonSpeed )
    return balloonConstructor(xcoord, ycoord,randomSize , randomColor, max_width, balloonSpeed);

}


Game.tick = function() {

    for (var i = this.balloons.length-1; i >= 0; i--) {
        if (this.balloons[i].ycoord <= ESCAPE_COORDS) {
            this.balloons.splice(i,1);
            this.lostBalloons++;
        }
    }



    var balloonFrequency = BALLOON_FREQUENCY - 0.0015 * this.balloons.length;

    if (Math.random() < balloonFrequency && this.balloons.length < MAX_BALLOONS) {
        console.log("Balloon Frequency: %f", balloonFrequency )
        this.balloons.push(this.randomBalloon());
    }

    for (var i in this.balloons) {
        this.balloons[i].tick();
    }
    if (this.lostBalloons >= MAX_LOST_BALLOONS) {
        this.gameover();
    }


}

Game.draw = function() {
    for (var i in this.balloons) {
        this.balloons[i].draw();
    }
    if (this.ctx) {
        this.ctx.fillText(this.balloons_caught + "/" +this.lostBalloons, this.canvas.width * 0.1, this.canvas.height * 0.1)
        this.time_to_show = ((Date.now() - this.start) / 1000).toFixed(2);
        this.ctx.fillText(this.time_to_show, this.canvas.width * 0.8, this.canvas.height * 0.1)
    }

};

Game.clear = function() {
    var self = this;
    self.ctx.clearRect( 0, 0, self.canvas.width, self.canvas.height);
    self.ctx.clearRect( 0, 0, self.canvas.width, self.canvas.height);
}



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
}


window.addEventListener('load', function () {
    Game.init();
}, false);

