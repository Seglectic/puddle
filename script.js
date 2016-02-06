/*
							PUDDLE
						
		Puddle is an environment for cellular automata 
		called "Blorbs" to eke out their lives within
		your browser. They are born, eat, poop and die.

		Please appreciate them.
*/

blorbs = [];
poops = [];
pellets = [];



/*
				  Environment Setup
		This section is for the preparation of
		the web environment to allow to for a 
		a decent browser experience
*/

canvas = document.createElement("canvas");
canvas.id = "game";
canvas.height=window.innerHeight-22;
canvas.width=window.innerWidth-22;
c = canvas.getContext("2d");
document.body.appendChild(canvas);

//Disable right-click context menu
canvas.oncontextmenu = function (e) {e.preventDefault();};



/*
				General-Purpose Function Declaration
		This section reserved for general functions that find
		use throughout puddle and not specific to any object
*/

//Check if 2D point within circle (point x, point y, (x,y,radius) of circle)
pointCircleCollide = function(px,py,x,y,r){
	x -= r;
	y -= r;
	w = (r*2);
	h = (r*2);
	if(px>x&px<x+w&py>y&py<y+h){return true;}
	else{return false;}
};

//Check if 2D point within rectangle (point x, point y, (x,y,width,height) of rect)
pointRectCollide = function(px,py,x,y,w,h){
	if(px>x&px<x+w&py>y&py<y+h){return true;}
};

//Return 2D distance
distance = function(x1,y1,x2,y2){
	var d = Math.sqrt( ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1)) );
	return d;
};

//Check collision between two circles
circleCollide = function(x1,y1,r1,x2,y2,r2){
	var d = distance(x1,y1,x2,y2);
	var rDist = r1+r2
	if (d<=rDist){return true;}
	else{return false;}
}

//Random range from min-max, bool int if rounding
RNG = function(min,max,int){
	var RNG = (Math.random()*(max-min))+min;
	if (int){RNG = Math.floor(RNG);}
	return RNG;
};



/*
				Mouse Interaction
		Creates a global mouse object for 
		handling viewer's mouse interaction.
*/
mouse = function(){
	this.x= -100;
	this.y= -100;
	this.lClick= false;
	this.rClick= false;

	this.mouseMove = function(e){
		var env = canvas.getBoundingClientRect();
		mouse.x=e.clientX-env.left;
		mouse.y=e.clientY-env.top;		
	}
	canvas.addEventListener('mousemove',this.mouseMove)

	this.mouseDown = function(e){
		if (e.buttons==1){mouse.lClick=true;}
	};
	canvas.addEventListener('mousedown',this.mouseDown);

	this.mouseUp = function(e){
		if (e.buttons==0){mouse.lClick=false;}
	};
	canvas.addEventListener('mouseup',this.mouseUp);
}
mouse();



