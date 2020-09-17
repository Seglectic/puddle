
/*
				Mouse Interaction
		Creates mouse object for 
		handling viewer's mouse interaction.
*/
PDL.mouse = function(){ //TODO Fix this to an object instead of a function
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
		var env          = PDL.canvas.getBoundingClientRect();
		PDL.mouse.x      = e.clientX-env.left;
		PDL.mouse.y      = e.clientY-env.top;
		PDL.mouse.worldX = PDL.camX + PDL.mouse.x
		PDL.mouse.worldY = PDL.camY + PDL.mouse.y
		PDL.mouse.vx 	 = PDL.mouse.x - PDL.mouse.prevX; //Mouse velocity? Not sure if this works really
		PDL.mouse.vy 	 = PDL.mouse.y - PDL.mouse.prevY;
		PDL.mouse.prevX  = PDL.mouse.x;
		PDL.mouse.prevY  = PDL.mouse.y;
	}

	this.mouseDown = function(e){
        switch (e) {
            case 1: PDL.mouse.lClick = true; break;
            case 2: PDL.mouse.rClick = true; break;
            case 3: PDL.mouse.lrClick= true; break;
            case 4: PDL.mouse.mClick = true; break;
			default:break;
			
        }
	};

	this.mouseUp = function(e){
		if (e.buttons==0){
			PDL.mouse.lClick  = false;
			PDL.mouse.rClick  = false;
			PDL.mouse.lrClick = false;
			PDL.mouse.mClick  = false;
		}
    };
}
PDL.mouse = new PDL.mouse();
addEventListener('mousemove',PDL.mouse.mouseMove)
addEventListener('mousedown',PDL.mouse.mouseDown);
addEventListener('mouseup'  ,PDL.mouse.mouseUp);


		//gamePad object //TODO clean this up a bit, abstract to own file prolly
/*		
		Sets up a global control
		object for keyboard input
*/
PDL.gPad = {
	up:false,
	down:false,
	left:false,
	right:false,
	fire:false,
};
//						Down Keypress
PDL.gPad.keyDown = function(e){
	key = e.keyCode;
	//If arrow keys, prevent browser's default scroll action
	if([32, 37, 38, 39, 40].indexOf(key) > -1) {e.preventDefault();}
	switch(key){
		case 87: PDL.gPad.up=true;break;
		case 65: PDL.gPad.left=true;break;
		case 83: PDL.gPad.down=true;break;
		case 68: PDL.gPad.right=true;break;
		case 38: PDL.gPad.up=true;break;
		case 37: PDL.gPad.left=true;break;
		case 40: PDL.gPad.down=true;break;
		case 39: PDL.gPad.right=true;break;
		case 32: PDL.gPad.fire = true; break;
		default:break;
	}
}
//						Key Release
PDL.gPad.keyUp = function(e){
    key = e.keyCode;
    switch(key){
        case 87: PDL.gPad.up=false; break;
        case 65: PDL.gPad.left=false;break;
        case 83: PDL.gPad.down=false;break;
        case 68: PDL.gPad.right=false;break;
        case 38: PDL.gPad.up=false;break;
        case 37: PDL.gPad.left=false;break;
        case 40: PDL.gPad.down=false;break;
        case 39: PDL.gPad.right=false;break;
		case 32: PDL.gPad.fire = false; break;
        default:break;
    }
}
addEventListener("keydown",PDL.gPad.keyDown);
addEventListener("keyup",PDL.gPad.keyUp);