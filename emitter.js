
//Creates a '+' particle emitter for healing Blorbs
emitter = function(x,y,amount,decay){
	this.particles = []
	this.x=x; this.y=y;
	this.active = false;
	var self = this;
	//Creates a particle and adds itself to list.
	this.particle = function(x,y,decay){
		this.decay = decay; 		 	//Fade rade
		this.x=x; this.y=y; 		 	//Coords
		this.alpha= -1; 	//Initial alpha
		this.vx=Math.random()-0.5; this.vy=Math.random()-0.5;
		this.update = function(){ //Update & draw the particle
			this.alpha -= this.decay;
			if(this.alpha>-0.9){
				this.x+=this.vx; this.y-=this.vy;
			}else{
				this.alpha=1;
				this.vx=Math.random()-0.5; this.vy=Math.random()-0.5;
				this.x = self.x; this.y = self.y;
			}
			ctx.fillStyle = "rgba(255,0,0,"+this.alpha+")";
			ctx.fillRect(this.x,this.y-4,1,8);
			ctx.fillRect(this.x-4,this.y,8,1);
		}
		self.particles.push(this);
	};
	this.update = function(){ 	//Update the Emitter
		//ctx.fillRect(this.x,this.y-20,10,10);
		if (!this.active){
			for (var i = 0; i < this.particles.length; i++) {
				this.particles[i].alpha=-1; return;
			};
		};
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].update();
		};
	}
	for (var i = 0; i < amount; i++) {this.particles.push(new this.particle(this.x,this.y,decay));}; //Populate local particle array
};