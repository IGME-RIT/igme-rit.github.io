"use strict";
var DrawLib = require('../tools/Drawlib.js');
var SearchPanel = require('./SearchPanel.js');
var DetailsPanel = require('./DetailsPanel.js');
var TutorialNode = require('./TutorialNode.js');
var Point = require('../containers/Point.js');

var graphLoaded;
var mouseTarget;


var graphDepthLimit = 5; // how many values to expand to
var debugMode = false;

var divWidth = 25; // what percent of the viewport is taken up by each sidebar


var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};


function Graph(pJSONData) {

    this.searchPanel = new SearchPanel(this);
    this.detailsPanel = new DetailsPanel(this);
    this.searchPanelButton = document.getElementById("OptionsButton");
    this.searchDiv = $("#leftBar")[0];
    this.dataDiv = $("#rightBar")[0];
    this.canvasDiv = $("#middleBar")[0];

    // load lock image for locked nodes and completed nodes
    this.lockImage = new Image();
    this.lockImage.src = "content/ui/Lock.png";
    this.checkImage = new Image();
    this.checkImage.src = "content/ui/Check.png";

    //create painter object to help draw stuff
    this.painter = new DrawLib();

    this.nodes = [];
    this.activeNodes = [];

    //populate the array
    for(var i = 0; i < pJSONData.length; i++) {
        var data = pJSONData[i];
        //ensures that the chunk contains a link
        if(data.tags.length === 0) {
            if(debugMode) console.log("Repo not tagged: " + data.name);
        }
        else if(data.name == data.series) {
            if(debugMode) console.log("Repo yaml out of date: " + data.name);
        }
        else {
            var node = new TutorialNode(data);
            this.nodes.push(node);
        }
    }

    // console.log(this.nodes);

    // loop through nodes and connect them together.
    this.nodes.forEach((node)=>{
        node.data.connections.forEach((connection)=>{
            this.nodes.forEach((otherNode)=>{
                if(otherNode.data.series === connection.series && otherNode.data.title === connection.title) {
                    node.previousNodes.push(otherNode);
                    otherNode.nextNodes.push(node);
                }
            });
        });
        node.fetchState();
    });



    // Start by focusing the intro node:
    this.transitionTime = 0;
    var first = this.nodes.find((currentNode)=>{
        return currentNode.data.link == "https://github.com/IGME-RIT/Welcome-to-Atlas";
    });

    // In case the Welcome to Atlas node isn't in the list of nodes (due
    // to a sync issue or something), give a node so it won't be loading forever
    if (first == undefined)
      first = this.nodes[0];

    this.FocusNode(first);


    function x (search) {
        if(search.open == true) {
            search.transitionOn = false;
        }
        else {
            search.transitionOn = true;
            search.open = true;
            $("#searchtextfield")[0].select();
        }
    }

    console.log(this.searchPanelButton);
    this.searchPanelButton.addEventListener( "click", x.bind(this.searchPanelButton, this.searchPanel));
};




Graph.prototype.FocusNode = function(centerNode) {
    this.focusedNode = centerNode;

    var newNodes = [];

    //get nodes to depth in both directions, and add them to the new nodes array
    var previousNodes = this.focusedNode.getPrevious(graphDepthLimit);
    newNodes = newNodes.concat(previousNodes);

    var nextNodes = this.focusedNode.getNext(graphDepthLimit);
    newNodes = newNodes.concat(nextNodes);


    //find redundancies from the newNodes, and make a new array without those redundancies.
    var temp = [];
    newNodes.forEach((nodeToCheck)=> {
        if(temp.every((alreadyAddedNode)=>{
            return nodeToCheck != alreadyAddedNode;
        })) {
            temp.push(nodeToCheck);
        }
    });
    newNodes = temp;



    // check if any of the nodes were previously on screen
    // (this is used to determine where they should appear during the transition animation)
    this.activeNodes.forEach((node)=>{
        node.wasPreviouslyOnScreen = newNodes.some((newNode)=>{
            return node == newNode;
        });
    });

    this.activeNodes = newNodes;

    //clear their parent data for new node
    this.activeNodes.forEach((node)=>{
        node.currentLayerDepth = 0;
        node.parent = null;
    });

    // Start animation.
    this.transitionTime = 1;
    // Figure out where everything needs to be.
    this.focusedNode.calculateNodeTree(graphDepthLimit, null, 0);
    this.focusedNode.setTransition(graphDepthLimit, null, 0, new Point(0, 0));
};

