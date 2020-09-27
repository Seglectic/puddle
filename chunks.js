// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                              Chunks                                 ┃
// ┃  Puddle is divided into chunks for processing only what is within   ┃
// ┃  or near the camera and for inhabitants to reference those nearby.  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

PDL.chunks = [];
PDL.chunkDraw = false;  //Should chunk debug be drawn?
PDL.chunkSize = 200; //Pixel size^2 (Should be a multiple of screen height/width)
PDL.maxChunksX = PDL.width/PDL.chunkSize;
PDL.maxChunksY = PDL.height/PDL.chunkSize;


//Chunk prototype, defines a cubic screenspace that
// is iterated at runtime to compartmentalize world
PDL.chunk = function(x,y){
    this.ID =  {x:x,y:y};
    this.x =  x * PDL.chunkSize;
    this.y =  y * PDL.chunkSize;
    this.live =  false;
    this.ents =  [];

    this.update = function(time){
        if(this.ents.length>0){
            this.live = true
            this.ents.forEach(ent => {ent.update(time);});
        }else{
            this.live=false;
        }
    }

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃  Render chunks to screen and    ┃
    // ┃  highlight areas when contains  ┃
    // ┃  active life                    ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    this.draw = function(){
            PDL.ctx.beginPath();
            if(this.live){
                PDL.ctx.fillStyle = "rgba(255,100,80,0.1)"
                PDL.ctx.fillRect(this.x-PDL.camX,this.y-PDL.camY,PDL.chunkSize,PDL.chunkSize)
            }
            else{
                PDL.ctx.strokeStyle = "rgb(80,80,100)"
                PDL.ctx.rect(this.x-PDL.camX, this.y-PDL.camY, 200, 200);
                PDL.ctx.stroke();    
            }
            PDL.ctx.font = "10px Arial";
            PDL.ctx.fillStyle = "rgb(255,255,255)"
            PDL.ctx.fillText(`X${this.x/PDL.chunkSize},Y${this.y/PDL.chunkSize}, ${this.ents.length}`,this.x-PDL.camX,this.y-PDL.camY+10);
    }
}


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Create chunks based off   ┃
// ┃  of screen and chunk size  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
PDL.chunkInit = function(){
    PDL.chunks = []
    for (let y = 0; y < PDL.height/PDL.chunkSize; y++) {
        var chunkRow = [];
        for (let x = 0; x < PDL.width/PDL.chunkSize; x++) {
            var chunk = new PDL.chunk(x,y)
            chunkRow.push(chunk)
        }
        PDL.chunks.push(chunkRow)
    }
}
PDL.chunkInit();


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Returns the chunk at given  ┃
// ┃  coordinates (point)         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
PDL.chunkPt = function(x,y){
    //If the point is outside bounds, no chunk.
    if(!PDL.pointRectCollide(x,y,0,0,PDL.width,PDL.height)){return null;}
    var x = PDL.clamp( Math.floor( x/PDL.chunkSize ) , 0 , PDL.maxChunksX)
    var y = PDL.clamp( Math.floor( y/PDL.chunkSize ) , 0 , PDL.maxChunksY)
    return PDL.chunks[y][x] 
}



// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Returns a 2D Array of chunks    ┃
// ┃  currently within viewport area  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
PDL.activeChunks = function(){
    var active = []
    var buffer = 1; //The amt of extra chunks to render off camera

    for (let y=PDL.camY-(buffer*PDL.chunkSize); y<PDL.canvas.height+PDL.camY+(buffer*PDL.chunkSize); y+=PDL.chunkSize) {
        var activeRow = []
        for (let x = PDL.camX-(buffer*PDL.chunkSize); x < PDL.canvas.width+PDL.camX+(buffer*PDL.chunkSize); x+=PDL.chunkSize) {
            var activeChunk = PDL.chunkPt(x,y);
            if(activeChunk){activeRow.push(activeChunk);}
        }
        if(activeRow.length==0){continue}
        active.push(activeRow);
    }
    return active
}


// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Returns array of chunks adjacent to given point  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
PDL.adjacentChunks = function(x,y){
    var adj = [];
    adj.push(PDL.chunkPt(x,y));                                 // Center
    adj.push(PDL.chunkPt(x-PDL.chunkSize,y-PDL.chunkSize));     // Top Left
    adj.push(PDL.chunkPt(x,y-PDL.chunkSize));                   // Top
    adj.push(PDL.chunkPt(x+PDL.chunkSize,y-PDL.chunkSize));     // Top Right
    adj.push(PDL.chunkPt(x-PDL.chunkSize,y));                   // Left
    adj.push(PDL.chunkPt(x+PDL.chunkSize,y));                   // Right
    adj.push(PDL.chunkPt(x-PDL.chunkSize,y+PDL.chunkSize));     // Bottom Left
    adj.push(PDL.chunkPt(x,y+PDL.chunkSize));                   // Bottom
    adj.push(PDL.chunkPt(x+PDL.chunkSize,y+PDL.chunkSize));     // Bottom Right
    adj = adj.filter(c => c!= null);                            // Filter null chunks out
    return adj
}

//Iterate and update  all active chunks         
PDL.crunchChunks = function(time){
    var active = PDL.activeChunks()
    active.forEach(chunkRow => {
        chunkRow.forEach(chunk =>{
            if(PDL.chunkDraw){
                chunk.draw();
            }

            chunk.update(time);

        })
    });
}