/*
				Blorb Object Prototype
		These are the main characters of puddle;
		roaming about, eating food, shitting and
		dying are their main past-times.
*/
blorb = function(){
	//Genetic properties
	this.baseRadius = RNG(5,10); //Starting r
	this.radius = this.baseRadius;		  //Current r
	this.x = RNG(this.radius,canvas.width-this.radius);
	this.y = RNG(this.radius,canvas.height-this.radius);
	//Initial velocities (5 is quite fast)
	this.vx = RNG(-3,3);  
	this.vy = RNG(-3,3);
	this.arc = 0;
	this.strokeClr = {r:20,g:20,b:90};
	this.fillClr = {r:20,g:200,b:20};
	//How thick to draw the line around nucleus
	this.baseMembrane = 5;
	this.membrane = this.baseMembrane; 
	//How often to roam
	this.roamTimer = new Date().getTime() + RNG(2000,3000);
	this.roamInterval = RNG(1000,3000);
	this.jigIntensity = (this.roamInterval/1000)*RNG(1,5,true);
	//How often to convery food into energy
	this.metabolicTimer = new Date().getTime()+(Math.random()*5000);
	this.metabolicInterval = RNG(5000,10000);
	//How quickly to rot
	this.rotTimer = new Date().getTime();
	this.rotInterval = 100;
	//Health properties
	this.beatTimer = new Date().getTime();	//How often to pulsate
	this.heart = 1;							//Requires delta for Blorb to function
	this.hp = 100;							//Health level
	this.energy = 20;						//Stored energy used for movement
	this.gut = 100; 							//How much food in stomach
	this.CND= "UNKNOWN";					//Current status
	this.foodTarget = null; 				//Reference to desired object
	//Sniff circle properties
	this.sniffing = false;
	this.sniffRange = 50;
	this.sniffRadius = 0;
	this.sniffAlpha = 1;
	this.sniffSpeed = 1;
	this.sniffTimer = new Date().getTime();
	this.sniffInterval = RNG(1000,4000);
	this.baseSniffInterval = this.sniffInterval;

	//Check for collision vs other Blorbs
	this.blorbCollide = function(){
		var me = blorbs.indexOf(this);  //Index of local blorb
		for (var i = 0; i < blorbs.length; i++) {
			var b = blorbs[i]

			//If self, continue
			if (me == i){continue};	
			//If not near enough to collide, continue
			if(!( this.x + this.radius + b.radius + this.membrane + b.membrane >b.x 
				& this.x < b.x + this.radius + b.radius  + this.membrane + b.membrane
				& this.y + this.radius + b.radius + this.membrane + b.membrane > b.y	
				& this.y < b.y + this.radius + b.radius + this.membrane + b.membrane))
			{
				continue;
			}

			//If actual circle collision fails, continue
			if(!circleCollide(this.x,this.y,this.radius,b.x,b.y,b.radius)){
				continue;
			}

			//Invert velocity upon collision
			this.vx*=-1; this.vy*=-1;
			b.vx*=-1; b.vy* -1;
			this.x+=this.vx; this.y+=this.vy;
			b.x+=b.vx; b.y+=b.vy;
			
			/*Elastic collision:
			var mass1 = this.radius*10;
			var mass2 = b.radius*10;
			this.vx = (this.vx * (mass1 - mass2) + (2 * mass2 * b.vx)) / (mass1 + mass2);
			this.vy = (this.vy * (mass1 - mass2) + (2 * mass2 * b.vy)) / (mass1 + mass2);
			b.vx = (b.vx * (mass2 - mass1) + (2 * mass1 * this.vx)) / (mass1 + mass2);
			b.vy = (b.vy * (mass2 - mass1) + (2 * mass1 * this.vy)) / (mass1 + mass2);
			*/
		};
	}

	this.heartBeat = function(){
		if(this.energy<=0){return false};
		this.energy -= 0.01;
		this.heart *= -1;

		if(this.heart==1){
			this.fillClr.r = 20;
			this.fillClr.g = 200;
		}else{
			this.fillClr.r = 100;
			this.fillClr.g = 150;
		}
		return true;
	}

	//Move blorb according to velocity
	this.move = function(){
		if(this.CND == "DECEASED"){return}
		this.x += this.vx;
		this.y += this.vy;
		//Bounce Blorb on wall collision
		var size = this.radius+this.membrane
		if (this.x+size>canvas.width){
			this.x = canvas.width-size;
			this.vx*= -0.8;
		};
		if (this.x<size){
			this.x = size;
			this.vx*= -0.8;
		}

		if (this.y+size>canvas.height){
			this.y = canvas.height-size;
			this.vy*= -0.8;
		};
		if (this.y<size){
			this.y = size;
			this.vy*= -0.8;
		}
		//Apply friction
		this.vx += (0 - this.vx)*0.03;
		this.vy += (0 - this.vy)*0.03;
	}

	//Updates blorb velocity at interval
	this.roam = function(time){
		if(this.energy<=0){return};
		if(time<(this.roamTimer+this.roamInterval) & !this.foodTarget){return};
		this.roamTimer = time;
		//Randomize velocity vector	
		this.vx = RNG(-2,2);
		this.vy = RNG(-2,2);
		//Consume energy based on velocity magnitude average
		this.energy -= (this.vx+this.vy)/2;
	};

	//Sniffs for nearby food pellets
	this.sniff = function(time){
		if(this.energy<=0 || this.foodTarget!= null){return;}
		if (time<(this.sniffTimer+this.sniffInterval)){return};

		if(this.condition == "HAPPY"){
			this.sniffInterval = this.baseSniffInterval; 
			this.sniffRange=50;
			this.sniffSpeed = 1;
		};
		if(this.condition == "HUNGRY"){
			this.sniffInterval=RNG(500,2000); 
			this.sniffRange=100;
			this.sniffSpeed = 2;
		};
		if(this.condition == "DYING"){
			this.sniffInterval = RNG(100,300); 
			this.sniffRange=150
			this.sniffSpeed = 3;
		}

		if (this.sniffRadius>this.sniffRange){
			this.sniffTimer = time;
			this.sniffAlpha = 1;
			this.sniffRadius = 0;
		}
		this.sniffRadius += this.sniffSpeed;
		this.sniffAlpha = (1-(this.sniffRadius/this.sniffRange))*0.4;

		for (var i = pellets.length - 1; i >= 0; i--) {
			var p = pellets[i];
			var dist = distance(p.x,p.y,this.x,this.y)
			if(dist<this.sniffRadius){ 
				this.foodTarget = p;
				this.sniffTimer = time;
				this.sniffAlpha = 1;
				this.sniffRadius = 0;
				break;
			}
		};
	}

	//Move toward food if located
	this.nomf = function(){
		var p = this.foodTarget;
		if(this.gut>200){this.foodTarget = null; return;}
		if(this.foodTarget == null){return;}
		//Calculate direction
		this.vx = (p.x - this.x)*0.1;
		this.vy = (p.y - this.y)*0.1;

		if(distance(p.x,p.y,this.x,this.y)<this.radius&this.energy>=1){
			this.gut+=p.nutrition;
			this.foodTarget=null;
			pellets.splice(pellets.indexOf(p),1);
		}
	}

	//Give blorb different proportions based on food levels
	this.fat = function(){
		var fat = this.baseMembrane * (this.energy/50) 
		var nucleus = this.baseRadius*(this.gut/100)+5
		if(nucleus<5){nucleus=5;}
		if(fat<3){fat=3;}
		this.membrane += fat-this.membrane;
		this.radius += (nucleus-this.radius); 
	}

	//Turn food in gut into energy
	this.metabolize = function(time){
		if(time<(this.metabolicTimer+this.metabolicInterval)){return;}
		this.metabolicTimer = time;
		
		//Take units from gut and convert to energy
		if(this.gut>0&this.energy<100){
			var digest = RNG(5,15);
			if (digest>this.gut){digest = this.gut} //Prevents overdrawing
			this.gut-= digest;
			this.energy+= digest*0.8;
			if (this.energy>100){this.energy=100}
			poops.push(new poop(this.x,this.y,digest*0.2)); //haha; push poops.
		}

		//Convert HP into energy when starving
		if(this.energy<=0&this.gut<=0&this.hp>0){
			var atrophy = RNG(5,10)
			if (atrophy>this.hp){atrophy=this.hp}
			this.hp -= atrophy;
			this.energy+= atrophy*0.6;
			if(this.energy>100){this.energy=100;}
		}

		//Convert energy to HP when hurt
		if(this.hp>100&this.energy>=3){
			this.hp+=RNG(10,20);
			this.energy-=3;
			if(this.hp>100){this.hp=100;}
		}
		this.energy = Math.floor(this.energy);
	};

	//Determines what should be done when Blorbs are dead
	this.rot = function(time){
		if(time<(this.rotTimer+this.rotInterval)){return;}
		this.rotTimer = time;
		if(this.fillClr.r < 40){
			this.fillClr.r += 1;
		}	
		if(this.fillClr.g > 0){
			this.fillClr.g -= 1;
		}
		if(this.strokeClr.r < 255){
			this.strokeClr.r +=1;
		}
		if(this.strokeClr.g < 255){
			this.strokeClr.g +=1;
		}
		if(this.strokeClr.b < 255){
			this.strokeClr.b +=1;
		}

	};

	//Analyze condition of Blorb
	this.condition = function(){
		if(this.energy<=0){
			this.CND = "TIRED";
		}
		if(this.gut>0&this.energy>0&this.hp>0){
			this.CND="HAPPY";
		}
		if(this.gut>200){
			this.CND = "FULL";
		}
		if(this.gut<=0){
			this.CND="HUNGRY";
		}
		if(this.gut<=0&this.energy<=0){
			this.CND="DYING";
		}
		if(this.hp<=0&this.energy<=0){
			this.CND="DECEASED";
		}
	}


	//Draw textual information about blorb nearby.
	this.info = function(){
		var fontSize = 12
		var y = this.y-this.radius-fontSize;
		var r = Math.floor(this.radius)
		//Move text to left when on right of screen
		if(this.x<canvas.width/2){var x = this.x+this.radius+20;}
		else{var x = this.x-(this.radius)-120}
		c.fillStyle = "White";
		c.font = (fontSize+"px Lucida Console")
		var name = "Blorb #"+blorbs.indexOf(this)+" ["+this.CND+"]";
		var energy = "Energy: "+Math.floor(this.energy);
		//var energy = "POS: "+this.x+' '+this.y;
		var hp = "Health: "+Math.floor(this.hp);
		var gut = "Gut: "+Math.floor(this.gut)+"% full"
		c.fillText(name,x,y)
		c.fillText(energy,x,y+fontSize)
		c.fillText(hp,x,y+(fontSize*2))
		c.fillText(gut,x,y+(fontSize*3))
	}

	//Blorb update logic
	this.update = function(time){
		if(this.arc>-2){this.draw();return;} //Let arc spin before beginning logic
		//this.heartBeat();
		
		this.sniff(time);
		this.nomf();
		this.condition();		
		this.move();
		this.roam(time);
		this.blorbCollide()
		this.metabolize(time);
		
		if (this.CND ==="DECEASED"){
			this.rot(time);
		}
		this.draw();
	};

	//Render blorb
	this.draw = function(){
		//Draw sniffSpheres
		c.lineWidth = 2;
		c.strokeStyle = "rgba(255,255,255,"+this.sniffAlpha+")";
		c.beginPath();
		c.arc(this.x,this.y,this.sniffRadius,2*Math.PI,false);
		c.stroke();

		this.fat();
		if (this.arc>-2){this.arc-=Math.random()*0.05}
		var f = this.fillClr;
		var s = this.strokeClr;
		c.fillStyle = "rgba("+this.fillClr.r+","+this.fillClr.g+","+this.fillClr.b+",1)";
		c.strokeStyle = "rgba("+this.strokeClr.r+","+this.strokeClr.g+","+this.strokeClr.b+",1)";
		c.lineWidth = this.membrane;
		c.beginPath();
		c.arc(this.x,this.y,this.radius,this.arc*Math.PI,false);
		if(this.arc<=-2){c.fill();}
		c.stroke();
	};
}




