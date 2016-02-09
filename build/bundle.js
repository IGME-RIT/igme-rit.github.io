(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
    "lessons":[
        {
            "x": "0",
            "y": "0",
            "image": "dog.jpeg"
        },
        {
            "x": "100",
            "y": "100",
            "image": "dog.jpeg"
        }
    ]
}
},{}],2:[function(require,module,exports){
"use strict";
function clear(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
}

function rect(ctx, x, y, w, h, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function line(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

function circle(ctx, x, y, radius, color){
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function boardButton(ctx, position, width, height, hovered){
    //ctx.save();
    if(hovered){
        ctx.fillStyle = "dodgerblue";
    }
    else{
        ctx.fillStyle = "lightblue";
    }
    //draw rounded container
    ctx.rect(position.x - width/2, position.y - height/2, width, height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fill();
    //ctx.restore();
}

module.exports = {
    clear : clear,
    rect: rect,
    line: line,
    circle: circle,
    boardButton: boardButton
};
},{}],3:[function(require,module,exports){
"use strict";
//imports
var Game = require('./modules/game.js');
var Point = require('./modules/point.js');

//variables
var game;
var canvas;
var ctx;

var header;
var activeHeight;
var center;
/*app.IMAGES = {
    testImage: "images/dog.png"
 };*/

window.onload = function(e){
    initializeVariables();
    
    loop();
	/*app.main.app = app;
    
	app.main.utilities = app.utilities;
	app.main.drawLib = app.drawLib;
    app.main.dataObject = new app.dataObject();
    app.board.drawLib = app.drawLib;
    app.lessonNode.drawLib = app.drawLib;
    app.boardButton.drawLib = app.drawLib;
    
	app.queue = new createjs.LoadQueue(false);
	app.queue.on("complete", function(){
		app.main.init();
	});
    app.queue.loadManifest([
        {id: "exampleImage", src:"images/dog.jpg"},
	]);
    
    window.addEventListener("resize",function(e){
        app.main.canvas.width = app.main.canvas.offsetWidth;
        app.main.canvas.height = app.main.canvas.offsetHeight;
        app.main.activeHeight = app.main.canvas.height - app.main.header.offsetHeight;
        app.main.center = new app.point(app.main.canvas.width / 2, app.main.activeHeight / 2 + app.main.header.offsetHeight)
	});*/
}

function initializeVariables(){
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
    
    header = document.querySelector('header');
    activeHeight = canvas.height - header.offsetHeight;
    center = new Point(canvas.width/2, activeHeight / 2 + header.offsetHeight);
    
    game = new Game();
}

function loop(){
    //window.requestAnimationFrame(loop());
    game.update(ctx, canvas, 0, center, activeHeight);
}

window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
});
},{"./modules/game.js":8,"./modules/point.js":10}],4:[function(require,module,exports){
'use strict';
var utilities = require('./utilities.js');
var app = app || {};

app.main = {    
    //variables
    canvas: undefined,
    ctx: undefined,
    app: undefined,
    utilities: undefined,
    drawLib: undefined,
    
    mousePosition: undefined,
    lastMousePosition: undefined,
    relativeMousePosition: undefined,
    animationID: 0,
	lastTime: 0,
    
    header: undefined,
    activeHeight: undefined,
    center: undefined,
    board: undefined,
    
    dragging: undefined,
    cursor: undefined,
    
    //dataObject: require('./objects/dataObject.js'),
    
    //enumeration
    GAME_STATE: Object.freeze({	
		BOARD_VIEW: 0,
		FOCUS_VIEW: 1
	}),
    
    init : function() {
        //this.debugLine = document.querySelector('#debugLine');
        
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        this.mousePosition = new app.point(this.canvas.width/2, this.canvas.height/2);
        this.lastMousePosition = this.mousePosition;
        this.relativeMousePosition = this.mousePosition;
        
        this.header = document.querySelector('header');
        this.activeHeight = this.canvas.height - this.header.offsetHeight;
        this.center = new app.point(this.canvas.width/2, this.activeHeight / 2 + this.header.offsetHeight);
        //get listv of nodes from data
        
        var tempLessonNodeArray = [];
        tempLessonNodeArray.push(new app.lessonNode(new app.point(0,0)));
        tempLessonNodeArray.push(new app.lessonNode(new app.point(300,300)));
        tempLessonNodeArray.push(new app.lessonNode(new app.point(300,-300)));
        this.board = new app.board(new app.point(0,0), tempLessonNodeArray);
        
        this.dragging = false;
        this.cursor = document.getElementById("myP");
        
        var testetest = this.dataObject.infoArray;
        
        //denotes gameplay state
        this.game_state = this.GAME_STATE.BOARD_VIEW;
        
        //connecting events
        this.canvas.onmousemove = this.getMousePosition.bind(this);
        this.canvas.onmousedown = this.doMouseDown.bind(this);
        this.canvas.onmouseup = this.doMouseUp.bind(this);
        this.canvas.addEventListener("mousewheel", this.doWheel.bind(this));
        
        //start the loop
        this.update();
    },
    
    //loop functions
    update: function() {
        //call the loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
        
        //calculate delta time
        var dt = this.calculateDeltaTime();
        
        //clear the canvas
        this.drawLib.clear(this.ctx,0,0,this.canvas.offsetWidth,this.canvas.offsetHeight);
        this.drawLib.rect(this.ctx, 0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight, "White");
        
        //update
        if(this.game_state == this.GAME_STATE.BOARD_VIEW){
            
            //draw game screen
            
            this.boardCollisionHandling();
            this.board.draw(this.ctx, this.center, this.canvas.width, this.activeHeight);
            
            this.drawLib.circle(this.ctx, this.mousePosition.x, this.mousePosition.y, 10, "RoyalBlue");
        }
        else if(this.game_state == this.GAME_STATE.TITLE){
            //draw title screen
        }
        //cursor handling
        this.cursorHandler();
        this.debugHud(this.ctx, dt);
    },
    
    calculateDeltaTime: function(){
		var now;
        var fps;
		now = (+ new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = app.utilities.clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},
    
    //helper event functions
    getMousePosition: function(e){
		this.lastMousePosition = this.mousePosition;
        this.mousePosition = app.utilities.getMouse(e, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.relativeMousePosition = new app.point(this.mousePosition.x - this.canvas.width/2 + this.board.position.x, this.mousePosition.y - this.activeHeight/2 + this.board.position.y - this.header.offsetHeight);
        
        if(this.dragging){
            //the positional difference between last loop and this
            this.board.move(this.lastMousePosition.x - this.mousePosition.x, this.lastMousePosition.y - this.mousePosition.y);
        }
	},
    doMouseDown : function(e) {
        this.dragging = true;
    },
    doMouseUp : function(e) {
        this.dragging = false;
    },
    doWheel : function(e) {
        this.board.zoom(this.ctx, this.center, e.deltaY);
    },
    
    cursorHandler : function(){
        //is it hovering over the canvas?
        //is it dragging?
        if(this.dragging){
            this.canvas.style.cursor = "-webkit-grabbing";
        }
        else{
            this.canvas.style.cursor = "default";
        }
    },
    
    boardCollisionHandling : function(){
        var activeNode;
        for(var i = 0; i < this.board.lessonNodeArray.length; i++){
            activeNode = this.board.lessonNodeArray[i];
            if(this.relativeMousePosition.x > activeNode.position.x - activeNode.width/2 && this.relativeMousePosition.x < activeNode.position.x + activeNode.width/2){
                if(this.relativeMousePosition.y > activeNode.position.y - activeNode.height/2 && this.relativeMousePosition.y < activeNode.position.y + activeNode.height/2){
                    activeNode.boardButton.hovered = true;
                    break;
                }
                else{
                    activeNode.boardButton.hovered = false;
                }
            }
            else{
                activeNode.boardButton.hovered = false;
            }
        }
    },
    
    //debug
    debugHud: function(ctx, dt) {
        ctx.save();
        this.fillText(ctx, "mousePosition: " + this.mousePosition.x + ", " + this.mousePosition.y, 50, this.canvas.height - 10, "12pt oswald", "Black");
        this.fillText(ctx,"RelMousePosition: "+this.relativeMousePosition.x + ", " + this.relativeMousePosition.y, this.canvas.width/2, this.canvas.height - 10,"12pt oswald","Black");
        this.fillText(ctx, "dt: " + dt.toFixed(3), this.canvas.width - 150, this.canvas.height - 10, "12pt oswald", "black");
        this.drawLib.line(ctx, this.center.x, this.center.y - this.activeHeight/2, this.center.x, this.center.y + this.activeHeight/2, 2, "Lightgray");
        this.drawLib.line(ctx, 0, this.center.y, this.canvas.width, this.center.y, 2, "Lightgray");
        
        this.fillText(ctx, this.board.lessonNodeArray[0].boardButton.hovered, this.canvas.width/2, this.canvas.height - 30, "12pt oswald", "black");
        this.fillText(ctx, this.board.lessonNodeArray[1].boardButton.hovered, this.canvas.width/2, this.canvas.height - 50, "12pt oswald", "black");
        this.fillText(ctx, this.board.lessonNodeArray[2].boardButton.hovered, this.canvas.width/2, this.canvas.height - 70, "12pt oswald", "black");
        
        ctx.restore();
    },
    fillText: function(ctx, string, x, y, css, color) {
		ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		this.ctx.font = css;
		this.ctx.fillStyle = color;
		this.ctx.fillText(string, x, y);
		ctx.restore();
	},
};
},{"./utilities.js":11}],5:[function(require,module,exports){
"use strict";
//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    this.position = startPosition;

    this.boundLeft = 0;
    this.boundRight = 0;
    this.boundTop = 0;
    this.boundBottom = 0;

    this.zoomFactor = 1;


    this.lessonNodeArray = lessonNodes;
}

board.drawLib = undefined;

//helper
function calculateBounds(){
    if(this.lessonNodeArray.length > 0){
        this.boundLeft = this.lessonNodeArray[0].position.x;
        this.boundRight = this.lessonNodeArray[0].position.x;
        this.boundTop = this.lessonNodeArray[0].position.y;
        this.boundBottom = this.lessonNodeArray[0].position.y;
        for(var i = 1; i < this.lessonNodeArray.length; i++){
            if(this.boundLeft > this.lessonNodeArray[i].position.x){
                this.boundLeft = this.lessonNodeArray[i].position.x;
            }
            else if(this.boundRight < this.lessonNodeArray[i].position.x){
                this.boundRight > this.lessonNodeArray[i].position.x;
            }
            if(this.boundTop > this.lessonNodeArray[i].position.y){
                this.boundTop = this.lessonNodeArray[i].position.y;
            }
            else if(this.boundBottom < this.lessonNodeArray[i].position.y){
                this.boundBottom = this.lessonNodeArray[i].position.y;
            }
        }
    }
}


//prototype
var p = board.prototype;

p.move = function(pX, pY){
    this.position.x += pX;
    this.position.y += pY;
};


p.zoom = function(ctx, center, delta){
    /*
    if(delta > 0){
        this.zoomFactor -= .1;
        if(this.zoomFactor < .5){
            this.zoomFactor = .5;
        }
    }
    else{
        this.zoomFactor += .1;
        if(this.zoomFactor > 1.5){
            this.zoomFactor = 1.5;
        }
    }
    */
    //nudge this in the direction of the mouse
    //this.move((center.x - mousePosition.x)/10, (center.y - mousePosition.y)/10);
    //ctx.translate(center.x, center.y);
    //ctx.scale(this.zoomFactor, this.zoomFactor);
    //ctx.translate(-center.x, -center.y);
};

p.draw = function(ctx, center, activeWidth, activeHeight){
    ctx.save();
    //translate to the center of the screen
    ctx.translate(center.x - this.position.x, center.y - this.position.y);
    for(var i = 0; i < this.lessonNodeArray.length; i++){
        this.lessonNodeArray[i].draw(ctx, this.zoomFactor);
    }
    ctx.restore();
};

module.exports = board;

//this is an object named Board and this is its javascript
//var Board = require('./objects/board.js');
//var b = new Board();
    
},{}],6:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function boardButton(startPosition, width, height){
    this.position = startPosition;
    this.width = width;
    this.height = height;
    this.clicked = false;
    this.hovered = false;
}
boardButton.drawLib = undefined;

var p = boardButton.prototype;

p.draw = function(ctx){
    ctx.save();
    var col;
    if(this.hovered){
        col = "dodgerblue";
    }
    else{
        col = "lightblue";
    }
    //draw rounded container
    boardButton.drawLib.rect(ctx, this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height, col);

    ctx.restore();
};

module.exports = boardButton;
},{}],7:[function(require,module,exports){
"use strict";
//the json is local, no need for xhr when using this module pattern
module.exports = require('../../data/lessons.json');
/*
var xhr = require('xhr');

var app = app || {};

var infoArray = undefined;

xhr({
    uri: "data/lessons.json",
    headers: {
        "Content-Type": "application/json",
        "If-Modified-Since": "Sat, 1 Jan 2010 00:00:00 GMT"
    }
}, function (err, resp, body) {
    var myJSON = JSON.parse(body);
    infoArray = myJSON.lessons;
});


module.exports = infoArray;
*/
},{"../../data/lessons.json":1}],8:[function(require,module,exports){
var Board = require('./board.js');

function game(){
}

var p = game.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight){
    //update stuff
    p.act();
    //draw stuff
    p.draw(ctx, canvas);
}

p.act = function(){
    console.log("ACT");
}

p.draw = function(ctx, canvas){
    console.log(canvas.offsetHeight);
    //draw board
    ctx.save();
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.restore();
    //draw lesson nodes
}

module.exports = game;
},{"./board.js":5}],9:[function(require,module,exports){
"use strict";
//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    this.position = startPosition;
    this.width = 100;
    this.height = 100;
    this.boardButton = new app.boardButton(this.position, this.width,this.height);

    //image loading
    var tempImage = new Image();
    try{
        tempImage.src = imagePath;
        this.image = tempImage;
    }
    catch (e) {
        image.src = this.app.Images['exampleImage'];
        this.image = tempImage;
    }
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx, scaleFactor){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    this.boardButton.draw(ctx);
};

module.exports = lessonNode;
},{}],10:[function(require,module,exports){
"use strict";
var x;
var y;

function point(pX, pY){
    x = pX;
    y = pY;
}

module.exports = point;
},{}],11:[function(require,module,exports){
"use strict";

// returns mouse position in local coordinate system of element
function getMouse(e, actualCanvasWidth, actualCanvasHeight){
    //return new app.Point((e.pageX - e.target.offsetLeft) * (app.main.renderWidth / actualCanvasWidth), (e.pageY - e.target.offsetTop) * (app.main.renderHeight / actualCanvasHeight));
    return new app.point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

function map(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
}

module.exports = {
    getMouse : getMouse,
    clamp: clamp,
    map: map    
};
},{}]},{},[2,3,4,5,6,7,8,9,10,11])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL2RyYXdsaWIuanMiLCJqcy9tYWluLmpzIiwianMvbWFpbk9MRC5qcyIsImpzL21vZHVsZXMvYm9hcmQuanMiLCJqcy9tb2R1bGVzL2JvYXJkQnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgICBcImxlc3NvbnNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcInhcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwieVwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMTAwXCIsXHJcbiAgICAgICAgICAgIFwieVwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcImltYWdlXCI6IFwiZG9nLmpwZWdcIlxyXG4gICAgICAgIH1cclxuICAgIF1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBjbGVhcihjdHgsIHgsIHksIHcsIGgpIHtcclxuICAgIGN0eC5jbGVhclJlY3QoeCwgeSwgdywgaCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlY3QoY3R4LCB4LCB5LCB3LCBoLCBjb2wpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sO1xyXG4gICAgY3R4LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbGluZShjdHgsIHgxLCB5MSwgeDIsIHkyLCB0aGlja25lc3MsIGNvbG9yKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gICAgY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaWNrbmVzcztcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2lyY2xlKGN0eCwgeCwgeSwgcmFkaXVzLCBjb2xvcil7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmFyYyh4LHksIHJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBib2FyZEJ1dHRvbihjdHgsIHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0LCBob3ZlcmVkKXtcclxuICAgIC8vY3R4LnNhdmUoKTtcclxuICAgIGlmKGhvdmVyZWQpe1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImRvZGdlcmJsdWVcIjtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwibGlnaHRibHVlXCI7XHJcbiAgICB9XHJcbiAgICAvL2RyYXcgcm91bmRlZCBjb250YWluZXJcclxuICAgIGN0eC5yZWN0KHBvc2l0aW9uLnggLSB3aWR0aC8yLCBwb3NpdGlvbi55IC0gaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDU7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgLy9jdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGNsZWFyIDogY2xlYXIsXHJcbiAgICByZWN0OiByZWN0LFxyXG4gICAgbGluZTogbGluZSxcclxuICAgIGNpcmNsZTogY2lyY2xlLFxyXG4gICAgYm9hcmRCdXR0b246IGJvYXJkQnV0dG9uXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0c1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9nYW1lLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9wb2ludC5qcycpO1xyXG5cclxuLy92YXJpYWJsZXNcclxudmFyIGdhbWU7XHJcbnZhciBjYW52YXM7XHJcbnZhciBjdHg7XHJcblxyXG52YXIgaGVhZGVyO1xyXG52YXIgYWN0aXZlSGVpZ2h0O1xyXG52YXIgY2VudGVyO1xyXG4vKmFwcC5JTUFHRVMgPSB7XHJcbiAgICB0ZXN0SW1hZ2U6IFwiaW1hZ2VzL2RvZy5wbmdcIlxyXG4gfTsqL1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgaW5pdGlhbGl6ZVZhcmlhYmxlcygpO1xyXG4gICAgXHJcbiAgICBsb29wKCk7XHJcblx0LyphcHAubWFpbi5hcHAgPSBhcHA7XHJcbiAgICBcclxuXHRhcHAubWFpbi51dGlsaXRpZXMgPSBhcHAudXRpbGl0aWVzO1xyXG5cdGFwcC5tYWluLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIGFwcC5tYWluLmRhdGFPYmplY3QgPSBuZXcgYXBwLmRhdGFPYmplY3QoKTtcclxuICAgIGFwcC5ib2FyZC5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAubGVzc29uTm9kZS5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAuYm9hcmRCdXR0b24uZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgXHJcblx0YXBwLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblx0YXBwLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGFwcC5tYWluLmluaXQoKTtcclxuXHR9KTtcclxuICAgIGFwcC5xdWV1ZS5sb2FkTWFuaWZlc3QoW1xyXG4gICAgICAgIHtpZDogXCJleGFtcGxlSW1hZ2VcIiwgc3JjOlwiaW1hZ2VzL2RvZy5qcGdcIn0sXHJcblx0XSk7XHJcbiAgICBcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgYXBwLm1haW4uY2FudmFzLndpZHRoID0gYXBwLm1haW4uY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIGFwcC5tYWluLmNhbnZhcy5oZWlnaHQgPSBhcHAubWFpbi5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGFwcC5tYWluLmFjdGl2ZUhlaWdodCA9IGFwcC5tYWluLmNhbnZhcy5oZWlnaHQgLSBhcHAubWFpbi5oZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGFwcC5tYWluLmNlbnRlciA9IG5ldyBhcHAucG9pbnQoYXBwLm1haW4uY2FudmFzLndpZHRoIC8gMiwgYXBwLm1haW4uYWN0aXZlSGVpZ2h0IC8gMiArIGFwcC5tYWluLmhlYWRlci5vZmZzZXRIZWlnaHQpXHJcblx0fSk7Ki9cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZVZhcmlhYmxlcygpe1xyXG4gICAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY29uc29sZS5sb2coXCJDYW52YXMgRGltZW5zaW9uczogXCIgKyBjYW52YXMud2lkdGggKyBcIiwgXCIgKyBjYW52YXMuaGVpZ2h0KTtcclxuICAgIFxyXG4gICAgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICBhY3RpdmVIZWlnaHQgPSBjYW52YXMuaGVpZ2h0IC0gaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgIGNlbnRlciA9IG5ldyBQb2ludChjYW52YXMud2lkdGgvMiwgYWN0aXZlSGVpZ2h0IC8gMiArIGhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9vcCgpe1xyXG4gICAgLy93aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3AoKSk7XHJcbiAgICBnYW1lLnVwZGF0ZShjdHgsIGNhbnZhcywgMCwgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyk7XHJcbnZhciBhcHAgPSBhcHAgfHwge307XHJcblxyXG5hcHAubWFpbiA9IHsgICAgXHJcbiAgICAvL3ZhcmlhYmxlc1xyXG4gICAgY2FudmFzOiB1bmRlZmluZWQsXHJcbiAgICBjdHg6IHVuZGVmaW5lZCxcclxuICAgIGFwcDogdW5kZWZpbmVkLFxyXG4gICAgdXRpbGl0aWVzOiB1bmRlZmluZWQsXHJcbiAgICBkcmF3TGliOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIG1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIGxhc3RNb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIGFuaW1hdGlvbklEOiAwLFxyXG5cdGxhc3RUaW1lOiAwLFxyXG4gICAgXHJcbiAgICBoZWFkZXI6IHVuZGVmaW5lZCxcclxuICAgIGFjdGl2ZUhlaWdodDogdW5kZWZpbmVkLFxyXG4gICAgY2VudGVyOiB1bmRlZmluZWQsXHJcbiAgICBib2FyZDogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICBkcmFnZ2luZzogdW5kZWZpbmVkLFxyXG4gICAgY3Vyc29yOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIC8vZGF0YU9iamVjdDogcmVxdWlyZSgnLi9vYmplY3RzL2RhdGFPYmplY3QuanMnKSxcclxuICAgIFxyXG4gICAgLy9lbnVtZXJhdGlvblxyXG4gICAgR0FNRV9TVEFURTogT2JqZWN0LmZyZWV6ZSh7XHRcclxuXHRcdEJPQVJEX1ZJRVc6IDAsXHJcblx0XHRGT0NVU19WSUVXOiAxXHJcblx0fSksXHJcbiAgICBcclxuICAgIGluaXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL3RoaXMuZGVidWdMaW5lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RlYnVnTGluZScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IG5ldyBhcHAucG9pbnQodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZUhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCAtIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG5ldyBhcHAucG9pbnQodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5hY3RpdmVIZWlnaHQgLyAyICsgdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICAvL2dldCBsaXN0diBvZiBub2RlcyBmcm9tIGRhdGFcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdGVtcExlc3Nvbk5vZGVBcnJheSA9IFtdO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgwLDApKSk7XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDMwMCwzMDApKSk7XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDMwMCwtMzAwKSkpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgYXBwLmJvYXJkKG5ldyBhcHAucG9pbnQoMCwwKSwgdGVtcExlc3Nvbk5vZGVBcnJheSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteVBcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRlc3RldGVzdCA9IHRoaXMuZGF0YU9iamVjdC5pbmZvQXJyYXk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kZW5vdGVzIGdhbWVwbGF5IHN0YXRlXHJcbiAgICAgICAgdGhpcy5nYW1lX3N0YXRlID0gdGhpcy5HQU1FX1NUQVRFLkJPQVJEX1ZJRVc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jb25uZWN0aW5nIGV2ZW50c1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vtb3ZlID0gdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZWRvd24gPSB0aGlzLmRvTW91c2VEb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5kb01vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCB0aGlzLmRvV2hlZWwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9zdGFydCB0aGUgbG9vcFxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvL2xvb3AgZnVuY3Rpb25zXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vY2FsbCB0aGUgbG9vcFxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uSUQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jYWxjdWxhdGUgZGVsdGEgdGltZVxyXG4gICAgICAgIHZhciBkdCA9IHRoaXMuY2FsY3VsYXRlRGVsdGFUaW1lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jbGVhciB0aGUgY2FudmFzXHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmNsZWFyKHRoaXMuY3R4LDAsMCx0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCx0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5yZWN0KHRoaXMuY3R4LCAwLCAwLCB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCwgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0LCBcIldoaXRlXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdXBkYXRlXHJcbiAgICAgICAgaWYodGhpcy5nYW1lX3N0YXRlID09IHRoaXMuR0FNRV9TVEFURS5CT0FSRF9WSUVXKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vZHJhdyBnYW1lIHNjcmVlblxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5ib2FyZENvbGxpc2lvbkhhbmRsaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZHJhdyh0aGlzLmN0eCwgdGhpcy5jZW50ZXIsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmFjdGl2ZUhlaWdodCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaWIuY2lyY2xlKHRoaXMuY3R4LCB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnksIDEwLCBcIlJveWFsQmx1ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzLmdhbWVfc3RhdGUgPT0gdGhpcy5HQU1FX1NUQVRFLlRJVExFKXtcclxuICAgICAgICAgICAgLy9kcmF3IHRpdGxlIHNjcmVlblxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2N1cnNvciBoYW5kbGluZ1xyXG4gICAgICAgIHRoaXMuY3Vyc29ySGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuZGVidWdIdWQodGhpcy5jdHgsIGR0KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGNhbGN1bGF0ZURlbHRhVGltZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBub3c7XHJcbiAgICAgICAgdmFyIGZwcztcclxuXHRcdG5vdyA9ICgrIG5ldyBEYXRlKTsgXHJcblx0XHRmcHMgPSAxMDAwIC8gKG5vdyAtIHRoaXMubGFzdFRpbWUpO1xyXG5cdFx0ZnBzID0gYXBwLnV0aWxpdGllcy5jbGFtcChmcHMsIDEyLCA2MCk7XHJcblx0XHR0aGlzLmxhc3RUaW1lID0gbm93OyBcclxuXHRcdHJldHVybiAxL2ZwcztcclxuXHR9LFxyXG4gICAgXHJcbiAgICAvL2hlbHBlciBldmVudCBmdW5jdGlvbnNcclxuICAgIGdldE1vdXNlUG9zaXRpb246IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBhcHAudXRpbGl0aWVzLmdldE1vdXNlKGUsIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLCB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IGFwcC5wb2ludCh0aGlzLm1vdXNlUG9zaXRpb24ueCAtIHRoaXMuY2FudmFzLndpZHRoLzIgKyB0aGlzLmJvYXJkLnBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55IC0gdGhpcy5hY3RpdmVIZWlnaHQvMiArIHRoaXMuYm9hcmQucG9zaXRpb24ueSAtIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2luZyl7XHJcbiAgICAgICAgICAgIC8vdGhlIHBvc2l0aW9uYWwgZGlmZmVyZW5jZSBiZXR3ZWVuIGxhc3QgbG9vcCBhbmQgdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmUodGhpcy5sYXN0TW91c2VQb3NpdGlvbi54IC0gdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubGFzdE1vdXNlUG9zaXRpb24ueSAtIHRoaXMubW91c2VQb3NpdGlvbi55KTtcclxuICAgICAgICB9XHJcblx0fSxcclxuICAgIGRvTW91c2VEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGRvTW91c2VVcCA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgZG9XaGVlbCA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmJvYXJkLnpvb20odGhpcy5jdHgsIHRoaXMuY2VudGVyLCBlLmRlbHRhWSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBjdXJzb3JIYW5kbGVyIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAvL2lzIGl0IGhvdmVyaW5nIG92ZXIgdGhlIGNhbnZhcz9cclxuICAgICAgICAvL2lzIGl0IGRyYWdnaW5nP1xyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dpbmcpe1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBcIi13ZWJraXQtZ3JhYmJpbmdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJkZWZhdWx0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgYm9hcmRDb2xsaXNpb25IYW5kbGluZyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGFjdGl2ZU5vZGU7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgYWN0aXZlTm9kZSA9IHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5W2ldO1xyXG4gICAgICAgICAgICBpZih0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54ID4gYWN0aXZlTm9kZS5wb3NpdGlvbi54IC0gYWN0aXZlTm9kZS53aWR0aC8yICYmIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggPCBhY3RpdmVOb2RlLnBvc2l0aW9uLnggKyBhY3RpdmVOb2RlLndpZHRoLzIpe1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSA+IGFjdGl2ZU5vZGUucG9zaXRpb24ueSAtIGFjdGl2ZU5vZGUuaGVpZ2h0LzIgJiYgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSA8IGFjdGl2ZU5vZGUucG9zaXRpb24ueSArIGFjdGl2ZU5vZGUuaGVpZ2h0LzIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vZGVidWdcclxuICAgIGRlYnVnSHVkOiBmdW5jdGlvbihjdHgsIGR0KSB7XHJcbiAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgXCJtb3VzZVBvc2l0aW9uOiBcIiArIHRoaXMubW91c2VQb3NpdGlvbi54ICsgXCIsIFwiICsgdGhpcy5tb3VzZVBvc2l0aW9uLnksIDUwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCwgXCIxMnB0IG9zd2FsZFwiLCBcIkJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LFwiUmVsTW91c2VQb3NpdGlvbjogXCIrdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCArIFwiLCBcIiArIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnksIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLFwiMTJwdCBvc3dhbGRcIixcIkJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCBcImR0OiBcIiArIGR0LnRvRml4ZWQoMyksIHRoaXMuY2FudmFzLndpZHRoIC0gMTUwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5saW5lKGN0eCwgdGhpcy5jZW50ZXIueCwgdGhpcy5jZW50ZXIueSAtIHRoaXMuYWN0aXZlSGVpZ2h0LzIsIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgKyB0aGlzLmFjdGl2ZUhlaWdodC8yLCAyLCBcIkxpZ2h0Z3JheVwiKTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIubGluZShjdHgsIDAsIHRoaXMuY2VudGVyLnksIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNlbnRlci55LCAyLCBcIkxpZ2h0Z3JheVwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMF0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMzAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMV0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gNTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMl0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gNzAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfSxcclxuICAgIGZpbGxUZXh0OiBmdW5jdGlvbihjdHgsIHN0cmluZywgeCwgeSwgY3NzLCBjb2xvcikge1xyXG5cdFx0Y3R4LnNhdmUoKTtcclxuXHRcdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9mb250XHJcblx0XHR0aGlzLmN0eC5mb250ID0gY3NzO1xyXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XHJcblx0XHR0aGlzLmN0eC5maWxsVGV4dChzdHJpbmcsIHgsIHkpO1xyXG5cdFx0Y3R4LnJlc3RvcmUoKTtcclxuXHR9LFxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBib2FyZChzdGFydFBvc2l0aW9uLCBsZXNzb25Ob2Rlcyl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcclxuXHJcbiAgICB0aGlzLmJvdW5kTGVmdCA9IDA7XHJcbiAgICB0aGlzLmJvdW5kUmlnaHQgPSAwO1xyXG4gICAgdGhpcy5ib3VuZFRvcCA9IDA7XHJcbiAgICB0aGlzLmJvdW5kQm90dG9tID0gMDtcclxuXHJcbiAgICB0aGlzLnpvb21GYWN0b3IgPSAxO1xyXG5cclxuXHJcbiAgICB0aGlzLmxlc3Nvbk5vZGVBcnJheSA9IGxlc3Nvbk5vZGVzO1xyXG59XHJcblxyXG5ib2FyZC5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxuLy9oZWxwZXJcclxuZnVuY3Rpb24gY2FsY3VsYXRlQm91bmRzKCl7XHJcbiAgICBpZih0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGggPiAwKXtcclxuICAgICAgICB0aGlzLmJvdW5kTGVmdCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5ib3VuZFJpZ2h0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLmJvdW5kVG9wID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueTtcclxuICAgICAgICB0aGlzLmJvdW5kQm90dG9tID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueTtcclxuICAgICAgICBmb3IodmFyIGkgPSAxOyBpIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBpZih0aGlzLmJvdW5kTGVmdCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLngpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZExlZnQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5ib3VuZFJpZ2h0IDwgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kUmlnaHQgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuYm91bmRUb3AgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRUb3AgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5ib3VuZEJvdHRvbSA8IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZEJvdHRvbSA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vL3Byb3RvdHlwZVxyXG52YXIgcCA9IGJvYXJkLnByb3RvdHlwZTtcclxuXHJcbnAubW92ZSA9IGZ1bmN0aW9uKHBYLCBwWSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnggKz0gcFg7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnkgKz0gcFk7XHJcbn07XHJcblxyXG5cclxucC56b29tID0gZnVuY3Rpb24oY3R4LCBjZW50ZXIsIGRlbHRhKXtcclxuICAgIC8qXHJcbiAgICBpZihkZWx0YSA+IDApe1xyXG4gICAgICAgIHRoaXMuem9vbUZhY3RvciAtPSAuMTtcclxuICAgICAgICBpZih0aGlzLnpvb21GYWN0b3IgPCAuNSl7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbUZhY3RvciA9IC41O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgdGhpcy56b29tRmFjdG9yICs9IC4xO1xyXG4gICAgICAgIGlmKHRoaXMuem9vbUZhY3RvciA+IDEuNSl7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbUZhY3RvciA9IDEuNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAqL1xyXG4gICAgLy9udWRnZSB0aGlzIGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIG1vdXNlXHJcbiAgICAvL3RoaXMubW92ZSgoY2VudGVyLnggLSBtb3VzZVBvc2l0aW9uLngpLzEwLCAoY2VudGVyLnkgLSBtb3VzZVBvc2l0aW9uLnkpLzEwKTtcclxuICAgIC8vY3R4LnRyYW5zbGF0ZShjZW50ZXIueCwgY2VudGVyLnkpO1xyXG4gICAgLy9jdHguc2NhbGUodGhpcy56b29tRmFjdG9yLCB0aGlzLnpvb21GYWN0b3IpO1xyXG4gICAgLy9jdHgudHJhbnNsYXRlKC1jZW50ZXIueCwgLWNlbnRlci55KTtcclxufTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCwgY2VudGVyLCBhY3RpdmVXaWR0aCwgYWN0aXZlSGVpZ2h0KXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGN0eC50cmFuc2xhdGUoY2VudGVyLnggLSB0aGlzLnBvc2l0aW9uLngsIGNlbnRlci55IC0gdGhpcy5wb3NpdGlvbi55KTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0uZHJhdyhjdHgsIHRoaXMuem9vbUZhY3Rvcik7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBib2FyZDtcclxuXHJcbi8vdGhpcyBpcyBhbiBvYmplY3QgbmFtZWQgQm9hcmQgYW5kIHRoaXMgaXMgaXRzIGphdmFzY3JpcHRcclxuLy92YXIgQm9hcmQgPSByZXF1aXJlKCcuL29iamVjdHMvYm9hcmQuanMnKTtcclxuLy92YXIgYiA9IG5ldyBCb2FyZCgpO1xyXG4gICAgIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBib2FyZEJ1dHRvbihzdGFydFBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLmNsaWNrZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaG92ZXJlZCA9IGZhbHNlO1xyXG59XHJcbmJvYXJkQnV0dG9uLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG52YXIgcCA9IGJvYXJkQnV0dG9uLnByb3RvdHlwZTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCl7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgdmFyIGNvbDtcclxuICAgIGlmKHRoaXMuaG92ZXJlZCl7XHJcbiAgICAgICAgY29sID0gXCJkb2RnZXJibHVlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGNvbCA9IFwibGlnaHRibHVlXCI7XHJcbiAgICB9XHJcbiAgICAvL2RyYXcgcm91bmRlZCBjb250YWluZXJcclxuICAgIGJvYXJkQnV0dG9uLmRyYXdMaWIucmVjdChjdHgsIHRoaXMucG9zaXRpb24ueCAtIHRoaXMud2lkdGgvMiwgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5oZWlnaHQvMiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIGNvbCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYm9hcmRCdXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdGhlIGpzb24gaXMgbG9jYWwsIG5vIG5lZWQgZm9yIHhociB3aGVuIHVzaW5nIHRoaXMgbW9kdWxlIHBhdHRlcm5cclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9kYXRhL2xlc3NvbnMuanNvbicpO1xyXG4vKlxyXG52YXIgeGhyID0gcmVxdWlyZSgneGhyJyk7XHJcblxyXG52YXIgYXBwID0gYXBwIHx8IHt9O1xyXG5cclxudmFyIGluZm9BcnJheSA9IHVuZGVmaW5lZDtcclxuXHJcbnhocih7XHJcbiAgICB1cmk6IFwiZGF0YS9sZXNzb25zLmpzb25cIixcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICBcIklmLU1vZGlmaWVkLVNpbmNlXCI6IFwiU2F0LCAxIEphbiAyMDEwIDAwOjAwOjAwIEdNVFwiXHJcbiAgICB9XHJcbn0sIGZ1bmN0aW9uIChlcnIsIHJlc3AsIGJvZHkpIHtcclxuICAgIHZhciBteUpTT04gPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgaW5mb0FycmF5ID0gbXlKU09OLmxlc3NvbnM7XHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5mb0FycmF5O1xyXG4qLyIsInZhciBCb2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIGdhbWUoKXtcclxufVxyXG5cclxudmFyIHAgPSBnYW1lLnByb3RvdHlwZTtcclxuXHJcbnAudXBkYXRlID0gZnVuY3Rpb24oY3R4LCBjYW52YXMsIGR0LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCl7XHJcbiAgICAvL3VwZGF0ZSBzdHVmZlxyXG4gICAgcC5hY3QoKTtcclxuICAgIC8vZHJhdyBzdHVmZlxyXG4gICAgcC5kcmF3KGN0eCwgY2FudmFzKTtcclxufVxyXG5cclxucC5hY3QgPSBmdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2coXCJBQ1RcIik7XHJcbn1cclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCwgY2FudmFzKXtcclxuICAgIGNvbnNvbGUubG9nKGNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgLy9kcmF3IGJvYXJkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIC8vZHJhdyBsZXNzb24gbm9kZXNcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnYW1lOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBsZXNzb25Ob2RlKHN0YXJ0UG9zaXRpb24sIGltYWdlUGF0aCl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcclxuICAgIHRoaXMud2lkdGggPSAxMDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDEwMDtcclxuICAgIHRoaXMuYm9hcmRCdXR0b24gPSBuZXcgYXBwLmJvYXJkQnV0dG9uKHRoaXMucG9zaXRpb24sIHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgIC8vaW1hZ2UgbG9hZGluZ1xyXG4gICAgdmFyIHRlbXBJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgdHJ5e1xyXG4gICAgICAgIHRlbXBJbWFnZS5zcmMgPSBpbWFnZVBhdGg7XHJcbiAgICAgICAgdGhpcy5pbWFnZSA9IHRlbXBJbWFnZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5hcHAuSW1hZ2VzWydleGFtcGxlSW1hZ2UnXTtcclxuICAgICAgICB0aGlzLmltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXNzb25Ob2RlLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG52YXIgcCA9IGxlc3Nvbk5vZGUucHJvdG90eXBlO1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4LCBzY2FsZUZhY3Rvcil7XHJcbiAgICAvL2xlc3Nvbk5vZGUuZHJhd0xpYi5jaXJjbGUoY3R4LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgMTAsIFwicmVkXCIpO1xyXG4gICAgdGhpcy5ib2FyZEJ1dHRvbi5kcmF3KGN0eCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlc3Nvbk5vZGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciB4O1xyXG52YXIgeTtcclxuXHJcbmZ1bmN0aW9uIHBvaW50KHBYLCBwWSl7XHJcbiAgICB4ID0gcFg7XHJcbiAgICB5ID0gcFk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vLyByZXR1cm5zIG1vdXNlIHBvc2l0aW9uIGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtIG9mIGVsZW1lbnRcclxuZnVuY3Rpb24gZ2V0TW91c2UoZSwgYWN0dWFsQ2FudmFzV2lkdGgsIGFjdHVhbENhbnZhc0hlaWdodCl7XHJcbiAgICAvL3JldHVybiBuZXcgYXBwLlBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCkgKiAoYXBwLm1haW4ucmVuZGVyV2lkdGggLyBhY3R1YWxDYW52YXNXaWR0aCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSAqIChhcHAubWFpbi5yZW5kZXJIZWlnaHQgLyBhY3R1YWxDYW52YXNIZWlnaHQpKTtcclxuICAgIHJldHVybiBuZXcgYXBwLnBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hcCh2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICByZXR1cm4gbWluMiArIChtYXgyIC0gbWluMikgKiAoKHZhbHVlIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgdmFsdWUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRNb3VzZSA6IGdldE1vdXNlLFxyXG4gICAgY2xhbXA6IGNsYW1wLFxyXG4gICAgbWFwOiBtYXAgICAgXHJcbn07Il19
