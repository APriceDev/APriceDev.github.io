/**
* NoiseBox NB-1 v0.9
**/

var nb1 = (function($){
    "use strict"
    var audioCtx,
    destination,
    osc1,
    osc1Type = "sine",
    osc1Frq = 440,
    osc1Gain,
    osc1GainLevel = 0.25,
    vol,
    volumeState,
    frq,
    frqState,
    radioOcs,
    osc1Btn,
    osc1Toggle,

    ocs1LFO,
    osc1LFOType = "sine",
    osc1LFOFrq = 0,
    ocs1LFOGain,
    ocs1LFOGainLevel = 0,
    volLFO,
    frqLFO,
    radioOcsLFO,
    lfoState,
    lfoFrqState,

    lpf,
     frqLPF,
     LFPFrq = 3000,
     lpfFrqState,

    analyser,
    canvasCtxScope,
    isPaused = false,
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

        vol = $("#volume");
        frq = $("#frequency");
        volLFO = $("#volumeLfo");
        frqLFO = $("#frequencyLfo");
        frqLPF = $("#frequencyLpf");

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

        frq.slider({
                    //orientation: "vertical",
                    min: 10,
                    max: 3000,
                    step: 1,
                    value: osc1Frq,
                    slide: function(e, ui){

                    updateFrequency(ui.value, this);
                    },

                    change: function(e, ui){

                    updateFrequency(ui.value, this);
                    }
                });

        volLFO.slider({
                    //orientation: "vertical",
                    min: 0,
                    max: 1.01,
                    step: 0.01,
                    value: ocs1LFOGainLevel,
                    slide: function(e, ui){

                    updateLFOVolume(ui.value, this);
                    },

                    change: function(e, ui){

                    updateLFOVolume(ui.value, this);
                    }
                });

        frqLFO.slider({
                    //orientation: "vertical",
                    min: 0,
                    max: 3000,
                    step: 1,
                    value: osc1LFOFrq,
                    slide: function(e, ui){

                    updateLFOFrequency(ui.value, this);
                    },

                    change: function(e, ui){

                    updateLFOFrequency(ui.value, this);
                    }
                });

        frqLPF.slider({
                    //orientation: "vertical",
                    min: 0,
                    max: 3000,
                    step: 1,
                    value: LFPFrq,
                    slide: function(e, ui){

                    updateLPFFrequency(ui.value, this);
                    },

                    change: function(e, ui){

                    updateLPFFrequency(ui.value, this);
                    }
                });


    });

    var freeze = function(){

        isPaused = !isPaused;
        //console.log(isPaused);
    }

    var scopeLooper = function(){
        looperScope = window.requestAnimationFrame(scopeLooper);

        if(!isPaused){
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
            //console.log("scope running");
        }
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

        analyser = audioCtx.createAnalyser();
        analyser.fftsize = 2048;

        osc1 = audioCtx.createOscillator();
        osc1.type = osc1Type;
        osc1.frequency.value = osc1Frq;
        osc1Gain = audioCtx.createGain();

        ocs1LFO = audioCtx.createOscillator();
        ocs1LFO.type = osc1LFOType;
        ocs1LFO.frequency.value = osc1LFOFrq;
        ocs1LFOGain = audioCtx.createGain();

        lpf = audioCtx.createBiquadFilter();
        lpf.type = "lowpass";

        waveState();
        waveStateLFO();

        updateLFOVolume();
        updateLFOFrequency();
        updateLPFFrequency();
        updateVolume();

        ocs1LFO.connect(ocs1LFOGain);
        ocs1LFOGain.connect(osc1Gain.gain);
        // ocs1LFOGain.connect(destination);

        osc1.connect(osc1Gain);
        osc1Gain.connect(lpf);
        lpf.connect(analyser);
        analyser.connect(destination);

        osc1.start(0);
        ocs1LFO.start(0);
        scopeLooper();
        fftLooper();
    };

    var stopOsc1 = function(){

        osc1Toggle = "stopOsc1";
        osc1.stop(0);
        ocs1LFO.stop(0);

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
        isPaused = false;
    };

    var updateVolume = function(value, el){

        value === undefined ? osc1GainLevel : osc1GainLevel = value;

        if (osc1Gain){
            osc1Gain.gain.value = osc1GainLevel;
        }

        if (el !== undefined){
            volumeState.innerHTML = " " + (parseInt(value*100)) + "%";
        }
    };

    var updateFrequency = function(value, el){

        value === undefined ? osc1Frq : osc1Frq = value;

        if (osc1){
            osc1.frequency.value = osc1Frq;
        }

        if (el !== undefined){
            frequencyState.innerHTML = " " + value + " hz";
        }
    };

    var updateLFOVolume = function(value, el){

        value === undefined ? ocs1LFOGainLevel : ocs1LFOGainLevel = value;

        if (ocs1LFOGain){
            ocs1LFOGain.gain.value = ocs1LFOGainLevel;
        }

        if (el !== undefined){
            volumeLfoState.innerHTML = " " + (parseInt(value*100)) + "%";
        }
    };

    var updateLFOFrequency = function(value, el){

        value === undefined ? osc1LFOFrq : osc1LFOFrq = value;

        if (ocs1LFO){
            ocs1LFO.frequency.value = osc1LFOFrq;
        }

        if (el !== undefined){
            frequencyLfoState.innerHTML = " " + value + " hz";
        }
    };

    var updateLPFFrequency = function(value, el){

        value === undefined ? LFPFrq : LFPFrq = value;

        if (lpf){
            lpf.frequency.value = LFPFrq;
        }

        if (el !== undefined){
            frequencyLpfState.innerHTML = " " + value + " hz";
        }
    };



    var waveState = function(e){

        e === undefined ? osc1Type : osc1Type = e.target.id;
        if(osc1){
            osc1.type = osc1Type;
        }
    };

    var waveStateLFO = function(e){

        e === undefined ? osc1LFOType : osc1LFOType = e.target.id.substring(0, e.target.id.length -3);
        if(ocs1LFO){
            ocs1LFO.type = osc1LFOType;
        }
    };

    var toggleOsc1 = function(){

        osc1Toggle !== "start" ? (startOsc1(), osc1Btn.className = "toggle btnOn") : (stopOsc1(), osc1Btn.className =  "toggle");
    };

    var setupEventListeners = function(){

        scope.addEventListener("click", freeze);
        osc1Btn.addEventListener("click", toggleOsc1);
        radioOcs.addEventListener("click", waveState);
        radioOcsLFO.addEventListener("click", waveStateLFO);
    };

    var init = function(){

        osc1Btn = document.getElementById("osc1Btn");
        radioOcs = document.getElementById("radioOcs");
        radioOcsLFO = document.getElementById("radioLfo");

        volumeState = document.getElementById("volumeState");
        volumeState.innerHTML = " 25%";
        frqState = document.getElementById("frequencyState");
        frqState.innerHTML = " 440 hz";

        lfoState = document.getElementById("volumeLfoState");
        lfoState.innerHTML = " 0%";
        lfoFrqState = document.getElementById("frequencyLfoState");
        lfoFrqState.innerHTML = " 0 hz";

        lpfFrqState = document.getElementById("frequencyLpfState");
        lpfFrqState.innerHTML = " 3000 hz";


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