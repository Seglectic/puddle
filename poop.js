
/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
				Excrement Prototype
		Blorbs excrete these objects when they
		metabolize food shrimps into energy.
*/
poop = function(x,y,size){
	this.x = x;
	this.y = y;
	this.vx= 0;
	this.radius = size;
	this.baseAlpha = RNG(0.5,1);
	this.alpha= 0;
	this.outline = RNG(0.5,2)
	this.friction = RNG(0.05,0.1);

	this.update = function(){
		//Remove poop if 'decayed' or offscreen
		if (this.alpha<0 || this.x>PDL.canvas.width){
			poops.splice(poops.indexOf(this),1);
			return;
		}
		//Fade poop into existence
		//if(this.baseAlpha>this.alpha){
			this.alpha += (this.baseAlpha - this.alpha)*0.02
		//}
		
		//'Decay' poop by decrementing alpha
		this.baseAlpha-=0.001;
		//Apply (simple) friction and velocity to poops
		if(this.vx>0){
			this.x+=this.vx;
			this.vx-=this.friction;
		}
		//Set poop x velocity on collision with sweeper to allow sweeping.
		if(this.x<sweeper.x+sweeper.w&this.x>sweeper.x){
			this.vx = sweeper.speed+2;
		}
		this.draw();
	};

	this.draw = function(){
		ctx.fillStyle = "rgba(150,110,20,"+this.alpha+")";
		ctx.strokeStyle = "rgba(120,100,10,"+this.alpha+")";
		ctx.lineWidth = this.outline;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,2*Math.PI,false);
		ctx.fill();
		ctx.stroke();		
	};
};
