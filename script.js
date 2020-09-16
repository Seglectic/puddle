/*
							PUDDLE
						
		Puddle is an environment for cellular automata 
		called "Blorbs" to eke out their lives within
		your browser. They are born, eat, poop and die.

		Please appreciate them.
*/



/*
				  Environment Setup
		This section is for the preparation of
		the web environment to allow to for a 
		a decent browser experience
*/

canvas = document.createElement("canvas");
canvas.id = "game";
canvas.height=window.innerHeight-10;
canvas.width=window.innerWidth-10;
c = canvas.getContext("2d");
document.body.appendChild(canvas);

//Disable right-click context menu
canvas.oncontextmenu = function (e) {e.preventDefault();};



/*
				General-Purpose Functions
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

/**
 * Return 2D distance
 */
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

//Random range from [min] to [max], bool [int] if rounding
RNG = function(min,max,int){
	var RNG = (Math.random()*(max-min))+min;
	if (int){RNG = Math.floor(RNG);}
	return RNG;
};

codeName = function(){
	var code = ['cute','sly','lone','rancid','dancing','psycho','awkward','quiet','loud','snapping','sea','blue','red','green','tiny','mini','cold','hot','hyper','mellow','tasty','nasty','kawaii','ultra']
	var naem = ['Eagle','Owl','Rat','Leopard','Monkey','Snail','Turtle','Cactus','Eel','Salmon','Hedgehog','Bear','Wolf','Coyote','Ox','Frog','Octopus','Squid','Okapi','Ant','Narwhal','Crab','Shrimp','Cicada','Moth','Cobra','Mantis','Viper','Osprey','Pig','Blorb'] 
	return code[Math.floor(Math.random()*code.length)]+naem[Math.floor(Math.random()*naem.length)];
}

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
			c.fillStyle = "rgba(255,0,0,"+this.alpha+")";
			c.fillRect(this.x,this.y-4,1,8);
			c.fillRect(this.x-4,this.y,8,1);
		}
		self.particles.push(this);
	};
	this.update = function(){ 	//Update the Emitter
		//c.fillRect(this.x,this.y-20,10,10);
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




/*
				Mouse Interaction
		Creates a global mouse object for 
		handling viewer's mouse interaction.
*/
mouse = function(){
	this.x       = -100;
	this.y       = -100;
	this.prevX   = 0;
	this.prevY   = 0;
	this.vx      = 0;
	this.vy      = 0;
	this.lClick  = false;
	this.rClick  = false;
	this.mClick  = false;
	this.lrClick = false;

	this.mouseMove = function(e){
		var env     = canvas.getBoundingClientRect();
		mouse.x     =e.clientX-env.left;
		mouse.y     =e.clientY-env.top;
		mouse.vx 	= mouse.x - mouse.prevX;
		mouse.vy 	= mouse.y - mouse.prevY;
		mouse.prevX = mouse.x;
		mouse.prevY = mouse.y;
	}
	canvas.addEventListener('mousemove',this.mouseMove)

	this.mouseDown = function(e){
		if (e.buttons==1){mouse.lClick=true;}
		if (e.buttons==2){mouse.rClick=true;}
		if (e.buttons==3){mouse.lrClick=true;}
		if (e.buttons==4){mouse.mClick=true;}

	};
	canvas.addEventListener('mousedown',this.mouseDown);

	this.mouseUp = function(e){
		if (e.buttons==0){
			mouse.lClick=false;
			mouse.rClick=false;
			mouse.lrClick=false;
			mouse.mClick=false;
		}
	};
	canvas.addEventListener('mouseup',this.mouseUp);
}
mouse();





/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Edible Shrimp Prototype
		Blorbs love these! Each shrimp has a nutrition
		attribute that goes toward fueling blorb activity.
*/

shrimps = [];


for (var i = 0; i < 20; i++) {
	new shrimp();
}


//Constantly keep shrimp spawned
shrimpSpawn = function(){
	if (shrimps.length<=5){
		for (var i = 0; shrimps.length < 20; i++) {
			new shrimp();
		};		
	};
};





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
		if (this.alpha<0 || this.x>canvas.width){
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
		c.fillStyle = "rgba(150,110,20,"+this.alpha+")";
		c.strokeStyle = "rgba(120,100,10,"+this.alpha+")";
		c.lineWidth = this.outline;
		c.beginPath();
		c.arc(this.x,this.y,this.radius,2*Math.PI,false);
		c.fill();
		c.stroke();		
	};
};


/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
				Sweeper Entity
		The sweeper is a bar that sweeps poops
		away as it passes across the screen.
*/
sweeper = function(){
	this.x = -10;
	this.speed = 5;
	this.w = 5;
	this.active = true;

	this.update = function(){
		if (mouse.rClick){
			this.x+=this.speed;
			this.draw();
		}
		if(this.x>canvas.width+10){this.x=-10;}
	}

	this.draw = function(){
		if(this.x<0){return};
		c.fillStyle= "rgba(255,255,255,0.25)"
		c.fillRect(this.x,0,this.w,canvas.height);

	}
}
sweeper = new sweeper();



/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Player
		Manages the input object that
		can place entities into Puddle
*/
player = function(){
	this.shrimpInterval = 100;
	this.spawnFlag = true;
	this.shrimpTimer = new Date().getTime();
	this.update = function(time){
		
		//left-Click to create shrimps
		if(mouse.lClick & time>this.shrimpTimer){
			this.shrimpTimer = time+this.shrimpInterval;
			if (shrimps.length<200){
				new shrimp(mouse.x,mouse.y,mouse.vx,mouse.vy); 
			}
		}

		//Spawn a Blorb on middle-click; delimit to mouseDown
		if(mouse.mClick){
			if(this.spawnFlag & blorbs.length<50){blorbs.push(new blorb(mouse.x,mouse.y))}
			this.spawnFlag=false;
		}else{this.spawnFlag=true;}

		if(mouse.lrClick){
			//blorbs = [];
			shrimps = [];
		}
	}
};
player = new player();


/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					PUDDLE SETUP
		Sets up the puddle with initialization 
		of globals and initial Blorb creation.
*/
blorbs = [];
shrimps = []
poops = [];

for (var i = 0; i < 20; i++) {
	blorbs.push(new amoeba());
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


/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Main Game Loop
*/

puddleUpdate = function(){
	drawbG();
	shrimpSpawn();
	var time = new Date().getTime();

	// Update Sweeper entity
	sweeper.update();

	/*Update poops*/
	for (var i = poops.length - 1; i >= 0; i--) {
		var poop = poops[i];
		poop.update();
	};
	
	/*Update shrimps*/
	for (var i = 0; i < shrimps.length; i++) {
		shrimps[i].update(time);
	}

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


	//Update player mouse interaction
	player.update(time);
	
	scanLines();
};


setInterval(puddleUpdate,20);