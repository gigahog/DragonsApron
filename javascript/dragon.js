
var canvasW = 0;
var canvasH = 0;

var scroll = new Rectangle(0, 0, 12, 0);
var drag = new Rectangle(0, 0, 10, 40);

var mousepos = new Vector(0, 0);
var grabdelta = new Vector(0, 0);
var ismousedown = false;

var htmlbuffer = "";

const COLOR_BLACK = "000000";
const COLOR_RED   = "FF0000";
const COLOR_GREEN = "00FF00";
const COLOR_BLUE  = "0000FF";
const COLOR_LT_RED   = "800000";
const COLOR_LT_GREEN = "008000";
const COLOR_LT_BLUE  = "000080";
const PROMPT = ">>> ";

window.addEventListener("load", start);


function start() {
    //loadxml();
    
    setup_canvas();
    
    // HTML.
    html_write_init();
    html_write_head(3, "The Dragons Apron", COLOR_RED);
    html_write_paragraph(PROMPT + "It was a cold, dark night and the wind whistled around", COLOR_BLUE);
    html_write_final();
    
    console.log("Buffer=" + htmlbuffer);
}

function loadxml() {
    // load xml file
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {    // IE 5/6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.overrideMimeType('text/xml');

    xhttp.open("GET", "../XML/DragonsApron.xml", false);
    xhttp.send();
    xhttp.onreadystatechange = function(){
        if (xhttp.status == "200")
            xmlDoc = xhttp.responseXML; 
    } 

    var uurloon = xmlDoc.getElementsByTagName("uurloon")[0].childNodes[0].textContent;
    var setloon = xmlDoc.getElementsByTagName("setloon")[0].childNodes[0].textContent;
    console.log(uurloon,setloon);
}

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

function setup_canvas() {
    const canvas = document.getElementById("gamechat");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
        // canvas-unsupported.
        console.log("Canvas is unsupported.");
        return;
    }
    
    canvasW = canvas.getBoundingClientRect().width;
    canvasH = canvas.getBoundingClientRect().height;

    paint(canvas);
    
    // Register callbacks.
    canvas.addEventListener("mousedown", function(e) 
    {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        get_mouse_pos(canvas);
        console.log("Coordinate x: " + mousepos.x, "Coordinate y: " + mousepos.y);
        
        // IF click on Drag area, then Calculate the grabdelta.
        if (is_point_in_rect(mousepos.x, mousepos.y, drag)) {
            grabdelta.x = mousepos.x - drag.x;
            grabdelta.y = mousepos.y - drag.y;
            ismousedown = true;
            return;
        }

        // IF click on Scroll area, then move the dragbar up or down by set amount.
        if (is_point_in_rect(mousepos.x, mousepos.y, scroll)) {
            if (mousepos.y > drag.y)
                drag.y += drag.h;
            else if (mousepos.y < drag.y)
                drag.y -= drag.h;

            paint(canvas);
        }
        
    });
    
    canvas.addEventListener("mouseup", function(e) 
    {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        if(e.button == 0) {
            // left click
            ismousedown = false;
        }
    });
    
    canvas.addEventListener("mouseout", function(e) 
    {
        ismousedown = false;
    });
    
    canvas.addEventListener("mousemove", function(e) 
    {
        const canvas = document.getElementById("gamechat");
                
        if (!ismousedown)
            return;
        
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        get_mouse_pos(canvas);
        
        drag.y = mousepos.y - grabdelta.y;

        paint(canvas);
    }); 
}

// Returns mouse position relative to canvas. 
function get_mouse_pos(canvas) {
    let rect = canvas.getBoundingClientRect(); 
    mousepos.x = event.clientX - rect.left; 
    mousepos.y = event.clientY - rect.top;
    return mousepos;
}

// Collision: Point and Rectangle.
function is_point_in_rect(x, y, rect) {
    if (x >= rect.x && x <= (rect.x + rect.w) &&
        y >= rect.y && y <= (rect.y + rect.h) )
        return true;
    return false;
}

function paint_scrollbar(canvas) {
    const ctx = canvas.getContext("2d");

    // Clear canvas to white.
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvasW, canvasH);
    
    // Scroll bar.
    scroll.h = canvasH;
    scroll.x = canvasW - scroll.w;
    ctx.fillStyle = "rgb(241, 241, 241)";
    ctx.fillRect(scroll.x, scroll.y, scroll.w, scroll.h);

    // Make sure drag position doesn't go past the min or max.
    if (drag.y < scroll.y)
        drag.y = scroll.y;
            
    if (drag.y > (scroll.h - drag.h))
        drag.y = scroll.h - drag.h;
    
    // Scrolls Drag bar.
    drag.x = scroll.x + ((scroll.w - drag.w) / 2);
    ctx.fillStyle = "rgb(193, 193, 193)";
    ctx.fillRect(drag.x, drag.y, drag.w, drag.h);
}

function paint(canvas) {
    paint_scrollbar(canvas);
    
    // Find total length in pixels.
    var len = get_total_length();
    
    var percent = drag.y / (scroll.y - drag.h);     // Gives value between 0 and 1.0.
    
    // Calculate the pixel to start rendering at.
    var pxl_start = (len * percent) - scroll.h;
    // Make sure pxl_start is not (-ve).
    if (pxl_start < 0) pxl_start = 0;
    
    // Walk through HTML until we hit pxl_start then render (for scroll.h pixels).
    walk_render(pxl_start);
}

function walk_render(pxl_start) {

}

function html_write_init() {

    // Empty buffer.
    htmlbuffer = "";
    
    htmlbuffer += "<!DOCTYPE html>";
    htmlbuffer += "<html>";
    htmlbuffer += "<head>";
    htmlbuffer += "<title>The Dragons Apron</title>";
    htmlbuffer += "</head>";
    htmlbuffer += "<body>";
}

function html_write_final() {

    htmlbuffer += "</body>";
    htmlbuffer += "</html>";
}

function html_write_head(i, str, colorstr) {

    htmlbuffer += "<h" + i + "><font color=#" + colorstr + ">" + str + "</font></h" + i + ">";
}

function html_write_paragraph(str, colorstr) {

    htmlbuffer += "<p><font color=#" + colorstr + ">" + str + "</font></p>";
}
