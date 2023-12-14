/*
var canvasW = 0;
var canvasH = 0;
var marginW = 20;
var lineSkip = 10;
var currenty = 20;

var scroll = new Rectangle(0, 0, 12, 0);
var drag = new Rectangle(0, 0, 10, 40);

var mousepos = new Vector(0, 0);
var grabdelta = new Vector(0, 0);
var ismousedown = false;
var last_mouse_down_tgt;

var playertxt = "";                     // Players current input text.
let objArr = [];                        // EditBox Array.
*/

const BOTTOM_PAD = 150;
const BOTTOM_TEXT = 75;

const COLOR_BLACK = "#000000";
const COLOR_WHITE = "#FFFFFF";
const COLOR_RED   = "#FF0000";
const COLOR_GREEN = "#00FF00";
const COLOR_BLUE  = "#0000FF";
const COLOR_MAGENTA  = "#FF00FF";
const COLOR_LT_RED   = "#800000";
const COLOR_LT_GREEN = "#008000";
const COLOR_LT_BLUE  = "#000080";
const COLOR_DK_RED   = "#8b0000";
const COLOR_DK_GREEN = "#008b00";
const COLOR_DK_BLUE  = "#00008b";

const COLOR_SCROLLBAR_GREY = "rgb(241, 241, 241)";
const COLOR_DRAGBAR_GREY   = "rgb(193, 193, 193)";

const COLOR_TITLE_TXT = COLOR_RED;
const COLOR_PLAYER_TXT = COLOR_DK_GREEN;
const COLOR_NARRATOR_TXT = COLOR_BLUE;

const DB_VERSION_MAJOR = "01";
const DB_VERSION_MINOR = "01";

let KEY_CODE = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    END: 35,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46
};

//=====================================================================
// Object Structures.

function Rectangle(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function GameText(x, y, color, font, text) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.font = font;
    this.text = text;
}

//=====================================================================
// Class Definition.

class displaybox {

