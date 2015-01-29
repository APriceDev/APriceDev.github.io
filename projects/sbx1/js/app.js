// SBX1 0.9, Oct 2014

// http://it-ebooks.info/
// http://chimera.labs.oreilly.com/books/1234000001552/ch06.html //Biquad Filters
// http://creativejs.com/resources/web-audio-api-a-bit-more-advanced/
// http://webaudio.github.io/web-audio-api/
// https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#attributes-PannerNode_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
// https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode.buffer
// https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode.normalize
// http://www.html5rocks.com/en/tutorials/webaudio/intro/
// https://developer.tizen.org/documentation/articles/advanced-web-audio-api-usage
// https://developer.mozilla.org/en-US/docs/Web/API/AudioNode.connect%28AudioParam%29
// http://noisehack.com/
// http://www.sitepoint.com/html5-web-audio-api-tutorial-building-virtual-synth-pad/
// https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode

// http://stackoverflow.com/questions/5873810/how-can-i-get-last-characters-of-a-string-using-javascript
// http://stackoverflow.com/questions/5765398/whats-the-best-way-to-convert-a-number-to-a-string

// https://www.google.com/search?q=web+audio+api+visualizer&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-a&channel=sb
// http://forestmist.org/share/web-audio-api-demo/

var sbx1 = (function($) {
"use strict";

var ctx,
	oscToggle,
	oscOne,
	oscOneGain,
	lfo1,
	lfo1Level = 0,
	lfo1Gain,
	lfo2,
	lfo2Level = 0,
	lpf,
	lpfLevel = 1100,
	convolver,
	path = "data/largeHallLeft.wav",
	masterGain,
	masterGainVol = 0.5,
	masterPan,
	masterPanLevel = 0,
	canvas,
	canvasCtx,
	analyser,
	bufferLength,
	dataArray,
	looper,
	destination,
	ms,
	mv,
	pan,
	f1,
	f2,
	f3;

	function init(){

		ms = document.getElementById("masterSwitch"),
		mv = $("#masterVolume"),
		pan = $("#panner"),
		f1 = $("#filter01"),
		f2 = $("#filter02"),
		f3 = $("#filter03"),

		canvas = document.getElementById("scope"),
		canvasCtx = canvas.getContext("2d");

		canvasCtx.beginPath();
      		canvasCtx.moveTo(600, 50);
      		canvasCtx.lineTo(0, 50);
      		canvasCtx.lineWidth = 2;
      		canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      		canvasCtx.stroke();


		mv.slider({
				orientation: "vertical",
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.5,
				slide: function(e, ui){

				 	updateMasterVol(ui.value, this);
				},

				change: function(e, ui){

				 	updateMasterVol(ui.value, this);
				}
			});

		pan.slider({
				orientation: "vertical",
				min: -1,
				max: 1,
				step: 0.01,
				value: 0,
				slide: function(e, ui){

					updateMasterPan(ui.value, this);
				},

				change: function(e, ui){

				 	updateMasterPan(ui.value, this);
				}
			});

		f1.slider({

				orientation: "vertical",
				min: 100,
				max: 2100,
				step: 0.01,
				value: 1100,
				slide: function(e, ui){

					updateLPF(ui.value, this);
				},

				change: function(e, ui){

				 	updateLPF(ui.value, this);
				}
			});

		f2.slider({
				orientation: "vertical",
				min: 0,
				max: 20,
				step: 0.01,
				value: 0,
				slide: function(e, ui){

					updateLFO1(ui.value, this);
				},

				change: function(e, ui){

					updateLFO1(ui.value, this);
				}
			});

		f3.slider({
				orientation: "vertical",
				min: 0,
				max: 1,
				step: 0.01,
				value: 0,
				// slide: function(e, ui){

				// 	update(ui.value, this);
				// },

				// change: function(e, ui){

				// 	update(ui.value, this);
				// }
			});

		ctx = new AudioContext();
		setupEventListeners();
	};

	function getVerb(source, url) {

	  var request = new XMLHttpRequest();
	  request.open('GET', url , true);
	  request.responseType = 'arraybuffer';

	  request.onload = function() {

	    var audioData = request.response;
	    ctx.decodeAudioData(audioData, function(buffer) {

	        source.buffer = buffer;
	      });
	  }

	  request.send();
	}

	function startOsc(){




		oscToggle = "start";
		oscOne = ctx.createOscillator(),

		analyser = ctx.createAnalyser(),
                             	analyser.fftsize = 2048,


		oscOneGain = ctx.createGain(),
		oscOne.type = "sawtooth",
		oscOne.frequency.value = 110,

		lfo1 = ctx.createOscillator(),
		lfo1.type = "sine",
		lfo1Gain = ctx.createGain(),
		lfo1.frequency.value = lfo1Level,

		convolver = ctx.createConvolver(),
		getVerb(convolver, path, true);

		masterPan = ctx.createPanner(),
		masterPan.panningModel = "equalpower";
		// masterPan.panningModel = "HRTF"; // default

		lpf = ctx.createBiquadFilter(),
		lpf.type = "lowpass",

		masterGain = ctx.createGain(),
		destination = ctx.destination;

		updateLFO1();
		updateLPF();
		updateMasterPan();
		updateMasterVol();

		lfo1.connect(oscOneGain.gain);

		oscOne.connect(oscOneGain);

		oscOneGain.connect(lpf);
		lpf.connect(masterPan);
		masterPan.connect(convolver);
		convolver.connect(masterGain);
		//masterGain.connect(destination);
		masterGain.connect(analyser);
		analyser.connect(destination);

		oscOne.start(0);
		lfo1.start(0);
		waveLooper();
	};

	function waveLooper(){
		looper = window.requestAnimationFrame(waveLooper);

		bufferLength = analyser.fftSize,
		dataArray = new Uint8Array(bufferLength);
		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

		analyser.getByteTimeDomainData(dataArray);

		canvasCtx.fillStyle = "rgba(255, 255, 255, 0)";
      		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      		canvasCtx.lineWidth = 2;
      		canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      		canvasCtx.beginPath();

      		var sliceWidth = canvas.width * 1.0 / bufferLength;
      		var x = 0;

		for(var i = 0; i < bufferLength; i++) {

			var v = dataArray[i] / 128.0;
			var y = v * canvas.height/2;

			if(i === 0) {
				canvasCtx.moveTo(x, y);
			}
			else {
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		canvasCtx.lineTo(canvas.width, canvas.height/2);
     		canvasCtx.stroke();
	};

	function stopOsc(){

		oscToggle = "stop";
		oscOne.stop(0);
		lfo1.stop(0);

		function looperF(){
			window.cancelAnimationFrame(looper)
		};

		setTimeout(looperF, 4000);
	};

	function updateLFO1(l, el){

	 	l === undefined ? lfo1Level : lfo1Level = l;

	 	if (lfo1){
			lfo1.frequency.value = lfo1Level;
		}

		if (el !== undefined){
			el.setAttribute("title", "lfo1 " + lfo1Level);
		}
	};

	function updateLPF(l, el){

	 	l === undefined ? lpfLevel : lpfLevel = l;

	 	if (lpf){
			lpf.frequency.value = lpfLevel;
		}

		if (el !== undefined){
			el.setAttribute("title", "lpf " + lpfLevel);
		}
	};

	function updateMasterPan(p, el){

	 	p === undefined ? masterPanLevel : masterPanLevel = p;

	 	var z = 1 - Math.abs(masterPanLevel);
	 	if (masterPan){
			masterPan.setPosition(masterPanLevel,0,z);
		}

		if (el !== undefined){
			el.setAttribute("title", "pan " + masterPanLevel);
		}
	};

	function updateMasterVol(v, el){

	 	v === undefined ? masterGainVol : masterGainVol = v;

	 	if (masterGain){
			masterGain.gain.value = masterGainVol;
		}

		if (el !== undefined){
			el.setAttribute("title", "amp " + masterGainVol);
		}

	};

	function toggleOsc(){
		oscToggle !== "start" ? startOsc() : stopOsc()
	};

	function setupEventListeners(){

		ms.addEventListener("click", toggleOsc);
	};

	return 	{
		init : init
	};

}(jQuery));

(function(){
	sbx1.init();
}());