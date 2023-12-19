// File: display.js

const COLOR_BLACK = "#000000";
const COLOR_WHITE = "#FFFFFF";
const COLOR_RED   = "#FF0000";
const COLOR_GREEN = "#00FF00";
const COLOR_BLUE  = "#0000FF";
const COLOR_MAGENTA     = "#FF00FF";
const COLOR_ORANGE      = "#FFA500";
const COLOR_PINK        = "#FF9BED";
const COLOR_LT_RED      = "#FFAD9B";
const COLOR_LT_GREEN    = "#9BFFAD";
const COLOR_LT_BLUE     = "#9BEDFF";
const COLOR_LT_YELLOW   = "#EDFF9B";
const COLOR_2LT_BLUE    = "#CEF6FF";
const COLOR_DK_RED      = "#8b0000";
const COLOR_DK_GREEN    = "#008b00";
const COLOR_DK_BLUE     = "#00008b";
const COLOR_DK_ORANGE   = "#FFC000";
const COLOR_DK_BROWN    = "#5C4033";

const COLOR_TB_LT_GREY = "rgb(241, 241, 241)";
const COLOR_TB_DK_GREY = "rgb(193, 193, 193)";

const COLOR_SCROLLBAR_GREY = "rgb(241, 241, 241)";
const COLOR_DRAGBAR_GREY   = "rgb(193, 193, 193)";

const COMPOSER_CANVAS = "composer";

const GRID_THROW_X = 10;
const GRID_THROW_Y = 10;

let KEY_CODE = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
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

class display {

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

        this.objArr = [];                        // EditBox Array.
        
        this.toolbar = new toolbar;
        
        // Screen offset.
        this.offset = new Vector(0, 0);
    }

//=====================================================================

