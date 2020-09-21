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
    PDL.ctx.fillStyle= "rgba(50,50,100,0.9)";
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



// Spawn shrimp
for (let i = 0; i < 5; i++) {
    new PDL.shrimp()
}

// Spawn duckweed 
//TODO have duckweed spawn in little clusters of 3-5, maybe make them slowly stick together
for (let i = 0; i < 100; i++) {
    new PDL.weed()
}



/*__________________________________________________________________________________________________________________________________________________________________________________________________________________
					Main Game Loop
*/
//TODO maybe abstract this elsewhere? 

PDL.timeEnd=Date.now();

PDL.puddleUpdate = function(){
    PDL.timeStart = Date.now();
    var delta = Math.abs( PDL.timeEnd - PDL.timeStart );
    
    PDL.drawbG();
    PDL.cameraUpdate();

    PDL.player.update(delta);

    PDL.crunchChunks(PDL.timeStart); //TODO Convert crunching to frame delta

    PDL.fps.draw(delta);
    PDL.scanLines();
    PDL.timeEnd = PDL.timeStart;

};


//FIXME Pretty sure there's a more elegant way to set the updateBuffer callback or change the callback within a setInterval. Maybe check optiwink or similar game
PDL.titleScreen = function(){
    PDL.drawbG();
    PDL.scanLines();

    if(PDL.mouse.lClick){
        clearInterval(PDL.updateBuffer);
        PDL.updateBuffer = setInterval(PDL.puddleUpdate,16.6667);
    }
    
}


PDL.updateBuffer = PDL.titleScreen;


//NOTE Bypassing title screen until Tone.js is implemented
PDL.updateBuffer = setInterval(PDL.puddleUpdate,16.6667);