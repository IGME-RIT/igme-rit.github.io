"use strict";
var Board = require('./board.js');
var Point = require('./point.js');
var DrawLib = require('./drawLib.js');
var LessonNode = require('./lessonNode.js');

var boardArray;
var painter;

function game(){
    painter = new DrawLib();
    
    var testLessonNode = new LessonNode(new Point(0,0), "images/dog.png");
    
    boardArray = [];
    boardArray.push(new Board(new Point(0,0), testLessonNode));
}

var p = game.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight){
    //update stuff
    p.act();
    //draw stuff
    p.draw(ctx, canvas, center, activeHeight);
}

p.act = function(){
}

p.draw = function(ctx, canvas, center, activeHeight){
    //draw board
    ctx.save();
    painter.clear(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    painter.rect(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight, "white");
    painter.line(ctx, canvas.offsetWidth/2, center.y - activeHeight/2, canvas.offsetWidth/2, canvas.offsetHeight, 2, "lightgray");
    painter.line(ctx, 0, center.y, canvas.offsetWidth, center.y, 2, "lightGray");
    ctx.restore();
    //draw lesson nodes
}

module.exports = game;