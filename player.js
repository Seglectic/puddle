// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                                                Player                                                             ┃
// ┃  Manages the input object that                                                                                    ┃
// ┃  can place entities into Puddle                                                                                   ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
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