/*
					Edible Food Pellet Prototype
		Blorbs love these! Each food object has a nutrition
		attribute that goes toward fueling blorb activity.
*/

pellet = function(x,y){
	var self = this;
	this.x= x;
	this.y= y;
	this.nutrition = RNG(20,40,true); 		//Energy value provided
	var sizePercent = (this.nutrition/40)*5
	this.w = sizePercent*2;
	this.h = sizePercent;
	this.alpha=0;
	this.particles = [];					//Holds particles to be emitted

	this.particle = function(){
		this.life = RNG(100,200);
		this.x = self.x;
		this.y = self.y;
		this.vx = RNG(-1,1);
		this.vy = RNG(-1,1);
		this.life= new 

		this.update = function(){
			this.x+=this.vx;
			this.y+=this.vy;
			c.fillRect(this.x-self.w/2,this.y-self.h/2,1,1);
		}
	}

	for (var i = 0; i < 3; i++) {
		//this.particles.push(new this.particle) //Currently laggy
	};

	this.update = function(){
		if (this.alpha<1){this.alpha+=0.01;}
		this.draw();

		for (var i = 0; i < this.particles.length; i++) {
			var p = this.particles[i];
			p.update();
		};
	};

	this.draw = function(){
		c.fillStyle = "rgba(250,50,150,"+this.alpha+")";
		c.fillRect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
	};
}

