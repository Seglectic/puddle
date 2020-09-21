// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃          Weed.js                  ┃
// ┃                                   ┃
// ┃  Generates clumps of duckweed     ┃
// ┃  to be littered across the world  ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

//Collides with and bumps against mouse?

PDL.weed = function(x,y,vx,vy){
    this.x         = x || PDL.origin.x + PDL.RNG(-PDL.chunkSize,PDL.chunkSize);
	this.y         = y || PDL.origin.y + PDL.RNG(-PDL.chunkSize,PDL.chunkSize);
	this.vx        = vx || PDL.RNG(-1,1); 
    this.vy        = vy || PDL.RNG(-1,1);
    this.radius    = 5;
    this.bearing   = Math.random()*(Math.PI*2);
    this.friction = 0.1
    
    this.color = `rgb(150,${PDL.RNG(180,255)},${PDL.RNG(100,200)})`;

    this.chunk 	   = PDL.chunkPt(this.x,this.y)
    this.lastChunk = this.chunk;

    this.chunk.ents.push(this) //Push self to chunk for iterating

    this.update = function(){
        
        //Place self into active chunk 
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
        this.vy += (0 - this.vy)*0.2
        this.vx += (0 - this.vx)*0.2


        if(PDL.pointCircleCollide(PDL.mouse.worldX,PDL.mouse.worldY,this.x,this.y,this.radius*2)){

            var moveX = (this.x - PDL.mouse.worldX ) * 0.01;
            var moveY = (this.y - PDL.mouse.worldY ) * 0.01;

            this.vx+= moveX
            this.vy+= moveY
            
            console.log(this.moveX,this.moveY);
        }
        this.draw();
    }

    this.draw = function(){
		//Draw connecting line
		// PDL.ctx.strokeStyle = this.tailColor;
		// PDL.ctx.lineWidth = 1;
		// PDL.ctx.beginPath();
		// PDL.ctx.moveTo(this.x-PDL.camX,this.y-PDL.camY);
		// PDL.ctx.lineTo(this.tailX-PDL.camX,this.tailY-PDL.camY);
		// PDL.ctx.stroke();
		// //Draw Tail
		// PDL.ctx.fillStyle = this.tailColor;
		// PDL.ctx.fillRect(this.tailX-(this.width/4)-PDL.camX,this.tailY-(this.height/4)-PDL.camY,this.width/2,this.height/2)
        //Draw Body
        var worldX = this.x-(this.radius/2)-PDL.camX
        var worldY = this.y-(this.radius/2)-PDL.camY
		PDL.ctx.fillStyle = this.color;
  
    
        PDL.ctx.beginPath();
        PDL.ctx.arc(worldX,worldY,this.radius,0,2*Math.PI)
        PDL.ctx.arc(worldX-(this.radius/0.8),worldY,this.radius,0,2*Math.PI)
        PDL.ctx.arc(worldX+(this.radius*0.8),worldY-(this.radius*0.8),this.radius,0,2*Math.PI)
        PDL.ctx.fill();
	}
}

// Spawn shrimp
for (let i = 0; i < 5; i++) {
    new PDL.weed()
}