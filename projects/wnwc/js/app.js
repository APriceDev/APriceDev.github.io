// white noise and white caps
// version 0.9.2

var wnwc = (function($) {
"use strict";

    var  ctx,
            oscToggle,
            oscOne,
            oscTwo,
            lfo1,
            lfo1Gain,
            lfo2,
            lfo2Gain,
            lpf1,
            lpf2,
            panOne,
            panTwo,
            master,
            compressor,
            destination,
            path,
            analyser,
            // canvas
            canvas,
            canvasCtx,
            fbc_array,
            bars,
            bar_x,
            bar_width,
            bar_height;

	function init(){

		master = document.getElementById("masterSwitch");
		canvas = document.getElementById("fft");

		canvasCtx = canvas.getContext("2d");
		canvasCtx.fillStyle = "rgba(41,45,148,0)",
        		canvasCtx.fillRect(0,0,600,100);

		ctx = new AudioContext();
		setupEventListeners();
	};

	function whiteNoise(source){	// make a white noise here...
		var 	sampleRate = ctx.sampleRate,
			bufferSize = 5 * sampleRate,
			buffer = ctx.createBuffer(1, bufferSize, sampleRate),
			data = buffer.getChannelData(0);

		for (var i = 0; i < bufferSize; i++) {
			data[i] = Math.random();
		}
		source.buffer = buffer;
		source.loop = true;
	};

	function startOsc(){

		oscToggle = "start";
		destination = ctx.destination;

                             analyser = ctx.createAnalyser();
                             analyser.fftsize = 2048;



		oscOne = ctx.createBufferSource();
		whiteNoise(oscOne);

		oscTwo = ctx.createBufferSource();
		whiteNoise(oscTwo);

		lfo1 = ctx.createOscillator();
		lfo1.type = "sine";
		lfo1.frequency.value = 0.05;

		lfo1Gain = ctx.createGain();
		lfo1Gain.gain.value = 250;

		lfo2 = ctx.createOscillator();
		lfo2.type = "sine";
		lfo2.frequency.value = 0.07;

		lfo2Gain = ctx.createGain();
		lfo2Gain.gain.value = 300;

		path = [oscOne, oscTwo, lfo1, lfo2];

		panOne = ctx.createPanner(),
		panOne.panningModel = "equalpower";
		// masterPan.panningModel = "HRTF"; // default
		panOne.setPosition(0.5,0,0.5);

		panTwo = ctx.createPanner(),
		panTwo.panningModel = "equalpower";
		panTwo.setPosition(-0.6,0,0.5);

		lpf1 = ctx.createBiquadFilter();
		lpf1.type = "lowpass";
		//lpf1.frequency.value = 1000;

		lpf2 = ctx.createBiquadFilter();
		lpf2.type = "lowpass";

		// hpf = ctx.createBiquadFilter();
		// hpf.type = "highpass";

		compressor = ctx.createDynamicsCompressor();
		compressor.threshold.value = -50;
		compressor.knee.value = 40;
		compressor.ratio.value = 12;
		compressor.reduction.value = -20;
		compressor.attack.value = 0;
		compressor.release.value = 0.25;

		lfo1.connect(lfo1Gain);
		lfo1Gain.connect(lpf1.frequency);

		lfo2.connect(lfo2Gain);
		lfo2Gain.connect(lpf2.frequency);

		oscOne.connect(panOne);
		panOne.connect(lpf1);

		oscTwo.connect(panTwo);
		panTwo.connect(lpf2);

		lpf1.connect(compressor);
		lpf2.connect(compressor);
		compressor.connect(analyser);

		//lpf1.connect(destination);
		//lpf2.connect(destination);

                             analyser.connect(destination);


		for (var i = 0; i < path.length; i++) {
			path[i].start(0);
		};

                            frameLooper();
	};

               function frameLooper(){
                            window.requestAnimationFrame(frameLooper);
                            fbc_array = new Uint8Array(analyser.frequencyBinCount);
                            analyser.getByteFrequencyData(fbc_array);
                            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                            canvasCtx.fillStyle = "rgba(255,255,255,0.25)";
                            bars = 200;
                            for (var i = 3; i < bars; i++) {

                                bar_x = i * 3;
                                bar_width = 2;
                                bar_height = -(fbc_array[i] / 2);
                                canvasCtx.fillRect(bar_x, canvas.height, bar_width, bar_height);
                            }
               };

	function stopOsc(){

		oscToggle = "stop";

		for (var i = 0; i < path.length; i++) {
			path[i].stop(0);
		};
	};

	function toggleOsc(){

		oscToggle !== "start" ? startOsc() : stopOsc();
	};

	function setupEventListeners(){

		master.addEventListener("click", toggleOsc);
	};

	return 	{
		init : init
	};

}(jQuery));

(function(){
	wnwc.init();
}());