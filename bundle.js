(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
//imports
var Game = require('./modules/Game.js');
var Point = require('./modules/common/Point.js');
var Time = require('./modules/containers/Time.js');
var MouseState = require('./modules/containers/MouseState.js');
var CanvasState = require('./modules/containers/CanvasState.js');

//game objects
var game;
var canvas;
var ctx;
var time;

//responsiveness
var header;
var center;
var scale;

//mouse handling
var mousePosition;
var relativeMousePosition;
var mouseDown;
var mouseIn;
var wheelDelta;

//passable states
var mouseState;
var canvasState;

//fires when the window loads
window.onload = function(e){
    //debug button designed to clear progress data
    
    //variable and loop initialization
    initializeVariables();
    loop();
}

//initialization for variables, mouse events, and game "class"
function initializeVariables(){
    //camvas initialization
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    
    time = new Time();
    
    
    //mouse variable initialization
    mousePosition = new Point(0,0);
    relativeMousePosition = new Point(0,0);
    
    
    
    
    
    //event listeners for mouse interactions with the canvas
    canvas.addEventListener("mousemove", function(e) {
        var boundRect = canvas.getBoundingClientRect();
        mousePosition = new Point(e.clientX - boundRect.left, e.clientY - boundRect.top);
        relativeMousePosition = new Point(mousePosition.x - canvas.offsetWidth / 2, mousePosition.y - canvas.offsetHeight / 2);
    });
    
    mouseDown = false;
    canvas.addEventListener("mousedown", function(e){
        mouseDown = true;
    });
    canvas.addEventListener("mouseup", function(e){
        mouseDown = false;
    });
    mouseIn = false;
    canvas.addEventListener("mouseover", function(e){
        mouseIn = true;
    });
    canvas.addEventListener("mouseout", function(e){
        mouseIn = false;
        mouseDown = false;
    });
    wheelDelta = 0;
    canvas.addEventListener("mousewheel", function(e){
        wheelDelta = e.wheelDelta;
    });
    
    
    
    
    //state variable initialization
    mouseState = new MouseState(mousePosition, relativeMousePosition, mouseDown, mouseIn, wheelDelta);
    canvasState = new CanvasState(canvas, ctx);
    
    //local storage handling for active node record and progress
    if(localStorage.activeNode === undefined){
        localStorage.activeNode = 0;
    }
    if(localStorage.progress === undefined){
        localStorage.progress = "";
    }
    
    //creates the game object from which most interaction is managed
    game = new Game();
}

//fires once per frame
function loop() {
    //binds loop to frames
    window.requestAnimationFrame(loop.bind(this));
    
    time.update(.0167);
    
    //feed current mouse variables back into mouse state
    mouseState.update(mousePosition, relativeMousePosition, mouseDown, mouseIn, wheelDelta);
    //resetting wheel delta
    wheelDelta = 0;
    
    //update game's variables: passing context, canvas, time, center point, usable height, mouse state
    
    game.update(mouseState, canvasState, time);
};

//listens for changes in size of window and adjusts variables accordingly
window.addEventListener("resize", function(e){
    canvasState.update();
});



},{"./modules/Game.js":2,"./modules/common/Point.js":3,"./modules/containers/CanvasState.js":5,"./modules/containers/MouseState.js":6,"./modules/containers/Time.js":7}],2:[function(require,module,exports){
"use strict";
//imported objects
var GraphPhase = require('./phases/graphPhase/GraphPhase.js');
var DrawLib = require('./libraries/Drawlib.js');
var Utilities = require('./libraries/Utilities.js');

var activePhase;
var painter;
var utility;

var mouseState

function Game(){    
    painter = new DrawLib();
    utility = new Utilities();
    
    //instantiate the graph
    activePhase = new GraphPhase("https://atlas-backend.herokuapp.com/repos"); //actual backend app
    //activePhase = new GraphPhase("http://localhost:5000/repos"); //for testing
    
    //give mouseState a value from the start so it doesn't pass undefined to previous
    mouseState = 0;
}

//passing context, canvas, delta time, center point, mouse state
Game.prototype.update = function(mouseState, canvasState, time) {
    
    
    //update key variables in the active phase
    activePhase.update(mouseState, canvasState, time);
    
    //draw background and then active phase
    canvasState.ctx.save();
    painter.rect(canvasState.ctx, 0, 0, canvasState.width, canvasState.height, "#222");
    canvasState.ctx.restore();
    activePhase.draw(canvasState);
    
}

module.exports = Game;
},{"./libraries/Drawlib.js":9,"./libraries/Utilities.js":10,"./phases/graphPhase/GraphPhase.js":13}],3:[function(require,module,exports){
"use strict";
function Point(pX, pY){
    this.x = pX;
    this.y = pY;
};

module.exports = Point;
},{}],4:[function(require,module,exports){
"use strict";

var Point = require('../common/Point.js');

function Button(position, size, text, color) {
    this.position = new Point(position.x, position.y);
    this.size = new Point(size.x, size.y);
    this.text = text;
    this.mouseOver = false;
    this.color = color;
    this.outlineWidth = 1;
};

//updates button, returns true if clicked
Button.prototype.update = function(pMouseState) {
    
    var m = pMouseState.relativePosition;
    if( m.x < this.position.x || m.x > this.position.x + this.size.x ||
        m.y < this.position.y || m.y > this.position.y + this.size.y) {
        this.mouseOver = false;
    }
    else {
        this.mouseOver = true;
        if(pMouseState.mouseDown && !pMouseState.lastMouseDown) {
            return true;
        }
    }
    return false;
};

Button.prototype.draw = function(pCanvasState, pPainter) {
    //draw base button
    if(this.mouseOver) {
        this.outlineWidth = 2;
    }
    else {
        this.outlineWidth = 1;
    }
    pPainter.rect(pCanvasState.ctx,
                  this.position.x - this.outlineWidth,
                  this.position.y - this.outlineWidth,
                  this.size.x + 2 * this.outlineWidth,
                  this.size.y + 2 * this.outlineWidth, "#fff");

    pPainter.rect(pCanvasState.ctx, this.position.x, this.position.y, this.size.x, this.size.y, this.color);
    
    //draw text of button
    pCanvasState.ctx.save();
    pCanvasState.ctx.font = "16px Arial";
    pCanvasState.ctx.fillStyle = "#fff";
    pCanvasState.ctx.textAlign = "center";
    pCanvasState.ctx.textBaseline = "middle";
    pCanvasState.ctx.fillText(this.text, this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
    pCanvasState.ctx.restore();
    
    
};


module.exports = Button;
},{"../common/Point.js":3}],5:[function(require,module,exports){
//Contains canvas related variables in a single easy-to-pass object
"use strict";
var Point = require('../common/Point.js');


function CanvasState(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.update();
}

CanvasState.prototype.update = function() {
    this.width = this.canvas.width = this.canvas.offsetWidth;
    this.height = this.canvas.height = this.canvas.offsetHeight;
    this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
}

module.exports = CanvasState;
},{"../common/Point.js":3}],6:[function(require,module,exports){
//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function MouseState(pPosition, pRelativePosition, pMouseDown, pMouseIn, pWheelDelta){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    this.wheelDelta = pWheelDelta;
    
    //tracking previous mouse states
    this.lastPosition = pPosition;
    this.lastRelativePosition = pRelativePosition;
    this.lastMouseDown = pMouseDown;
    this.lastMouseIn = pMouseIn;
    this.lastWheelDelta = pWheelDelta
}

MouseState.prototype.update = function(pPosition, pRelativePosition, pMouseDown, pMouseIn, pWheelDelta){
    this.lastPosition = this.position;
    this.lastRelativePosition = this.relativePosition;
    this.lastMouseDown = this.mouseDown;
    this.lastMouseIn = this.mouseIn;
    this.lastWheelDelta = this.wheelDelta;
    
    
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    this.wheelDelta = pWheelDelta;
}

module.exports = MouseState;
},{}],7:[function(require,module,exports){
"use strict";

function Time () {
    this.totalTime = 0;
    this.deltaTime = 0;
};

Time.prototype.update = function(dt) {
    this.totalTime += dt;
    this.deltaTime = dt;
};

module.exports = Time;
},{}],8:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./libraries/Drawlib.js":9,"./libraries/Utilities.js":10,"./phases/graphPhase/GraphPhase.js":13,"dup":2}],9:[function(require,module,exports){
"use strict";
function Drawlib(){
};

Drawlib.prototype.clear = function(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
};

Drawlib.prototype.rect = function(ctx, x, y, w, h, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
};

Drawlib.prototype.roundedRect = function(ctx, x, y, w, h, rad, fill, fillColor, outline, outlineColor, outlineWidth) {
    ctx.save();
    ctx.moveTo(x, y - rad); //11 o clock
    ctx.beginPath();
    ctx.lineTo(x + w, y - rad); //1 o clock
    ctx.arcTo(x + w + rad, y - rad, x + w + rad, y, rad); // 2 o clock
    ctx.lineTo(x + w + rad, y + h); // 4 o clock
    ctx.arcTo(x + w + rad, y + h + rad, x + w, y + h + rad, rad) //5 o clock
    ctx.lineTo(x, y + h + rad); // 7 o clock
    ctx.arcTo(x - rad, y + h + rad, x - rad, y + h, rad) //8 o clock
    ctx.lineTo(x - rad, y); // 10 o clock
    ctx.arcTo(x - rad, y - rad, x, y -rad, rad) //11 o clock
    ctx.closePath();
    if(fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if(outline) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.stroke();
    }
    ctx.restore();
}

Drawlib.prototype.line = function(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
};

Drawlib.prototype.circle = function(ctx, x, y, radius, fill, fillColor, outline, outlineColor, outlineWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    if(fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if(outline) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.stroke();
    }
    ctx.restore();
};

Drawlib.prototype.textToLines = function(ctx, text, font, width) {
    ctx.save();
    ctx.font = font;
    
    var lines = [];
    
    while (text.length) {
        var i, j;
        for(i = text.length; ctx.measureText(text.substr(0, i)).width > width; i--);

        var result = text.substr(0,i);

        if (i !== text.length)
            for(var j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1);

        lines.push(result.substr(0, j || result.length));
        width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
        text  = text.substr(lines[lines.length - 1].length, text.length);
    }
    ctx.restore();
    return lines;
};