//Constantly keep food spawned around screen
pelletSpawn = function(){
	if (pellets.length<=5){
		for (var i = 0; pellets.length < 20; i++) {
			pellets.push(new pellet(RNG(50,canvas.width-50),RNG(50,canvas.height-50)) )
		};		
	}
}

/*
				Excrement Prototype
		Blorbs excrete these objects when they
		metabolize food pellets into energy.
*/
poop = function(x,y,size){
	this.x = x;
	this.y = y;
	this.radius = size;
	this.baseAlpha = RNG(0.5,1);
	this.alpha= 0;
	this.outline = RNG(0.5,2)
	this.update = function(){
		this.draw();
		this.alpha += (this.baseAlpha - this.alpha)*0.02
		this.baseAlpha-=0.001;
		if (this.alpha<0){
			poops.splice(poops.indexOf(this),1)
			return
		}
	};

	this.draw = function(){
		c.fillStyle = "rgba(150,110,20,"+this.alpha+")";
		c.strokeStyle = "rgba(120,100,10,"+this.alpha+")";
		c.lineWidth = this.outline;
		c.beginPath();
		c.arc(this.x,this.y,this.radius,2*Math.PI,false);
		c.fill();
		c.stroke();		
	};
}



/*
					PUDDLE SETUP
		Sets up the puddle with initialization 
		of globals and initial Blorb creation.
*/

