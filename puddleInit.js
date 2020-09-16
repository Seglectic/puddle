        // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        // ┃                                                                                                                   ┃
        // ┃                      							PUDDLE                                                             ┃
        // ┃                                                                                                                   ┃
        // ┃  						     Puddle is an environment for cellular automata                                        ┃
        // ┃  							 to eke out their lives within your browser.                                           ┃
        // ┃  						     They are born, eat, poop and die.                                                     ┃
        // ┃  								                                                                                   ┃
		// ┃  							 Please appreciate them.       														   ┃ 
		// ┃																												   ┃	
		// ┃                                                                             									   ┃
		// ┃                                                                    -Seglectic Softworks 2020                      ┃  
        // ┃                                                                                                                   ┃
		// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
		//TODO Move this to a readme




// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃              Environment Setup           ┃
// ┃  This section is for the preparation of  ┃
// ┃  the web environment to allow a          ┃
// ┃  a decent browser experience             ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

//###  Main Puddle namespace  ###//
PDL = {};

PDL.canvas        = document.createElement("canvas");
PDL.canvas.id     = "puddleCanvas";
PDL.canvas.height = window.innerHeight-10;
PDL.canvas.width  = window.innerWidth-10;
PDL.ctx           = PDL.canvas.getContext("2d");
document.body.appendChild(PDL.canvas);

//Disable right-click context menu
PDL.canvas.oncontextmenu = function (e) {e.preventDefault();};





// ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  										General & Shorthand functions                                              │
// └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

//Check if 2D point within circle (point x, point y, (x,y,radius) of circle)
PDL.pointCircleCollide = function(px,py,x,y,r){
	x -= r;
	y -= r;
	w = (r*2);
	h = (r*2);
	if(px>x&px<x+w&py>y&py<y+h){return true;}
	else{return false;}
};

// Check if 2D point within rectangle (point x, point y, (x,y,width,height) of rect)
PDL.pointRectCollide = function(px,py,x,y,w,h){
	if(px>x&px<x+w&py>y&py<y+h){return true;}
};

/**
 * Return 2D distance
 */
PDL.distance = function(x1,y1,x2,y2){
	var d = Math.sqrt( ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1)) );
	return d;
};

//Check collision between two circles
PDL.circleCollide = function(x1,y1,r1,x2,y2,r2){
	var d = distance(x1,y1,x2,y2);
	var rDist = r1+r2
	if (d<=rDist){return true;}
	else{return false;}
}


// Clamp number to range
PDL.clamp = function(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

//Random range from [min] to [max], bool [int] if rounding
PDL.RNG = function(min,max,int){
	var RNG = (Math.random()*(max-min))+min;
	if (int){return Math.floor(RNG);}
	return RNG;
};


//Return FPS for display //TODO shit needs fixin
PDL.fps = {
	lastFrame: Date.now(),
	updateInterval: 1000,
	timer: Date.now()+this.updateInterval, 
	flag: 0,
	get:()=>{
		var now = Date.now()
		if (now<PDL.fps.timer){return}
		var fps = Math.floor(1000/(now - PDL.fps.lastFrame));
		PDL.fps.lastFrame = now;
		PDL.fps.flag++
		if(PDL.fps.flag>2){PDL.fps.timer = now+PDL.fps.updateInterval;}
		return fps;
	}
};