Graph.prototype.update = function(mouseState, canvasState, time) {

    // update transition time if it needs to be updated.
    if(this.transitionTime > 0) {
        this.transitionTime -= time.deltaTime;
    } else {
        this.transitionTime = 0;
    }

    // Loop over and update active nodes
    var mouseOverNode = null;
    this.activeNodes.forEach((node)=>{
        var isMain = (node == this.focusedNode);
        node.update(mouseState, time, this.transitionTime, isMain);

        // Also check if the mouse is over that node.
        if(node.mouseOver) {
            mouseOverNode = node;
        }
    });


    // If user clicks
    if(mouseState.mouseDown && !mouseState.lastMouseDown) {

        // focus node if clicked
        if(mouseOverNode) {
            this.FocusNode(mouseOverNode);
        }

        // show details for node if button clicked
        if(this.focusedNode.detailsButton.mouseOver) {
            if(this.detailsPanel.node == null)  {
                this.detailsPanel.enable(this.focusedNode);
            }
            else {
                this.detailsPanel.disable();
            }

        }
        // user clicks on completion button
        if(this.focusedNode.completionButton.mouseOver) {
            if(this.focusedNode.state == TutorialState.Unlocked) {
                this.focusedNode.changeState(TutorialState.Completed);
            }
            else if (this.focusedNode.state == TutorialState.Locked) {
                if (confirm("Skip ahead? This won't automatically complete anything previous to this.")) {
                    this.focusedNode.changeState(TutorialState.Completed);
                }
            }
            else if (this.focusedNode.state == TutorialState.Completed) {
                // If resetting, ask for confirmation.
                if (confirm("This will reset any progress past this point. Are you sure you want to do this?")) {
                    this.focusedNode.changeState(TutorialState.Unlocked);
                }
            }
        }
    }

    // Update the search panel if it's open.
    if(this.searchPanel.open == true) {
        this.searchPanel.update(canvasState, time);
    }

    // Update the details panel if it's open.
    if(this.detailsPanel.node != null) {
        this.detailsPanel.update(canvasState, time, this.focusedNode);
    }

    if(this.focusedNode != null) {
      if(this.detailsPanel.enabled) {
        this.focusedNode.detailsButton.text = "Less";
      }
      else {
        this.focusedNode.detailsButton.text = "More";
      }
    }


    // Transition the side bars on and off smoothly
    var t1 = (1 - Math.cos(this.searchPanel.transitionTime * Math.PI))/2;
    var t2 = (1 - Math.cos(this.detailsPanel.transitionTime * Math.PI))/2;

    // Change styling to change size of divs
    this.searchDiv.style.width = divWidth * t1 + "vw";
    this.dataDiv.style.width = divWidth * t2 + "vw";
    this.canvasDiv.style.width = 100 - divWidth * (t1 + t2) + "vw";

    this.searchPanelButton.style.left = "calc(" + divWidth * t1 + "vw + 12px)";


    this.searchDiv.style.display = (t1 == 0) ? "none" : "block";
    this.dataDiv.style.display = (t2 == 0) ? "none" : "block";

    canvasState.update();
};







Graph.prototype.draw = function(canvasState) {

    canvasState.ctx.save();

    //translate to the center of the screen
    canvasState.ctx.translate(canvasState.center.x, canvasState.center.y);

    //draw nodes
    this.focusedNode.draw(canvasState, this.painter, this, null, 0, graphDepthLimit);

    canvasState.ctx.restore();
};

module.exports = Graph;