for (var i = 0; i < 20; i++) {
	blorbs.push(new blorb());
};



/*
					VISUAL FX
		Defines some fancy/necessary routines
		for painting to our canvas.
*/

//Draw puddle background
drawbG = function(){
    c.fillStyle= "rgba(50,50,100,0.6)";
    c.fillRect(0,0,canvas.width,canvas.height);
};

//Draw scanlines
scanLines = function(){
    for (line=1;line<=canvas.height;line+=2){
        c.fillStyle="rgba(0,0,100,0.1)";
        c.fillRect(0,line,canvas.width,1);
    }
}


/*
					MAIN GAME UPDATE LOOP
			All magic called from this function
*/

puddleUpdate = function(){
	drawbG();
	var time = new Date().getTime();

	//Automatically spawn pellets?
	pelletSpawn();

	/*Update poops*/
	for (var i = poops.length - 1; i >= 0; i--) {
		var poop = poops[i];
		poop.update();

	};

	/*Update food pellets*/
	for (var i = pellets.length - 1; i >= 0; i--) {
		var p = pellets[i];
		p.update();

	};

	/*Update Blorbs*/
	for (var i = blorbs.length - 1; i >= 0; i--) {
		var blorb = blorbs[i];
		blorb.update(time);

		// Draw info near cursor
		if(distance(blorb.x,blorb.y,mouse.x,mouse.y)<80){
			blorb.info();
			c.strokeStyle = "rgb(200,200,200)";
			c.lineWidth = 1;
			c.beginPath();
			c.moveTo(mouse.x,mouse.y);
			c.lineTo(blorb.x,blorb.y);
			c.stroke();
		}
	};


	//Click to create pellets
	if(mouse.lClick){
		if (pellets.length<100){
			pellets.push(new pellet(mouse.x,mouse.y));
		}
	}
	
	scanLines();
};


setInterval(puddleUpdate,20);