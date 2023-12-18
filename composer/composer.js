
const COMPOSER_TITLE = "Adventurer Composer";

var dply = new display();               // Display Class.
let locationArr = [];                   // Location Array.
let location_idx = -1;                  // Index into locationArr.
let location_next_id = 1;

// Variables to do with Selection.
let ss_x = -1;
let ss_y = -1;
let ss_w = 0;
let ss_h = 0;

const COMPOSER_VERSION_MAJOR = "01";
const COMPOSER_VERSION_MINOR = "05";

const FONT_TITLE = "bold 18px Helvetica, Arial, sans-serif";
const FONT_NORMAL = "normal 11px Helvetica, Arial, sans-serif";

const LOCATION_BOX_W = 100;
const LOCATION_BOX_H = 60;
const LOCATION_TEXT_PAD = 2;
const DIR_BOX_SZ = 8;

window.addEventListener("load", start_composer);

//=====================================================================

function Location() {
    this.rect = new Rectangle(0, 0, 0, 0);
    this.selected = false;
    
    // Should be N,S,E & W.
    this.squ = [];
    
    this.id = "IDXXX";
    this.name = "";
    this.description = "";
    this.object = [];
    this.option = [];
    this.north = "";
    this.south = "";
    this.east = "";
    this.west = "";
    this.listen = "";
}

function DirSquare() {
    this.offset = new Rectangle(0, 0, 0, 0);
    this.direction = "";
}

//=====================================================================

function start_composer() {
    print_version();

    dply.setup_canvas();

    //kickoff_worker();
}

//=====================================================================

function print_version() {
    console.log("Game   : " + COMPOSER_TITLE);
    console.log("Version: " + COMPOSER_VERSION_MAJOR + "." + COMPOSER_VERSION_MINOR);
}

//=====================================================================
// Toolbar Callbacks.

function on_add_location(select) {
}

function on_select_location(select) {
}

//=====================================================================
// Add location with very minimal data.

function add_location(mx, my) {
    var loc = new Location();
    var ds;

    loc.rect.x = mx;
    loc.rect.y = my;
    loc.rect.w = LOCATION_BOX_W;
    loc.rect.h = LOCATION_BOX_H;
    loc.id = "ID" + location_next_id.toString().padStart(3, '0');
    loc.name = "default";
    
    // North Square.
    ds = new DirSquare();
    ds.direction = "N";
    ds.offset.x = (LOCATION_BOX_W-DIR_BOX_SZ)/2;
    ds.offset.y = -DIR_BOX_SZ;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    loc.squ.push(ds);

    // South Square.
    ds = new DirSquare();
    ds.direction = "S";
    ds.offset.x = (LOCATION_BOX_W-DIR_BOX_SZ)/2;
    ds.offset.y = LOCATION_BOX_H;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    loc.squ.push(ds);

    // East Square.
    ds = new DirSquare();
    ds.direction = "E";
    ds.offset.x = -DIR_BOX_SZ;
    ds.offset.y = (LOCATION_BOX_H-DIR_BOX_SZ)/2;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    loc.squ.push(ds);

    // West Square.
    ds = new DirSquare();
    ds.direction = "W";
    ds.offset.x = LOCATION_BOX_W;
    ds.offset.y = (LOCATION_BOX_H-DIR_BOX_SZ)/2;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    loc.squ.push(ds);

    locationArr.push(loc);
    console.log("Location " + loc.id + " added.");

    // Increment for next location.
    location_next_id++;
}

//=====================================================================
// Unselect all locations.

function unselect_all_locations() {

    for (var loc of locationArr)
        loc.selected = false;
}

//=====================================================================

