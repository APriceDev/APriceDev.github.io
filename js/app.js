
var lissajous = (function(){
    "use strict";

    var scope, canvasCtx;

    var drawSine = function(){

        var x, y, amt = 400, offsetX = scope.width/2, offsetY = scope.height/2, amp = 6, sz = 2;

        for (var i = 0; i <amt; i++) {

            x = Math.round(amp + i/25 * (Math.sin(i) * 10) + offsetX);
            y = Math.round(amp + i/30  * (Math.cos(i) * 10) + offsetY);
            canvasCtx.fillStyle = "rgba(41,45,48,1)";
            canvasCtx.fillRect(x, y, sz, sz);
        };
    };

    var init = function(){

        scope = document.getElementById("scope"),
        canvasCtx = scope.getContext("2d");

        drawSine();
    };

    return {
        init : init
    };

}());

(function(){
    lissajous.init();
}());