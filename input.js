
/*
				Mouse Interaction
		Creates mouse object for 
		handling viewer's mouse interaction.
*/
PDL.mouse = function(){
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
		var env     = PDL.canvas.getBoundingClientRect();
		PDL.mouse.x     = e.clientX-env.left;
		PDL.mouse.y     = e.clientY-env.top;
		PDL.mouse.vx 	= PDL.mouse.x - PDL.mouse.prevX;
		PDL.mouse.vy 	= PDL.mouse.y - PDL.mouse.prevY;
		PDL.mouse.prevX = PDL.mouse.x;
		PDL.mouse.prevY = PDL.mouse.y;
	}

	this.mouseDown = function(e){
        switch (e) {
            case 1:
                PDL.mouse.lClick=true;
                break;
            case 2:
                PDL.mouse.rClick=true;
                break
            case 3:
                PDL.mouse.lrClick=true;
                break
            case 4:
                PDL.mouse.mClick=true;
                break                            
            default:
                break;
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
PDL.canvas.addEventListener('mousemove',PDL.mouse.mouseMove)
PDL.canvas.addEventListener('mousedown',PDL.mouse.mouseDown);
PDL.canvas.addEventListener('mouseup'  ,PDL.mouse.mouseUp);


//TODO Add PDL.keyboard object here for keyboard input (if need be)


PDL.moveKeys= function(e){    //Keybind to flip card
	switch (e.keyCode) {
		case 87:
            PDL.camY -= 25;
			break;
		case 83:
            PDL.camY += 25;
			break;
		case 65:
            PDL.camX -= 25;
            break;
		case 68:
            PDL.camX += 25;
			break;            
		default:
			console.log(e.keyCode);
			break;
	}
}
addEventListener("keydown",PDL.moveKeys)