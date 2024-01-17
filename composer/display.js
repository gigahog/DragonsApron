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
const COLOR_SKY_BLUE    = "#75aad9";

const COLOR_TB_LT_GREY = "rgb(241, 241, 241)";
const COLOR_TB_DK_GREY = "rgb(193, 193, 193)";

const COLOR_SCROLLBAR_GREY = "rgb(241, 241, 241)";
const COLOR_DRAGBAR_GREY   = "rgb(193, 193, 193)";

const COMPOSER_CANVAS = "composer";

const GRID_THROW_X = 10;
const GRID_THROW_Y = 10;

const SEL_MOVE = 2;

const KEY_OFFSET = 100;
const KEY_DELETE = TOOLBAR_DELETE + KEY_OFFSET;

const SCROLL_WIDTH = 16;
const DRAG_WIDTH = 12;

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

        this.ismousedown = false;
        this.last_mouse_down_tgt;
        
        this.location_guide_flag = false;
        this.location_guide_x = 0;
        this.location_guide_y = 0;

        this.objArr = [];                        // EditBox Array.
        
        this.toolbar = new toolbar;

        this.scrollH = new scrollbar;
        this.scrollV = new scrollbar;
        
        // Screen offset.
        this.offset = new Vector(0, 0);
        
        // Size of World canvas. 
        this.world = new Vector(0, 0);
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
    this.setup_scrollbars();

    this.paint(canvas);

    // Register callbacks.
    canvas.addEventListener("mousedown", (e) =>
    {
        const canvas = document.getElementById(COMPOSER_CANVAS);
        var mousepos = this.get_mouse_pos(canvas, e);

        // Convert mousepos to world coordinates.
        var worldmouse = this.screen2world(mousepos.x, mousepos.y);

        // Set mousedown flag.
        this.ismousedown = true;


        // Check for click on Drag area.
        if (this.scrollV.on_click_dragbar(mousepos.x, mousepos.y)) {
            this.scrollV.set_selected(true);
            return;
        }
        
        if (this.scrollH.on_click_dragbar(mousepos.x, mousepos.y)) {
            this.scrollH.set_selected(true);
            return;
        }


        // IF click on Scroll area, then move the vertical dragbar up or down by set amount.
        if (this.scrollV.on_click_scrollbar(mousepos.x, mousepos.y) ||
            this.scrollH.on_click_scrollbar(mousepos.x, mousepos.y)) {

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
                add_location(worldmouse.x, worldmouse.y);
                set_change_flag();
                break;
            case TOOLBAR_SELECT:
                // Check if the mouse click was on location box.
                if (on_click_location_box(mousepos.x, mousepos.y))
                    break;

                start_select_box(mousepos.x, mousepos.y);
                break;
            case TOOLBAR_LINK:
                lnk.on_add_link(worldmouse.x, worldmouse.y);
                set_change_flag();
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
        var worldmouse = this.screen2world(mousepos.x, mousepos.y);

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
                    lnk.on_finish_link(worldmouse.x, worldmouse.y);
                    set_change_flag();
                    break;
                case TOOLBAR_NONE:
                    // Do nothing.
                    break;
            }
        }
        
        this.ismousedown = false;
        
        // Mouse button is up, so unselect the scrollbar selection flags.
        this.scrollV.set_selected(false);
        this.scrollH.set_selected(false);
        
        // Re-Paint Canvas.
        this.paint(canvas);
    });

    
    canvas.addEventListener("mousemove", (e) =>
    {
        const canvas = document.getElementById(COMPOSER_CANVAS);
        var mousepos = this.get_mouse_pos(canvas, e);
        var worldmouse = this.screen2world(mousepos.x, mousepos.y);

        // Reset the flag everytime we move.
        this.location_guide_flag = false;

        
        // If mouse is not down.
        if (!this.ismousedown) {

            switch (this.toolbar.get_selected()) {
                case TOOLBAR_ADD:
                    this.location_guide_flag = true;
                    this.location_guide_x = mousepos.x;
                    this.location_guide_y = mousepos.y;
                    break;
            }
            this.paint(canvas);
            return;
        }

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        if (this.scrollV.is_dragbar_hit(mousepos.x, mousepos.y) || this.scrollV.is_selected())
            this.scrollV.set_grab_pos( mousepos.y );

        if (this.scrollH.is_dragbar_hit(mousepos.x, mousepos.y) || this.scrollH.is_selected())
            this.scrollH.set_grab_pos( mousepos.x );

        switch (this.toolbar.get_selected()) {
            case TOOLBAR_ADD:
                break;
            case TOOLBAR_SELECT:
                if (this.ismousedown == true)
                    move_select_box(mousepos.x, mousepos.y);
                break;
            case TOOLBAR_LINK:
                lnk.on_move_link(worldmouse.x, worldmouse.y);
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


    document.addEventListener("mousedown", (e) => {
        // Store target of where the mouse was last clicked.
        this.last_mouse_down_tgt = e.target;
    });
    
    
    document.addEventListener("keydown", (e) =>
    {
        const canvas = document.getElementById(COMPOSER_CANVAS);
                
        if (this.last_mouse_down_tgt == canvas) {
            this.on_key_press(canvas, e.key, e.keyCode);

            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    window.addEventListener("resize", (event) =>
    {
        console.log("window resize");
        this.set_canvas_size();
        this.setup_scrollbars();
    });
}

//=====================================================================
// Mouse wheel has changed.

on_mouse_wheel(e) {
    const canvas = document.getElementById(COMPOSER_CANVAS);
    let scrollDirection;
    let wheelData = e.wheelDelta;

    // The Y-scroll wheel direction for IE/Chrome vs. Firefox is reversed.
    if (wheelData)
        scrollDirection = wheelData;
    else
        scrollDirection = -1 * e.detail;

    if (scrollDirection > 0)
        this.scrollV.scroll_drag_up();
    else
        this.scrollV.scroll_drag_down();

    // Re-Paint Canvas.
    this.paint(canvas);
}

//=====================================================================
// Calculate the offset based on the dragbar position.

calc_offset() {

    // Get dragbar percentages.
    var x_per = this.scrollH.get_percentage();
    var y_per = this.scrollV.get_percentage();

    this.offset.x = (this.world.x - this.canvasW) * x_per;
    this.offset.y = (this.world.y - this.canvasH) * y_per;

    //console.log(" offset.x=" + this.offset.x + " (world.x=" + this.world.x + ")");
    //console.log(" offset.y=" + this.offset.y + " (world.y=" + this.world.y + " Canvas.h=" + this.canvasH + ")");
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

    // Set the World size.
    this.world.x = this.canvasW * 1.5;
    this.world.y = this.canvasH * 1.5;
    
    // Re-Paint Canvas.
    this.paint(canvas);
}

//=====================================================================
// Setup Toolbar.

setup_toolbar() {
    
    // Toolbar.
    this.toolbar.addtool("Master", "Edit Master Record", on_edit_master,
                         "./res/toolbar_master.png", TOOLBAR_MASTER);
    this.toolbar.addtool("Add", "Add Location", on_add_location,
                         "./res/toolbar_add.png", TOOLBAR_ADD);
    this.toolbar.addtool("Select", "Select Location", on_select_location,
                         "./res/toolbar_select.png", TOOLBAR_SELECT);
    this.toolbar.addtool("Select All", "Select All Locations", on_select_all,
                         "./res/toolbar_selectall.png", TOOLBAR_SELECTALL);
    this.toolbar.addtool("Delete", "Delete Selection", on_delete,
                         "./res/toolbar_trash.png", TOOLBAR_DELETE);
    this.toolbar.addtool("Link", "Draw link between locations", on_link,
                         "./res/toolbar_link.png", TOOLBAR_LINK);
    this.toolbar.addtool("Edit", "Edit location description", on_edit_location,
                         "./res/toolbar_edit.png", TOOLBAR_EDIT);
    this.toolbar.addtool("Distribute", "Evenly distribute location boxes", on_evenly_distribute,
                         "./res/toolbar_distribute.png", TOOLBAR_DISTRIBUTE);

    // Menu bar.
    this.toolbar.addmenu("New", "New Location", on_new_location,
                         "./res/menu_new.png", "", MENUBAR_NEW);
    this.toolbar.addmenu("Load", "Load XML Location File", on_load_xml_location,
                         "./res/menu_load.png", "./res/menu_load_disable.png", MENUBAR_LOAD);
    this.toolbar.addmenu("Save", "Save XML Location File", on_save_xml_location,
                         "./res/menu_save.png", "./res/menu_save_disable.png", MENUBAR_SAVE);
    this.toolbar.addmenu("Download", "Download XML Location File", on_download_xml_file,
                         "./res/menu_download.png", "./res/menu_download_disable.png", MENUBAR_DOWNLOAD);
    this.toolbar.addmenu("ID", "Google ID", on_google_id,
                         "", "./res/menu_id_disable.png", MENUBAR_GOOGLE_ID);
    
    // Disable the Load, Save, Download & ID Menu functions.
    this.toolbar.set_enabled("Load", false);
    this.toolbar.set_enabled("Save", false);
    this.toolbar.set_enabled("Download", false);
    this.toolbar.set_enabled("ID", false);
}

//=====================================================================
// Initialize the Scrollbar positions.

setup_scrollbars() {
    var t, w_scroll, h_scroll, x_scroll, y_scroll;

    t = VERTICAL_SLIDE;
    w_scroll = SCROLL_WIDTH;
    h_scroll = this.canvasH - BANNER_HEIGHT - SCROLL_WIDTH;
    x_scroll = this.canvasW - w_scroll;
    y_scroll = BANNER_HEIGHT;
    this.scrollV.init_scrollbar(t, x_scroll, y_scroll, w_scroll, h_scroll);
    
    t = HORIZONTAL_SLIDE;
    w_scroll = this.canvasW - SCROLL_WIDTH;
    h_scroll = SCROLL_WIDTH;
    x_scroll = 0;
    y_scroll = this.canvasH - h_scroll;
    this.scrollH.init_scrollbar(t, x_scroll, y_scroll, w_scroll, h_scroll);
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
//  l - Reference the Link class.

repaint(l) {
    const canvas = document.getElementById(COMPOSER_CANVAS);
    this.paint(canvas);
}

//=====================================================================
// Main Paint function (private member function).
//  canvas - Canvas to paint on.

paint(canvas) {
    this.calc_offset();

    this.paint_background(canvas);

    this.paint_grid(canvas);

    // Render the Location boxes.
    paint_locations(canvas);
    
    // Render links (current Link & Baked Links)
    var lnk = get_link_class();
    lnk.paint_current_link(canvas);
    lnk.paint_baked_links(canvas);

    // Render the dotted selector box.
    paint_select_box(canvas);
    
    this.paint_location_guides(canvas);
    
    this.scrollV.paint_scrollbar(canvas);
    this.scrollH.paint_scrollbar(canvas);
    this.paint_scroll_square(canvas);
    
    this.toolbar.paint_toolbar(canvas);
    


    // Find total document size in pixels.
    var sz = this.get_total_size();

    // Get percentage of dragbar.
    var percent = this.scrollV.get_percentage();

    // Calculate the pixel to start rendering at.
    var pxl_start = (sz[0] * percent) - this.scrollV.get_drag_height();
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
// Draw the scroll bar (Vertical & Horizontal).

paint_scrollbars(canvas) {

    this.scrollV.paint_scrollbar(canvas);
    this.scrollH.paint_scrollbar(canvas);
}

//=====================================================================
// Paint the bottom-right square at the meeting of the Horizontal & Vertical scrollbars.

paint_scroll_square(canvas) {
    const ctx = canvas.getContext("2d");

    // Clear bottom-right square.
    ctx.fillStyle = COLOR_SKY_BLUE;
    ctx.fillRect(this.canvasW-SCROLL_WIDTH, this.canvasH-SCROLL_WIDTH, SCROLL_WIDTH, SCROLL_WIDTH);
}

//=====================================================================
// Make sure the vertical dragbar is visible. Set Drag bar to end.

set_dragbar_to_bottom() {
    
    var len = this.get_total_length();

    // Create percentage value between 0 and 1.0.
    var percent = this.scrollV.get_percentage();

    // Calculate the pixel to start rendering at.
    var pxl_start = (len * percent) - this.scrollV.get_drag_height();
    // Make sure pxl_start is not (-ve).
    if (pxl_start < 0) pxl_start = 0;
    
    if ( (this.currenty > pxl_start) && (this.currenty < (pxl_start + this.scrollV.get_scroll_height())) )
        this.set_dragbar(1.0);
}

//=====================================================================
// Draw the grid of dots.

paint_grid(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = COLOR_TB_DK_GREY;

    var xrem = this.offset.x % GRID_THROW_X;
    var yrem = this.offset.y % GRID_THROW_Y;
    
    for (let x = -xrem; x <= this.canvasW+xrem; x+=GRID_THROW_X) {
        for (let y = -yrem; y <= this.canvasH+xrem; y+=GRID_THROW_Y) {
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
// Paint the dotted lines for guides to position the Location box.

paint_location_guides(canvas) {

    if (this.location_guide_flag == false)
        return;

    const ctx = canvas.getContext("2d");
    var x = this.location_guide_x;
    var y = this.location_guide_y;

    // Dashed line
    ctx.beginPath();
    ctx.lineWidth = 0.75;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, y);
    ctx.lineTo(this.canvasW, y);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.canvasH);
    ctx.strokeStyle = '#ff0000';
    ctx.stroke();
}

//=====================================================================
// Get size of document in pixels.

get_total_size() {

    var sz = [this.total_w, this.total_h];

    return sz;
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

                // COMMENT - What is edit_player_string ?
                //this.edit_player_string(this.playertxt);
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
            this.scrollV.on_pageup();
            break;
        case KEY_CODE.PAGEDOWN:
            this.scrollV.on_pagedown();
            break;
        case KEY_CODE.END:
            this.set_vert_dragbar(1.0);
            break;
        case KEY_CODE.HOME:
            this.set_vert_dragbar(0.0);
            break;
        case KEY_CODE.LEFT:
            if (is_anything_selected())
                on_move_selected_locations(-SEL_MOVE, 0);
            break;
        case KEY_CODE.RIGHT:
            if (is_anything_selected())
                on_move_selected_locations(SEL_MOVE, 0);
            break;
        case KEY_CODE.UP:
            if (is_anything_selected())
                on_move_selected_locations(0, -SEL_MOVE);
            //else
            //    this.on_vert_scroll_by_line(canvas, 1, -1);
            break;
        case KEY_CODE.DOWN:
            if (is_anything_selected())
                on_move_selected_locations(0, SEL_MOVE);
            //else
            //    this.on_vert_scroll_by_line(canvas, 1, 1);
            break;
        case KEY_CODE.DELETE:
            on_delete(KEY_DELETE);
            break;
        default:
            // Add all other characters to end of string.
            this.playertxt += key;
            console.log("Player Text: " + this.playertxt);

            // COMMENT - What is edit_player_string ?
            //this.edit_player_string(this.playertxt);
            break;
    }
    
    this.paint(canvas);
}

//=====================================================================
// Scroll up/down by a line size.
//  canvas - Canvas.
//  count  - Number of lies to scroll by.
//  dir    - Direction (-1 is up, +1 is down).
/*
on_vert_scroll_by_line(canvas, count, dir) {
    const ctx = canvas.getContext("2d");
    var h = get_font_height(ctx, "A");
    
    h = h * count * dir;
    
    // Find total length in pixels.
    var len = this.get_total_length();

    // Set the new position of the vertical drag bar.
    var percent = this.vert_drag.y / (this.vert_scroll.h - this.vert_drag.h);
    
    // Find the pixel position (using the dragbar position).
    var pos = len * percent;
    
    // Modify the pixel position.
    pos = pos + h;
    
    // Find new percentage.
    percent = pos / len;
    
    this.set_vert_dragbar(percent);
}
*/
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