module.exports = Drawlib;
},{}],10:[function(require,module,exports){
"use strict";
var Point = require('../common/Point.js');

function Utilities(){
}

//BOARDPHASE - set a status value of a node in localStorage based on ID
Utilities.prototype.setProgress = function(pObject){
    var progressString = localStorage.progress;
    
    var targetObject = pObject;
    //make accomodations if this is an extension node
    var extensionflag = true;
    while(extensionflag){
        if(targetObject.type === "extension"){
            targetObject = targetObject.connectionForward[0];
        }
        else{
            extensionflag = false;
        }
    }
    
    var objectID = targetObject.data._id;
    var objectStatus = targetObject.status;
    
    //search the progressString for the current ID
    var idIndex = progressString.indexOf(objectID);
    
    //if it's not add it to the end
    if(idIndex === -1){
        progressString += objectID + "" + objectStatus + ",";
    }
    //otherwise modify the status value
    else{
        progressString = progressString.substr(0, objectID.length + idIndex) + objectStatus + progressString.substr(objectID.length + 1 + idIndex, progressString.length) + "";
    }
    localStorage.progress = progressString;
}

//returns mouse position in local coordinate system of element
Utilities.prototype.getMouse = function(e){
    return new Point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

Utilities.prototype.map = function(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

//limits the upper and lower limits of the parameter value
Utilities.prototype.clamp = function(value, min, max){
    return Math.max(min, Math.min(max, value));
}

//checks mouse collision on canvas
Utilities.prototype.mouseIntersect = function(pMouseState, pElement, pOffsetter, pScale){
    //if the x position collides
    if(pElement.status !== "0"){
        if(pMouseState.relativePosition.x + pOffsetter.x > (pElement.position.x - (pElement.width)/2) && pMouseState.relativePosition.x + pOffsetter.x < (pElement.position.x + (pElement.width)/2)){
            //if the y position collides
            if(pMouseState.relativePosition.y + pOffsetter.y > (pElement.position.y - (pElement.height)/2) && pMouseState.relativePosition.y + pOffsetter.y < (pElement.position.y + (pElement.height)/2)){
                    pElement.mouseOver = true;
            }
            else{
                pElement.mouseOver = false;
            }
        }
        else{
            pElement.mouseOver = false;
        }
    }
}

module.exports = Utilities;
},{"../common/Point.js":3}],11:[function(require,module,exports){
"use strict"

var TutorialTags = {
    "AI": "#804",
    "Audio": "#048",
    "Computer Science": "#111",
    "Core": "#333",
    "Graphics": "#c0c",
    "Input": "#880",
    "Math": "#484",
    "Networking": "#c60",
    "Optimization": "#282",
    "Physics": "#048",
    "Scripting": "#088",
    "SoftwareEngineering": "#844"
};


function DetailsPanel(graph) {
    this.graph = graph;
    this.node = null;
    this.data = null;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.dataDiv = document.getElementById("rightBar");
};

DetailsPanel.prototype.enable = function(node) {
    this.node = node;
    this.data = node.data;
    this.transitionOn = true
};

DetailsPanel.prototype.disable = function() {
    this.dataDiv.innerHTML = "";
    this.transitionOn = false;
};

DetailsPanel.prototype.update = function(canvasState, time, node) {
    
    //update node if its not the same anymore
    if(this.node != node) {
        this.node = node;
        this.data = node.data;
        this.dataDiv.innerHTML = this.GenerateDOM();
    }
    
    
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
                this.dataDiv.innerHTML = this.GenerateDOM();
            }
        }
    }
    //transition off
    else {
        if(this.transitionTime > 0) {
            this.transitionTime -= time.deltaTime * 3;
            if(this.transitionTime <= 0) {
                //done transitioning
                this.transitionTime = 0;
                this.node = null;
                this.data = null; 
            }
        }
    }
};

DetailsPanel.prototype.GenerateDOM = function() {
    var html = "<h1>"+this.data.series+":</h1><h1><a href=" + this.data.link + ">"+this.data.title+"</a></h1>";
    html += "<a href=" + this.data.link + "><img src=https://raw.githubusercontent.com/IGME-RIT/" + this.data.name +
        "/master/igme_thumbnail.png alt=" + this.data.link + "></a>";
    
    html += "<ul id='tags'>";
    if(this.data.tags.length != 0) {
        for(var i = 0; i < this.data.tags.length; i++) {
            html += "<li style='background-color:" + TutorialTags[this.data.tags[i]] + "'>" + this.data.tags[i] + "</li>";
        }
    }
    html+= "</ul>"
    
    html += "<p>" + this.data.description + "</p>";
    //console.log(this.data);
    if(this.data.extra_resources.length != 0) {
        html += "<h2>Additional Resources:</h2>";
        html += "<ul>";
        for(var i = 0; i < this.data.extra_resources.length; i++) {
            html += "<li><a href=" + this.data.extra_resources[i].link + ">" + this.data.extra_resources[i].title + "</a></li>";
        }
        html += "</ul>";
    }
    
    return html;
};

module.exports = DetailsPanel;
},{}],12:[function(require,module,exports){
"use strict";
var DrawLib = require('../../libraries/Drawlib.js');
var SearchPanel = require('./SearchPanel.js');
var DetailsPanel = require('./DetailsPanel.js');
var TutorialNode = require('./TutorialNode.js');
var Point = require('../../common/Point.js');


var painter;
var expand = 3;
var debugMode = false;

function Graph(pJSONData) {
        
    this.searchPanel = new SearchPanel(this);
    this.detailsPanel = new DetailsPanel(this);
    this.searchPanelButton = document.getElementById("OptionsButton");
    this.searchDiv = document.getElementById("leftBar");
    this.dataDiv = document.getElementById("rightBar");
    this.canvasDiv = document.getElementById("middleBar");
    painter = new DrawLib();
    
    this.nodes = [];
    this.activeNodes = [];
    
    //populate the array
    for(var i = 0; i < pJSONData.length; i++) {
        var data = pJSONData[i];
        //ensures that the chunk contains a link
        if(data.tags.length === 0) {
            if(debugMode) console.log("Repo not tagged: " + data.name);
        }
        else if(data.image !== undefined) {
            if(debugMode) console.log("Repo yaml out of date: " + data.name);
        }
        else {
            var node = new TutorialNode(data);
            this.nodes.push(node);
        }
    }
    
    //set direct object connections to related nodes for referencing
    //parse entire list
    for(var i = 0; i < this.nodes.length; i++) {
        //loop over listed connections
        for(var k = 0; k < this.nodes[i].data.connections.length; k++) {
            //search for similar nodes
            for(var j = 0; j < this.nodes.length; j++) {
                if(this.nodes[j].data.series === this.nodes[i].data.connections[k].series &&
                    this.nodes[j].data.title === this.nodes[i].data.connections[k].title) {
                    this.nodes[i].previousNodes.push(this.nodes[j]);
                    this.nodes[j].nextNodes.push(this.nodes[i]);
                }
            }
        }
    }
    
    this.transitionTime = 0;
    this.FocusNode(this.nodes[0]);
    
    
    function x (search) {
        if(search.open == true) {
            search.transitionOn = false;
        }
        else {
            search.transitionOn = true;
            search.open = true;
        }
    }
    
    this.searchPanelButton.addEventListener("click", x.bind(this.searchPanelButton, this.searchPanel));
};




Graph.prototype.FocusNode = function(centerNode) {
    this.focusedNode = centerNode;
    
    var newNodes = [];
    
    //get nodes to depth
    
    var previousNodes = this.focusedNode.getPrevious(expand);
    for(var i = 0; i < previousNodes.length; i++) {
        newNodes.push(previousNodes[i]);
    }
    
    var nextNodes = this.focusedNode.getNext(expand);
    for(var i = 0; i < nextNodes.length; i++) {
        newNodes.push(nextNodes[i]);
    }
    
    var temp = [];
    
    //remove redundancies
    for(var i = 0; i < newNodes.length; i++) {
        var alreadyExists = false;
        for(var j = 0; j < temp.length; j++) {
            if(newNodes[i] == temp[j]) {
                alreadyExists = true;
            }
        }
        if(!alreadyExists) {
            temp.push(newNodes[i]);
        }
    }
    
    newNodes = temp;
    
    //check if any of the nodes were previously on screen
    for(var i = 0; i < this.activeNodes.length; i++) {
        this.activeNodes[i].wasPreviouslyOnScreen = false;
        for(var j = 0; j < newNodes.length; j++) {
            if(this.activeNodes[i] == newNodes[j]) {
                this.activeNodes[i].wasPreviouslyOnScreen = true;
            }
        }
    }
    
    this.activeNodes = newNodes;
    
    //clear their parent data for new node
    for(var i = 0; i < this.activeNodes.length; i++) {
        this.activeNodes[i].currentLayerDepth = 0;
        this.activeNodes[i].parent = null;
    }
    
    
    this.transitionTime = 1;
    
    this.focusedNode.calculateNodeTree(expand, null, 0);
    this.focusedNode.setTransition(expand, null, 0, new Point(0, 0));
};

Graph.prototype.update = function(mouseState, canvasState, time) {
    
    if(this.transitionTime > 0) {
        this.transitionTime -= time.deltaTime;
    }
    else {
        this.transitionTime = 0;
    }
    
    var mouseOverNode = null;
    
    for(var i = 0; i < this.activeNodes.length; i++) {
        var isMain = (this.activeNodes[i] == this.focusedNode);
        this.activeNodes[i].update(mouseState, time, this.transitionTime, isMain);
        if(this.activeNodes[i].mouseOver) {
            mouseOverNode = this.activeNodes[i];
        }
    }
    
    //if cuser clicks
    if(mouseState.mouseDown && !mouseState.lastMouseDown) {
        //focus node if clicked
        if(mouseOverNode) {
            this.FocusNode(mouseOverNode);
        }
        //show details for node if button clicked
        if(this.focusedNode.detailsButton.mouseOver) {
            if(this.detailsPanel.node == null)  {
                this.detailsPanel.enable(this.focusedNode);
            }
            else {
                this.detailsPanel.disable();
            }
        }
    }
    
    if(this.searchPanel.open == true) {
        this.searchPanel.update(canvasState, time);
    }
    
    
    if(this.detailsPanel.node != null) {
        this.detailsPanel.update(canvasState, time, this.focusedNode);
        this.focusedNode.detailsButton.text = "Less";
    }
    else {
        this.focusedNode.detailsButton.text = "More";
    }
    
    
    var t1 = (1 - Math.cos(this.searchPanel.transitionTime * Math.PI))/2;
    var t2 = (1 - Math.cos(this.detailsPanel.transitionTime * Math.PI))/2;
    
    this.searchDiv.style.width = 30 * t1 + "vw";
    this.dataDiv.style.width = 30 * t2 + "vw";
    this.canvasDiv.style.width = 100 - 30 * (t1 + t2) + "vw";    
    
    this.searchPanelButton.style.left = "calc(" + 30 * t1 + "vw + 12px)";
    
    canvasState.update();
};







Graph.prototype.draw = function(canvasState) {
    canvasState.ctx.save();
    
    //translate to the center of the screen
    canvasState.ctx.translate(canvasState.center.x, canvasState.center.y);
    //console.log(canvasState.center);
    //console.log(canvasState);
    //draw nodes
    this.focusedNode.draw(canvasState, painter, null, 0, expand);
    
    canvasState.ctx.restore();
};

module.exports = Graph;
},{"../../common/Point.js":3,"../../libraries/Drawlib.js":9,"./DetailsPanel.js":11,"./SearchPanel.js":16,"./TutorialNode.js":17}],13:[function(require,module,exports){
"use strict";
var Parser = require('../graphPhase/Parser.js');
var Graph = require('./Graph.js');

var graphLoaded;

var mouseTarget;
var graph;

function GraphPhase(pTargetURL){
    //initialize base values
    graphLoaded = false;
    mouseTarget = 0;
    
    
    //request graph data and wait to begin parsing
    Parser(pTargetURL, function(pJSONElements){
        graph = new Graph(pJSONElements);
        graphLoaded = true;
    });
}

GraphPhase.prototype.update = function(mouseState, canvasState, time) {
    if(graphLoaded) {
        graph.update(mouseState, canvasState, time);
    }
}

GraphPhase.prototype.draw = function(canvasState) {
    if(graphLoaded) {
        graph.draw(canvasState);
    }
    else {
        //if we havent loaded the data, display loading, and wait
        canvasState.ctx.save();
        canvasState.ctx.font = "40px Arial";
        canvasState.ctx.fillStyle = "#fff";
        canvasState.ctx.textBaseline = "middle";
        canvasState.ctx.textAlign = "center";
        canvasState.ctx.fillText("Loading...", canvasState.center.x, canvasState.center.y);
        canvasState.ctx.restore();
    }
};

module.exports = GraphPhase;
},{"../graphPhase/Parser.js":15,"./Graph.js":12}],14:[function(require,module,exports){
"use strict";

var Point = require('../../common/Point.js');
var Button = require("../../containers/Button.js");
var TutorialNode = require('./TutorialNode.js');

var labelCornerSize = 6;

var titleFontSize = 12;
var titleFont = titleFontSize+"px Arial";

var descriptorFontSize = 12;
var descriptorFont = descriptorFontSize+"px Arial";

var lineBreak = 6;

//create a label to pair with a node
function NodeLabel(pTutorialNode) {
    this.node = pTutorialNode;
    
    this.series = this.node.data.series;
    this.title = this.node.data.title;
    this.description = this.node.data.description;
    this.descriptionLines = null;
    
    this.position = new Point(
        this.node.position.x,
        this.node.position.y - this.node.size - 10);
    
    this.displayFullData = false;
};

NodeLabel.prototype.calculateTextFit = function(ctx, pPainter) {
    ctx.save();
    ctx.font = titleFont;
    var seriesSize = ctx.measureText(this.series);
    var titleSize = ctx.measureText(this.title);
    ctx.restore();

    this.size = new Point(Math.max(seriesSize.width, titleSize.width), titleFontSize * 2);
    
    

    if(this.displayFullData) {
        this.size.x = Math.max(240, Math.max(seriesSize.width, titleSize.width));
        this.descriptionLines = pPainter.textToLines(ctx, this.description, descriptorFont, this.size.x);
        this.size.y += lineBreak + this.descriptionLines.length * descriptorFontSize;
    }
};



NodeLabel.prototype.update = function (pMouseState, time, displayBrief) {
    
    
    //directly above node
    this.desiredPosition = new Point(
        this.node.position.x,
        this.node.position.y - this.node.size - 12 - labelCornerSize);
    
    if(this.desiredPosition.x != this.position.x || this.desiredPosition.y != this.position.y) {
        //move towards desiredPosition
        var dif = new Point(
            this.desiredPosition.x - this.position.x,
            this.desiredPosition.y - this.position.y);
        
        var speedScalar = Math.sqrt(dif.x * dif.x + dif.y * dif.y) * time.deltaTime;

        var velocity = new Point(dif.x * speedScalar, dif.y * speedScalar);
        if(velocity.x * velocity.x < dif.x * dif.x) {
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
        else {
            this.position.x = this.desiredPosition.x;
            this.position.y = this.desiredPosition.y;
        }
        
    }
    
    
    //if this is the primary node, display description
    if(displayBrief) {
        
        if(this.displayFullData == false) {
            this.size = false;
            this.displayFullData = true;
        }
    }
    else if (this.displayFullData == true) {
        this.buttonClicked = false;
        this.size = false;
        this.displayFullData = false;
    }
    
}

NodeLabel.prototype.draw = function(pCanvasState, pPainter) {
    
    if(!this.size) {
        this.calculateTextFit(pCanvasState.ctx, pPainter);
    }
    
    //draw line from node to label
    pCanvasState.ctx.save();
    pCanvasState.ctx.strokeStyle = "#fff";
    pCanvasState.ctx.lineWidth = 2;
    pCanvasState.ctx.beginPath();
    
    pCanvasState.ctx.moveTo(
        this.position.x,
        this.position.y);
    
    pCanvasState.ctx.lineTo(
        this.node.position.x,
        this.node.position.y - this.node.size);
    
    pCanvasState.ctx.closePath();
    pCanvasState.ctx.stroke();
    pCanvasState.ctx.restore();
    
    //draw label
    pPainter.roundedRect(
        pCanvasState.ctx,
        this.position.x - (this.size.x / 2),
        this.position.y - this.size.y,
        this.size.x,
        this.size.y,
        labelCornerSize,
        true, this.node.color,
        true, "#fff", 2);
    
    
    pCanvasState.ctx.save();
    pCanvasState.ctx.fillStyle = "#fff";
    pCanvasState.ctx.font = titleFont;
    pCanvasState.ctx.textBaseline = "top";
    pCanvasState.ctx.textAlign = "center";
    pCanvasState.ctx.fillText(
        this.series,
        this.position.x,
        this.position.y - this.size.y);
    pCanvasState.ctx.fillText(
        this.title,
        this.position.x,
        this.position.y - this.size.y + titleFontSize);
    pCanvasState.ctx.restore();
    
    
    if(this.displayFullData) {
        
        pCanvasState.ctx.save();
        pCanvasState.ctx.fillStyle = "#fff";
        pCanvasState.ctx.font = descriptorFont;
        pCanvasState.ctx.textBaseline = "top";
        pCanvasState.ctx.textAlign = "left";
        
        for(var i = 0; i < this.descriptionLines.length; i++) {
            pCanvasState.ctx.fillText(
                this.descriptionLines[i],
                this.position.x - this.size.x / 2,
                this.position.y - this.size.y + titleFontSize * 2 + lineBreak + i * descriptorFontSize);
        }
        pCanvasState.ctx.restore();
    }
};



module.exports  = NodeLabel;
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./TutorialNode.js":17}],15:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function Parser(pTargetURL, callback){
    var JSONObject;
    var lessonArray = [];
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        JSONObject = JSON.parse(xhr.responseText);

        //pass lesson data back
        callback(JSONObject);
    }

    xhr.open('GET', pTargetURL, true);
    xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GM0T");
    xhr.send();
}

module.exports = Parser;
},{}],16:[function(require,module,exports){
"use strict"

var queryData = [];

function updateQueryData() {
    var list = document.getElementById("QueryListData");
    list.innerHTML = "";
    if(queryData.length > 0) {
        for(var i = 0; i < queryData.length; i++) {
            list.innerHTML += "<li>" + queryData[i].type + ": " + queryData[i].value + "</li>";
        }
        document.getElementById("clearquerybutton").style.display = "inline";
    }
    else {
        document.getElementById("clearquerybutton").style.display = "none";
    }
};

document.getElementById("searchtextbutton").onclick = function() {
    var query = {
        type: "Text",
        value: document.getElementById("searchtextfield").value
    };
    if(query.value == "")
        return;
    queryData.push(query);
    updateQueryData();
};


document.getElementById("searchlanguagebutton").onclick = function() {
    var query = {
        type: "Language",
        value: document.getElementById("searchlanguagefield").value
    };
    if(query.value == "Any")
        return;
    queryData.push(query);
    updateQueryData();
};

document.getElementById("searchtagbutton").onclick = function() {
    var query = {
        type: "Tag",
        value: document.getElementById("searchtagfield").value
    };
    if(query.value == "Any")
        return;
    queryData.push(query);
    updateQueryData();
};

document.getElementById("clearquerybutton").onclick = function() {
    queryData = [];
    updateQueryData();
};

document.getElementById("searchbutton").onclick = function() {
    
};


function SearchPanel(graph) {
    this.graph = graph;
    this.open = false;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.optionsDiv = document.getElementById("leftBar");
    
    this.searchButton = document.getElementById("searchbutton");
    
    
    this.searchButton.addEventListener("click", function (that) {
        //parse data to find matching results
        var searchResults = that.search(queryData, that.graph.nodes);
        
        //display results
        var div = document.getElementById("searchresults");
        if(searchResults.length == 0) {
            div.innerHTML = "No Matching Results Found.";
            return;
        }
        
        div.innerHTML = "";
        
        
        for(var i = 0; i < searchResults.length; i++) {
            //create list tag
            var li = document.createElement("li");
            //set title as text
            li.innerHTML = searchResults[i].data.title;
            //add event to focus the node if its clicked
            li.addEventListener("click", function(that, node) {
                that.graph.FocusNode(node);
            }.bind(li, that, searchResults[i]));
            //add the tag to the page
            div.appendChild(li);
        }
    }.bind(this.searchButton, this));
};




SearchPanel.prototype.search = function(query, nodes) {
    var results = [];
    
    
    for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i].data;
        var match = true;
        for(var j = 0; j < query.length; j++) {
            if(query[j].type === "Text") {
                if(node.title.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                    if(node.series.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                        if(node.description.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                            match = false;
                            break;
                        }
                    }
                }
            }
            else if(query[j].type === "Language") {
                if(node.language !== query[j].value) {
                    match = false;
                    break;
                }
            }
            else {
                var tagMatch = false;
                for(var k = 0; k < node.tags.length; k++) {
                    if(node.tags[k] == query[j].value) {
                        tagMatch = true;
                    }
                }
                if(tagMatch == false) {
                    match = false;
                    break;
                }
            }
        }
        //if we passed all that crap, we have a match!
        if(match === true) { 
            results.push(nodes[i]);
        }
    }
    
    return results;
};


