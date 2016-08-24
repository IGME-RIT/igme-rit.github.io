"use strict";

var Point = require('../../common/Point.js');
var NodeLabel = require('./NodeLabel.js');

var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};

var TutorialTags = {
    "Core": "#fff",
    "Math": "#080",
    "C++": "#800",
    "Graphics": "#808",
    "Physics": "#008"
};

//make a node with some data
function TutorialNode(JSONChunk) {
    this.data = JSONChunk;
    this.primaryTag = this.data.tags[1];
    this.color = TutorialTags[this.primaryTag];
    this.state = TutorialState.Locked;
    
    this.wasPreviouslyOnScreen = false;
    this.position = new Point(0, 0);
    this.previousPosition = new Point(0, 0);
    this.nextPosition = new Point(0, 0);
    
    this.size = 25;
    this.label = new NodeLabel(this);
        
    this.nextNodes = [];
    this.previousNodes = [];
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

//updates nodes recursively starting with the core node
//transition time is 1-0, with 0 being the final location
TutorialNode.prototype.update = function(mouseState, time, transitionTime) {
    //move the node
    var iWasClicked = false;
    
    if(this.position != this.nextPosition) {
        this.position.x = (this.previousPosition.x * transitionTime) + (this.nextPosition.x * (1 - transitionTime));
        this.position.y = (this.previousPosition.y * transitionTime) + (this.nextPosition.y * (1 - transitionTime));
    }
    
    //test if mouse is inside circle
    var dx = mouseState.relativePosition.x - this.position.x;
    var dy = mouseState.relativePosition.y - this.position.y;
    if((dx * dx) + (dy * dy) < this.size * this.size) {
        this.size = 30;
        if(mouseState.mouseDown && !mouseState.lastMouseDown) {
            iWasClicked = true;
        }
    }
    else {
        this.size = 25;
    }
    
    
    
    this.label.update(time);
    
    
    return iWasClicked;
};


TutorialNode.prototype.setTransition = function(layerDepth, parent, direction, targetPosition) {
    
    //dont mess with node position if it already exists in the graph
    if(this.usedInGraph) {
        return;
    }
    
    this.usedInGraph = true;
    
    
    this.parent = parent;
    this.previousPosition = this.position;
    this.nextPosition = targetPosition;
    
    //figure out size of children to space them out appropriately
    if(layerDepth > 0) {
        var xPosition;
        var yPosition;
        
        //left or middle
        if(direction < 1) {
            var totalLeftHeight = this.getPreviousHeight(layerDepth);
            xPosition = targetPosition.x - 200;
            yPosition = targetPosition.y - (totalLeftHeight / 2);
            
            for(var i = 0; i < this.previousNodes.length; i++) {
                var placement = new Point(xPosition, yPosition + this.previousNodes[i].currentHeight / 2);
                this.previousNodes[i].setTransition(layerDepth - 1, this, -1, placement);
                /*if(!this.wasPreviouslyOnScreen) {
                    this.previousNodes[i].position = new Point(-1000, placement.y);
                    this.previousNodes[i].previousPosition = new Point(-1000, placement.y);
                }*/
                yPosition += this.previousNodes[i].currentHeight;
            }
        }
        
        //right or middle
        if(direction > -1) {
            var totalRightHeight = this.getNextHeight(layerDepth);
            xPosition = targetPosition.x + 200;
            yPosition = targetPosition.y - (totalRightHeight / 2);

            for(var i = 0; i < this.nextNodes.length; i++) {
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
};

TutorialNode.prototype.getPreviousHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.previousNodes.length > 0) {
        for(var i = 0; i < this.previousNodes.length; i++) {
            this.currentHeight += this.previousNodes[i].getPreviousHeight(layerDepth - 1);
        }
    }
    else {
        this.currentHeight = this.size * 5;
    }
    
    return this.currentHeight;
};

TutorialNode.prototype.getNextHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.nextNodes.length > 0) {
        for(var i = 0; i < this.nextNodes.length; i++) {
            this.currentHeight += this.nextNodes[i].getNextHeight(layerDepth - 1);
        }
    }
    else {
        this.currentHeight = this.size * 5;
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
};



module.exports  = TutorialNode;