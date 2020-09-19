// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                                                Player                                                             ┃
// ┃  Manages the input object that                                                                                    ┃
// ┃  can place entities into Puddle                                                                                   ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


PDL.player = {
	update :()=>{
		if(PDL.gPad.up   ){PDL.camDY-=PDL.camSpeed;}	
		if(PDL.gPad.down ){PDL.camDY+=PDL.camSpeed;}	
		if(PDL.gPad.left ){PDL.camDX-=PDL.camSpeed;}	
		if(PDL.gPad.right){PDL.camDX+=PDL.camSpeed;}	

			//left-Click to create shrimps
		if(PDL.mouse.lClick){;
			new PDL.shrimp(PDL.mouse.worldX,PDL.mouse.worldY,PDL.mouse.vx,PDL.mouse.vy); 
			// console.log("meow")
		}
	}
}











// Legacy stuff might need later
// player = function(){
// 	this.shrimpInterval = 100;
// 	this.spawnFlag = true;
// 	this.shrimpTimer = new Date().getTime();
// 	this.update = function(time){
		


// 		//Spawn a Blorb on middle-click; delimit to mouseDown
// 		if(mouse.mClick){
// 			if(this.spawnFlag & blorbs.length<50){blorbs.push(new blorb(mouse.x,mouse.y))}
// 			this.spawnFlag=false;
// 		}else{this.spawnFlag=true;}

// 		if(mouse.lrClick){
// 			//blorbs = [];
// 			shrimps = [];
// 		}
// 	}
// };
// player = new player();
