// File: scrollbar.js

//=====================================================================
// Constants.

const HORIZONTAL_SLIDE = 1;
const VERTICAL_SLIDE   = 2;

const DRAGBAR_LENGTH = 40;


//=====================================================================
// Structure Definition.


//=====================================================================
// Class Definition.

class scrollbar {

    constructor() {
        this.scroll = new Rectangle(0, 0, 0, 0);
        this.drag = new Rectangle(0, 0, 0, 0);

        this.type = VERTICAL_SLIDE;             // Either HORIZONTAL_SLIDE or VERTICAL_SLIDE.

        this.grabdelta = new Vector(0, 0);
        
        this.selected = false;
    }

//=====================================================================
//=====================================================================
// Initialize Scrollbar & dragbar.
//  t - Scrollbar type.
//  x_scroll, y_scroll, w_scroll, h_scroll - Scrollbar rect.

init_scrollbar(t, x_scroll, y_scroll, w_scroll, h_scroll) {

    this.type = t;
    this.scroll.x = x_scroll;
    this.scroll.y = y_scroll;
    this.scroll.w = w_scroll;
    this.scroll.h = h_scroll;
    
    this.init_dragbar();
}

//=====================================================================

init_dragbar() {

    if (this.type == VERTICAL_SLIDE) {
        this.drag.w = this.scroll.w - 4;
        this.drag.h = DRAGBAR_LENGTH;
    } else {
        this.drag.w = DRAGBAR_LENGTH;
        this.drag.h = this.scroll.h - 4;;
    }
}

//=====================================================================
// Draw the scroll bar (Vertical & Horizontal).

paint_scrollbar(canvas) {
    const ctx = canvas.getContext("2d");
    
    //console.log("paint_scrollbar() " + this.get_type());

    // Draw Scroll bar.
    ctx.fillStyle = COLOR_SCROLLBAR_GREY;
    ctx.fillRect(this.scroll.x, this.scroll.y, this.scroll.w, this.scroll.h);

    if (this.type == VERTICAL_SLIDE) {
        // Make sure vertical drag position doesn't go past the min or max.
        if (this.drag.y < this.scroll.y)
            this.drag.y = this.scroll.y;

        if (this.drag.y > (this.scroll.y + this.scroll.h - this.drag.h))
            this.drag.y = this.scroll.y + this.scroll.h - this.drag.h;

        this.drag.x = this.scroll.x + ((this.scroll.w - this.drag.w) / 2);
    } else {
        // Make sure horizontal drag position doesn't go past the min or max.
        if (this.drag.x < this.scroll.x)
            this.drag.x = this.scroll.x;

        if (this.drag.x > (this.scroll.x + this.scroll.w - this.drag.w))
            this.drag.x = this.scroll.x + this.scroll.w - this.drag.w;

        this.drag.y = this.scroll.y + ((this.scroll.h - this.drag.h) / 2);
    }

    // Draw Drag bar.
    ctx.fillStyle = COLOR_DRAGBAR_GREY;
    ctx.fillRect(this.drag.x, this.drag.y, this.drag.w, this.drag.h);
}

//=====================================================================
// Set percentage for Vertical Drag bar.
//  percent - Value between 0 and 1.0.

set_dragbar(percent) {
    //console.log("set_dragbar() " + this.get_type());
    
    // Limit the percentage between 0.0 and 1.0.
    if (percent > 1.0)
        percent = 1.0;
    if (percent < 0.0)
        percent = 0.0;

    // Set the new position of the vertical drag bar.
    this.drag.y = (this.scroll.h - this.drag.h) * percent;
    
    //console.log("percent=" + percent + " drag.y=" + this.drag.y);
}

//=====================================================================

on_click_scrollbar(mx, my) {

    // IF click on Scroll area, then move the vertical dragbar up or down by set amount.
    if (is_point_in_rect(mx, my, this.scroll)) {

        if (this.type == VERTICAL_SLIDE) {

            if (my > this.drag.y)
                this.drag.y += this.drag.h;
            else if (my < this.drag.y)
                this.drag.y -= this.drag.h;
        
            return true;
        } else {

            if (mx > this.drag.x)
                this.drag.x += this.drag.w;
            else if (mx < this.drag.x)
                this.drag.x -= this.drag.w;

            return true;
        }
    }

    return false;
}

//=====================================================================

on_pageup() {

    if (this.type == VERTICAL_SLIDE)
        this.drag.y -= this.drag.h;
    else
        this.drag.x -= this.drag.w;
}

//=====================================================================

on_pagedown() {

    if (this.type == VERTICAL_SLIDE)
        this.drag.y += this.drag.h;
    else
        this.drag.x += this.drag.w;
}

//=====================================================================

on_click_dragbar(mx, my) {

    // IF click on Dragbar area, then Calculate the grabdelta.
    if (is_point_in_rect(mx, my, this.drag)) {
        
        this.grabdelta.x = mx - this.drag.x;
        this.grabdelta.y = my - this.drag.y;
        return true;
    }

    return false;
}

//=====================================================================
// Scrolling up.

scroll_drag_up() {
    this.drag.y -= this.drag.h;
}

//=====================================================================
// Scrolling down.

scroll_drag_down() {
    this.drag.y += this.drag.h;
}

//=====================================================================
// Get percentage of dragbar (Create percentage value between 0 and 1.0).

get_percentage() {
    var percent = 0.0;

    if (this.type == VERTICAL_SLIDE)
        percent = (this.drag.y - this.scroll.y) / (this.scroll.h - this.drag.h);
    
    if (this.type == HORIZONTAL_SLIDE)
        percent = (this.drag.x - this.scroll.x) / (this.scroll.w - this.drag.w);

    if (percent > 1.0) percent = 1.0;
    if (percent < 0.0) percent = 0.0;

    return percent;
}

//=====================================================================

get_drag_width() {
    return this.drag.w;
}

get_drag_height() {
    return this.drag.h;
}

get_scroll_height() {
    return this.scroll.h;
}

//=====================================================================
// Set grabbar slide position.

set_grab_pos(val) {

    if (this.type == VERTICAL_SLIDE)
        this.drag.y = val - this.grabdelta.y;
    
    if (this.type == HORIZONTAL_SLIDE)
        this.drag.x = val - this.grabdelta.x;
}

//=====================================================================
// Is point within dragbar rectangle ?

is_dragbar_hit(mx, my) {

    if (is_point_in_rect(mx, my, this.drag))
        return true;

    return false;
}

//=====================================================================
// Set the 'selected' flag.

set_selected(val) {
    this.selected = val;
}

is_selected() {
    return this.selected;
}

//=====================================================================
// DEBUG

get_type() {
    switch(this.type) {
        case VERTICAL_SLIDE: return "VERTICAL_SLIDE";
            break;
        case HORIZONTAL_SLIDE: return "HORIZONTAL_SLIDE";
            break;
    }
}

//=====================================================================        
        
}  // End of Class

