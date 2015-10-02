/*

							PUDDLE
						
		Puddle is ↑an environment for cellular automata 
		called "Blorbs" to eke out their lives within
		your web browser. They are born, eat and die.

		Please appreciate them.
*/

poops = [];
blorbs = [];
pellets = [];


/*
				  Environment Setup
		This section is for the preparation of
		the web environment to allow to for a 
		a decent browser experience
*/

canvas = document.createElement("canvas");
canvas.id = "game";
canvas.height=window.innerHeight-20;
canvas.width=window.innerWidth-20;
c = canvas.getContext("2d");
document.body.appendChild(canvas);



//Disable right-click context menu
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};


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

//Check if 2D point within circle (point x, point y, (x,y,width,height) of rect)
pointRectCollide = function(px,py,x,y,w,h){
	if(px>x&px<x+w&py>y&py<y+h){return true;}
};

//2D distance
distance = function(x1,y1,x2,y2){
	var d = Math.sqrt( ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1)) );
	return d;
};

//Check collision between two circles
circleCollide = function(x1,y1,r1,x2,y2,r2){
	var d = distance(x1,y1,x2,y2);
	var rDist = r1+r2
	if (d<=rDist){
		return true;}
	else{return false}
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
	this.baseRadius = 5*Math.random()+10; //Starting r
	this.radius = this.baseRadius;		  //Current r
	this.x = RNG(this.radius,canvas.width-this.radius)
	this.y = RNG(this.radius,canvas.height-this.radius)
	this.dx = this.x;
	this.dy = this.y;
	this.arc = 0;
	this.strokeClr = {r:200,g:90,b:20};
	this.fillClr = {r:20,g:200,b:20};
	//How thick to draw the line around nucleus
	this.baseMembrane = 5;
	this.membrane = this.baseMembrane; 

	//How often to roam
	this.roamTimer = new Date().getTime() + (Math.random()*2000);
	this.roamInterval = RNG(1000,3000);
	this.jiggleIntensity = (this.roamInterval/1000)*RNG(1,5,true);
	//How often to digest
	this.metabolicTimer = new Date().getTime()+(Math.random()*5000);
	this.metabolicInterval = RNG(5000,10000);
	//How often to jiggle
	this.jiggleTimer = new Date().getTime()+(Math.random()*100);
	this.jiggleInterval = RNG(50,100);
	//How quickly to rot
	this.rotTimer = new Date().getTime();
	this.rotInterval = 100;
	//Health properties
	this.hp = 100;			//Health level
	this.energy = 20;		//Stored energy used for movement
	this.gut = 0; 			//How much food in stomach
	this.CND= "UNKNOWN";	//Current status
	this.foodTarget = null; //Reference to desired object

	//Random jiggly movement
	this.jiggle = function(time,jiggleIntensity){
		if (this.energy<=0){return}
		if(time<(this.jiggleTimer+this.jiggleInterval)){return;}
		this.jiggleTimer = time;
		this.dx +=RNG(-jiggleIntensity,jiggleIntensity);
		this.dy +=RNG(-jiggleIntensity,jiggleIntensity);
	};

	//Constantly translate blorb toward (dx,dy)
	this.interp = function(){
		if(this.CND == "DECEASED"){return;}
		/*Don't allow movement if colliding
		for (var i = blorbs.length - 1; i >= 0; i--) {
			var b = blorbs[i];
			if (circleCollide(this.x,this.y,this.radius,b.x,b.y,b.radius)){
				return;
			}
		};
		*/
		this.x += (this.dx-this.x)*0.06
		this.y += (this.dy-this.y)*0.06
	}

	//Choose random nearby (dx,dy) pos to move to.
	this.roam = function(time){
		if(this.energy<=0){return}
		if(time<(this.roamTimer+this.roamInterval)){return;}
		this.roamTimer = time;
		while(true){		
			var destX = this.dx + RNG(-100,100);
			var destY = this.dy + RNG(-100,100);
			//Check if roam pos is within bounding area
			if(pointRectCollide(destX,destY,this.radius,this.radius,canvas.width-this.radius,canvas.height-this.radius)){
				this.dx = destX;
				this.dy = destY;
				break;
			}
		}
		if(this.energy>0){
			this.energy-=1;
		}
	};

	//Sniffs for nearby food pellets
	this.sniff = function(){
		for (var i = pellets.length - 1; i >= 0; i--) {
			var p = pellets[i];
			var dist = distance(p.x,p.y,this.x,this.y)
			var targets = []
			if(dist<100){
				targets.push(p);
			}
			if(targets.length>0){
				targets = targets.sort();
				this.foodTarget = targets[0];
				return true;
			}
		};
	}

	//jumps towards food and consumes it
	this.nomf = function(p){
		if(this.gut>200){return;}
		if(this.gut>5&this.energy<5){return;}

		if(distance(p.x,p.y,this.x,this.y)<2&this.energy>=1){
			this.energy-=2;
			this.gut+=p.nutrition;
			this.foodTarget=null;
			pellets.splice(pellets.indexOf(p),1);
		}
		if(this.energy>=2){
			this.dx = p.x;
			this.dy = p.y;
		}
	}

	//Draw blorb at different proportions based on food levels
	this.fat = function(){
		var fat = this.baseMembrane * (this.energy/50) 
		var nucleus = this.baseRadius * (this.gut/100)
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
			poops.push(new poop(this.x,this.y,digest*0.4)); //haha; push poops.
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

		if(this.strokeClr.r > 40){
			this.strokeClr.r -=1;
		}
		if(this.strokeClr.g > 20){
			this.strokeClr.g -=1;
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
		var fontSize = 15
		var y = this.y-this.radius-fontSize;
		var r = Math.floor(this.radius)
		//Move text to left when on right of screen
		if(this.x<canvas.width/2){var x = this.x+this.radius+20;}
		else{var x = this.x-(this.radius)-120}
		c.fillStyle = "White";
		c.font = (fontSize+"px Lucida Console")
		var name = "Blorb #"+blorbs.indexOf(this)+" ["+this.CND+"]";
		var energy = "Energy: "+Math.floor(this.energy);
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
		this.condition();
		this.jiggle(time,this.jiggleIntensity);
		this.interp();
		if(this.gut<200&this.sniff()){
			this.nomf(this.foodTarget);
		}else{
			this.roam(time);
		}
		this.metabolize(time);
		if (this.CND ==="DECEASED"){
			this.rot(time);
		}
		this.draw();
	};

	//Render blorb
	this.draw = function(){
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
				Blorbs love these! Each food object has a
				nutrition attribute that goes toward fueling
				blorb activity.
*/
pellet = function(x,y){
	this.x= x;
	this.y= y;
	this.nutrition = RNG(5,40,true);
	var sizePercent = (this.nutrition/40)*10
	this.w = sizePercent;
	this.h = sizePercent;
	this.alpha=0;
	this.update = function(){
		if (this.alpha<1){this.alpha+=0.01;}
		this.draw();
	};

	this.draw = function(){
		c.fillStyle = "rgba(255,255,100,"+this.alpha+")";
		c.fillRect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
	};
}


//Constantly keep food spawned around screen
pelletSpawn = function(){
	if (pellets.length<=5){
		for (var i = 0; pellets.length < 20; i++) {
			pellets.push(new pellet(canvas.width*Math.random(),canvas.height*Math.random()))
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

		//Check if mouse is over blorb and display info.
		if(pointCircleCollide(mouse.x,mouse.y,blorb.x,blorb.y,blorb.radius)){
			blorb.info();
		}
	};


	//Click to create pellets
	if(mouse.lClick){
		if (pellets.length<30){
			pellets.push(new pellet(mouse.x,mouse.y));
		}
	}
	
	scanLines();
};


setInterval(puddleUpdate,20);