// File: helper.js
// Helper Functions.


//=====================================================================
// Collision: Point and Rectangle.

function is_point_in_rect(x, y, rect) {
    if (x >= rect.x && x <= (rect.x + rect.w) &&
        y >= rect.y && y <= (rect.y + rect.h) )
        return true;
    return false;
}

//=====================================================================
// Collision: Is rectangle aa fully within bounds of rectangle bb ?

function is_rect_fully_within(aa, bb) {
    if (aa.x >= bb.x &&
        aa.x+aa.w <= bb.x+bb.w &&
        aa.y >= bb.y &&
        aa.y+aa.h <= bb.y+bb.h)
        return true;
    return false;
}

//=====================================================================
// Collision: Check for partial collision between two rectangles.

function is_AABB_collision(aa, bb) {
    if (aa.x < bb.x + bb.w &&
        aa.x + aa.w > bb.x &&
        aa.y < bb.y + bb.h &&
        aa.y + aa.h > bb.y)
        return true;
    return false;
}

//=====================================================================
// Get font height in whole pixels.

function get_font_height(ctx, text) {
    var fM = ctx.measureText(text);
    var txtH = fM.actualBoundingBoxAscent + fM.actualBoundingBoxDescent;

    return Math.ceil(txtH);
}

//=====================================================================
// Get font width in whole pixels.

function get_font_width(ctx, text) {
    var fM = ctx.measureText(text);
    var txtW = fM.width;

    return Math.ceil(txtW);
}

//=====================================================================
// Fill in the arc of the circle.
// e.g.
//  /* Draw a semi-circle. */
//  draw_arc_fill(ctx, x, y, radius, Math.PI, 2*Math.PI, "#000000");

function draw_arc_fill(ctx, x, y, radius, startAngle, endAngle, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
}

//=====================================================================
// Return text that fits into 'target_width'.

function crop_text_to_size(ctx, text, target_width) {
    var i = 0;
    var txt = text;
    
    while (get_font_width(ctx, txt) > target_width) {
        txt = txt.slice(0, -1);
    }
    return txt;
}

//=====================================================================
// Pad a integer to a fixed length 'len' of pad characters 'pad'.
// e.g.
//    53, 5, '0' = "00053"
//  1234, 8, '*' = "****1234"

function padIt(nbr, len, pad) {
	var t = nbr.toString();
   
    while (t.length < len) {
        t = pad + t;
    }
    return t;
}

//=====================================================================
