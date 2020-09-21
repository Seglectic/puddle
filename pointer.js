
		// 		Pointer
		// Handles pointer presses
		//     and movement
PDL.mouse = {
	x: -100,
	y: -100,
	prevX: 0,
	prevY: 0,
	vx: 0,
	vy: 0,
	lClick: false,
	rClick: false,
	mClick: false,
	lrClick: false
}

	PDL.mouse.mouseMove = function(e){
		var env          = PDL.canvas.getBoundingClientRect();
		PDL.mouse.x      = e.clientX-env.left;
		PDL.mouse.y      = e.clientY-env.top;
		PDL.mouse.worldX = PDL.camX + PDL.mouse.x
		PDL.mouse.worldY = PDL.camY + PDL.mouse.y
		PDL.mouse.vx 	 = PDL.mouse.x - PDL.mouse.prevX;
		PDL.mouse.vy 	 = PDL.mouse.y - PDL.mouse.prevY;
		PDL.mouse.prevX  = PDL.mouse.x;
		PDL.mouse.prevY  = PDL.mouse.y;		
	}

	PDL.mouse.mouseDown = function(e){
        switch (e.buttons) {
            case 1: PDL.mouse.lClick = true; break;
            case 2: PDL.mouse.rClick = true; break;
            case 3: PDL.mouse.lrClick= true; break;
            case 4: PDL.mouse.mClick = true; break;
			default:break;
        }
	};

	PDL.mouse.mouseUp = function(e){
		if (e.buttons==0){
			PDL.mouse.lClick  = false;
			PDL.mouse.rClick  = false;
			PDL.mouse.lrClick = false;
			PDL.mouse.mClick  = false;
		}
	};
	
addEventListener('mousemove',PDL.mouse.mouseMove)
addEventListener('mousedown',PDL.mouse.mouseDown);
addEventListener('mouseup'  ,PDL.mouse.mouseUp);



//Handles touch events

PDL.touch = {
	start:()=>{

	},

	move:()=>{

	},

	end:()=>{
		
	}
}