function paint_locations(canvas) {
    const ctx = canvas.getContext('2d');
    var radius = 4;
    var xstart = 0, ystart = 0, txth = 0;
    var yoffset = LOCATION_TEXT_PAD;
    var txt = "";
        
    // Walk the list of Locations.
    for (var loc of locationArr) {
        yoffset = LOCATION_TEXT_PAD;

        // Where to draw on canvas.
        var dx = loc.rect.x;
        var dy = loc.rect.y;
        var dWidth  = loc.rect.w;
        var dHeight = loc.rect.h;

        // Fill all rectangle.
        if (loc.selected == false)
            ctx.fillStyle = COLOR_LT_BLUE;
        else
            ctx.fillStyle = COLOR_LT_YELLOW;
        ctx.fillRect(dx, dy, dWidth, dHeight);
        
        // Draw outer edge.
        ctx.strokeStyle = COLOR_BLACK;
        ctx.strokeRect(dx, dy, dWidth, dHeight);
        
        // Setup Font.
        ctx.font = "10px Arial";
        ctx.fillStyle = COLOR_BLACK;
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        
        // Text: ID
        xstart = (dWidth - get_font_width(ctx, loc.id)) / 2;
        ystart = dy + yoffset;
        txth = get_font_width(ctx, loc.id);
        ctx.fillText(loc.id, dx+xstart, ystart);
        yoffset += txth + LOCATION_TEXT_PAD;
        
        // Text: Name.
        txt = crop_text_to_size(ctx, loc.name, dWidth);
        xstart = (dWidth - get_font_width(ctx, txt)) / 2;
        ystart = dy + yoffset;
        ctx.fillText(txt, dx+xstart, ystart);
        yoffset += txth + LOCATION_TEXT_PAD;

        
        // Render a square for each direction (N,S,E & W).
        for (ds of loc.squ) {
            ctx.fillRect(dx+ds.offset.x, dy+ds.offset.y, ds.offset.w, ds.offset.h);
        }

        txt = "N";
        xstart = dWidth / 2;
        ystart = LOCATION_TEXT_PAD;
        ctx.textBaseline = "bottom";
        ctx.fillText(txt, dx+xstart+radius+LOCATION_TEXT_PAD, dy-ystart);

        txt = "S";
        xstart = dWidth / 2;
        ystart = dHeight + LOCATION_TEXT_PAD
        ctx.textBaseline = "top";
        ctx.fillText(txt, dx+xstart+radius+LOCATION_TEXT_PAD, dy+ystart);

        txt = "E";
        xstart = get_font_width(ctx, txt) + LOCATION_TEXT_PAD;
        ystart = (dHeight / 2) + get_font_height(ctx, txt);
        ctx.textBaseline = "top";
        ctx.fillText(txt, dx-xstart, dy+ystart);

        txt = "W";
        xstart = dWidth + LOCATION_TEXT_PAD;
        ystart = (dHeight / 2) + get_font_height(ctx, txt);
        ctx.textBaseline = "top";
        ctx.fillText(txt, dx+xstart, dy+ystart);
    }
}

//=====================================================================
// Check for a click in the area on and round the location box.

function on_click_location_box(mx, my) {
    var box = new Rectangle(0, 0, 0, 0);

    // Walk the list of Locations.
    for (var loc of locationArr) {
        
        if (is_point_in_rect(mx, my, loc.rect)) {
            // Hit a location box.
            console.log("Hit location=" + loc.id);
        }

        for (ds of loc.squ) {

            box.x = loc.rect.x + ds.offset.x;
            box.y = loc.rect.y + ds.offset.y;
            box.w = ds.offset.w;
            box.h = ds.offset.h;
            
            if (is_point_in_rect(mx, my, box)) {
                // Hit a location box.
                console.log("Hit Squ=" + ds.direction);
            }
        }
    }
}

//=====================================================================

function start_select_box(mx, my) {
    ss_x = mx;
    ss_y = my;
    
    // Reset the height & width of selection box.
    ss_w = 0;
    ss_h = 0;
}

function move_select_box(mx, my) {
    if (ss_x != -1 && ss_y != -1) {
        ss_w = mx - ss_x;
        ss_h = my - ss_y;
    }
}

function finish_select_box(mx, my) {

    // Create selection rectangle.
    var select = new Rectangle(ss_x, ss_y, ss_w, ss_h);

    // Unselect all locations.
    unselect_all_locations();

    // Walk the location array and check which boxes are fully encompased
    // by selection rectangle.
    for (var loc of locationArr) {

        if (is_rect_fully_within(loc.rect, select)) {
            loc.selected = true;
        }
    }

    // Reset the start, height & width of selection box.
    ss_w = 0;
    ss_h = 0;
    ss_x = -1;
    ss_y = -1;
}

function paint_select_box(canvas) {
    const ctx = canvas.getContext('2d');
    
    ctx.setLineDash([3, 2]);

    // Draw a dashed line
    ctx.beginPath();
    ctx.moveTo(ss_x, ss_y);
    ctx.lineTo(ss_x+ss_w, ss_y);
    ctx.lineTo(ss_x+ss_w, ss_y+ss_h);
    ctx.lineTo(ss_x, ss_y+ss_h);
    ctx.lineTo(ss_x, ss_y);
    ctx.stroke();
    
    // Disable the dotted line.
    ctx.setLineDash([1, 0]);
}
