// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃          Weed.js                  ┃
// ┃                                   ┃
// ┃  Generates clumps of duckweed     ┃
// ┃  to be littered across the world  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

//Collides with and bumps against mouse?

PDL.weed = function(x,y,vx,vy){
    this.x         = x || PDL.origin.x + PDL.RNG(-PDL.chunkSize*10,PDL.chunkSize*10);
	this.y         = y || PDL.origin.y + PDL.RNG(-PDL.chunkSize*10,PDL.chunkSize*10);
	this.vx        = vx || PDL.RNG(-0.2,0.2); 
    this.vy        = vy || PDL.RNG(-0.2,0.2);
    this.radius    = 5;
    this.bearing   = Math.random()*(Math.PI*2);
    this.friction = 0.1

    //Pad spacings?
    this.padSpace = this.radius;
    this.pad1X = PDL.RNG(-this.padSpace,this.padSpace);
    this.pad1Y = PDL.RNG(-this.padSpace,this.padSpace);
    this.pad2X = PDL.RNG(-this.padSpace,this.padSpace);
    this.pad2Y = PDL.RNG(-this.padSpace,this.padSpace);
    
    this.color = `rgb(150,${PDL.RNG(180,255)},${PDL.RNG(100,200)})`;

    this.chunk 	   = PDL.chunkPt(this.x,this.y)
    this.lastChunk = this.chunk;

    this.chunk.ents.push(this) //Push self to chunk for iterating

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃  Process collision with other entities  ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    //FIXME We probably want a main physics object that applies collisions to each object in the canvas per-frame 
    this.collide = function(){
        var ents = []; //Ents to collide against
        PDL.adjacentChunks(this.x,this.y).forEach(c => {
            c.ents.forEach(e=>{
                if(this != e){
                    ents.push(e);
                }
            });
        });

        ents.forEach(e => {
                var dist = PDL.distance(e.x,e.y,this.x,this.y);

                if(dist<this.radius*2.5){
                    this.vx -= (e.x-this.x) * 0.05;
                    this.vy -= (e.y-this.y) * 0.05;
                    e.vx    -= (this.x-e.x) * 0.05;
                    e.vy    -= (this.y-e.y) * 0.05;
                }
        });


    }

    // ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Update Weed                                                                                                      │
    // └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
    this.update = function(){
        
        //Place self into active chunk 
        this.chunk = PDL.chunkPt(this.x,this.y)
		if(this.lastChunk!=this.chunk){ //Remove from prior chunk (if different)		
			var removeIndex = this.lastChunk.ents.indexOf(this);
			this.lastChunk.ents.splice(removeIndex,1);
			this.lastChunk = this.chunk;
			this.chunk.ents.push(this)
        }

        //Move according to velocity
        this.x += this.vx*2;
        this.y += this.vy*2;
        
        //Apply Friction
        // this.vx>0 ? this.vx-=this.friction : this.vx=0;
        // this.vy>0 ? this.vy-=this.friction : this.vy=0;
        this.vy += (0 - this.vy)*this.friction
        this.vx += (0 - this.vx)*this.friction


        if(PDL.pointCircleCollide(PDL.mouse.worldX,PDL.mouse.worldY,this.x,this.y,this.radius*4)){
            var moveX = (this.x - PDL.mouse.worldX ) * 0.01;
            var moveY = (this.y - PDL.mouse.worldY ) * 0.01;
            this.vx+= moveX
            this.vy+= moveY
        }
        this.collide();
        this.draw();
    }


    // ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Draw Weed                                                                                                        │
    // └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
    this.draw = function(){
        //Draw Body
        var worldX = this.x-(this.radius/2)-PDL.camX
        var worldY = this.y-(this.radius/2)-PDL.camY
		PDL.ctx.fillStyle = this.color;
  
    
        PDL.ctx.beginPath();
        PDL.ctx.arc(worldX,worldY,this.radius,0,2*Math.PI)
        PDL.ctx.fill();
        PDL.ctx.beginPath();
        PDL.ctx.arc(worldX+this.pad1X,worldY+this.pad1Y,this.radius,0,2*Math.PI)
        PDL.ctx.fill();
        PDL.ctx.beginPath();
        PDL.ctx.arc(worldX+this.pad2X,worldY+this.pad2Y,this.radius,0,2*Math.PI)
        // PDL.ctx.arc(worldX+(this.radius*0.8),worldY-(this.radius*0.8),this.radius,0,2*Math.PI)
        PDL.ctx.fill();
	}
}

