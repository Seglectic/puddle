// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃  Puddle Setup                                                                                                     ┃
// ┃                                                                                                                   ┃
// ┃  Prepares the puddle for creatures to inhabit                                                                     ┃
// ┃  as well as spawning  initial inhabitants                                                                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/*
					VISUAL FX
		Defines some fancy/necessary routines
		for painting to our PDL.canvas.
*/

//Draw puddle background
PDL.drawbG = function(){
    PDL.ctx.fillStyle= "rgba(50,50,100,0.5)";
    PDL.ctx.fillRect(0,0,PDL.canvas.width,PDL.canvas.height);
    //TODO Add central gradient?
        /*var grd = ctx.createRadialGradient(75,50,5,90,60,100);
        grd.addColorStop(0,"red");
        grd.addColorStop(1,"white");*/
};

//Draw scanlines
PDL.refreshScanLine = 0;
PDL.scanLines = function(){
    for (line=1;line<=PDL.canvas.height;line+=2){
        PDL.ctx.fillStyle="rgba(0,0,100,0.1)";
        PDL.ctx.fillRect(0,line,PDL.canvas.width,1);
    }
    PDL.refreshScanLine+=2;
    PDL.ctx.fillStyle="rgba(100,100,100,0.1)";
    PDL.ctx.fillRect(0,PDL.refreshScanLine,PDL.canvas.width,1);
    if(PDL.refreshScanLine>PDL.canvas.height){PDL.refreshScanLine=0;}
}

//Draw FPS
PDL.fpsTimer = 300
PDL.drawFPS = function(delta){
    // var fps = PDL.fps();
    var fps = Math.floor(1000/delta)

    PDL.ctx.font = "11px Lucida Sans Unicode";
    fps <=25 ? PDL.ctx.fillStyle = "rgb(255,0,0)" : PDL.ctx.fillStyle = "rgb(0,255,0)";
    PDL.ctx.fillText("FPS: "+fps,0,11)
}


//Smoothly update camera position //NOTE Camera stuff may deserve its own file?
PDL.cameraUpdate = function(){
    PDL.camX   += (PDL.camDX - PDL.camX)*0.02;
    PDL.camY   += (PDL.camDY - PDL.camY)*0.02;
}








/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Main Game Loop
*/
//TODO maybe abstract this elsewhere? 
//TODO Use frame delta for other timers

puddleUpdate = function(){
    PDL.timeStart = Date.now();
    var delta = PDL.timeStart - PDL.timeEnd;
    
    PDL.drawbG();
    PDL.cameraUpdate();

    // PDL.drawFPS(delta);
   
    PDL.player.update();

    PDL.crunchChunks(PDL.timeStart);

    PDL.scanLines();

    PDL.timeEnd = Date.now();
};


setInterval(puddleUpdate,16.667);