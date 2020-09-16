
//Returns randomized name, not guaranteed unique
PDL.codeName = function(){
	var code = ['cute','sly','lone','rancid','dancing','psycho','awkward','quiet','loud','snapping','sea','blue','red','green','tiny','mini','cold','hot','hyper','mellow','tasty','nasty','kawaii','ultra']
	var naem = ['Eagle','Owl','Rat','Leopard','Monkey','Snail','Turtle','Cactus','Eel','Salmon','Hedgehog','Bear','Wolf','Coyote','Ox','Frog','Octopus','Squid','Okapi','Ant','Narwhal','Crab','Shrimp','Cicada','Moth','Cobra','Mantis','Viper','Osprey','Pig','Blorb'] 
	return code[Math.floor(Math.random()*code.length)]+naem[Math.floor(Math.random()*naem.length)];
}
