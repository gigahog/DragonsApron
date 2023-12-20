
const TOOLBAR_NONE = 0;
const TOOLBAR_ADD = 1;
const TOOLBAR_SELECT = 2;
const TOOLBAR_DELETE = 3;
const TOOLBAR_LINK = 4;

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
}

//=====================================================================
// Class Definition.

class toolbar {

    constructor() {
        this.toolCount = 0;
        this.toolW = 32;
        this.toolH = 32;
        this.toolBaseX = 0;
        this.toolBaseY = 0;
        this.vertical = true;

        this.tools = [];
    }

//=====================================================================

addtool(name, desc, callback, icon, selectval) {
    
    var t = new Tool;

    t.name = name;
    t.description = desc;
    t.callback = callback;
    t.icon = icon;
    t.select_value = selectval;
    if (this.vertical)
        t.rect = new Rectangle(this.toolBaseX,
                               (this.toolCount*this.toolH)+this.toolBaseY,
                               this.toolW, this.toolH);
    else
        t.rect = new Rectangle((this.toolCount*this.toolW)+this.toolBaseX,
                               this.toolBaseY,
                               this.toolW, this.toolH);

    this.tools.push(t);
    
    // Increment the tool, count.
    this.toolCount++;
}

//=====================================================================

paint_toolbar(canvas) {
    const ctx = canvas.getContext('2d');
    
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
        if (tool.selected == false)
            ctx.fillStyle = COLOR_TB_LT_GREY;
        else
            ctx.fillStyle = COLOR_TB_DK_GREY;
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