setup_canvas() {
    const canvas = document.getElementById(COMPOSER_CANVAS);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        // canvas-unsupported.
        console.log("Canvas is unsupported.");
        return;
    }

    this.setup_toolbar();
    this.set_canvas_size();

    this.paint(canvas);
    
    // Register callbacks.
    canvas.addEventListener("mousedown", (e) =>
    {
        // tell the browser we're handling this event.
        const canvas = document.getElementById(COMPOSER_CANVAS);
        var mousepos;

        mousepos = this.get_mouse_pos(canvas, e);
        this.ismousedown = true;

        
        // IF click on Drag area, then Calculate the grabdelta.
        if (is_point_in_rect(mousepos.x, mousepos.y, this.drag)) {
            this.grabdelta.x = mousepos.x - this.drag.x;
            this.grabdelta.y = mousepos.y - this.drag.y;
            return;
        }

        // IF click on Scroll area, then move the dragbar up or down by set amount.
        if (is_point_in_rect(mousepos.x, mousepos.y, this.scroll)) {
            if (mousepos.y > this.drag.y)
                this.drag.y += this.drag.h;
            else if (mousepos.y < this.drag.y)
                this.drag.y -= this.drag.h;

            // Re-Paint Canvas.
            this.paint(canvas);
            return;
        }
        
        // Check if clicked on toolbar area.
        if (this.toolbar.on_toolbar_clicked(mousepos.x, mousepos.y)) {
            //console.log("Clicked on toolbar.");
            this.paint(canvas);
            return;
        }
        
        // If we are here then the click was on main part of canvas.
        // What we do depends on the toolbar selection.
        switch (this.toolbar.get_selected()) {
            case TOOLBAR_ADD:
                add_location(mousepos.x, mousepos.y);
                break;
            case TOOLBAR_SELECT:
                // Check if the mouse click was on location box.
                if (on_click_location_box(mousepos.x, mousepos.y))
                    break;

                start_select_box(mousepos.x, mousepos.y);
                break;
            case TOOLBAR_LINK:
                break;
            case TOOLBAR_NONE:
                // Do nothing.
                break;
        }
        
        // Re-Paint Canvas.
        this.paint(canvas);
    });


    canvas.addEventListener("mouseup", (e) =>
    {
        var mousepos = this.get_mouse_pos(canvas, e);

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        //console.log("canvas.mouseup event.");
        
        // Left button click.
        if(e.button == 0) {
         
            switch (this.toolbar.get_selected()) {
                case TOOLBAR_ADD:
                    break;
                case TOOLBAR_SELECT:
                    if (this.ismousedown == true)
                        finish_select_box(mousepos.x, mousepos.y);
                    break;
                case TOOLBAR_LINK:
                    break;
                case TOOLBAR_NONE:
                    // Do nothing.
                    break;
            }
        }
        
        this.ismousedown = false;
        
        // Re-Paint Canvas.
        this.paint(canvas);
    });

    
    canvas.addEventListener("mousemove", (e) =>
    {
        const canvas = document.getElementById(COMPOSER_CANVAS);
        var mousepos;
        
        if (!this.ismousedown)
            return;

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mousepos = this.get_mouse_pos(canvas, e);
    
        this.drag.y = mousepos.y - this.grabdelta.y;

        switch (this.toolbar.get_selected()) {
            case TOOLBAR_ADD:
                add_location(mousepos.x, mousepos.y);
                break;
            case TOOLBAR_SELECT:
                if (this.ismousedown == true)
                    move_select_box(mousepos.x, mousepos.y);
                break;
            case TOOLBAR_LINK:
                break;
            case TOOLBAR_NONE:
                // Do nothing.
                break;
        }
        
        // Re-Paint Canvas.
        this.paint(canvas);
    });


    // For IE/Chrome browsers.
    canvas.addEventListener("mousewheel", (e) => {
        this.on_mouse_wheel(e);
    });

    // For Firefox browsers.
    canvas.addEventListener("DOMMouseScroll", (e) => {
        this.on_mouse_wheel(e);
    });


    document.addEventListener("mousedown", (e) =>
    {
        // Store target of where the mouse was last clicked.
        this.last_mouse_down_tgt = e.target;
        //console.log("document.mousedown");
    });
    
    
    document.addEventListener("keydown", (e) =>
    {
        const canvas = document.getElementById(COMPOSER_CANVAS);
                
        if (this.last_mouse_down_tgt == canvas) {
            //console.log("document.keydown");
            this.on_key_press(canvas, e.key, e.keyCode);

            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    window.addEventListener("resize", (event) =>
    {
        console.log("window resize");
        this.set_canvas_size();
    });
}

//=====================================================================
// Mouse wheel has changed.

on_mouse_wheel(e) {
    const canvas = document.getElementById(COMPOSER_CANVAS);
    let scrollDirection;
    let wheelData = e.wheelDelta;

    // The scroll wheel direction for IE/Chrome vs. Firefox is reversed.
    if (wheelData)
        scrollDirection = wheelData;
    else
        scrollDirection = -1 * e.detail;

    if (scrollDirection > 0)
        this.drag.y -= this.drag.h;     // Scrolling up.
    else
        this.drag.y += this.drag.h;     // Scrolling down.

    // Re-Paint Canvas.
    this.paint(canvas);
}

//=====================================================================
// Sets the canvas size.

set_canvas_size() {
    const canvas = document.getElementById(COMPOSER_CANVAS);
    
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.position = "absolute";

    this.canvasW = canvas.getBoundingClientRect().width;
    this.canvasH = canvas.getBoundingClientRect().height;
    
    // Re-Paint Canvas.
    this.paint(canvas);
}

//=====================================================================
// Setup Toolbar.

setup_toolbar() {
    this.toolbar.addtool("Add", "Add Location", on_add_location,
                         "./res/toolbar_add.png", TOOLBAR_ADD);
    this.toolbar.addtool("Select", "Select Location", on_select_location,
                         "./res/toolbar_select.png", TOOLBAR_SELECT);
    this.toolbar.addtool("Delete", "Delete Selection", on_delete,
                         "./res/toolbar_trash.png", TOOLBAR_DELETE);
    this.toolbar.addtool("Link", "Draw link between locations", on_link,
                         "./res/toolbar_link.png", TOOLBAR_LINK);
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
// Paint function (public member function).

repaint() {
    const canvas = document.getElementById(COMPOSER_CANVAS);
    this.paint(canvas);
}

//=====================================================================
// Main Paint function (private member function).

paint(canvas) {
    this.paint_background(canvas);

    this.paint_grid(canvas);
    
    this.paint_scrollbar(canvas);
    
    this.toolbar.paint_toolbar(canvas);
    
    // Render the Loction boxes.
    paint_locations(canvas);
    
    // Render the dotted selector box.
    paint_select_box(canvas);


    // Find total length in pixels.
    var len = this.get_total_length();

    // Create percentage value between 0 and 1.0.
    var percent = this.drag.y / (this.scroll.h - this.drag.h);

    // Calculate the pixel to start rendering at.
    var pxl_start = (len * percent) - this.drag.h;
    // Make sure pxl_start is not (-ve).
    if (pxl_start < 0) pxl_start = 0;

    //console.log("pxl_start=" + pxl_start.toFixed(3) + " percent=" + percent.toFixed(3));
}

//=====================================================================
// Paint background.

paint_background(canvas) {
    const ctx = canvas.getContext("2d");

    // Clear canvas to background color.
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);
}

//=====================================================================
// Draw the scroll bar.

paint_scrollbar(canvas) {
    const ctx = canvas.getContext("2d");

    // Draw Scroll bar.
    this.scroll.h = this.canvasH;
    this.scroll.x = this.canvasW - this.scroll.w;
    ctx.fillStyle = COLOR_SCROLLBAR_GREY;
    ctx.fillRect(this.scroll.x, this.scroll.y, this.scroll.w, this.scroll.h);

    // Make sure drag position doesn't go past the min or max.
    if (this.drag.y < this.scroll.y)
        this.drag.y = this.scroll.y;

    if (this.drag.y > (this.scroll.h - this.drag.h))
        this.drag.y = this.scroll.h - this.drag.h;

    // Draw Drag bar.
    this.drag.x = this.scroll.x + ((this.scroll.w - this.drag.w) / 2);
    ctx.fillStyle = "rgb(193, 193, 193)";
    ctx.fillRect(this.drag.x, this.drag.y, this.drag.w, this.drag.h);
}

//=====================================================================
// Draw the grid of dots.

paint_grid(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = COLOR_TB_DK_GREY;

    var xrem = this.offset.x % GRID_THROW_X;
    var yrem = this.offset.y % GRID_THROW_Y;
    
    for (let x = xrem; x <= this.canvasW; x+=GRID_THROW_X) {
        for (let y = yrem; y <= this.canvasH; y+=GRID_THROW_Y) {
            ctx.beginPath();
            ctx.moveTo(x-1, y);
            ctx.lineTo(x+1, y);
            ctx.moveTo(x, y-1);
            ctx.lineTo(x, y+1);
            ctx.stroke();
        }
    }
}

//=====================================================================
// Set percentage for Drag bar.
//  percent - Value between 0 and 1.0.

set_dragbar(percent) {
    
    // Limit the percentage between 0.0 and 1.0.
    if (percent > 1.0)
        percent = 1.0;
    if (percent < 0.0)
        percent = 0.0;
    
    // Find total length in pixels.
    var len = this.get_total_length();

    // Set the new position of the drag bar.
    this.drag.y = (this.scroll.h - this.drag.h) * percent;
    
    //console.log("percent=" + percent + " drag.y=" + this.drag.y);
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
// Get length of text in pixels.

get_total_length() {

    var len = this.currenty - this.scroll.h;

    if (len < 0)
        len = 0;

    return len;
}

//=====================================================================
// Key Press.

on_key_press(canvas, key, code) {
    console.log("Key pressed: " + key);

    switch (code) {
        case KEY_CODE.BACKSPACE:
            // Make sure we don't delete the PROMPT text.
            if (this.playertxt.length > PROMPT.length) {
                this.playertxt = this.playertxt.slice(0, -1);
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
        case KEY_CODE.PAGEUP:
            this.on_scroll_by_line(canvas, 10, -1);
            break;
        case KEY_CODE.PAGEDOWN:
            this.on_scroll_by_line(canvas, 10, 1);
            break;
        case KEY_CODE.END:
            this.set_dragbar(1.0);
            break;
        case KEY_CODE.HOME:
            this.set_dragbar(0.0);
            break;
        case KEY_CODE.LEFT:
            break;
        case KEY_CODE.RIGHT:
            break;
        case KEY_CODE.UP:
            this.on_scroll_by_line(canvas, 1, -1);
            break;
        case KEY_CODE.DOWN:
            this.on_scroll_by_line(canvas, 1, 1);
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
// Scroll up/down by a line size.
//  canvas - Canvas.
//  count  - Number of lies to scroll by.
//  dir    - Direction (-1 is up, +1 is down).

on_scroll_by_line(canvas, count, dir) {
    const ctx = canvas.getContext("2d");
    var h = get_font_height(ctx, "A");
    
    h = h * count * dir;
    
    // Find total length in pixels.
    var len = this.get_total_length();

    // Set the new position of the drag bar.
    var percent = this.drag.y / (this.scroll.h - this.drag.h);
    
    // Find the pixel position (using the dragbar position).
    var pos = len * percent;
    
    // Modify the pixel position.
    pos = pos + h;
    
    // Find new percentage.
    percent = pos / len;
    
    this.set_dragbar(percent);
}

//=====================================================================
// Get screen offset.
// Return Type: Vector2

get_screen_offset() {
    return this.offset;
}

//=====================================================================
// Convert World to Screen coordinates.

world2screen(wx, wy) {
    var sc = new Vector(wx, wy);
    sc.x -= this.offset.x;
    sc.y -= this.offset.y;
    return sc;
}

//=====================================================================
// Convert Screen to World coordinates.

screen2world(sx, sy) {
    var wld = new Vector(sx, sy);
    wld.x += this.offset.x;
    wld.y += this.offset.y;
    return wld;
}

//=====================================================================

} // End of Class


