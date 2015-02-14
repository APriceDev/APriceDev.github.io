/**
* NoiseBox NB-1 v0.9
**/

var nb1 = (function($){
    "use strict"
    var audioCtx,
    destination,
    osc1,
    osc1Type = "sine",
    osc1Gain,
    osc1GainLevel = 0.25,
    vol,
    volumeState,
    radio,
    osc1Btn,
    osc1Toggle,
    analyser,
    canvasCtxScope,
    scope,
    looperScope,
    scopeBufferLength,
    scopeBufferArray,
    canvasCtxFft,
    fft,
    looperFft,
    fftBufferArray,
    bars,
    barX,
    barWidth,
    barHeight;

    $(function($) {

        vol = $("#volume")

        vol.slider({
                    //orientation: "vertical",
                    min: 0,
                    max: 1.01,
                    step: 0.01,
                    value: osc1GainLevel,
                    slide: function(e, ui){

                    updateVolume(ui.value, this);
                    },

                    change: function(e, ui){

                    updateVolume(ui.value, this);
                    }
                });
    });


    var scopeLooper = function(){
        looperScope = window.requestAnimationFrame(scopeLooper);

        scopeBufferLength = analyser.fftSize,
        scopeBufferArray = new Uint8Array(scopeBufferLength);
        canvasCtxScope.clearRect(0, 0, scope.width, scope.height);

        analyser.getByteTimeDomainData(scopeBufferArray);

        canvasCtxScope.fillStyle = "rgba(255, 255, 255, 0)";
        canvasCtxScope.fillRect(0, 0, scope.width, scope.height);
        canvasCtxScope.lineWidth = 1;
        canvasCtxScope.strokeStyle = "rgba(41,45,48,1)";
        canvasCtxScope.beginPath();

        var sliceWidth = scope.width * 1.0 / scopeBufferLength;
        var x = 0;

        for(var i = 0; i < scopeBufferLength; i++) {

            var v = scopeBufferArray[i] / 128.0;
            var y = v * scope.height/2;

            if(i === 0) {
                canvasCtxScope.moveTo(x, y);
            }
            else {
                canvasCtxScope.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtxScope.lineTo(scope.width, scope.height/2);
        canvasCtxScope.stroke();
        // console.log("scope running");
    };

    function fftLooper(){

        looperFft = window.requestAnimationFrame(fftLooper);
        fftBufferArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(fftBufferArray);
        canvasCtxFft.clearRect(0, 0, fft.width, fft.height);
        bars = 200;

        for (var i = 3; i < bars; i++) {

        barX = i * 3;
        barWidth = 2;
        barHeight = -(fftBufferArray[i] / 2);
        canvasCtxFft.fillStyle = "rgba(41,45,48," + Math.abs(barHeight / 100) +  ")";
        canvasCtxFft.fillRect(barX, fft.height, barWidth, barHeight);
        }
        //console.log("fft running");
    };

    var startOsc1 = function(){

        osc1Toggle = "start";

        destination  = audioCtx.destination;

        analyser = audioCtx.createAnalyser(),
        analyser.fftsize = 2048,

        osc1 = audioCtx.createOscillator();
        osc1.type = osc1Type;
        osc1Gain = audioCtx.createGain();

        waveState();
        updateVolume();

        osc1.connect(osc1Gain);
        osc1Gain.connect(analyser);
        analyser.connect(destination);

        osc1.start(0);
        scopeLooper();
        fftLooper();
    };

    var stopOsc1 = function(){

        osc1Toggle = "stopOsc1";
        osc1.stop(0);

        function scopeLooperF(){
        window.cancelAnimationFrame(looperScope);
        window.cancelAnimationFrame(looperFft);

        canvasCtxScope.clearRect(0, 0, scope.width, scope.height);
        canvasCtxScope.beginPath();
        canvasCtxScope.moveTo(600, 50);
        canvasCtxScope.lineTo(0, 50);
        canvasCtxScope.lineWidth = 1;
        canvasCtxScope.strokeStyle = "rgba(41,45,48,1)";
        canvasCtxScope.stroke();

        canvasCtxFft.clearRect(0, 0, fft.width, fft.height);
        };

        setTimeout(scopeLooperF, 10);
    };

    var updateVolume = function(value, el){

        value === undefined ? osc1GainLevel : osc1GainLevel = value;

        if (osc1Gain){
            osc1Gain.gain.value = osc1GainLevel;
        }

        if (el !== undefined){
            volumeState.innerHTML = " " + (parseInt(value*100)) + "%";
        }
    }
    var waveState = function(e){

        e === undefined ? osc1Type : osc1Type = e.target.id;
        if(osc1){
            osc1.type = osc1Type;
        }
    };

    var toggleOsc1 = function(){

        osc1Toggle !== "start" ? (startOsc1(), osc1Btn.className = "toggle btnOn") : (stopOsc1(), osc1Btn.className =  "toggle");
    };

    var setupEventListeners = function(){

        osc1Btn.addEventListener("click", toggleOsc1);
        radio.addEventListener("click", waveState);
    };

    var init = function(){

        osc1Btn = document.getElementById("osc1Btn");
        radio = document.getElementById("radio");

        volumeState = document.getElementById("volumeState");
        volumeState.innerHTML = " 25%";

        audioCtx = new AudioContext();
        scope = document.getElementById("scope"),
        canvasCtxScope = scope.getContext("2d");

        canvasCtxScope.beginPath();
        canvasCtxScope.moveTo(600, 50);
        canvasCtxScope.lineTo(0, 50);
        canvasCtxScope.lineWidth = 1;
        canvasCtxScope.strokeStyle = "rgba(41,45,48,1)";
        canvasCtxScope.stroke();

        fft = document.getElementById("fft"),
        canvasCtxFft = fft.getContext("2d");


        setupEventListeners();
    };

    return {
        init: init
    };
}(jQuery));

(function(){
    nb1.init();
}());