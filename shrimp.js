/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Edible Shrimp Prototype
		Blorbs love these! Each shrimp has a nutrition
		attribute that goes toward fueling blorb activity.
*/



PDL.shrimp = function(x,y,vx,vy){
	
	this.x         = 2000 || x;
	this.y         = 2000 || y;
	this.nutrition = PDL.RNG(30,40,true); //Energy value provided
	this.width     = 4;
	this.height    = 4;
	this.px1       = Math.random()*10; this.py1 = Math.random()*10;
	this.px2       = Math.random()*10; this.py2 = Math.random()*10;
	this.vx        = vx || PDL.RNG(-1,1); 
	this.vy        = vy || PDL.RNG(-1,1);
	this.vTimer    = new Date().getTime();
	this.vInterval = PDL.RNG(400,600,true);
	this.tailX     = this.x; 
	this.tailY     = this.y;
	this.color     = "rgb(195,150,200)";
	this.tailColor = "rgb(207,87,87)";

	//Check for wall collisions and bounce //FIXME fix this from not using PDL size, maybe use / make rect collision func in init
	this.wallCollide = function(){
		if (this.x>PDL.canvas.width-this.width){this.vx=0;this.x-=1;this.veloGet();};
		if (this.x<this.width){this.vx=0;this.x+=1;this.veloGet();}
		if (this.y>PDL.canvas.height-this.height){this.vy=0;this.y-=1;this.veloGet();};
		if (this.y<this.height){this.vy=0;this.y+=1;this.veloGet();}
	}
	
	//Get a new velocity for the scrimp
	this.veloGet = function(time){
		if(time<(this.vTimer+this.vInterval)){return};
		this.vTimer = time;
		var i = 0.02
		this.px1 += i;
		this.py1 += i;
		this.px2 += i;
		this.py2 += i;
		this.vx = noise.perlin2(this.px1,this.px2);
		this.vy = noise.perlin2(this.py1,this.py2);
	}
	
	//Update logic and draw ent
	this.update = function(time){
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
	this.draw = function(){
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
	PDL.shrimps.push(this);
};

// //Constantly keep shrimp spawned
// shrimpSpawn = function(){
// 	if (shrimps.length<=5){
// 		for (var i = 0; shrimps.length < 20; i++) {
// 			new shrimp();
// 		};		
// 	};
// };

// Spawn shrimp
for (let i = 0; i < 50; i++) {
    new PDL.shrimp()
}
