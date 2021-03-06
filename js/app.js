
var lissajous = (function(){
    "use strict";

    var scope, canvasCtx;

    var drawLogo = function(){

        var x, y, amt = 400, offsetX = scope.width/2 -25, offsetY = scope.height/2, amp = 6, sz = 8, opacity = 0.8;

        for (var i = 0; i < amt; i++) {

            x = Math.round(amp + i/25 * (Math.sin(i) * 10) + offsetX);
            y = Math.round(amp + i/30  * (Math.cos(i) * 10) + offsetY);
            canvasCtx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
            //canvasCtx.fillStyle = "rgba(41, 45, 48, " + opacity + ")";
            canvasCtx.fillRect(x, y, sz, sz);

            opacity -= 0.002;
        };
    };

    var init = function(){

        scope = document.getElementById("scope"),
        canvasCtx = scope.getContext("2d");

        drawLogo();
        //scope.className = "unBlur";
    };

    return {
        init : init
    };

}());

(function(){
    lissajous.init();
}());