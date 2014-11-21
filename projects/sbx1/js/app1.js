// SoundLab 1.0, July 2014

//	oscillator.type = oscillator.SINE; (0)
//	oscillator.type = oscillator.SQUARE; (1)	
//	oscillator.type = oscillator.SAWTOOTH; (2)
// 	oscillator.type = oscillator.TRIANGLE; (3)
//	oscillator.type = oscillator.CUSTOM; (4)

(function() {
"use strict";

var SoundLab = {
	ctx : new AudioContext(),
	freq : {
			freq0 : 261.63, // fundamental
			freq1 : function(){return this.freq0 * 0.25;}, // two octaves down
			freq2 : function(){return this.freq0 * 2;}, // one octave up
			freq3 : function(){return 5 * (this.freq0 / 4);},// third
			freq4 : function(){return 4 * (this.freq0 / 3);}, // fourth
			freq5 : function(){return 3 * (this.freq0 / 2);} // fifth
	},
	oscType : {
				init: "sine"
				//sine : "sine",
				//square : "square",
				//sawtooth : "sawtooth",
				//triangle : "triangle"
	}
};

// synth definition
function fn1(frq){

	//var osc = osc || SoundLab.oscType.init;
	var startTime = SoundLab.ctx.currentTime,
		endTime = 4.0,
		xPos = Math.floor(Math.random() * (10 - (-10) + 1) + (-10)),
		zPos = xPos/2,
	// create nodes
		oscillator = SoundLab.ctx.createOscillator(),
		masterGain = SoundLab.ctx.createGain(),
		envelope = SoundLab.ctx.createGain(),
		panner = SoundLab.ctx.createPanner(),
		destination = SoundLab.ctx.destination;

	// set values
	oscillator.type = SoundLab.oscType.init;
	//oscillator.frequency.value = frq;
	oscillator.frequency.value = frq + (Math.round(Math.random() * 100));
	envelope.gain.setValueAtTime(0, startTime);
	envelope.gain.linearRampToValueAtTime(1.0, startTime + 2.0);
	envelope.gain.linearRampToValueAtTime(0.0, startTime + endTime);
	//envelope.gain.exponentialRampToValueAtTime(1.0, startTime + 2.0);
	//envelope.gain.exponentialRampToValueAtTime(1.0, startTime + endTime);
	
	panner.setPosition(xPos,0,zPos);
	masterGain.gain.value = 0.025;

	// log osc type, x-postion, z-position, freq
	console.log(oscillator.type, xPos, zPos, oscillator.frequency.value);

	// connect nodes
	oscillator.connect(envelope);
	envelope.connect(panner);
	panner.connect(masterGain);
	masterGain.connect(destination);
	
	// play sound
	oscillator.start(startTime);
	oscillator.stop(startTime + endTime);
	//oscillator.disconnect();
};

// swap osc type
function fn2 (o){
	return SoundLab.oscType.init = o;
};

// key func
function onKeyDown(e){

	var sf = SoundLab.freq;

	switch(e.keyCode){
		// z
		case 90:
			fn1(sf.freq0);
		break;
		// x
		case 88:
			fn1(sf.freq1());
		break;
		// c
		case 67:
			fn1(sf.freq2());
		break;
		// v
		case 86:
			fn1(sf.freq3());
		break;
		// b
		case 66:
			fn1(sf.freq4());
		break;
		// n
		case 78:
			fn1(sf.freq5());
		break;
		// u
		case 85:
			fn2("sine");
		break;
		// i
		case 73:
			fn2("square");
		break;
		// o
		case 79:
			fn2("sawtooth");
		break;
		// p
		case 80:
			fn2("triangle");
		break;
		}
};

window.addEventListener("keydown", onKeyDown);
}());