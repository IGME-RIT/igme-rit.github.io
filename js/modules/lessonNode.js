"use strict";
var DrawLib = require('./drawLib.js');

var painter;

//parameter is a point that denotes starting position
function lessonNode(startPosition, JSONChunk){    
    this.imageLoaded = false;
    painter = new DrawLib();
    
    this.position = startPosition;
    this.mouseOver = false;
    this.highlighted = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    this.data = JSONChunk;
    //0 = hidden, 1 = visible unsolved, 2 = visible solved
    //this.status = 0;
    
    this.placement = 1;
    
    //parse JSONChunk for completeness
    
    
    //image loading and resizing
    var tempImage = new Image();
    
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction.bind(this), false);
    
    tempImage.src = JSONChunk.image.icon;
}


var _loadAction = function (e) {
    this.image = e.target;
    this.width = e.target.naturalWidth;
    this.height = e.target.naturalHeight;
    
    var maxDimension = 100;
    
    if(this.width < maxDimension && this.height < maxDimension){
        var x;
        if(this.width > this.height){
            x = maxDimension / this.width;
        }
        else{
            x = maxDimension / this.height;
        }
        this.width = this.width * x;
        this.height = this.height * x;
    }
    if(this.width > maxDimension || this.height > maxDimension){
        var x;
        if(this.width > this.height){
            x = this.width / maxDimension;
        }
        else{
            x = this.height / maxDimension;
        }
        this.width = this.width / x;
        this.height = this.height / x;
    }
    
    this.imageLoaded = true;
};
var _errorAction = function(e){
    //alert("There was an error loading an image.");
    this.image = new Image();
    this.image.src = "../assets/ui/missingThumbnail.gif";
    this.width = 100;
    this.height = 100;
    this.imageLoaded = true;
};

var _toggleStatus = function (e) {
    if(this.status === 1){
        console.log("status 1 - 2");
        this.status = 2;
        //if forward connection status === 0, set to 1
        //local storage stuff
    }
    else if(this.status === 2){
        console.log("status 2 - 1");
        this.status = 1;
    }
    console.log(this.status);
}

lessonNode.prototype.draw = function(ctx){
    if(this.imageLoaded){
        
        if(this.status !== 0){
            ctx.save();
            if(this.highlighted){
                ctx.shadowColor = '#0066ff';
                ctx.shadowBlur = 7;
            }

            if(this.status === 2){
                //draw lines as part of the lessonNode
                for(var i = 0; i < this.connectionForward.length; i++){
                    this.connectionForward[i].highlight = true;
                    painter.line(ctx, this.position.x, this.position.y, this.connectionForward[i].position.x, this.connectionForward[i].position.y, 2, "black");
                }
            }
                ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)

                ctx.font = "20px Arial";
                ctx.textBaseline = "hanging";
                ctx.textAlign = "center";
                ctx.strokeText(this.data.title, this.position.x, this.position.y + 5 + this.height/2);
                
            //draw completion flag
            if(this.status === 2){
            }
            
            
            ctx.restore();


            //draw the image, shadow if hovered
            if(this.mouseOver){
                this.highlighted = true;
                if(this.connectionForward[0] !== undefined){
                    if(this.connectionForward[0].type === "extension"){
                        this.connectionForward[0].highlighted = true;
                    }
                }
            }
            else{
                this.highlighted = false;
                if(this.connectionForward[0] !== undefined){
                    if(this.connectionForward[0].type === "extension"){
                        this.connectionForward[0].highlighted = false;
                    }
                }
            }
        }
    }
    
};



//populates the detailWindow based on the sender
lessonNode.prototype.click = function(){
    //set detailWindow values here
    
    document.getElementById("detailLayer").className = "visible";
    
    document.getElementById("dwBannerTitle").innerHTML = this.data.title;
    document.getElementById("dwBannerImage").src = this.data.image.banner;
    
    var tagText = "";
    for(var i = 0; i < this.data.tags.length; i++){
        tagText += "<div class=\"dwTag\"><p>" + this.data.tags[i] + "</p></div>";
    }
    
    document.getElementById("dwTags").innerHTML = tagText;
    document.getElementById("dwDescriptionText").innerHTML = this.data.description;
    
    var conglomerate = "";
    if(this.data.extra_resources[0] !== null){
        for(var i = 0; i < this.data.extra_resources.length; i++){
            var snippet = this.data.extra_resources[i];
            var headerSnippet = "";
            var footerSnippet = "";
            //removes / from the end since it will be used as an marker for cutting
            if(snippet.substring(snippet.length - 1, snippet.length) === "/"){
                snippet = snippet.substring(0, snippet.length - 1);
            }
            //remove the http:// or https:// header
            if(snippet.substring(0, 8) === "https://"){
                snippet = snippet.substring(8, snippet.length);
            }
            if(snippet.substring(0, 7) === "http://"){
                snippet = snippet.substring(7, snippet.length);
            }
            if(snippet.substring(0, 4) === "www."){
                snippet = snippet.substring(4, snippet.length);
            }
            //if the snippet contains / parse based on it
            if(snippet.indexOf('/') !== "-1"){
                var counter = 0;
                for(var k = 0; k < snippet.length; k++){
                    if(snippet[k] !== "/"){
                        counter++;
                    }
                    else{
                        break;
                    }
                }
                headerSnippet += snippet.substring(0, counter);
                headerSnippet += ":";
                
                counter = snippet.length;
                for(var k = snippet.length - 1; k > 0; k--){
                    if(snippet[k] !== "/"){
                        counter--;
                    }
                    else{
                        break;
                    }
                }
                footerSnippet += snippet.substring(counter, snippet.length);
                var temporarySnippet = "";
                for(var k = 0; k < footerSnippet.length; k++){
                    if(footerSnippet[k] === '-' || footerSnippet[k] === '_' || footerSnippet[k] === '~'){
                        temporarySnippet += ' ';
                    }
                    else{
                        temporarySnippet += footerSnippet[k];
                    }
                }
                footerSnippet = temporarySnippet;
            }
            
            conglomerate += "<a href=\"" + this.data.extra_resources[i] + "\" target=\"_blank\"><div class=\"dwResource\"><div class=\"dwResourceContent\"><p class=\"dwResourceP1\">";
            conglomerate += headerSnippet;
            conglomerate += "</p><p class=\"dwResourceP2\">" + footerSnippet +"</p></div></div></a>";
        }
        
    }
    document.getElementById("dwResources").innerHTML = conglomerate;
    
    
    
    document.getElementById("dwLauncher").innerHTML = "<a href=\"" + this.data.link + "\" target=\"_blank\"><div id=\"dwLauncherLaunch\"><p>Open Lesson</p></div></a>" + 
    "<button id=\"completionButton\"><div id=\"dwLauncherToggle\"><p>Mark as Complete</p></div></button>";
    
    //set cookie data
    localStorage.activeNode = this.data._id;
    
    //attach click event to button
    var dwCompletionButton = document.querySelector("#completionButton");
    dwCompletionButton.addEventListener('click', _toggleStatus.bind(this), false);
};

module.exports = lessonNode;