
const TOOLBAR_NONE = 0;
const TOOLBAR_ADD = 1;
const TOOLBAR_SELECT = 2;
const TOOLBAR_DELETE = 3;
const TOOLBAR_LINK = 4;
const TOOLBAR_EDIT = 5;
const TOOLBAR_MASTER = 6;
const BANNER_HOME = 20;
const MENUBAR_LOAD = 30;
const MENUBAR_SAVE = 31;
const MENUBAR_NEW = 32;

const BANNER_HEIGHT = 48;
const BANNER_WIDTH = 165;

const TYPE_TOOLBAR = 1;
const TYPE_MENUBAR = 2;
const TYPE_BANNER  = 3;

//=====================================================================
// Structure Definition.

function Tool() {
    this.name = "";
    this.description = "";
    this.callback = null;
    this.icon = "";
    this.rect = (0, 0, 0, 0);
    this.selected = false;
    this.select_value = TOOLBAR_NONE;
    this.type = TYPE_TOOLBAR;
}

//=====================================================================
// Class Definition.

class toolbar {

    constructor() {
        this.toolCountV = 0;
        this.toolCountH = 0;
        this.toolW = 32;
        this.toolH = 32;
        this.toolBaseX = BANNER_WIDTH;
        this.toolBaseY = BANNER_HEIGHT;
        this.vertical = true;

        this.menuW = 48;
        this.menuH = 48;
        
        this.tools = [];
        
        // Add a banner.
        this.addbanner(COMPOSER_TITLE, "", on_banner, "./res/Title/banner04.png", BANNER_HOME);
    }

//=====================================================================

addbanner(name, desc, callback, icon, selectval) {
    
    var t = new Tool;

    t.name = name;
    t.description = desc;
    t.callback = callback;
    t.icon = icon;
    t.select_value = selectval;
    t.type = TYPE_BANNER;

    // Banner goes in the top lefthand corner.
    t.rect = new Rectangle(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

    this.tools.push(t);
}

//=====================================================================

addtool(name, desc, callback, icon, selectval) {
    
    var t = new Tool;

    t.name = name;
    t.description = desc;
    t.callback = callback;
    t.icon = icon;
    t.select_value = selectval;
    t.type = TYPE_TOOLBAR;

    // All Tool icons are vertical.
    t.rect = new Rectangle(0, (this.toolCountV*this.toolH)+this.toolBaseY,
                           this.toolW, this.toolH);

    this.tools.push(t);
    
    // Increment the vertical tool count.
    this.toolCountV++;
}

//=====================================================================

addmenu(name, desc, callback, icon, selectval) {
    
    var t = new Tool;

    t.name = name;
    t.description = desc;
    t.callback = callback;
    t.icon = icon;
    t.select_value = selectval;
    t.type = TYPE_MENUBAR;

    // All Menu icons are horizontal.
    t.rect = new Rectangle((this.toolCountH*this.menuW)+this.toolBaseX,  0,
                           this.menuW, this.menuH);

    this.tools.push(t);
    
    // Increment the horizontal menu count.
    this.toolCountH++;
}

//=====================================================================

paint_toolbar(canvas) {

    const ctx = canvas.getContext('2d');
    
    // Draw black background bar.
    ctx.fillStyle = COLOR_BLACK;
    ctx.fillRect(0, 0, canvas.width, this.menuH);

    
    // Walk the list of Tools.
    for (var tool of this.tools) {
    
        const img = new Image();
        img.src = tool.icon;
        
        // Select part of the image to draw.
        var sx = 0;
        var sy = 0;
        var sWidth  = tool.rect.w;
        var sHeight = tool.rect.h;
        
        // Where to draw on canvas.
        var dx = tool.rect.x;
        var dy = tool.rect.y;
        var dWidth  = tool.rect.w;
        var dHeight = tool.rect.h;

        // Fill all rectangle.
        if (tool.selected == true && tool.type == TYPE_TOOLBAR)
            ctx.fillStyle = COLOR_TB_DK_GREY;
        else
            ctx.fillStyle = COLOR_TB_LT_GREY;
            
        ctx.fillRect(dx, dy, dWidth, dHeight);
        
        // Draw outer edge.
        ctx.strokeStyle = COLOR_TB_DK_GREY;
        ctx.strokeRect(dx, dy, dWidth, dHeight);
        
        // Draw icon.
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
}

//=====================================================================
// Handle a left mouse click.

on_toolbar_clicked(mx, my) {
    var is_clicked = false;
    
    // Walk the list of Tools.
    for (var tool of this.tools) {

        if ( is_point_in_rect(mx, my, tool.rect) == true ) {
            this.unselect_all();
            tool.selected = true;
            is_clicked = true;
            
            // Toolbar callback function.
            tool.callback( tool.select_value );
        }
    }
    
    return is_clicked;
}

//=====================================================================
// Unselect all tools.

unselect_all() {
    for (var tool of this.tools) {
        tool.selected = false;
    }
}

//=====================================================================
// Returns the tool that is currently selected (e.g. TOOLBAR_ADD).

get_selected() {
    for (var tool of this.tools) {
        if (tool.selected)
            return tool.select_value;
    }
    return TOOLBAR_NONE;
}

//=====================================================================

}  // End of Class