SearchPanel.prototype.update = function(canvasState, time) {
    
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
            }
        }
    }
    //transition off
    else {
        if(this.transitionTime > 0) {
            this.transitionTime -= time.deltaTime * 3;
            if(this.transitionTime <= 0) {
                //done transitioning
                this.transitionTime = 0;
                this.open = false;
            }
        }
    }
};



module.exports = SearchPanel;
},{}],17:[function(require,module,exports){
"use strict";

var Point = require('../../common/Point.js');
var NodeLabel = require('./NodeLabel.js');
var Button = require('../../containers/Button.js');

var horizontalSpacing = 180;
var baseSize = 24;

var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};

var TutorialTags = {
    "AI": "#804",
    "Audio": "#048",
    "Computer Science": "#111",
    "Core": "#333",
    "Graphics": "#c0c",
    "Input": "#880",
    "Math": "#484",
    "Networking": "#c60",
    "Optimization": "#282",
    "Physics": "#048",
    "Scripting": "#088",
    "SoftwareEngineering": "#844"
};


//make a node with some data
function TutorialNode(JSONChunk) {
    this.data = JSONChunk;
    this.primaryTag = this.data.tags[0];
    this.color = TutorialTags[this.primaryTag];
    
    this.state = TutorialState.Locked;
    this.mouseOver = false;
    
    
    this.position = new Point(0, 0);
    this.previousPosition = new Point(0, 0);
    this.nextPosition = new Point(0, 0);
    
    this.size = 24;
    this.label = new NodeLabel(this);
        
    this.nextNodes = [];
    this.previousNodes = [];
    
    this.detailsButton = new Button(new Point(0, 0), new Point(72, 36), "More", this.color);
    
};

//recursive function to get previous nodes
TutorialNode.prototype.getPrevious = function(depth) {
    var result = [];
    result.push(this);
    if(depth > 0) {
        for(var i = 0; i < this.previousNodes.length; i++) {
            var previous = this.previousNodes[i].getPrevious(depth-1);
            for(var j = 0; j < previous.length; j++) {
                result.push(previous[j]);
            }
        }
    }
    return result;
};



//recursive function to get next nodes
TutorialNode.prototype.getNext = function(depth) {
    var result = [];
    result.push(this);
    if(depth > 0) {
        for(var i = 0; i < this.nextNodes.length; i++) {
            var previous = this.nextNodes[i].getNext(depth-1);
            for(var j = 0; j < previous.length; j++) {
                result.push(previous[j]);
            }
        }
    }
    return result;
};

//direction is the side of the parent this node exists on
//layer depth is how many layers to render out
TutorialNode.prototype.recursiveUpdate = function(direction, depth) {
    if(depth > 0) {
        if(direction < 1) {
            for(var i = 0; i < this.previousNodes.length; i++) {
                this.previousNodes[i].recursiveUpdate(-1, depth - 1);
            }
        }
        if(direction > -1) {
            for(var i = 0; i < this.nextNodes.length; i++) {
                this.nextNodes[i].recursiveUpdate(1, depth - 1);
            }
        }
    }
};

//updates a node
//transition time is 1-0, with 0 being the final location
TutorialNode.prototype.update = function(mouseState, time, transitionTime, isFocused) {
    
    //move the node
    if(this.position != this.nextPosition) {
        this.position.x = (this.previousPosition.x * transitionTime) + (this.nextPosition.x * (1 - transitionTime));
        this.position.y = (this.previousPosition.y * transitionTime) + (this.nextPosition.y * (1 - transitionTime));
    }
    
    if(isFocused) {
        this.size = 36;
    }
    else {
        //test if mouse is inside circle
        var dx = mouseState.relativePosition.x - this.position.x;
        var dy = mouseState.relativePosition.y - this.position.y;
        if((dx * dx) + (dy * dy) < this.size * this.size) {
            this.size = 30;
            this.mouseOver = true;
        }
        else {
            this.size = 24;
            this.mouseOver = false;
        }
    }
    
    
    
    this.label.update(mouseState, time, isFocused);
    
    if(isFocused) {
        this.detailsButton.position.x = this.position.x - this.detailsButton.size.x / 2 - 3;
        this.detailsButton.position.y = this.position.y + this.size + 12;
        this.detailsButton.update(mouseState);
    }
};


TutorialNode.prototype.calculateNodeTree = function(layerDepth, parent, direction) {
    
    // If the node already exists in the graph in a better place than this one, dont use it
    if(this.currentLayerDepth > layerDepth) {
        return;
    }
    
    this.currentLayerDepth = layerDepth;
    this.parent = parent;
    
    if(layerDepth > 0) {
        //left or middle
        if(direction < 1) {
            for(var i = 0; i < this.previousNodes.length; i++) {
                this.previousNodes[i].calculateNodeTree(layerDepth - 1, this, -1);
            }
        }
        
        //right or middle
        if(direction > -1) {
            for(var i = 0; i < this.nextNodes.length; i++) {
                this.nextNodes[i].calculateNodeTree(layerDepth - 1, this, 1);
            }
        }
    }
};

TutorialNode.prototype.setTransition = function(layerDepth, parent, direction, targetPosition) {
    
    
    this.previousPosition = this.position;
    this.nextPosition = targetPosition;
    
    //figure out size of children to space them out appropriately
    if(layerDepth > 0) {
        var xPosition;
        var yPosition;
        
        //left or middle
        if(direction < 1) {
            var totalLeftHeight = this.getPreviousHeight(layerDepth);
            xPosition = targetPosition.x - horizontalSpacing;
            if(direction == 0) xPosition -= 60;
            yPosition = targetPosition.y - (totalLeftHeight / 2);
            
            for(var i = 0; i < this.previousNodes.length; i++) {
                if(this.previousNodes[i].parent == this) {
                    var placement = new Point(xPosition, yPosition + this.previousNodes[i].currentHeight / 2);
                    this.previousNodes[i].setTransition(layerDepth - 1, this, -1, placement);
                    /*if(!this.wasPreviouslyOnScreen) {
                        this.previousNodes[i].position = new Point(-1000, placement.y);
                        this.previousNodes[i].previousPosition = new Point(-1000, placement.y);
                    }*/
                    yPosition += this.previousNodes[i].currentHeight;
                }
            }
        }
        
        //right or middle
        if(direction > -1) {
            var totalRightHeight = this.getNextHeight(layerDepth);
            xPosition = targetPosition.x + horizontalSpacing;
            if(direction == 0) xPosition += 60;
            yPosition = targetPosition.y - (totalRightHeight / 2);

            for(var i = 0; i < this.nextNodes.length; i++) {
                if(this.nextNodes[i].parent == this) {
                    var placement = new Point(xPosition, yPosition + this.nextNodes[i].currentHeight / 2);
                    this.nextNodes[i].setTransition(layerDepth - 1, this, 1, placement);
                    /*if(!this.wasPreviouslyOnScreen) {
                        this.nextNodes[i].position = new Point(1000, placement.y);
                        this.nextNodes[i].previousPosition = new Point(1000, placement.y);
                        console.log("throw the switch!");
                    }*/
                    yPosition += this.nextNodes[i].currentHeight;
                }
            }
        }
    }
};

TutorialNode.prototype.getPreviousHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.previousNodes.length > 0) {
        for(var i = 0; i < this.previousNodes.length; i++) {
            if(this.previousNodes[i].parent == this) {
                this.currentHeight += this.previousNodes[i].getPreviousHeight(layerDepth - 1);
            }
        }
    }
    if (this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;
    }
    
    return this.currentHeight;
};

