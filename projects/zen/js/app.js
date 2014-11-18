// ZeNimbus 0.9.2 -- Nov '14

var zeNimbus = (function($){ // module zeNimbus
	"use strict"

	var zv, // chimes
		zenEl,
		statusEl,
		ctx,
		chimesToggle,
		startTime,
		endTime,
		maxPan,
		xPos,
		zPos,
		frq,
		freq = {
			freq0 : 261.63, 									// fundamental
			freq1 : function(){return 9 * (this.freq0 / 8);},	// second
			freq2 : function(){return 4 * (this.freq0 / 3);},	// third
			freq3 : function(){return 3 * (this.freq0 / 2);},	// fifth
			freq4 : function(){return 5 * (this.freq0 / 3);},	// sixth
			freq5 : function(){return this.freq0 * 2;} 			// one octave up
		},
		oscChime,
		envelope,
		panner,
		masterGain,
		masterGainVol = 0.5,
		nodes = [oscChime, envelope, panner, masterGain],
		destination;

	// ctor
	function synthBox(){

		zv = $("#zenVolume"),
		zenEl = document.getElementById("marquee"),
		zv.slider({
			orientation: "vertical",
			min: 0,
			max: 1,
			step: 0.01,
			value: 0.5,
			slide: function(e, ui){

				updateChimesVol(ui.value);
			},

			change: function(e, ui){

				updateChimesVol(ui.value);
			}
		});

		ctx = new AudioContext();

		setupEventListeners();
	};

	// chimes
	function playChimes(randfreq){

		startTime = ctx.currentTime,
		endTime = 2.8,
		maxPan = 4,
		xPos = Math.floor(Math.random() * (maxPan - (-maxPan) + 1) + (-maxPan)),
		zPos = xPos/2,
		frq,
		oscChime = ctx.createOscillator(),
		envelope = ctx.createGain(),
		panner = ctx.createPanner(),
		masterGain = ctx.createGain(),
		destination = ctx.destination,
		nodes = [oscChime, envelope, panner, masterGain];

		// set value of chime frequency
		switch(randfreq){
				//
		case 0:
			frq = freq.freq0;
		break;
				//
		case 1:
			frq = freq.freq1();
		break;
				//
		case 2:
			frq = freq.freq2();
		break;
				//
		case 3:
			frq = freq.freq3();
		break;
				//
		case 4:
			frq = freq.freq4();
		break;
				//
		case 5:
			frq = freq.freq5();
		break;
				//
		default:
			frq = 440;
		}

		oscChime.type = "sine";
		oscChime.frequency.value = frq;
		envelope.gain.setValueAtTime(0, startTime);
		envelope.gain.linearRampToValueAtTime(1.0, startTime + 0.008);
		envelope.gain.linearRampToValueAtTime(0.0, startTime + endTime);
		masterGain.gain.value = masterGainVol;
		panner.setPosition(xPos,0,zPos);
		
		updateChimesVol();

		// connect nodes
		nodes.reduce(function (prev, cur) {
			prev.connect(cur);
			return cur;
		}).connect(destination);

		// play
		oscChime.start(startTime);
		oscChime.stop(startTime + endTime);
	};

	function startChimes(){

		chimesToggle = "start";

		(function loopChimes() {

	    	var rand = (Math.round(Math.random() * (800 - 200)) + 200),
	    		randfreq = Math.floor(Math.random() * (5 - 0 + 1)) + 0,
	    	zenLoop = setTimeout(function() {
	        	playChimes(randfreq);
	        	loopChimes();  
	    	}, rand);

	    	if(chimesToggle === "stop"){
	    		clearTimeout(zenLoop);
	    	};
		}());
	};

	function stopChimes(){

		chimesToggle = "stop";
	};

	function toggleChimes(){

		chimesToggle !== "start" ? startChimes() : stopChimes()
	};

	function updateChimesVol(v){

	 	v === undefined ? masterGainVol : masterGainVol = v;

	 	if(masterGain){
			masterGain.gain.value = masterGainVol;
		}
	};

	function setupEventListeners(){ 
		zenEl.addEventListener("click", toggleChimes);
	};

	//return synthBox;
	return 	{
				synthbox : synthBox
			};
}(jQuery));

(function(){
	zeNimbus.synthbox();
}());