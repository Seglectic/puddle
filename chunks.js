// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                              Chunks                                 ┃
// ┃  Puddle is divided into chunks for processing only what is within   ┃
// ┃  or near the camera and for inhabitants to reference those nearby.  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

PDL.chunks = [];
PDL.chunkSize = 200; //Pixel size^2 (Should be a multiple of screen height/width)
PDL.maxChunksX = PDL.width/PDL.chunkSize;
PDL.maxChunksY = PDL.height/PDL.chunkSize;


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Create chunks based off   ┃
// ┃  of screen and chunk size  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
PDL.chunkInit = function(){
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
}
PDL.chunkInit();


// Returns the chunk at given coordinates (point)

PDL.chunkPt = function(x,y){
    var x = PDL.clamp( Math.floor(x/PDL.chunkSize) , 0 , PDL.maxChunksX)
    var y = PDL.clamp( Math.floor(y/PDL.chunkSize) , 0 , PDL.maxChunksY)
    // return {x:x,y:y}
    console.log(x,y)
    return PDL.chunks[y][x]
}


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Render chunks to screen and    ┃
// ┃  highlight areas when contains  ┃
// ┃  active life                    ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
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


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Returns a 2D Array of chunks    ┃
// ┃  currently within viewport area  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
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
PDL.crunchChunks = function(time){
    var active = PDL.activeChunks()
    active.forEach(chunkRow => {
        chunkRow.forEach(c =>{
            var chunk = PDL.chunks[c.y][c.x];
            //update shrimp
            if(chunk.shrimps.length>=1){
                chunk.live=true;
                chunk.shrimps.forEach(shrimp => {shrimp.update(time);});
                //NOTE shrimp no longer update when leaving the exterior of the puddle. 
            }else{
                chunk.live=false;
            }
        })
    });
}
