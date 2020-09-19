


            // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
            // ┃              Shrimp                     ┃
            // ┃                                         ┃
            // ┃  The smallest creatures living in the   ┃
            // ┃  puddle. These provide the necessary    ┃
            // ┃  nutrients for bigger critters as well  ┃
            // ┃  as some visual flair through activity. ┃
            // ┃                                         ┃
            // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

			//TODO Create a critter prototype using the shrimp as a base to reuse?
PDL.shrimp = function(x,y,vx,vy){
	
	this.x         = x || PDL.origin.x + PDL.RNG(-1,1);
	this.y         = y || PDL.origin.y + PDL.RNG(-1,1);
	this.nutrition = PDL.RNG(30,40,true); //Energy value provided
	this.width     = 4;
	this.height    = 4;
	this.px1       = Math.random()*10; this.py1 = Math.random()*10;
	this.px2       = Math.random()*10; this.py2 = Math.random()*10;
	this.vx        = vx || PDL.RNG(-2,2); 
	this.vy        = vy || PDL.RNG(-2,2);
	this.vTimer    = new Date().getTime();
	this.vInterval = PDL.RNG(400,600,true);
	this.tailX     = this.x; 
	this.tailY     = this.y;
	this.chunk 	   = PDL.chunkPt(this.x,this.y)
	this.lastChunk = this.chunk;
	
	this.chunk.shrimps.push(this) //Push self to chunk for iterating
	
	this.tailColor = "rgb(207,87,87)";
	
	//Set gender and color
	this.female    = PDL.RNG(0,1)>0.5 ? true : false;
	this.female ? 
		this.color = `rgb(${PDL.RNG(150,255)},150,200)`:
		this.color = `rgb(${PDL.RNG(100,150)},150,${PDL.RNG(200,255)})`;

	//Check for wall collisions and bounce 
	//NOTE Giving activating on maximum x and y chunk for some reason? Also need strict collisions to not exceed main map or no chunk will update them
	//FIXME T
	this.wallCollide = function(){
		if (this.x>PDL.width-this.width  ){this.vx=0;this.x-=1;this.veloGet();}
		if (this.x<this                  ){this.vx=0;this.x+=1;this.veloGet();}
		if (this.y>PDL.height-this.height){this.vy=0;this.y-=1;this.veloGet();}
		if (this.y<this.height           ){this.vy=0;this.y+=1;this.veloGet();}
	}
	
	//Get a new velocity for the scrimp
	this.veloGet = function(time){
		if(time<(this.vTimer+this.vInterval)){return};
		this.vTimer = time;
		var i = 0.08
		this.px1 += i;
		this.py1 += i;
		this.px2 += i;
		this.py2 += i;
		this.vx = noise.perlin2(this.px1,this.px2);
		this.vy = noise.perlin2(this.py1,this.py2);
	}
	
	//Update logic and draw ent
	this.update = function(time){

		this.chunk = PDL.chunkPt(this.x,this.y)

		//Place self into active chunk 
		if(this.lastChunk!=this.chunk){ //Remove from prior chunk (if different)		
			var removeIndex = this.lastChunk.shrimps.indexOf(this);
			this.lastChunk.shrimps.splice(removeIndex,1);
			this.lastChunk = this.chunk;
			this.chunk.shrimps.push(this)
		}

		this.veloGet(time);
		//Make tail follow shrimp
		this.tailX += (this.x - this.tailX)*0.2;
		this.tailY += (this.y - this.tailY)*0.2;
		this.wallCollide();
		//Increment velocity
		this.x += this.vx*2;
		this.y += this.vy*2;
		this.draw();
	}
	
	//Manages how ent is drawn
	this.draw = function(){			//FIXME Shrimp are doing weird flickering
		//Draw connecting line
		PDL.ctx.strokeStyle = this.tailColor;
		PDL.ctx.lineWidth = 1;
		PDL.ctx.beginPath();
		PDL.ctx.moveTo(this.x-PDL.camX,this.y-PDL.camY);
		PDL.ctx.lineTo(this.tailX-PDL.camX,this.tailY-PDL.camY);
		PDL.ctx.stroke();
		//Draw Tail
		PDL.ctx.fillStyle = this.tailColor;
		PDL.ctx.fillRect(this.tailX-(this.width/4)-PDL.camX,this.tailY-(this.height/4)-PDL.camY,this.width/2,this.height/2)
		//Draw Body
		PDL.ctx.fillStyle = this.color;
		PDL.ctx.fillRect(this.x-(this.width/2)-PDL.camX,this.y-(this.height/2)-PDL.camY,this.width,this.height)
	}

};

// Spawn shrimp
for (let i = 0; i < 10; i++) {
    new PDL.shrimp()
}
