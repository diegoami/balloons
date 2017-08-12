var INITY = 390;
var XMAX = 640;

var balloonConstructor = function(xcoord, ycoord, size, color) {
    var that;
    that = new Object();
    that.xcoord = xcoord ;
    that.ycoord = ycoord ;
    that.size = size;
    that.color = color;
    that.delta = -1 * ((Math.random()*3.4)+0.25);
    that.xdelta = -.5+ Math.random();

    that.tick = function() {
        that.ycoord = that.ycoord +that.delta;
        that.xcoord = that.xcoord +that.xdelta;
        if (that.xcoord < 0) {
            that.xdelta = -that.xdelta;;
        }
        if (that.xcoord > XMAX) {
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



Game.init = function() {
    this._intervalId = setInterval(Game.run, 1000 / Game.fps);
    this.canvas = $('#balloon_canvas');
    this.canvasbackup = $('#balloon_canvas').clone(true);
    this.div = $('#div_canvas');
    this.balloons = [];
    this.balloons_caught = 0;
    this.lostBalloons = 0;
//this.canvas.width($(window).width());
//    this.canvas.height($(window).height());
    var that = this;
    $('#balloon_canvas').click( function(event) {
        var x = event.pageX - 0,
            y = event.pageY - 100;
        console.log(x);
        console.log(y);

        for (var i = that.balloons.length-1; i >= 0; i--) {
            if (that.balloons[i].collision(x,y)) {
                that.balloons.splice(i,1);
                that.balloons_caught++;
                $('#caught_balloon_counter').html(that.balloons_caught);
                break;
            }
        }
   });
}

Game.randomBalloon = function() {
    var xcoord = Math.floor(Math.random()*XMAX );
    var ycoord = INITY;
    var randomSize = 24+Math.floor(Math.random()*50);

    var getRandomRGB = function() { return  Math.floor(Math.random()*255) };
    var randomColor = { r : getRandomRGB(), g : getRandomRGB(), b : getRandomRGB() };
    return balloonConstructor(xcoord, ycoord,randomSize , randomColor);

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
        this.balloons[i].draw(this.canvas);
    }

};

Game.clear = function() {
    var self = this;
    self.ctx = self.canvas[0].getContext('2d');
    self.ctx.clearRect( 0, 0, 640, 390);
}
    /*

    Game.clear = function() {
        var self = this;
        if (null == self.canvasbackup) {
            var tmpcanvas = self.canvas.clone(true);
            self.canvasbackup = self.canvas;
            self.canvas=tmpcanvas;
        } else {
            var tmpcanvas = self.canvasbackup;
            self.canvasbackup = self.canvas;
            self.canvas=tmpcanvas;
        }
        self.ctx = self.canvas[0].getContext('2d');
        self.ctx.clearRect( 0, 0, 1000, 460);
    }
    */
Game.inDOM =  function() {
    var self = this;
    if(null==self.canvasbackup) {
        self.canvas.appendTo(self.div);
        //self.div.appendTo(self.container);
    } else {
        //self.connectHuman();
        self.canvasbackup.remove();
        self.canvas.appendTo(self.div);
    }
}



Game.update = function() {
    var self = this;
    self.clear();
    self.tick();
    self.draw();
//    self.inDOM();

};
Game.run = function() {
    if (!Game.stopped) { // While the game is running
        Game.update();        // Update Entities (e.g. Position)
    }
}




window.addEventListener('load', function () {
    Game.init();
}, false);