    constructor() {
        this.canvasW = 0;
        this.canvasH = 0;
        this.marginW = 20;
        this.lineSkip = 10;
        this.currenty = 20;

        this.scroll = new Rectangle(0, 0, 12, 0);
        this.drag = new Rectangle(0, 0, 10, 40);

        this.grabdelta = new Vector(0, 0);
        this.ismousedown = false;
        this.last_mouse_down_tgt;

        this.playertxt = "";                     // Players current input text.
        this.objArr = [];                        // EditBox Array.
    }

//=====================================================================

setup_canvas() {
    const canvas = document.getElementById("gamechat");
    const ctx = canvas.getContext("2d");
    
    console.log("setup_canvas()");

    if (!ctx) {
        // canvas-unsupported.
        console.log("Canvas is unsupported.");
        return;
    }
    
    this.canvasW = canvas.getBoundingClientRect().width;
    this.canvasH = canvas.getBoundingClientRect().height;

    this.paint(canvas);
    
    // Register callbacks.
    canvas.addEventListener("mousedown", (e) =>
    {
        // tell the browser we're handling this event.
        const canvas = document.getElementById("gamechat");
        var mousepos;

        //e.preventDefault();
        //e.stopPropagation();

        mousepos = this.get_mouse_pos(canvas, e);
        console.log("canvas.mousedown (" + mousepos.x + "," + mousepos.y + ")");
        
        // IF click on Drag area, then Calculate the grabdelta.
        if (this.is_point_in_rect(mousepos.x, mousepos.y, this.drag)) {
            this.grabdelta.x = mousepos.x - this.drag.x;
            this.grabdelta.y = mousepos.y - this.drag.y;
            this.ismousedown = true;
            return;
        }

        // IF click on Scroll area, then move the dragbar up or down by set amount.
        if (this.is_point_in_rect(mousepos.x, mousepos.y, this.scroll)) {
            if (mousepos.y > this.drag.y)
                this.drag.y += this.drag.h;
            else if (mousepos.y < this.drag.y)
                this.drag.y -= this.drag.h;

            // Re-Paint Canvas.
            this.paint(canvas);
        }
    });

    canvas.addEventListener("mouseup", (e) =>
    {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        if(e.button == 0) {
            // left click
            this.ismousedown = false;
            console.log("canvas.mouseup event.");
        }
    });
    
    canvas.addEventListener("mouseout", (e) =>
    {
        this.ismousedown = false;
        console.log("canvas.mouseout event.");
    });
    
    canvas.addEventListener("mousemove", (e) =>
    {
        const canvas = document.getElementById("gamechat");
        var mousepos;
        
        if (!this.ismousedown)
            return;

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mousepos = this.get_mouse_pos(canvas, e);
    
        this.drag.y = mousepos.y - this.grabdelta.y;

        console.log("canvas.mousemove (" + mousepos.x + "," + mousepos.y + ")");
        
        // Re-Paint Canvas.
        this.paint(canvas);
    });

    document.addEventListener("mousedown", (e) =>
    {
        // Store target of where the mouse was last clicked.
        this.last_mouse_down_tgt = e.target;
        console.log("document.mousedown");
    });
    
    
    document.addEventListener("keydown", (e) =>
    {
        const canvas = document.getElementById("gamechat");
                
        if (this.last_mouse_down_tgt == canvas) {
            console.log("document.keydown");
            this.on_key_press(canvas, e.key, e.keyCode);

            e.preventDefault();
            e.stopPropagation();
        }
    });
}

//=====================================================================
// Returns mouse position relative to canvas.

get_mouse_pos(canvas, e) {
    let rect = canvas.getBoundingClientRect();
    let p = new Vector(0, 0);

    p.x = e.clientX - rect.left; 
    p.y = e.clientY - rect.top;

    return p;
}

//=====================================================================
// Collision: Point and Rectangle.

is_point_in_rect(x, y, rect) {
    if (x >= rect.x && x <= (rect.x + rect.w) &&
        y >= rect.y && y <= (rect.y + rect.h) )
        return true;
    return false;
}

//=====================================================================
// Draw the scroll bar.

paint_scrollbar(canvas) {
    const ctx = canvas.getContext("2d");

    // Clear canvas to white.
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Scroll bar.
    this.scroll.h = this.canvasH;
    this.scroll.x = this.canvasW - this.scroll.w;
    ctx.fillStyle = COLOR_SCROLLBAR_GREY;
    ctx.fillRect(this.scroll.x, this.scroll.y, this.scroll.w, this.scroll.h);

    // Make sure drag position doesn't go past the min or max.
    if (this.drag.y < this.scroll.y)
        this.drag.y = this.scroll.y;

    if (this.drag.y > (this.scroll.h - this.drag.h))
        this.drag.y = this.scroll.h - this.drag.h;

    // Scrolls Drag bar.
    this.drag.x = this.scroll.x + ((this.scroll.w - this.drag.w) / 2);
    ctx.fillStyle = "rgb(193, 193, 193)";
    ctx.fillRect(this.drag.x, this.drag.y, this.drag.w, this.drag.h);
}

//=====================================================================
// Paint function (public member function).

repaint() {
    const canvas = document.getElementById("gamechat");
    this.paint(canvas);
}

//=====================================================================
// Main Paint function (private member function).

paint(canvas) {
    this.paint_scrollbar(canvas);

    // Find total length in pixels.
    var len = this.get_total_length();

    // Create percentage value between 0 and 1.0.
    var percent = this.drag.y / (this.scroll.h - this.drag.h);

    // Calculate the pixel to start rendering at.
    var pxl_start = (len * percent) - this.drag.h;
    // Make sure pxl_start is not (-ve).
    if (pxl_start < 0) pxl_start = 0;

    console.log("pxl_start=" + pxl_start.toFixed(3) + " percent=" + percent.toFixed(3));

    // Render text.
    this.render_history(canvas, pxl_start);
}

//=====================================================================
// Walk through text until we hit pxl_start then render (for scroll.h pixels).

render_history(canvas, pxl_start) {
    const ctx = canvas.getContext("2d");

    console.log("render_history()");
    
    for (const obj of this.objArr) {

        //console.log("obj.y:" + obj.y + 
        //            " pxl_start:" + pxl_start + 
        //            " pxl_start+scroll.h:" + (pxl_start + this.scroll.h) +
        //            " scroll.h:" + this.scroll.h);

        if ( (obj.y > pxl_start) && (obj.y < (pxl_start + this.scroll.h)) ) {

            var xx = obj.x;
            var yy = obj.y - pxl_start;
        
            ctx.font = obj.font;
            ctx.fillStyle = obj.color;
            ctx.textAlign = "start";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(obj.text, xx, yy);

            //console.log("A:" + xx + " " + yy + " " + obj.text);
        }
    }
}

//=====================================================================
// Set percentage for Drag bar.
//  percent - Value between 0 and 1.0.

set_dragbar(percent) {

    // Find total length in pixels.
    var len = this.get_total_length();

    // Set the new position of the drag bar.
    this.drag.y = (this.scroll.h - this.drag.h) * percent;
    
    console.log("percent=" + percent + " drag.y=" + this.drag.y);
}

//=====================================================================
// Make sure the dragbar is visible. Set Drag bar to bottom.

set_dragbar_to_bottom() {    
    
    var len = this.get_total_length();

    // Create percentage value between 0 and 1.0.
    var percent = this.drag.y / (this.scroll.h - this.drag.h);

    // Calculate the pixel to start rendering at.
    var pxl_start = (len * percent) - this.drag.h;
    // Make sure pxl_start is not (-ve).
    if (pxl_start < 0) pxl_start = 0;
    
    if ( (this.currenty > pxl_start) && (this.currenty < (pxl_start + this.scroll.h)) )
        this.set_dragbar(1.0);
}

//=====================================================================
// Add string.

add_string(text, color, font) {
    const canvas = document.getElementById("gamechat");
    const ctx = canvas.getContext("2d");
    const myArray = text.split(" ");
    var sentence = "";

    console.log("add_string(" + text + ")");
        
    ctx.font = font;

    for (const word of myArray) {
        var tmp = sentence + SPACE + word;

        var l = ctx.measureText(tmp).width;

        // Check for full width sentence.
        if (l > (this.canvasW - this.marginW - this.scroll.w) ) {
            var gt = new GameText(this.marginW, this.currenty,  color, font, sentence);
            this.objArr.push(gt);
            sentence = "";
            this.currenty += this.get_font_height(ctx, sentence);
            this.currenty += this.lineSkip;
        }

        sentence += word + SPACE;
    }

    // Add the final part of the sentence.
    if (sentence != "" ) {
        var gt = new GameText(this.marginW, this.currenty,  color, font, sentence);
        this.objArr.push(gt);
        this.currenty += this.get_font_height(ctx, sentence);
        this.currenty += this.lineSkip;
    }

    this.set_dragbar_to_bottom();

    this.paint(canvas);
}

//=====================================================================
// Get length of text in pixels.

get_total_length() {

    var len = this.currenty - this.scroll.h;

    if (len < 0)
        len = 0;

    len += BOTTOM_PAD;

    return len;
}

//=====================================================================
// Get font height in whole pixels.

get_font_height(ctx, text) {
    var fM = ctx.measureText(text);
    var txtH = fM.actualBoundingBoxAscent + fM.actualBoundingBoxDescent;

    return Math.ceil(txtH);
}

//=====================================================================
// Key Press.

on_key_press(canvas, key, code) {
    console.log("Key pressed: " + key);

    switch (code) {
        case KEY_CODE.BACKSPACE:
            // Make sure we don't delete the PROMPT text.
            if (this.playertxt.length > 4) {
                this.playertxt = playertxt.slice(0, -1);
                this.edit_player_string(this.playertxt);
            }
            break;
        case KEY_CODE.TAB:
            break;
        case KEY_CODE.ENTER:
            get_game_response(this.playertxt);
            
            // Setup the users input prompt.
            this.setup_input_prompt();
            break;
        case KEY_CODE.SHIFT:
            break;
        case KEY_CODE.CTRL:
            break;
        case KEY_CODE.ALT:
            break;
        case KEY_CODE.END:
            break;
        case KEY_CODE.LEFT:
            break;
        case KEY_CODE.UP:
            break;
        case KEY_CODE.RIGHT:
            break;
        case KEY_CODE.DOWN:
            break;
        case KEY_CODE.DELETE:
            break;
        default:
            // Add all other characters to end of string.
            this.playertxt += key;
            console.log("Player Text: " + this.playertxt);
            this.edit_player_string(this.playertxt);
            break;
    }
    
    this.paint(canvas);
}

//=====================================================================
// Replace the last string in the array with 'txt'.

edit_player_string(txt) {
    var len = this.objArr.length;
    
    if (len > 2)
        this.objArr[len-1].text = txt;
}

//=====================================================================
// Set players input prompt.

setup_input_prompt() {
    this.playertxt = PROMPT;
    this.add_string(this.playertxt, COLOR_PLAYER_TXT, FONT_NORMAL);
}

//=====================================================================
// Debug.
// - List history in editbox.

debug() {
    
    for (const obj of this.objArr) {
        console.log("Y:" + (obj.y).toString() + " " + obj.text);
    }
}

//=====================================================================

} // End of Class
