// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Puddle Setup                                                                                                     ┃
// ┃                                                                                                                   ┃
// ┃  Prepares the puddle for creatures to inhabit                                                                     ┃
// ┃  as well as spawning  initial inhabitants                                                                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                              Chunks                                 ┃
// ┃  Puddle is divided into chunks for processing only what is within   ┃
// ┃  or near the camera and for inhabitants to reference those nearby.  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
PDL.chunks = [];
PDL.chunkSize = 200; //Pixel size^2 (Should be a multiple of screen height/width)
PDL.maxChunksX = PDL.width/PDL.chunkSize;
PDL.maxChunksY = PDL.height/PDL.chunkSize;

//Create chunks based on map and chunk size
for (let y = 0; y < PDL.height/PDL.chunkSize; y++) {
    var chunkRow = [];
    for (let x = 0; x < PDL.width/PDL.chunkSize; x++) {
        var chunk = {
            ID: {x:x,y:y},
            x: x * PDL.chunkSize,
            y: y * PDL.chunkSize,
            live: false,
            shrimps: []
        };
        chunkRow.push(chunk)
    }
    PDL.chunks.push(chunkRow)
}

// console.log(PDL.chunks[0][0])



//Creature containers /NOTE Should be deprecated
PDL.shrimps = [];

/*
					VISUAL FX
		Defines some fancy/necessary routines
		for painting to our PDL.canvas.
*/

//Draw puddle background
PDL.drawbG = function(){
    PDL.ctx.fillStyle= "rgba(50,50,100,0.5)";
    PDL.ctx.fillRect(0,0,PDL.canvas.width,PDL.canvas.height);
    //TODO Add central gradient?
        /*var grd = ctx.createRadialGradient(75,50,5,90,60,100);
        grd.addColorStop(0,"red");
        grd.addColorStop(1,"white");*/
};

//Draw scanlines
PDL.refreshScanLine = 0;
PDL.scanLines = function(){
    for (line=1;line<=PDL.canvas.height;line+=2){
        PDL.ctx.fillStyle="rgba(0,0,100,0.1)";
        PDL.ctx.fillRect(0,line,PDL.canvas.width,1);
    }
    PDL.refreshScanLine+=2;
    PDL.ctx.fillStyle="rgba(100,100,100,0.1)";
    PDL.ctx.fillRect(0,PDL.refreshScanLine,PDL.canvas.width,1);
    if(PDL.refreshScanLine>PDL.canvas.height){PDL.refreshScanLine=0;}
}

//Draw FPS
PDL.drawFPS = function(){
    var fps = PDL.fps.get();
    PDL.ctx.font = "11px Lucida Sans Unicode";
    fps <=25 ? PDL.ctx.fillStyle = "rgb(255,0,0)" : PDL.ctx.fillStyle = "rgb(0,255,0)";
    PDL.ctx.fillText("FPS: "+fps,0,11)
}


//Smoothly update camera position //NOTE Camera stuff may deserve its own file?
PDL.cameraUpdate = function(){
    PDL.camX   += (PDL.camDX - PDL.camX)*0.02;
    PDL.camY   += (PDL.camDY - PDL.camY)*0.02;
}



//Draw debug chunks only within visible screen area
PDL.drawChunks = function(){ 

    //Get starting screen chunks
    var chunkWidth = Math.ceil(PDL.canvas.width / PDL.chunkSize);
    var chunkHeight = Math.ceil(PDL.canvas.height / PDL.chunkSize);
    var startChunkX = PDL.clamp(Math.floor(PDL.camX/PDL.chunkSize),0,PDL.maxChunksX)
    var startChunkY = PDL.clamp(Math.floor(PDL.camY/PDL.chunkSize),0,PDL.maxChunksY)
    // console.log(startChunkX,startChunkY,chunkWidth,chunkHeight)

    for (let y = 0; y < chunkHeight+1; y++) {
        for (let x = 0; x < chunkWidth+1; x++) {
            // if(x + startChunkX>PDL.maxChunksX){continue}
            // if(y + startChunkY>PDL.maxChunksY){continue}
            var chunk = PDL.chunks[ PDL.clamp(startChunkY+y,0,PDL.maxChunksY-1) ][ PDL.clamp(startChunkX+x,0,PDL.maxChunksX-1) ];
            if(!chunk){continue}
            //Draw
            PDL.ctx.beginPath();
            if(chunk.live){
                PDL.ctx.fillStyle = "rgba(255,100,80,0.1)"
                PDL.ctx.fillRect(chunk.x-PDL.camX,chunk.y-PDL.camY,PDL.chunkSize,PDL.chunkSize)
            }
            else{
                PDL.ctx.strokeStyle = "rgb(80,80,100)"
                PDL.ctx.rect(chunk.x-PDL.camX, chunk.y-PDL.camY, 200, 200);
                PDL.ctx.stroke();    
            }
            PDL.ctx.font = "10px Arial";
            PDL.ctx.fillStyle = "rgb(255,255,255)"
            PDL.ctx.fillText(`${chunk.x/PDL.chunkSize},${chunk.y/PDL.chunkSize}`,chunk.x-PDL.camX,chunk.y-PDL.camY+10);
        }
    }
}


//Return 2D array of chunks currently on screen
PDL.activeChunks = function(){

    var active = []
    //Get starting screen chunks
    var chunkWidth = Math.ceil(PDL.canvas.width / PDL.chunkSize);
    var chunkHeight = Math.ceil(PDL.canvas.height / PDL.chunkSize);
    var startChunkX = PDL.clamp(Math.floor(PDL.camX/PDL.chunkSize),0,PDL.maxChunksX-1)
    var startChunkY = PDL.clamp(Math.floor(PDL.camY/PDL.chunkSize),0,PDL.maxChunksY-1)

    for (let y = 0; y < chunkHeight+1; y++) {
        var activeRow = []
        for (let x = 0; x < chunkWidth+1; x++) {
            var chunk = PDL.chunks[ PDL.clamp(startChunkY+y,0,PDL.maxChunksY-1) ][ PDL.clamp(startChunkX+x,0,PDL.maxChunksX-1) ];
            a = {x:chunk.ID.x,y:chunk.ID.y};
            activeRow.push(a);
        }
        active.push(activeRow);
    }
    
    return active
}


//Iterate through all active chunks
PDL.iterateChunks = function(time){
    var active = PDL.activeChunks()
    active.forEach(chunkRow => {
        chunkRow.forEach(c =>{
            var chunk = PDL.chunks[c.y][c.x];
            //update shrimp
            if(chunk.shrimps.length>=1){
                chunk.live=true;
                chunk.shrimps.forEach(shrimp => {
                    shrimp.update(time);
                });
            }else{
                chunk.live=false;
            }
        })
    });
}





/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Main Game Loop
*/
//TODO maybe abstract this elsewhere? 
//TODO calculate frame delta and feed to subsequent objects for their timers

puddleUpdate = function(){
    var time = Date.now();

    PDL.drawbG();
    PDL.cameraUpdate();

    // PDL.drawFPS();
 
    // PDL.activeChunks();

    PDL.drawChunks();
    
    PDL.player.update();
    // PDL.drawAllChunks();
	//Update player mouse interaction
    // player.update(time);
    // PDL.shrimps.forEach(shrimp => {
    //     shrimp.update(time)
    // });
    PDL.iterateChunks(time);

    


	PDL.scanLines();
};


setInterval(puddleUpdate,16.667);