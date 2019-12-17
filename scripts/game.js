


var balloonConstructor = function(xcoord, ycoord, size, color, xmax) {
    var that;
    that = new Object();
    that.xcoord = xcoord ;
    that.ycoord = ycoord ;
    that.size = size;
    that.color = color;
    that.delta = -1 * ((Math.random()*3.4)+0.25);
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
        if (this.ycoord > -100) {
            var balloon = new CANVASBALLOON.Balloon('balloon_canvas', this.xcoord, this.ycoord, this.size, this.color);
            balloon.draw();
        }

    }

    that.collision = function(x,y) {
        var xdelta = x-this.xcoord;
        var ydelta = y-this.ycoord;
        return Math.sqrt(xdelta*xdelta+ydelta*ydelta) < this.size+5;

    }
    return that;
}



var Game = { };
Game.fps = 50;
var css_items = Object.keys(cssKeywords);

function getRandomCssColor() {

    return css_items[Math.floor(Math.random() * css_items.length)];
}

Game.init = function() {


    this.canvas = $('#balloon_canvas')[0];
    //this.canvasbackup = $('#balloon_canvas').clone(true)[0];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    ratio = this.canvas.width / 1000;

    this.div = $('#div_canvas');
    this.balloons = [];
    this.balloons_caught = 0;
    this.lostBalloons = 0;

    var that = this;
    $('#balloon_canvas').click( function(event) {
        var x = event.pageX,
            y = event.pageY;


        for (var i = that.balloons.length-1; i >= 0; i--) {
            if (that.balloons[i].collision(x,y)) {
                that.balloons.splice(i,1);
                that.balloons_caught++;
                $('#caught_balloon_counter').html(that.balloons_caught);
                break;
            }
        }
    });
    this.fontSize = 30 * ratio ;
    this.ctx.font = (this.fontSize|30) + "px Verdana";


    // Create gradient
    var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);

    for (var i = 0; i < 1; i += 0.05) {

        gradient.addColorStop(i, getRandomCssColor());

    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillText("Stop the balloons, before it is too late !!",this.canvas.width * 0.1,this.canvas.height * 0.15);

    setTimeout(function() {
        Game.clear();
        setInterval(Game.run, 1000 / Game.fps);
    }, 2000);

}

function getRandomItem(set) {
    let items = Array.from(cssKeywords);
    return items[Math.floor(Math.random() * items.length)];
}

Game.randomBalloon = function() {

    var max_width = this.canvas.width;
    var max_height = this.canvas.height;
    var xcoord = Math.floor(Math.random()*(max_width*0.9) )+max_width*0.05;
    var ycoord = max_height;
    var randomSize = 24+Math.floor(Math.random()*50);

    var getRandomRGB = function() { return  Math.floor(Math.random()*255) };
    var randomColor = { r : getRandomRGB(), g : getRandomRGB(), b : getRandomRGB() };
    return balloonConstructor(xcoord, ycoord,randomSize , randomColor, max_width);

}

Game.tick = function() {
    for (var i = 0; i < this.balloons.length; i++) {
        if (this.balloons[i].ycoord < -50) {
            this.balloons.splice(i,1);
            i--;
            this.lostBalloons++;
            $('#balloon_counter').html(this.lostBalloons);
        }
    }

    if (Math.random() < 0.03) {
        this.balloons.push(this.randomBalloon());
    }

    for (var i in this.balloons) {
        this.balloons[i].tick();
    }

}

Game.draw = function() {
    for (var i in this.balloons) {
        this.balloons[i].draw();
    }
    if (this.ctx) {
        this.ctx.fillText(this.balloons_caught, this.canvas.width * 0.1, this.canvas.height * 0.1)
        this.ctx.fillText(this.lostBalloons, this.canvas.width * 0.8, this.canvas.height * 0.1)
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


