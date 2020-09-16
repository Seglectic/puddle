/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
				Blorb Object Prototype
		These are the main characters of puddle;
		roaming about, eating food, shitting and
		dying are their main past-times.
*/
amoeba = function(x,y){

	this.name = codeName();
	//Genetic properties
	this.baseRadius = RNG(5,10); //Starting r
	this.radius = this.baseRadius;		  //Current r
	this.x = x || RNG(this.radius,canvas.width-this.radius);
	this.y = y || RNG(this.radius,canvas.height-this.radius);
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
	this.hp = 100;							//Health level
	this.energy = 20;						//Stored energy used for movement
	this.gut = 50; 							//How much food in stomach
	this.CND= "UNKNOWN";					//Current status
	this.foodTarget = null; 				//Reference to desired object
	//Sniff 'radar' properties
	this.sniffRange = 35;
	this.sniffRadius = 0;
	this.sniffAlpha = 1;
	this.sniffSpeed = 1;
	this.sniffTimer = new Date().getTime();
	this.sniffInterval = RNG(2000,4000);
	this.baseSniffInterval = this.sniffInterval;
	this.emitter = new emitter(this.x,this.y,5,0.01)

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
			var mass1 = this.radius*10;	var mass2 = b.radius*10;
			this.vx = (this.vx * (mass1 - mass2) + (2 * mass2 * b.vx)) / (mass1 + mass2);
			this.vy = (this.vy * (mass1 - mass2) + (2 * mass2 * b.vy)) / (mass1 + mass2);
			b.vx = (b.vx * (mass2 - mass1) + (2 * mass1 * this.vx)) / (mass1 + mass2);
			b.vy = (b.vy * (mass2 - mass1) + (2 * mass1 * this.vy)) / (mass1 + mass2);
			*/
		};
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
		if(time<(this.roamTimer+this.roamInterval)){return};
		if(this.foodTarget){return};
		this.roamTimer = time;

		//Randomize velocity vector	
		this.vx = RNG(-2,2);
		this.vy = RNG(-2,2);
		//Consume energy based on velocity magnitude average
		this.energy -= (Math.abs(this.vx+this.vy)/2);
	};

	//Sniffs for nearby food shrimps
	this.sniff = function(time){
		if(this.hp<=0 || this.foodTarget!= null){return;}
		if (time<(this.sniffTimer+this.sniffInterval)){return};

		if(this.CND == "HAPPY" || this.CND == "HEALING"){
			this.sniffInterval = this.baseSniffInterval; 
			this.sniffRange=50;
			this.sniffSpeed = 1;
		};
		if(this.CND == "HUNGRY"){
			this.sniffInterval=RNG(500,1000); 
			this.sniffRange=100;
			this.sniffSpeed = 3;
		};
		if(this.CND == "DYING"){
			this.sniffInterval = 0; 
			this.sniffRange=150
			this.sniffSpeed = RNG(3,5);
		}

		if (this.sniffRadius>this.sniffRange){
			this.sniffTimer = time;
			this.sniffAlpha = 1;
			this.sniffRadius = 0;
		}
		this.sniffRadius += this.sniffSpeed;
		this.sniffAlpha = (1-(this.sniffRadius/this.sniffRange))*0.4;

		for (var i = shrimps.length - 1; i >= 0; i--) {
			var s = shrimps[i];
			var dist = distance(s.x,s.y,this.x,this.y)
			if(dist<this.sniffRadius){ 
				this.foodTarget = s;
				this.sniffTimer = time;
				this.sniffAlpha = 1;
				this.sniffRadius = 0;
				break;
			}
		};
	}

	//Move toward food if located
	this.nomf = function(time){
		//Consume shrimp regardless if timer passed
		if(this.foodTarget == null){return};
		if(shrimps.indexOf(this.foodTarget)==-1){
			this.foodTarget=null;
			return;
		}
		var s = this.foodTarget;
		if(distance(s.x,s.y,this.x,this.y)<this.radius&this.energy>=1){
			this.gut+=s.nutrition;
			shrimps.splice(shrimps.indexOf(s),1);
			this.foodTarget=null;
		}

		if(this.energy<=0){return};
		if(time<(this.roamTimer+this.roamInterval)){return};
		if(this.gut>200){this.foodTarget = null; return};

		this.roamTimer = time;

		//Calculate velocity vector
		var dx = (s.x - this.x)
		var dy = (s.y - this.y)
		var magnitude = Math.sqrt(dx*dx + dy*dy);
		this.vx = dx/magnitude * 3;
		this.vy = dy/magnitude * 3;
	}

	//Give blorb different proportions based on food levels
	this.fat = function(){
		var fat = this.baseMembrane * (this.energy/50) 
		var nucleus = this.baseRadius*(this.gut/100)+3
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
		if(this.hp<100&this.energy>=10){
			this.emitter.active = true;
			this.hp+=RNG(10,20);
			this.energy-=2;
			if(this.hp>100){this.hp=100;}
		}else{
			this.emitter.active = false;
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
		if(this.gut>0&this.energy>0&this.hp>30){
			this.CND="HAPPY";
		}
		if(this.gut>0&this.energy>0&this.hp<100){
			this.CND="HEALING";
		}
		if(this.gut>200){
			this.CND = "FULL";
		}
		if(this.gut<=0&this.energy<20){
			this.CND="HUNGRY";
		}
		if(this.gut<=0&this.hp<100){
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
		ctx.fillStyle = "White";
		ctx.font = (fontSize+"px Lucida Console")
		var name = "Blorb: "+this.name+" ["+this.CND+"]";
		var energy = "Energy: "+Math.floor(this.energy);
		//var energy = "POS: "+this.x+' '+this.y;
		var hp = "Health: "+Math.floor(this.hp);
		var gut = "Gut: "+Math.floor(this.gut)+"% full"
		ctx.fillText(name,x,y)
		ctx.fillText(energy,x,y+fontSize)
		ctx.fillText(hp,x,y+(fontSize*2))
		ctx.fillText(gut,x,y+(fontSize*3))
	}

	//Blorb update logic
	this.update = function(time){
		if(this.arc>-2){this.draw();return;} //Let arc spin before beginning logic
		this.condition();
		this.sniff(time);
		this.roam(time);
		this.nomf(time);
		this.move();
		this.blorbCollide()
		this.metabolize(time);
		
		this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.update();
		
		if (this.CND ==="DECEASED"){
			this.rot(time);
		}
		this.draw();
	};

	//Render blorb
	this.draw = function(){
		//Draw sniffSpheres
		if (this.CND!="DECEASED"){
			ctx.lineWidth = 2;
			ctx.strokeStyle = "rgba(255,255,255,"+this.sniffAlpha+")";
			ctx.beginPath();
			ctx.arc(this.x,this.y,this.sniffRadius,2*Math.PI,false);
			ctx.stroke();
		}

		this.fat();
		if (this.arc>-2){this.arc-=Math.random()*0.05}
		var f = this.fillClr;
		var s = this.strokeClr;
		ctx.fillStyle = "rgba("+this.fillClr.r+","+this.fillClr.g+","+this.fillClr.b+",1)";
		ctx.strokeStyle = "rgba("+this.strokeClr.r+","+this.strokeClr.g+","+this.strokeClr.b+",1)";
		ctx.lineWidth = this.membrane;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,this.arc*Math.PI,false);
		if(this.arc<=-2){ctx.fill();}
		ctx.stroke();
	};
};