TutorialNode.prototype.getNextHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.nextNodes.length > 0) {
        for(var i = 0; i < this.nextNodes.length; i++) {
            if(this.nextNodes[i].parent == this) {
                this.currentHeight += this.nextNodes[i].getNextHeight(layerDepth - 1);
            }
        }
    }
    if (this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;
    }
    
    return this.currentHeight;
};


TutorialNode.prototype.draw = function(pCanvasState, pPainter, parentCaller, direction, layerDepth) {
    //draw line to parent if possible
    if(parentCaller && parentCaller == this.parent) {
        pCanvasState.ctx.save();
        pCanvasState.ctx.lineWidth = 2;
        pCanvasState.ctx.strokeStyle = "#fff";
        pCanvasState.ctx.beginPath();
        
        //var between = new Point(this.position.x, this.position.y);
        pCanvasState.ctx.moveTo(this.position.x, this.position.y);
        pCanvasState.ctx.lineTo(parentCaller.position.x, parentCaller.position.y);
        
        
        pCanvasState.ctx.closePath();
        pCanvasState.ctx.stroke();
        pCanvasState.ctx.restore();
    }
    
    //draw child nodes
    if(layerDepth > 0){
        if(direction < 1) {
            for(var i = 0; i < this.previousNodes.length; i++) {
                this.previousNodes[i].draw(pCanvasState, pPainter, this, -1, layerDepth - 1);
            }
        }
        if(direction > -1) {
            for(var i = 0; i < this.nextNodes.length; i++) {
                this.nextNodes[i].draw(pCanvasState, pPainter, this, 1, layerDepth - 1);
            }
        }
    }
    
    //draw circle
    pPainter.circle(pCanvasState.ctx, this.position.x, this.position.y, this.size, true, this.color, true, "#fff", 2);
    
    this.label.draw(pCanvasState, pPainter);
    if(direction == 0) {
        this.detailsButton.draw(pCanvasState, pPainter);
    }
};



