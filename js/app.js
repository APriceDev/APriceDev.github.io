// canvas demo

var demo = (function($) {
"use strict";

    var canvas,
            ctx;

    function draw(){
        canvas = document.getElementById("logo"),
        ctx = canvas.getContext("2d"),
        //ctx.fillStyle = "rgba(41,45,148,1)",
        //ctx.fillRect(0,0,100,100);
        ctx.beginPath();
        ctx.moveTo(100,0);
        ctx.lineTo(100,160);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "white";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0,160);
        ctx.lineTo(100,0);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "white";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(100,4);
        ctx.lineTo(130,4);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "white";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(130,93);
        ctx.lineTo(42,93);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "white";
        ctx.stroke();

        // arc
        var x = canvas.width / 1.63;
        var y = canvas.height / 3.32;
        var radius = 45;
        var startAngle = 1.5 * Math.PI;
        var endAngle = 2.5 * Math.PI;
        var counterClockwise = false;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "white";
        ctx.stroke();

    };

    return  {box : draw};

}(jQuery));

(function(){
    demo.box();
}());