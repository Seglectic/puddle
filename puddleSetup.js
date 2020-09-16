// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Puddle Setup                                                                                                     ┃
// ┃                                                                                                                   ┃
// ┃  Prepares the puddle for creatures to inhabit                                                                     ┃
// ┃  as well as spawning  initial inhabitants                                                                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


// Puddle width & height in pixels
PDL.width = 4000;
PDL.height = 4000;
PDL.origin = {x:PDL.canvas.width/2, y:PDL.canvas.height/2};
//Camera render offsets (Centered)
PDL.camX = (PDL.width/2)  - (PDL.canvas.height/2);
PDL.camY = (PDL.height/2) - (PDL.canvas.width/2);



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
            x: x * PDL.chunkSize,
            y: y * PDL.chunkSize
        };
        chunkRow.push(chunk)
    }
    PDL.chunks.push(chunkRow)
}

// console.log(PDL.chunks[0][0])



//Creature containers
PDL.shrimps = [];

/*
					VISUAL FX
		Defines some fancy/necessary routines
		for painting to our PDL.canvas.
*/

//Draw puddle background
PDL.drawbG = function(){
    PDL.ctx.fillStyle= "rgba(50,50,100,0.6)";
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

//Draw debug chunks only within visible screen area
PDL.drawChunks = function(){ //FIXME Gives out of range errors, maybe make a separate method to pull 2d array from on-screen chunks

    //Get starting screen chunks
    var chunkWidth = Math.ceil(PDL.canvas.width / PDL.chunkSize);
    var chunkHeight = Math.ceil(PDL.canvas.height / PDL.chunkSize);
    var startChunkX = PDL.clamp(Math.floor(PDL.camX/PDL.chunkSize),0,PDL.maxChunksX)
    var startChunkY = PDL.clamp(Math.floor(PDL.camY/PDL.chunkSize),0,PDL.maxChunksY)
    console.log(startChunkX,startChunkY,chunkWidth,chunkHeight)

    for (let y = 0; y < chunkHeight+1; y++) {
        for (let x = 0; x < chunkWidth+1; x++) {
            // if(x + startChunkX>PDL.maxChunksX){continue}
            // if(y + startChunkY>PDL.maxChunksY){continue}
            var chunk = PDL.chunks[ PDL.clamp(startChunkY+y,0,PDL.maxChunksY) ][ PDL.clamp(startChunkX+x,0,PDL.maxChunksX) ];
            if(!chunk){continue}
            //Draw
            PDL.ctx.beginPath();
            PDL.ctx.strokeStyle = "rgb(80,80,100)"
            PDL.ctx.rect(chunk.x-PDL.camX, chunk.y-PDL.camY, 200, 200);
            PDL.ctx.stroke();
            PDL.ctx.font = "10px Arial";
            PDL.ctx.fillStyle = "rgb(255,255,255)"
            PDL.ctx.fillText(`${chunk.x/PDL.chunkSize},${chunk.y/PDL.chunkSize}`,chunk.x-PDL.camX,chunk.y-PDL.camY+10);
        }
    }
}

PDL.drawAllChunks = function(){
    var chunkWidth = Math.ceil(PDL.canvas.width / PDL.chunkSize);
    var chunkHeight = Math.ceil(PDL.canvas.height / PDL.chunkSize);
    for (let y = 0; y < PDL.maxChunksY; y++) {
        for (let x = 0; x < PDL.maxChunksX; x++) {
            var chunk = PDL.chunks[y][x];
            PDL.ctx.beginPath();
            PDL.ctx.strokeStyle = "rgb(80,80,100)"
            PDL.ctx.rect(chunk.x-PDL.camX, chunk.y-PDL.camY, 200, 200);
            PDL.ctx.stroke();
            PDL.ctx.font = "10px Arial";
            PDL.ctx.fillStyle = "rgb(255,255,255)"
            PDL.ctx.fillText(`${chunk.x},${chunk.y}`,chunk.x-PDL.camX,chunk.y-PDL.camY+10);
        }
    }
}




/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Main Game Loop
*/

puddleUpdate = function(){
    PDL.drawbG();

    // PDL.drawFPS();
    PDL.drawChunks();
    // PDL.drawAllChunks();
	//Update player mouse interaction
    // player.update(time);
    PDL.shrimps.forEach(shrimp => {
        shrimp.update()
    });
	
	PDL.scanLines();
};


setInterval(puddleUpdate,16.667);