module.exports = TutorialNode;
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./NodeLabel.js":14}]},{},[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb21tb24vUG9pbnQuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvQnV0dG9uLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcyIsImpzL21vZHVsZXMvbGlicmFyaWVzL0RyYXdsaWIuanMiLCJqcy9tb2R1bGVzL2xpYnJhcmllcy9VdGlsaXRpZXMuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGguanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0dyYXBoUGhhc2UuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9waGFzZXMvZ3JhcGhQaGFzZS9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvVHV0b3JpYWxOb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0c1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9HYW1lLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIFRpbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9UaW1lLmpzJyk7XHJcbnZhciBNb3VzZVN0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvTW91c2VTdGF0ZS5qcycpO1xyXG52YXIgQ2FudmFzU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9DYW52YXNTdGF0ZS5qcycpO1xyXG5cclxuLy9nYW1lIG9iamVjdHNcclxudmFyIGdhbWU7XHJcbnZhciBjYW52YXM7XHJcbnZhciBjdHg7XHJcbnZhciB0aW1lO1xyXG5cclxuLy9yZXNwb25zaXZlbmVzc1xyXG52YXIgaGVhZGVyO1xyXG52YXIgY2VudGVyO1xyXG52YXIgc2NhbGU7XHJcblxyXG4vL21vdXNlIGhhbmRsaW5nXHJcbnZhciBtb3VzZVBvc2l0aW9uO1xyXG52YXIgcmVsYXRpdmVNb3VzZVBvc2l0aW9uO1xyXG52YXIgbW91c2VEb3duO1xyXG52YXIgbW91c2VJbjtcclxudmFyIHdoZWVsRGVsdGE7XHJcblxyXG4vL3Bhc3NhYmxlIHN0YXRlc1xyXG52YXIgbW91c2VTdGF0ZTtcclxudmFyIGNhbnZhc1N0YXRlO1xyXG5cclxuLy9maXJlcyB3aGVuIHRoZSB3aW5kb3cgbG9hZHNcclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgLy9kZWJ1ZyBidXR0b24gZGVzaWduZWQgdG8gY2xlYXIgcHJvZ3Jlc3MgZGF0YVxyXG4gICAgXHJcbiAgICAvL3ZhcmlhYmxlIGFuZCBsb29wIGluaXRpYWxpemF0aW9uXHJcbiAgICBpbml0aWFsaXplVmFyaWFibGVzKCk7XHJcbiAgICBsb29wKCk7XHJcbn1cclxuXHJcbi8vaW5pdGlhbGl6YXRpb24gZm9yIHZhcmlhYmxlcywgbW91c2UgZXZlbnRzLCBhbmQgZ2FtZSBcImNsYXNzXCJcclxuZnVuY3Rpb24gaW5pdGlhbGl6ZVZhcmlhYmxlcygpe1xyXG4gICAgLy9jYW12YXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBcclxuICAgIHRpbWUgPSBuZXcgVGltZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vbW91c2UgdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cclxuICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vZXZlbnQgbGlzdGVuZXJzIGZvciBtb3VzZSBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgY2FudmFzXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGJvdW5kUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIGJvdW5kUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZFJlY3QudG9wKTtcclxuICAgICAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQobW91c2VQb3NpdGlvbi54IC0gY2FudmFzLm9mZnNldFdpZHRoIC8gMiwgbW91c2VQb3NpdGlvbi55IC0gY2FudmFzLm9mZnNldEhlaWdodCAvIDIpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIHdoZWVsRGVsdGEgPSAwO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHdoZWVsRGVsdGEgPSBlLndoZWVsRGVsdGE7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9zdGF0ZSB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxyXG4gICAgbW91c2VTdGF0ZSA9IG5ldyBNb3VzZVN0YXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluLCB3aGVlbERlbHRhKTtcclxuICAgIGNhbnZhc1N0YXRlID0gbmV3IENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KTtcclxuICAgIFxyXG4gICAgLy9sb2NhbCBzdG9yYWdlIGhhbmRsaW5nIGZvciBhY3RpdmUgbm9kZSByZWNvcmQgYW5kIHByb2dyZXNzXHJcbiAgICBpZihsb2NhbFN0b3JhZ2UuYWN0aXZlTm9kZSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UuYWN0aXZlTm9kZSA9IDA7XHJcbiAgICB9XHJcbiAgICBpZihsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gXCJcIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9jcmVhdGVzIHRoZSBnYW1lIG9iamVjdCBmcm9tIHdoaWNoIG1vc3QgaW50ZXJhY3Rpb24gaXMgbWFuYWdlZFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbi8vZmlyZXMgb25jZSBwZXIgZnJhbWVcclxuZnVuY3Rpb24gbG9vcCgpIHtcclxuICAgIC8vYmluZHMgbG9vcCB0byBmcmFtZXNcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIFxyXG4gICAgdGltZS51cGRhdGUoLjAxNjcpO1xyXG4gICAgXHJcbiAgICAvL2ZlZWQgY3VycmVudCBtb3VzZSB2YXJpYWJsZXMgYmFjayBpbnRvIG1vdXNlIHN0YXRlXHJcbiAgICBtb3VzZVN0YXRlLnVwZGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbiwgd2hlZWxEZWx0YSk7XHJcbiAgICAvL3Jlc2V0dGluZyB3aGVlbCBkZWx0YVxyXG4gICAgd2hlZWxEZWx0YSA9IDA7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIGdhbWUncyB2YXJpYWJsZXM6IHBhc3NpbmcgY29udGV4dCwgY2FudmFzLCB0aW1lLCBjZW50ZXIgcG9pbnQsIHVzYWJsZSBoZWlnaHQsIG1vdXNlIHN0YXRlXHJcbiAgICBcclxuICAgIGdhbWUudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxufTtcclxuXHJcbi8vbGlzdGVucyBmb3IgY2hhbmdlcyBpbiBzaXplIG9mIHdpbmRvdyBhbmQgYWRqdXN0cyB2YXJpYWJsZXMgYWNjb3JkaW5nbHlcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufSk7XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0ZWQgb2JqZWN0c1xyXG52YXIgR3JhcGhQaGFzZSA9IHJlcXVpcmUoJy4vcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGhQaGFzZS5qcycpO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4vbGlicmFyaWVzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vbGlicmFyaWVzL1V0aWxpdGllcy5qcycpO1xyXG5cclxudmFyIGFjdGl2ZVBoYXNlO1xyXG52YXIgcGFpbnRlcjtcclxudmFyIHV0aWxpdHk7XHJcblxyXG52YXIgbW91c2VTdGF0ZVxyXG5cclxuZnVuY3Rpb24gR2FtZSgpeyAgICBcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgLy9pbnN0YW50aWF0ZSB0aGUgZ3JhcGhcclxuICAgIGFjdGl2ZVBoYXNlID0gbmV3IEdyYXBoUGhhc2UoXCJodHRwczovL2F0bGFzLWJhY2tlbmQuaGVyb2t1YXBwLmNvbS9yZXBvc1wiKTsgLy9hY3R1YWwgYmFja2VuZCBhcHBcclxuICAgIC8vYWN0aXZlUGhhc2UgPSBuZXcgR3JhcGhQaGFzZShcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZXBvc1wiKTsgLy9mb3IgdGVzdGluZ1xyXG4gICAgXHJcbiAgICAvL2dpdmUgbW91c2VTdGF0ZSBhIHZhbHVlIGZyb20gdGhlIHN0YXJ0IHNvIGl0IGRvZXNuJ3QgcGFzcyB1bmRlZmluZWQgdG8gcHJldmlvdXNcclxuICAgIG1vdXNlU3RhdGUgPSAwO1xyXG59XHJcblxyXG4vL3Bhc3NpbmcgY29udGV4dCwgY2FudmFzLCBkZWx0YSB0aW1lLCBjZW50ZXIgcG9pbnQsIG1vdXNlIHN0YXRlXHJcbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy91cGRhdGUga2V5IHZhcmlhYmxlcyBpbiB0aGUgYWN0aXZlIHBoYXNlXHJcbiAgICBhY3RpdmVQaGFzZS51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgYmFja2dyb3VuZCBhbmQgdGhlbiBhY3RpdmUgcGhhc2VcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwYWludGVyLnJlY3QoY2FudmFzU3RhdGUuY3R4LCAwLCAwLCBjYW52YXNTdGF0ZS53aWR0aCwgY2FudmFzU3RhdGUuaGVpZ2h0LCBcIiMyMjJcIik7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgYWN0aXZlUGhhc2UuZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBQb2ludChwWCwgcFkpe1xyXG4gICAgdGhpcy54ID0gcFg7XHJcbiAgICB0aGlzLnkgPSBwWTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIEJ1dHRvbihwb3NpdGlvbiwgc2l6ZSwgdGV4dCwgY29sb3IpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoc2l6ZS54LCBzaXplLnkpO1xyXG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYnV0dG9uLCByZXR1cm5zIHRydWUgaWYgY2xpY2tlZFxyXG5CdXR0b24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIHZhciBtID0gcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIGlmKCBtLnggPCB0aGlzLnBvc2l0aW9uLnggfHwgbS54ID4gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggfHxcclxuICAgICAgICBtLnkgPCB0aGlzLnBvc2l0aW9uLnkgfHwgbS55ID4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnkpIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhcE1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5CdXR0b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICAvL2RyYXcgYmFzZSBidXR0b25cclxuICAgIGlmKHRoaXMubW91c2VPdmVyKSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAxO1xyXG4gICAgfVxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS54ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNpemUueSArIDIgKiB0aGlzLm91dGxpbmVXaWR0aCwgXCIjZmZmXCIpO1xyXG5cclxuICAgIHBQYWludGVyLnJlY3QocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZS54LCB0aGlzLnNpemUueSwgdGhpcy5jb2xvcik7XHJcbiAgICBcclxuICAgIC8vZHJhdyB0ZXh0IG9mIGJ1dHRvblxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjE2cHggQXJpYWxcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggLyAyLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSAvIDIpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uOyIsIi8vQ29udGFpbnMgY2FudmFzIHJlbGF0ZWQgdmFyaWFibGVzIGluIGEgc2luZ2xlIGVhc3ktdG8tcGFzcyBvYmplY3RcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxufVxyXG5cclxuQ2FudmFzU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIHRoaXMuY2VudGVyID0gbmV3IFBvaW50KHRoaXMuY2FudmFzLndpZHRoIC8gMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzU3RhdGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBNb3VzZVN0YXRlKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG4gICAgXHJcbiAgICAvL3RyYWNraW5nIHByZXZpb3VzIG1vdXNlIHN0YXRlc1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RNb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhXHJcbn1cclxuXHJcbk1vdXNlU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gdGhpcy5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gdGhpcy5tb3VzZURvd247XHJcbiAgICB0aGlzLmxhc3RNb3VzZUluID0gdGhpcy5tb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHRoaXMud2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUaW1lICgpIHtcclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxufTtcclxuXHJcblRpbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSArPSBkdDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gZHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIERyYXdsaWIoKXtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yb3VuZGVkUmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgcmFkLCBmaWxsLCBmaWxsQ29sb3IsIG91dGxpbmUsIG91dGxpbmVDb2xvciwgb3V0bGluZVdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4LCB5IC0gcmFkKTsgLy8xMSBvIGNsb2NrXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubGluZVRvKHggKyB3LCB5IC0gcmFkKTsgLy8xIG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSAtIHJhZCwgeCArIHcgKyByYWQsIHksIHJhZCk7IC8vIDIgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4ICsgdyArIHJhZCwgeSArIGgpOyAvLyA0IG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSArIGggKyByYWQsIHggKyB3LCB5ICsgaCArIHJhZCwgcmFkKSAvLzUgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgaCArIHJhZCk7IC8vIDcgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgKyBoICsgcmFkLCB4IC0gcmFkLCB5ICsgaCwgcmFkKSAvLzggbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4IC0gcmFkLCB5KTsgLy8gMTAgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgLSByYWQsIHgsIHkgLXJhZCwgcmFkKSAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGlmKGZpbGwpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcbiAgICBpZihvdXRsaW5lKSB7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZUNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvdXRsaW5lV2lkdGg7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUudGV4dFRvTGluZXMgPSBmdW5jdGlvbihjdHgsIHRleHQsIGZvbnQsIHdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSBmb250O1xyXG4gICAgXHJcbiAgICB2YXIgbGluZXMgPSBbXTtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRleHQubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGksIGo7XHJcbiAgICAgICAgZm9yKGkgPSB0ZXh0Lmxlbmd0aDsgY3R4Lm1lYXN1cmVUZXh0KHRleHQuc3Vic3RyKDAsIGkpKS53aWR0aCA+IHdpZHRoOyBpLS0pO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGV4dC5zdWJzdHIoMCxpKTtcclxuXHJcbiAgICAgICAgaWYgKGkgIT09IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgIT09IC0xOyBqID0gcmVzdWx0LmluZGV4T2YoXCIgXCIsIGopICsgMSk7XHJcblxyXG4gICAgICAgIGxpbmVzLnB1c2gocmVzdWx0LnN1YnN0cigwLCBqIHx8IHJlc3VsdC5sZW5ndGgpKTtcclxuICAgICAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjdHgubWVhc3VyZVRleHQobGluZXNbbGluZXMubGVuZ3RoIC0gMV0pLndpZHRoKTtcclxuICAgICAgICB0ZXh0ICA9IHRleHQuc3Vic3RyKGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIHJldHVybiBsaW5lcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJhd2xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiBVdGlsaXRpZXMoKXtcclxufVxyXG5cclxuLy9CT0FSRFBIQVNFIC0gc2V0IGEgc3RhdHVzIHZhbHVlIG9mIGEgbm9kZSBpbiBsb2NhbFN0b3JhZ2UgYmFzZWQgb24gSURcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uKHBPYmplY3Qpe1xyXG4gICAgdmFyIHByb2dyZXNzU3RyaW5nID0gbG9jYWxTdG9yYWdlLnByb2dyZXNzO1xyXG4gICAgXHJcbiAgICB2YXIgdGFyZ2V0T2JqZWN0ID0gcE9iamVjdDtcclxuICAgIC8vbWFrZSBhY2NvbW9kYXRpb25zIGlmIHRoaXMgaXMgYW4gZXh0ZW5zaW9uIG5vZGVcclxuICAgIHZhciBleHRlbnNpb25mbGFnID0gdHJ1ZTtcclxuICAgIHdoaWxlKGV4dGVuc2lvbmZsYWcpe1xyXG4gICAgICAgIGlmKHRhcmdldE9iamVjdC50eXBlID09PSBcImV4dGVuc2lvblwiKXtcclxuICAgICAgICAgICAgdGFyZ2V0T2JqZWN0ID0gdGFyZ2V0T2JqZWN0LmNvbm5lY3Rpb25Gb3J3YXJkWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBleHRlbnNpb25mbGFnID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgb2JqZWN0SUQgPSB0YXJnZXRPYmplY3QuZGF0YS5faWQ7XHJcbiAgICB2YXIgb2JqZWN0U3RhdHVzID0gdGFyZ2V0T2JqZWN0LnN0YXR1cztcclxuICAgIFxyXG4gICAgLy9zZWFyY2ggdGhlIHByb2dyZXNzU3RyaW5nIGZvciB0aGUgY3VycmVudCBJRFxyXG4gICAgdmFyIGlkSW5kZXggPSBwcm9ncmVzc1N0cmluZy5pbmRleE9mKG9iamVjdElEKTtcclxuICAgIFxyXG4gICAgLy9pZiBpdCdzIG5vdCBhZGQgaXQgdG8gdGhlIGVuZFxyXG4gICAgaWYoaWRJbmRleCA9PT0gLTEpe1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nICs9IG9iamVjdElEICsgXCJcIiArIG9iamVjdFN0YXR1cyArIFwiLFwiO1xyXG4gICAgfVxyXG4gICAgLy9vdGhlcndpc2UgbW9kaWZ5IHRoZSBzdGF0dXMgdmFsdWVcclxuICAgIGVsc2V7XHJcbiAgICAgICAgcHJvZ3Jlc3NTdHJpbmcgPSBwcm9ncmVzc1N0cmluZy5zdWJzdHIoMCwgb2JqZWN0SUQubGVuZ3RoICsgaWRJbmRleCkgKyBvYmplY3RTdGF0dXMgKyBwcm9ncmVzc1N0cmluZy5zdWJzdHIob2JqZWN0SUQubGVuZ3RoICsgMSArIGlkSW5kZXgsIHByb2dyZXNzU3RyaW5nLmxlbmd0aCkgKyBcIlwiO1xyXG4gICAgfVxyXG4gICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gcHJvZ3Jlc3NTdHJpbmc7XHJcbn1cclxuXHJcbi8vcmV0dXJucyBtb3VzZSBwb3NpdGlvbiBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbSBvZiBlbGVtZW50XHJcblV0aWxpdGllcy5wcm90b3R5cGUuZ2V0TW91c2UgPSBmdW5jdGlvbihlKXtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICByZXR1cm4gbWluMiArIChtYXgyIC0gbWluMikgKiAoKHZhbHVlIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpKTtcclxufVxyXG5cclxuLy9saW1pdHMgdGhlIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMgb2YgdGhlIHBhcmFtZXRlciB2YWx1ZVxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgdmFsdWUpKTtcclxufVxyXG5cclxuLy9jaGVja3MgbW91c2UgY29sbGlzaW9uIG9uIGNhbnZhc1xyXG5VdGlsaXRpZXMucHJvdG90eXBlLm1vdXNlSW50ZXJzZWN0ID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUsIHBFbGVtZW50LCBwT2Zmc2V0dGVyLCBwU2NhbGUpe1xyXG4gICAgLy9pZiB0aGUgeCBwb3NpdGlvbiBjb2xsaWRlc1xyXG4gICAgaWYocEVsZW1lbnQuc3RhdHVzICE9PSBcIjBcIil7XHJcbiAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54ID4gKHBFbGVtZW50LnBvc2l0aW9uLnggLSAocEVsZW1lbnQud2lkdGgpLzIpICYmIHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA8IChwRWxlbWVudC5wb3NpdGlvbi54ICsgKHBFbGVtZW50LndpZHRoKS8yKSl7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHkgcG9zaXRpb24gY29sbGlkZXNcclxuICAgICAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55ID4gKHBFbGVtZW50LnBvc2l0aW9uLnkgLSAocEVsZW1lbnQuaGVpZ2h0KS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPCAocEVsZW1lbnQucG9zaXRpb24ueSArIChwRWxlbWVudC5oZWlnaHQpLzIpKXtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0aWVzOyIsIlwidXNlIHN0cmljdFwiXHJcblxyXG52YXIgVHV0b3JpYWxUYWdzID0ge1xyXG4gICAgXCJBSVwiOiBcIiM4MDRcIixcclxuICAgIFwiQXVkaW9cIjogXCIjMDQ4XCIsXHJcbiAgICBcIkNvbXB1dGVyIFNjaWVuY2VcIjogXCIjMTExXCIsXHJcbiAgICBcIkNvcmVcIjogXCIjMzMzXCIsXHJcbiAgICBcIkdyYXBoaWNzXCI6IFwiI2MwY1wiLFxyXG4gICAgXCJJbnB1dFwiOiBcIiM4ODBcIixcclxuICAgIFwiTWF0aFwiOiBcIiM0ODRcIixcclxuICAgIFwiTmV0d29ya2luZ1wiOiBcIiNjNjBcIixcclxuICAgIFwiT3B0aW1pemF0aW9uXCI6IFwiIzI4MlwiLFxyXG4gICAgXCJQaHlzaWNzXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJTY3JpcHRpbmdcIjogXCIjMDg4XCIsXHJcbiAgICBcIlNvZnR3YXJlRW5naW5lZXJpbmdcIjogXCIjODQ0XCJcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBEZXRhaWxzUGFuZWwoZ3JhcGgpIHtcclxuICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcclxuICAgIHRoaXMubm9kZSA9IG51bGw7XHJcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgIHRoaXMuZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gdHJ1ZVxyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlLCB0aW1lLCBub2RlKSB7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIG5vZGUgaWYgaXRzIG5vdCB0aGUgc2FtZSBhbnltb3JlXHJcbiAgICBpZih0aGlzLm5vZGUgIT0gbm9kZSkge1xyXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSB0aGlzLkdlbmVyYXRlRE9NKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy90cmFuc2l0aW9uIG9uXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25Pbikge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgKz0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID49IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSB0aGlzLkdlbmVyYXRlRE9NKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL3RyYW5zaXRpb24gb2ZmXHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gbnVsbDsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLkdlbmVyYXRlRE9NID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaHRtbCA9IFwiPGgxPlwiK3RoaXMuZGF0YS5zZXJpZXMrXCI6PC9oMT48aDE+PGEgaHJlZj1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+XCIrdGhpcy5kYXRhLnRpdGxlK1wiPC9hPjwvaDE+XCI7XHJcbiAgICBodG1sICs9IFwiPGEgaHJlZj1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+PGltZyBzcmM9aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0lHTUUtUklUL1wiICsgdGhpcy5kYXRhLm5hbWUgK1xyXG4gICAgICAgIFwiL21hc3Rlci9pZ21lX3RodW1ibmFpbC5wbmcgYWx0PVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj48L2E+XCI7XHJcbiAgICBcclxuICAgIGh0bWwgKz0gXCI8dWwgaWQ9J3RhZ3MnPlwiO1xyXG4gICAgaWYodGhpcy5kYXRhLnRhZ3MubGVuZ3RoICE9IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLnRhZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaHRtbCArPSBcIjxsaSBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpcIiArIFR1dG9yaWFsVGFnc1t0aGlzLmRhdGEudGFnc1tpXV0gKyBcIic+XCIgKyB0aGlzLmRhdGEudGFnc1tpXSArIFwiPC9saT5cIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBodG1sKz0gXCI8L3VsPlwiXHJcbiAgICBcclxuICAgIGh0bWwgKz0gXCI8cD5cIiArIHRoaXMuZGF0YS5kZXNjcmlwdGlvbiArIFwiPC9wPlwiO1xyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmRhdGEpO1xyXG4gICAgaWYodGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlcy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgIGh0bWwgKz0gXCI8aDI+QWRkaXRpb25hbCBSZXNvdXJjZXM6PC9oMj5cIjtcclxuICAgICAgICBodG1sICs9IFwiPHVsPlwiO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8bGk+PGEgaHJlZj1cIiArIHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXNbaV0ubGluayArIFwiPlwiICsgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlc1tpXS50aXRsZSArIFwiPC9hPjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGh0bWwgKz0gXCI8L3VsPlwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gaHRtbDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGV0YWlsc1BhbmVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4uLy4uL2xpYnJhcmllcy9EcmF3bGliLmpzJyk7XHJcbnZhciBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoJy4vU2VhcmNoUGFuZWwuanMnKTtcclxudmFyIERldGFpbHNQYW5lbCA9IHJlcXVpcmUoJy4vRGV0YWlsc1BhbmVsLmpzJyk7XHJcbnZhciBUdXRvcmlhbE5vZGUgPSByZXF1aXJlKCcuL1R1dG9yaWFsTm9kZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcblxyXG52YXIgcGFpbnRlcjtcclxudmFyIGV4cGFuZCA9IDM7XHJcbnZhciBkZWJ1Z01vZGUgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIEdyYXBoKHBKU09ORGF0YSkge1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5zZWFyY2hQYW5lbCA9IG5ldyBTZWFyY2hQYW5lbCh0aGlzKTtcclxuICAgIHRoaXMuZGV0YWlsc1BhbmVsID0gbmV3IERldGFpbHNQYW5lbCh0aGlzKTtcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIk9wdGlvbnNCdXR0b25cIik7XHJcbiAgICB0aGlzLnNlYXJjaERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVmdEJhclwiKTtcclxuICAgIHRoaXMuZGF0YURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmlnaHRCYXJcIik7XHJcbiAgICB0aGlzLmNhbnZhc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlkZGxlQmFyXCIpO1xyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICBcclxuICAgIHRoaXMubm9kZXMgPSBbXTtcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgLy9wb3B1bGF0ZSB0aGUgYXJyYXlcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwSlNPTkRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHBKU09ORGF0YVtpXTtcclxuICAgICAgICAvL2Vuc3VyZXMgdGhhdCB0aGUgY2h1bmsgY29udGFpbnMgYSBsaW5rXHJcbiAgICAgICAgaWYoZGF0YS50YWdzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyBub3QgdGFnZ2VkOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoZGF0YS5pbWFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmKGRlYnVnTW9kZSkgY29uc29sZS5sb2coXCJSZXBvIHlhbWwgb3V0IG9mIGRhdGU6IFwiICsgZGF0YS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbmV3IFR1dG9yaWFsTm9kZShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9zZXQgZGlyZWN0IG9iamVjdCBjb25uZWN0aW9ucyB0byByZWxhdGVkIG5vZGVzIGZvciByZWZlcmVuY2luZ1xyXG4gICAgLy9wYXJzZSBlbnRpcmUgbGlzdFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvL2xvb3Agb3ZlciBsaXN0ZWQgY29ubmVjdGlvbnNcclxuICAgICAgICBmb3IodmFyIGsgPSAwOyBrIDwgdGhpcy5ub2Rlc1tpXS5kYXRhLmNvbm5lY3Rpb25zLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgIC8vc2VhcmNoIGZvciBzaW1pbGFyIG5vZGVzXHJcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLm5vZGVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm5vZGVzW2pdLmRhdGEuc2VyaWVzID09PSB0aGlzLm5vZGVzW2ldLmRhdGEuY29ubmVjdGlvbnNba10uc2VyaWVzICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tqXS5kYXRhLnRpdGxlID09PSB0aGlzLm5vZGVzW2ldLmRhdGEuY29ubmVjdGlvbnNba10udGl0bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVzW2ldLnByZXZpb3VzTm9kZXMucHVzaCh0aGlzLm5vZGVzW2pdKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVzW2pdLm5leHROb2Rlcy5wdXNoKHRoaXMubm9kZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMuRm9jdXNOb2RlKHRoaXMubm9kZXNbMF0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHggKHNlYXJjaCkge1xyXG4gICAgICAgIGlmKHNlYXJjaC5vcGVuID09IHRydWUpIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHNlYXJjaC5vcGVuID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHguYmluZCh0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLCB0aGlzLnNlYXJjaFBhbmVsKSk7XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5HcmFwaC5wcm90b3R5cGUuRm9jdXNOb2RlID0gZnVuY3Rpb24oY2VudGVyTm9kZSkge1xyXG4gICAgdGhpcy5mb2N1c2VkTm9kZSA9IGNlbnRlck5vZGU7XHJcbiAgICBcclxuICAgIHZhciBuZXdOb2RlcyA9IFtdO1xyXG4gICAgXHJcbiAgICAvL2dldCBub2RlcyB0byBkZXB0aFxyXG4gICAgXHJcbiAgICB2YXIgcHJldmlvdXNOb2RlcyA9IHRoaXMuZm9jdXNlZE5vZGUuZ2V0UHJldmlvdXMoZXhwYW5kKTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbmV3Tm9kZXMucHVzaChwcmV2aW91c05vZGVzW2ldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIG5leHROb2RlcyA9IHRoaXMuZm9jdXNlZE5vZGUuZ2V0TmV4dChleHBhbmQpO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5ld05vZGVzLnB1c2gobmV4dE5vZGVzW2ldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIHRlbXAgPSBbXTtcclxuICAgIFxyXG4gICAgLy9yZW1vdmUgcmVkdW5kYW5jaWVzXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbmV3Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYWxyZWFkeUV4aXN0cyA9IGZhbHNlO1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0ZW1wLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmKG5ld05vZGVzW2ldID09IHRlbXBbal0pIHtcclxuICAgICAgICAgICAgICAgIGFscmVhZHlFeGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFhbHJlYWR5RXhpc3RzKSB7XHJcbiAgICAgICAgICAgIHRlbXAucHVzaChuZXdOb2Rlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuZXdOb2RlcyA9IHRlbXA7XHJcbiAgICBcclxuICAgIC8vY2hlY2sgaWYgYW55IG9mIHRoZSBub2RlcyB3ZXJlIHByZXZpb3VzbHkgb24gc2NyZWVuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3RpdmVOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZXNbaV0ud2FzUHJldmlvdXNseU9uU2NyZWVuID0gZmFsc2U7XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IG5ld05vZGVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuYWN0aXZlTm9kZXNbaV0gPT0gbmV3Tm9kZXNbal0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTm9kZXNbaV0ud2FzUHJldmlvdXNseU9uU2NyZWVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5hY3RpdmVOb2RlcyA9IG5ld05vZGVzO1xyXG4gICAgXHJcbiAgICAvL2NsZWFyIHRoZWlyIHBhcmVudCBkYXRhIGZvciBuZXcgbm9kZVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLmN1cnJlbnRMYXllckRlcHRoID0gMDtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLnBhcmVudCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICBcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUuY2FsY3VsYXRlTm9kZVRyZWUoZXhwYW5kLCBudWxsLCAwKTtcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUuc2V0VHJhbnNpdGlvbihleHBhbmQsIG51bGwsIDAsIG5ldyBQb2ludCgwLCAwKSk7XHJcbn07XHJcblxyXG5HcmFwaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIFxyXG4gICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBtb3VzZU92ZXJOb2RlID0gbnVsbDtcclxuICAgIFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaXNNYWluID0gKHRoaXMuYWN0aXZlTm9kZXNbaV0gPT0gdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgdGhpcy50cmFuc2l0aW9uVGltZSwgaXNNYWluKTtcclxuICAgICAgICBpZih0aGlzLmFjdGl2ZU5vZGVzW2ldLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBtb3VzZU92ZXJOb2RlID0gdGhpcy5hY3RpdmVOb2Rlc1tpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vaWYgY3VzZXIgY2xpY2tzXHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhbW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgLy9mb2N1cyBub2RlIGlmIGNsaWNrZWRcclxuICAgICAgICBpZihtb3VzZU92ZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRm9jdXNOb2RlKG1vdXNlT3Zlck5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3Nob3cgZGV0YWlscyBmb3Igbm9kZSBpZiBidXR0b24gY2xpY2tlZFxyXG4gICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5kZXRhaWxzUGFuZWwubm9kZSA9PSBudWxsKSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZW5hYmxlKHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0aGlzLnNlYXJjaFBhbmVsLm9wZW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoUGFuZWwudXBkYXRlKGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC51cGRhdGUoY2FudmFzU3RhdGUsIHRpbWUsIHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi50ZXh0ID0gXCJMZXNzXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24udGV4dCA9IFwiTW9yZVwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIHZhciB0MSA9ICgxIC0gTWF0aC5jb3ModGhpcy5zZWFyY2hQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgdmFyIHQyID0gKDEgLSBNYXRoLmNvcyh0aGlzLmRldGFpbHNQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS53aWR0aCA9IDMwICogdDEgKyBcInZ3XCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQyICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5jYW52YXNEaXYuc3R5bGUud2lkdGggPSAxMDAgLSAzMCAqICh0MSArIHQyKSArIFwidndcIjsgICAgXHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uc3R5bGUubGVmdCA9IFwiY2FsYyhcIiArIDMwICogdDEgKyBcInZ3ICsgMTJweClcIjtcclxuICAgIFxyXG4gICAgY2FudmFzU3RhdGUudXBkYXRlKCk7XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5HcmFwaC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlKSB7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgXHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGNhbnZhc1N0YXRlLmN0eC50cmFuc2xhdGUoY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgIC8vY29uc29sZS5sb2coY2FudmFzU3RhdGUuY2VudGVyKTtcclxuICAgIC8vY29uc29sZS5sb2coY2FudmFzU3RhdGUpO1xyXG4gICAgLy9kcmF3IG5vZGVzXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmRyYXcoY2FudmFzU3RhdGUsIHBhaW50ZXIsIG51bGwsIDAsIGV4cGFuZCk7XHJcbiAgICBcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgUGFyc2VyID0gcmVxdWlyZSgnLi4vZ3JhcGhQaGFzZS9QYXJzZXIuanMnKTtcclxudmFyIEdyYXBoID0gcmVxdWlyZSgnLi9HcmFwaC5qcycpO1xyXG5cclxudmFyIGdyYXBoTG9hZGVkO1xyXG5cclxudmFyIG1vdXNlVGFyZ2V0O1xyXG52YXIgZ3JhcGg7XHJcblxyXG5mdW5jdGlvbiBHcmFwaFBoYXNlKHBUYXJnZXRVUkwpe1xyXG4gICAgLy9pbml0aWFsaXplIGJhc2UgdmFsdWVzXHJcbiAgICBncmFwaExvYWRlZCA9IGZhbHNlO1xyXG4gICAgbW91c2VUYXJnZXQgPSAwO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vcmVxdWVzdCBncmFwaCBkYXRhIGFuZCB3YWl0IHRvIGJlZ2luIHBhcnNpbmdcclxuICAgIFBhcnNlcihwVGFyZ2V0VVJMLCBmdW5jdGlvbihwSlNPTkVsZW1lbnRzKXtcclxuICAgICAgICBncmFwaCA9IG5ldyBHcmFwaChwSlNPTkVsZW1lbnRzKTtcclxuICAgICAgICBncmFwaExvYWRlZCA9IHRydWU7XHJcbiAgICB9KTtcclxufVxyXG5cclxuR3JhcGhQaGFzZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgZ3JhcGgudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxufVxyXG5cclxuR3JhcGhQaGFzZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlKSB7XHJcbiAgICBpZihncmFwaExvYWRlZCkge1xyXG4gICAgICAgIGdyYXBoLmRyYXcoY2FudmFzU3RhdGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9pZiB3ZSBoYXZlbnQgbG9hZGVkIHRoZSBkYXRhLCBkaXNwbGF5IGxvYWRpbmcsIGFuZCB3YWl0XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZm9udCA9IFwiNDBweCBBcmlhbFwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXCJMb2FkaW5nLi4uXCIsIGNhbnZhc1N0YXRlLmNlbnRlci54LCBjYW52YXNTdGF0ZS5jZW50ZXIueSk7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JhcGhQaGFzZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG52YXIgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbnRhaW5lcnMvQnV0dG9uLmpzXCIpO1xyXG52YXIgVHV0b3JpYWxOb2RlID0gcmVxdWlyZSgnLi9UdXRvcmlhbE5vZGUuanMnKTtcclxuXHJcbnZhciBsYWJlbENvcm5lclNpemUgPSA2O1xyXG5cclxudmFyIHRpdGxlRm9udFNpemUgPSAxMjtcclxudmFyIHRpdGxlRm9udCA9IHRpdGxlRm9udFNpemUrXCJweCBBcmlhbFwiO1xyXG5cclxudmFyIGRlc2NyaXB0b3JGb250U2l6ZSA9IDEyO1xyXG52YXIgZGVzY3JpcHRvckZvbnQgPSBkZXNjcmlwdG9yRm9udFNpemUrXCJweCBBcmlhbFwiO1xyXG5cclxudmFyIGxpbmVCcmVhayA9IDY7XHJcblxyXG4vL2NyZWF0ZSBhIGxhYmVsIHRvIHBhaXIgd2l0aCBhIG5vZGVcclxuZnVuY3Rpb24gTm9kZUxhYmVsKHBUdXRvcmlhbE5vZGUpIHtcclxuICAgIHRoaXMubm9kZSA9IHBUdXRvcmlhbE5vZGU7XHJcbiAgICBcclxuICAgIHRoaXMuc2VyaWVzID0gdGhpcy5ub2RlLmRhdGEuc2VyaWVzO1xyXG4gICAgdGhpcy50aXRsZSA9IHRoaXMubm9kZS5kYXRhLnRpdGxlO1xyXG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IHRoaXMubm9kZS5kYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgdGhpcy5kZXNjcmlwdGlvbkxpbmVzID0gbnVsbDtcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludChcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplIC0gMTApO1xyXG4gICAgXHJcbiAgICB0aGlzLmRpc3BsYXlGdWxsRGF0YSA9IGZhbHNlO1xyXG59O1xyXG5cclxuTm9kZUxhYmVsLnByb3RvdHlwZS5jYWxjdWxhdGVUZXh0Rml0ID0gZnVuY3Rpb24oY3R4LCBwUGFpbnRlcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5mb250ID0gdGl0bGVGb250O1xyXG4gICAgdmFyIHNlcmllc1NpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy5zZXJpZXMpO1xyXG4gICAgdmFyIHRpdGxlU2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLnRpdGxlKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgdGhpcy5zaXplID0gbmV3IFBvaW50KE1hdGgubWF4KHNlcmllc1NpemUud2lkdGgsIHRpdGxlU2l6ZS53aWR0aCksIHRpdGxlRm9udFNpemUgKiAyKTtcclxuICAgIFxyXG4gICAgXHJcblxyXG4gICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEpIHtcclxuICAgICAgICB0aGlzLnNpemUueCA9IE1hdGgubWF4KDI0MCwgTWF0aC5tYXgoc2VyaWVzU2l6ZS53aWR0aCwgdGl0bGVTaXplLndpZHRoKSk7XHJcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbkxpbmVzID0gcFBhaW50ZXIudGV4dFRvTGluZXMoY3R4LCB0aGlzLmRlc2NyaXB0aW9uLCBkZXNjcmlwdG9yRm9udCwgdGhpcy5zaXplLngpO1xyXG4gICAgICAgIHRoaXMuc2l6ZS55ICs9IGxpbmVCcmVhayArIHRoaXMuZGVzY3JpcHRpb25MaW5lcy5sZW5ndGggKiBkZXNjcmlwdG9yRm9udFNpemU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHBNb3VzZVN0YXRlLCB0aW1lLCBkaXNwbGF5QnJpZWYpIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2RpcmVjdGx5IGFib3ZlIG5vZGVcclxuICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uID0gbmV3IFBvaW50KFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUgLSAxMiAtIGxhYmVsQ29ybmVyU2l6ZSk7XHJcbiAgICBcclxuICAgIGlmKHRoaXMuZGVzaXJlZFBvc2l0aW9uLnggIT0gdGhpcy5wb3NpdGlvbi54IHx8IHRoaXMuZGVzaXJlZFBvc2l0aW9uLnkgIT0gdGhpcy5wb3NpdGlvbi55KSB7XHJcbiAgICAgICAgLy9tb3ZlIHRvd2FyZHMgZGVzaXJlZFBvc2l0aW9uXHJcbiAgICAgICAgdmFyIGRpZiA9IG5ldyBQb2ludChcclxuICAgICAgICAgICAgdGhpcy5kZXNpcmVkUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5kZXNpcmVkUG9zaXRpb24ueSAtIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHNwZWVkU2NhbGFyID0gTWF0aC5zcXJ0KGRpZi54ICogZGlmLnggKyBkaWYueSAqIGRpZi55KSAqIHRpbWUuZGVsdGFUaW1lO1xyXG5cclxuICAgICAgICB2YXIgdmVsb2NpdHkgPSBuZXcgUG9pbnQoZGlmLnggKiBzcGVlZFNjYWxhciwgZGlmLnkgKiBzcGVlZFNjYWxhcik7XHJcbiAgICAgICAgaWYodmVsb2NpdHkueCAqIHZlbG9jaXR5LnggPCBkaWYueCAqIGRpZi54KSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCArPSB2ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgKz0gdmVsb2NpdHkueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHRoaXMuZGVzaXJlZFBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IHRoaXMuZGVzaXJlZFBvc2l0aW9uLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vaWYgdGhpcyBpcyB0aGUgcHJpbWFyeSBub2RlLCBkaXNwbGF5IGRlc2NyaXB0aW9uXHJcbiAgICBpZihkaXNwbGF5QnJpZWYpIHtcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLmRpc3BsYXlGdWxsRGF0YSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuZGlzcGxheUZ1bGxEYXRhID09IHRydWUpIHtcclxuICAgICAgICB0aGlzLmJ1dHRvbkNsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNpemUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlGdWxsRGF0YSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpIHtcclxuICAgIFxyXG4gICAgaWYoIXRoaXMuc2l6ZSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVGV4dEZpdChwQ2FudmFzU3RhdGUuY3R4LCBwUGFpbnRlcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vZHJhdyBsaW5lIGZyb20gbm9kZSB0byBsYWJlbFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4Lm1vdmVUbyhcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5saW5lVG8oXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIC8vZHJhdyBsYWJlbFxyXG4gICAgcFBhaW50ZXIucm91bmRlZFJlY3QoXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSAodGhpcy5zaXplLnggLyAyKSxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSxcclxuICAgICAgICB0aGlzLnNpemUueCxcclxuICAgICAgICB0aGlzLnNpemUueSxcclxuICAgICAgICBsYWJlbENvcm5lclNpemUsXHJcbiAgICAgICAgdHJ1ZSwgdGhpcy5ub2RlLmNvbG9yLFxyXG4gICAgICAgIHRydWUsIFwiI2ZmZlwiLCAyKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSB0aXRsZUZvbnQ7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFxyXG4gICAgICAgIHRoaXMuc2VyaWVzLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFxyXG4gICAgICAgIHRoaXMudGl0bGUsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55ICsgdGl0bGVGb250U2l6ZSk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBpZih0aGlzLmRpc3BsYXlGdWxsRGF0YSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gZGVzY3JpcHRvckZvbnQ7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJsZWZ0XCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGVzY3JpcHRpb25MaW5lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNjcmlwdGlvbkxpbmVzW2ldLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5zaXplLnggLyAyLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkgKyB0aXRsZUZvbnRTaXplICogMiArIGxpbmVCcmVhayArIGkgKiBkZXNjcmlwdG9yRm9udFNpemUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgID0gTm9kZUxhYmVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gUGFyc2VyKHBUYXJnZXRVUkwsIGNhbGxiYWNrKXtcclxuICAgIHZhciBKU09OT2JqZWN0O1xyXG4gICAgdmFyIGxlc3NvbkFycmF5ID0gW107XHJcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBKU09OT2JqZWN0ID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuXHJcbiAgICAgICAgLy9wYXNzIGxlc3NvbiBkYXRhIGJhY2tcclxuICAgICAgICBjYWxsYmFjayhKU09OT2JqZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICB4aHIub3BlbignR0VUJywgcFRhcmdldFVSTCwgdHJ1ZSk7XHJcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIklmLU1vZGlmaWVkLVNpbmNlXCIsIFwiU2F0LCAxIEphbiAyMDEwIDAwOjAwOjAwIEdNMFRcIik7XHJcbiAgICB4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlcjsiLCJcInVzZSBzdHJpY3RcIlxyXG5cclxudmFyIHF1ZXJ5RGF0YSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlUXVlcnlEYXRhKCkge1xyXG4gICAgdmFyIGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlF1ZXJ5TGlzdERhdGFcIik7XHJcbiAgICBsaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICBpZihxdWVyeURhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWVyeURhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGlzdC5pbm5lckhUTUwgKz0gXCI8bGk+XCIgKyBxdWVyeURhdGFbaV0udHlwZSArIFwiOiBcIiArIHF1ZXJ5RGF0YVtpXS52YWx1ZSArIFwiPC9saT5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhcnF1ZXJ5YnV0dG9uXCIpLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhcnF1ZXJ5YnV0dG9uXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIH1cclxufTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGV4dGJ1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJUZXh0XCIsXHJcbiAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGV4dGZpZWxkXCIpLnZhbHVlXHJcbiAgICB9O1xyXG4gICAgaWYocXVlcnkudmFsdWUgPT0gXCJcIilcclxuICAgICAgICByZXR1cm47XHJcbiAgICBxdWVyeURhdGEucHVzaChxdWVyeSk7XHJcbiAgICB1cGRhdGVRdWVyeURhdGEoKTtcclxufTtcclxuXHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGxhbmd1YWdlYnV0dG9uXCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWVyeSA9IHtcclxuICAgICAgICB0eXBlOiBcIkxhbmd1YWdlXCIsXHJcbiAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNobGFuZ3VhZ2VmaWVsZFwiKS52YWx1ZVxyXG4gICAgfTtcclxuICAgIGlmKHF1ZXJ5LnZhbHVlID09IFwiQW55XCIpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgcXVlcnlEYXRhLnB1c2gocXVlcnkpO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHRhZ2J1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJUYWdcIixcclxuICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdmaWVsZFwiKS52YWx1ZVxyXG4gICAgfTtcclxuICAgIGlmKHF1ZXJ5LnZhbHVlID09IFwiQW55XCIpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgcXVlcnlEYXRhLnB1c2gocXVlcnkpO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsZWFycXVlcnlidXR0b25cIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcXVlcnlEYXRhID0gW107XHJcbiAgICB1cGRhdGVRdWVyeURhdGEoKTtcclxufTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNoYnV0dG9uXCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIFNlYXJjaFBhbmVsKGdyYXBoKSB7XHJcbiAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMub3B0aW9uc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVmdEJhclwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGJ1dHRvblwiKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKHRoYXQpIHtcclxuICAgICAgICAvL3BhcnNlIGRhdGEgdG8gZmluZCBtYXRjaGluZyByZXN1bHRzXHJcbiAgICAgICAgdmFyIHNlYXJjaFJlc3VsdHMgPSB0aGF0LnNlYXJjaChxdWVyeURhdGEsIHRoYXQuZ3JhcGgubm9kZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZGlzcGxheSByZXN1bHRzXHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNocmVzdWx0c1wiKTtcclxuICAgICAgICBpZihzZWFyY2hSZXN1bHRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBcIk5vIE1hdGNoaW5nIFJlc3VsdHMgRm91bmQuXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZGl2LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaFJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbGlzdCB0YWdcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICAvL3NldCB0aXRsZSBhcyB0ZXh0XHJcbiAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IHNlYXJjaFJlc3VsdHNbaV0uZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgdG8gZm9jdXMgdGhlIG5vZGUgaWYgaXRzIGNsaWNrZWRcclxuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKHRoYXQsIG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ3JhcGguRm9jdXNOb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICB9LmJpbmQobGksIHRoYXQsIHNlYXJjaFJlc3VsdHNbaV0pKTtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIHRhZyB0byB0aGUgcGFnZVxyXG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzLnNlYXJjaEJ1dHRvbiwgdGhpcykpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuU2VhcmNoUGFuZWwucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uKHF1ZXJ5LCBub2Rlcykge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldLmRhdGE7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcXVlcnkubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYocXVlcnlbal0udHlwZSA9PT0gXCJUZXh0XCIpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuc2VyaWVzLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihxdWVyeVtqXS50eXBlID09PSBcIkxhbmd1YWdlXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUubGFuZ3VhZ2UgIT09IHF1ZXJ5W2pdLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YWdNYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IG5vZGUudGFncy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUudGFnc1trXSA9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdNYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodGFnTWF0Y2ggPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vaWYgd2UgcGFzc2VkIGFsbCB0aGF0IGNyYXAsIHdlIGhhdmUgYSBtYXRjaCFcclxuICAgICAgICBpZihtYXRjaCA9PT0gdHJ1ZSkgeyBcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59O1xyXG5cclxuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy90cmFuc2l0aW9uIG9mZlxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoUGFuZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIE5vZGVMYWJlbCA9IHJlcXVpcmUoJy4vTm9kZUxhYmVsLmpzJyk7XHJcbnZhciBCdXR0b24gPSByZXF1aXJlKCcuLi8uLi9jb250YWluZXJzL0J1dHRvbi5qcycpO1xyXG5cclxudmFyIGhvcml6b250YWxTcGFjaW5nID0gMTgwO1xyXG52YXIgYmFzZVNpemUgPSAyNDtcclxuXHJcbnZhciBUdXRvcmlhbFN0YXRlID0ge1xyXG4gICAgTG9ja2VkOiAwLFxyXG4gICAgVW5sb2NrZWQ6IDEsXHJcbiAgICBDb21wbGV0ZWQ6IDJcclxufTtcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbi8vbWFrZSBhIG5vZGUgd2l0aCBzb21lIGRhdGFcclxuZnVuY3Rpb24gVHV0b3JpYWxOb2RlKEpTT05DaHVuaykge1xyXG4gICAgdGhpcy5kYXRhID0gSlNPTkNodW5rO1xyXG4gICAgdGhpcy5wcmltYXJ5VGFnID0gdGhpcy5kYXRhLnRhZ3NbMF07XHJcbiAgICB0aGlzLmNvbG9yID0gVHV0b3JpYWxUYWdzW3RoaXMucHJpbWFyeVRhZ107XHJcbiAgICBcclxuICAgIHRoaXMuc3RhdGUgPSBUdXRvcmlhbFN0YXRlLkxvY2tlZDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgXHJcbiAgICB0aGlzLnNpemUgPSAyNDtcclxuICAgIHRoaXMubGFiZWwgPSBuZXcgTm9kZUxhYmVsKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5uZXh0Tm9kZXMgPSBbXTtcclxuICAgIHRoaXMucHJldmlvdXNOb2RlcyA9IFtdO1xyXG4gICAgXHJcbiAgICB0aGlzLmRldGFpbHNCdXR0b24gPSBuZXcgQnV0dG9uKG5ldyBQb2ludCgwLCAwKSwgbmV3IFBvaW50KDcyLCAzNiksIFwiTW9yZVwiLCB0aGlzLmNvbG9yKTtcclxuICAgIFxyXG59O1xyXG5cclxuLy9yZWN1cnNpdmUgZnVuY3Rpb24gdG8gZ2V0IHByZXZpb3VzIG5vZGVzXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0UHJldmlvdXMgPSBmdW5jdGlvbihkZXB0aCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgcmVzdWx0LnB1c2godGhpcyk7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMucHJldmlvdXNOb2Rlc1tpXS5nZXRQcmV2aW91cyhkZXB0aC0xKTtcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHByZXZpb3VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChwcmV2aW91c1tqXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuXHJcblxyXG4vL3JlY3Vyc2l2ZSBmdW5jdGlvbiB0byBnZXQgbmV4dCBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbihkZXB0aCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgcmVzdWx0LnB1c2godGhpcyk7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5uZXh0Tm9kZXNbaV0uZ2V0TmV4dChkZXB0aC0xKTtcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHByZXZpb3VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChwcmV2aW91c1tqXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLy9kaXJlY3Rpb24gaXMgdGhlIHNpZGUgb2YgdGhlIHBhcmVudCB0aGlzIG5vZGUgZXhpc3RzIG9uXHJcbi8vbGF5ZXIgZGVwdGggaXMgaG93IG1hbnkgbGF5ZXJzIHRvIHJlbmRlciBvdXRcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5yZWN1cnNpdmVVcGRhdGUgPSBmdW5jdGlvbihkaXJlY3Rpb24sIGRlcHRoKSB7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5yZWN1cnNpdmVVcGRhdGUoLTEsIGRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5yZWN1cnNpdmVVcGRhdGUoMSwgZGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vdXBkYXRlcyBhIG5vZGVcclxuLy90cmFuc2l0aW9uIHRpbWUgaXMgMS0wLCB3aXRoIDAgYmVpbmcgdGhlIGZpbmFsIGxvY2F0aW9uXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgdGltZSwgdHJhbnNpdGlvblRpbWUsIGlzRm9jdXNlZCkge1xyXG4gICAgXHJcbiAgICAvL21vdmUgdGhlIG5vZGVcclxuICAgIGlmKHRoaXMucG9zaXRpb24gIT0gdGhpcy5uZXh0UG9zaXRpb24pIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnggKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueCAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkgKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueSAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5zaXplID0gMzY7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rlc3QgaWYgbW91c2UgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIHZhciBkeSA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIGlmKChkeCAqIGR4KSArIChkeSAqIGR5KSA8IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgaXNGb2N1c2VkKTtcclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRldGFpbHNCdXR0b24uc2l6ZS54IC8gMiAtIDM7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUgKyAxMjtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24udXBkYXRlKG1vdXNlU3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuY2FsY3VsYXRlTm9kZVRyZWUgPSBmdW5jdGlvbihsYXllckRlcHRoLCBwYXJlbnQsIGRpcmVjdGlvbikge1xyXG4gICAgXHJcbiAgICAvLyBJZiB0aGUgbm9kZSBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgZ3JhcGggaW4gYSBiZXR0ZXIgcGxhY2UgdGhhbiB0aGlzIG9uZSwgZG9udCB1c2UgaXRcclxuICAgIGlmKHRoaXMuY3VycmVudExheWVyRGVwdGggPiBsYXllckRlcHRoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmN1cnJlbnRMYXllckRlcHRoID0gbGF5ZXJEZXB0aDtcclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgXHJcbiAgICBpZihsYXllckRlcHRoID4gMCkge1xyXG4gICAgICAgIC8vbGVmdCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5jYWxjdWxhdGVOb2RlVHJlZShsYXllckRlcHRoIC0gMSwgdGhpcywgLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcmlnaHQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5jYWxjdWxhdGVOb2RlVHJlZShsYXllckRlcHRoIC0gMSwgdGhpcywgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnNldFRyYW5zaXRpb24gPSBmdW5jdGlvbihsYXllckRlcHRoLCBwYXJlbnQsIGRpcmVjdGlvbiwgdGFyZ2V0UG9zaXRpb24pIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbjtcclxuICAgIFxyXG4gICAgLy9maWd1cmUgb3V0IHNpemUgb2YgY2hpbGRyZW4gdG8gc3BhY2UgdGhlbSBvdXQgYXBwcm9wcmlhdGVseVxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICB2YXIgeFBvc2l0aW9uO1xyXG4gICAgICAgIHZhciB5UG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9sZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsTGVmdEhlaWdodCA9IHRoaXMuZ2V0UHJldmlvdXNIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHhQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnggLSBob3Jpem9udGFsU3BhY2luZztcclxuICAgICAgICAgICAgaWYoZGlyZWN0aW9uID09IDApIHhQb3NpdGlvbiAtPSA2MDtcclxuICAgICAgICAgICAgeVBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueSAtICh0b3RhbExlZnRIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMucHJldmlvdXNOb2Rlc1tpXS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSBuZXcgUG9pbnQoeFBvc2l0aW9uLCB5UG9zaXRpb24gKyB0aGlzLnByZXZpb3VzTm9kZXNbaV0uY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAvKmlmKCF0aGlzLndhc1ByZXZpb3VzbHlPblNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgUG9pbnQoLTEwMDAsIHBsYWNlbWVudC55KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLnByZXZpb3VzUG9zaXRpb24gPSBuZXcgUG9pbnQoLTEwMDAsIHBsYWNlbWVudC55KTtcclxuICAgICAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgICAgICAgICB5UG9zaXRpb24gKz0gdGhpcy5wcmV2aW91c05vZGVzW2ldLmN1cnJlbnRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB2YXIgdG90YWxSaWdodEhlaWdodCA9IHRoaXMuZ2V0TmV4dEhlaWdodChsYXllckRlcHRoKTtcclxuICAgICAgICAgICAgeFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueCArIGhvcml6b250YWxTcGFjaW5nO1xyXG4gICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gMCkgeFBvc2l0aW9uICs9IDYwO1xyXG4gICAgICAgICAgICB5UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi55IC0gKHRvdGFsUmlnaHRIZWlnaHQgLyAyKTtcclxuXHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5uZXh0Tm9kZXNbaV0ucGFyZW50ID09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgdGhpcy5uZXh0Tm9kZXNbaV0uY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzW2ldLnNldFRyYW5zaXRpb24obGF5ZXJEZXB0aCAtIDEsIHRoaXMsIDEsIHBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyppZighdGhpcy53YXNQcmV2aW91c2x5T25TY3JlZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgUG9pbnQoMTAwMCwgcGxhY2VtZW50LnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5wcmV2aW91c1Bvc2l0aW9uID0gbmV3IFBvaW50KDEwMDAsIHBsYWNlbWVudC55KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aHJvdyB0aGUgc3dpdGNoIVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgICAgICAgICB5UG9zaXRpb24gKz0gdGhpcy5uZXh0Tm9kZXNbaV0uY3VycmVudEhlaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0UHJldmlvdXNIZWlnaHQgPSBmdW5jdGlvbihsYXllckRlcHRoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSAwO1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDAgJiYgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMucHJldmlvdXNOb2Rlc1tpXS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IHRoaXMucHJldmlvdXNOb2Rlc1tpXS5nZXRQcmV2aW91c0hlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jdXJyZW50SGVpZ2h0ID09IDApIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSBiYXNlU2l6ZSAqIDU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldE5leHRIZWlnaHQgPSBmdW5jdGlvbihsYXllckRlcHRoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSAwO1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDAgJiYgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZih0aGlzLm5leHROb2Rlc1tpXS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IHRoaXMubmV4dE5vZGVzW2ldLmdldE5leHRIZWlnaHQobGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuY3VycmVudEhlaWdodCA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gYmFzZVNpemUgKiA1O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50SGVpZ2h0O1xyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIHBhcmVudENhbGxlciwgZGlyZWN0aW9uLCBsYXllckRlcHRoKSB7XHJcbiAgICAvL2RyYXcgbGluZSB0byBwYXJlbnQgaWYgcG9zc2libGVcclxuICAgIGlmKHBhcmVudENhbGxlciAmJiBwYXJlbnRDYWxsZXIgPT0gdGhpcy5wYXJlbnQpIHtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy92YXIgYmV0d2VlbiA9IG5ldyBQb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8odGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKHBhcmVudENhbGxlci5wb3NpdGlvbi54LCBwYXJlbnRDYWxsZXIucG9zaXRpb24ueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5jbG9zZVBhdGgoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgY2hpbGQgbm9kZXNcclxuICAgIGlmKGxheWVyRGVwdGggPiAwKXtcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIHRoaXMsIC0xLCBsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIHRoaXMsIDEsIGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGNpcmNsZVxyXG4gICAgcFBhaW50ZXIuY2lyY2xlKHBDYW52YXNTdGF0ZS5jdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnNpemUsIHRydWUsIHRoaXMuY29sb3IsIHRydWUsIFwiI2ZmZlwiLCAyKTtcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgaWYoZGlyZWN0aW9uID09IDApIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUdXRvcmlhbE5vZGU7Il19
