/*		
		Sets up a controller
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