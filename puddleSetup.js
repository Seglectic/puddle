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
PDL.timeEnd=Date.now();

puddleUpdate = function(){
    PDL.timeStart = Date.now();
    var delta = Math.abs( PDL.timeEnd - PDL.timeStart );
    
    PDL.drawbG();
    PDL.cameraUpdate();

    PDL.player.update(delta);

    PDL.crunchChunks(PDL.timeStart);

    
    PDL.fps.draw(delta);
    PDL.scanLines();
    PDL.timeEnd = PDL.timeStart;

};


setInterval(puddleUpdate,16.6667);