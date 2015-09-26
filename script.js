canvas = document.createElement("canvas");
canvas.id = "game";
canvas.height=window.innerHeight-20;
canvas.width=window.innerWidth-20;
c = canvas.getContext("2d");
document.body.appendChild(canvas);

var mouse = {x:-100,y:-100,lClick:false,rClick:false};


//Gets mouse position into global mouse object
canvas.addEventListener('mousemove',function(e){
	var env = canvas.getBoundingClientRect();
	mouse.x=e.clientX-env.left;
	mouse.y=e.clientY-env.top;
});

canvas.addEventListener('mousedown',function(e){
	if (e.buttons==1){mouse.lClick=true;}
});

canvas.addEventListener('mouseup',function(e){
	if (e.buttons==0){mouse.lClick=false;}
});

//Disable right-click context menu
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};


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
	if (d<rDist){
		return true;}
	else{return false}
}


//Random range from min-max
RNG = function(min,max){
	return (Math.random()*(max-min))+min;
};


/*
				Main organism object
*/
blorb = function(){
	//Genetic properties
	this.radius = 5*Math.random()+10;
	this.x = RNG(this.radius,canvas.width-this.radius)
	this.y = RNG(this.radius,canvas.height-this.radius)
	this.dx = this.x;
	this.dy = this.y;
	this.arc = 0;
	//How often to roam
	this.roamTimer = new Date().getTime() + (Math.random()*2000);
	this.roamInterval = RNG(1000,3000);
	//How often to digest
	this.metabolicTimer = new Date().getTime()+(Math.random()*5000);
	this.metabolicInterval = RNG(5000,10000);
	//Death counter
	this.deathTimer = 0;
	//Ego properties
	this.hp = 100;			//Health level
	this.energy = 10;		//Stored energy used for movement
	this.gut = 100; 		//How much food in stomach
	this.CND= "UNKNOWN";	//Current status
	this.foodTarget = null; //Reference to desired object

	//Random jiggly movement
	this.jiggle = function(intensity){
		if (this.energy<=0){return}
		intensity -= intensity/2
		min = intensity/2*-1
		this.dx+=(Math.random() * intensity) +min;
		this.dy+=(Math.random() * intensity) +min;
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
		this.roamTimer = new Date().getTime();
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
			var dists = []
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
		this.dx = p.x;
		this.dy = p.y;
		if(distance(p.x,p.y,this.x,this.y)<2&this.energy>=2){
			this.energy-=2;
			this.gut+=p.nutrition;
			this.foodTarget=null;
			pellets.splice(pellets.indexOf(p),1);
		}
	}

	//Turn food in gut into energy
	this.metabolize = function(time){
		if(time<(this.metabolicTimer+this.metabolicInterval)){return;}
			this.metabolicTimer = new Date().getTime();
			
			//Take units from gut and apply to energy
			if(this.gut>0&this.energy<100){
				var digest = RNG(5,15);
				if (digest>this.gut){digest = this.gut} //Prevents overdrawing
				this.gut-= digest;
				this.energy+= digest*0.8;
				if (this.energy>100){this.energy=100}
				poops.push(new poop(this.x,this.y)); //haha; push poops.
			}

			//Turn HP into energy
			if(this.energy<=0&this.gut<=0&this.hp>0){
				var atrophy = RNG(5,10)
				if (atrophy>this.hp){atrophy=this.hp}
				this.hp -= atrophy;
				this.energy+= atrophy*0.6;
				if(this.energy>100){this.energy=100;}
			}
			this.energy = Math.floor(this.energy);
	};

	//Determines condition of Blorb
	this.condition = function(){
		if(this.energy<=0){
			this.CND = "TIRED";
		}
		if(this.gut>0&this.energy>0&this.hp>0){
			this.CND="HAPPY";
		}
		if(this.gut<=0){
			this.CND="HUNGRY";
		}
		if(this.gut<=0&this.energy<=0){
			this.CND="DYING";
		}
		if(this.hp<=0&this.gut<=0&this.energy<=0){
			this.CND="DECEASED";
		}
	}


	//Draw textual information about blorb nearby.
	this.info = function(){
		var fontSize = 15
		var y = this.y-this.radius-fontSize;
		var r = Math.floor(this.radius)

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

	//blorb update logic
	this.update = function(time){
		if(this.arc>-2){this.draw();return;} //Let arc spin before beginning logic

		this.condition();
		this.jiggle(5);
		this.interp();

		
		if(this.sniff()){
			this.nomf(this.foodTarget);
		}else{
			this.roam(time);
		}
		
		this.metabolize(time);
		this.draw();
	};

	//Render blorb
	this.draw = function(){
		if (this.arc>-2){this.arc-=Math.random()*0.05}

		c.fillStyle = "rgba(20,200,20,1)";
		c.strokeStyle = "rgba(200,90,90,1)";
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x,this.y,this.radius,this.arc*Math.PI,false);
		if(this.arc<=-2){c.fill();}
		c.stroke();
	};
}


//Blorb excrement
poop = function(x,y){
	this.x = x;
	this.y = y;
	this.radius = RNG(3,6);
	this.alpha = 1;
	this.outline = RNG(0.5,2)
	this.update = function(){
		this.draw();
		this.alpha-=0.001;
		if (this.alpha<0){
			poops.splice(poops.indexOf(this),1)
			return
		}
	};

	this.draw = function(){
		c.fillStyle = "rgba(100,100,50,"+this.alpha+")";
		c.strokeStyle = "rgba(100,150,50,"+this.alpha+")";
		c.lineWidth = this.outline;
		c.beginPath();
		c.arc(this.x,this.y,this.radius,2*Math.PI,false);
		c.fill();
		c.stroke();		
	};
}

//Edible food pellets
pellet = function(x,y){
	this.x= x;
	this.y= y;
	this.nutrition = Math.floor(RNG(20,40));
	this.update = function(){

		this.draw();
	};

	this.draw = function(){
		c.fillStyle = "rgba(255,255,100,1)";
		c.fillRect(this.x,this.y,10,10);
	};

}



			/* SETUP */
poops = [];
blorbs = [];
pellets = [];

for (var i = 0; i < 2; i++) {
	blorbs.push(new blorb());
	
};


for (var i = 0; i < 20; i++) {
	pellets.push(new pellet(canvas.width*Math.random(),canvas.height*Math.random()))
};








drawbG = function(){
    c.fillStyle= "rgba(10,10,20,0.6)";
    c.fillRect(0,0,canvas.width,canvas.height);
};

scanLines = function(){
    for (line=1;line<=canvas.height;line+=2){
        c.fillStyle="rgba(0,0,0,0.1)";
        c.fillRect(0,line,canvas.width,1);
    }
}

update = function(){
	drawbG();
	var time = new Date().getTime();


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
		pellets.push(new pellet(mouse.x,mouse.y))
	}
	


	scanLines();
};


setInterval(update,20);