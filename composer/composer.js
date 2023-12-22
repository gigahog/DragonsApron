
const COMPOSER_TITLE = "Adventurer Composer";

var dply = new display();               // Display Class.
var lnk  = new link();                  // Link Class.
let locationArr = [];                   // Location Array.
let location_idx = -1;                  // Index into locationArr.
let location_next_id = 1;

// Selection Rectangle (World coords).
var ss = new Rectangle(-1, -1, 0, 0);


const COMPOSER_VERSION_MAJOR = "01";
const COMPOSER_VERSION_MINOR = "06";

const FONT_TITLE = "bold 18px Helvetica, Arial, sans-serif";
const FONT_NORMAL = "normal 11px Helvetica, Arial, sans-serif";

const LOCATION_BOX_W = 100;
const LOCATION_BOX_H = 60;
const LOCATION_TEXT_PAD = 2;
const DIR_BOX_SZ = 8;
const EMPTY = "";

window.addEventListener("load", start_composer);

//=====================================================================

function Location() {
    this.rect = new Rectangle(0, 0, 0, 0);  // x & y are stored as World coordinates.
    this.selected = false;
    
    // This array stores N,S,E & W info about squares, their offset location
    // and what they are connected to (See DirSquare).
    this.squ = [];
    
    this.id = "IDXXX";
    this.name = "";
    this.description = "";
    this.object = [];
    this.option = [];
    this.listen = "";
    //  NOTE: north, south, east & west info now stored in this.squ array.
}

function DirSquare() {
    this.offset = new Rectangle(0, 0, 0, 0);    // Coordinates of square offset from Location.
    this.direction = "";            // N, S, E or W.
    this.connected_id = "";         // This ID of the location we are linked to.
    this.connected_dir = "";        // The direction of the location we are linked to.
    this.connected = false;
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

function on_delete(select) {

    var remove_ids = [];
    var fixed = 0;
    
    locationArr = locationArr.filter(function(loc) {
            if (loc.selected == true) {
                remove_ids.push(loc.id);
                // Return false if you want to filter it out.
                return false;
            }
            return true;
    });

    // Fix any hanging references to the removed ID's.
    for (var id of remove_ids) {    
        console.log(" Fixing refs for " + id);
        fixed = remove_ref(id);
    }
    console.log("Fixed " + fixed + " hanging refs.");
}

function on_link(select) {
}

//=====================================================================
// Start editing Location.

function on_edit_location() {
    
    // Walk the list of Locations.
    for (var loc of locationArr) {
        //console.log("ID=" + loc.id + " selected=" + loc.selected);

        // Check for ID match.
        if (loc.selected == true) {
            console.log("HERE01 - " + loc.id + " selected=" + loc.selected);
            
            document.getElementById("loc_id").value = loc.id;

            if (loc.name != EMPTY)
                document.getElementById("loc_name").value = loc.name;

            if (loc.description != EMPTY)
                document.getElementById("loc_desc").value = loc.description;
            
            for (var i=0; i<loc.object.length; i++) {
                if (loc.object[i] == EMPTY) continue;
                if (i == 0) document.getElementById("loc_obj1").value = loc.object[i];
                if (i == 1) document.getElementById("loc_obj2").value = loc.object[i];
                if (i == 2) document.getElementById("loc_obj3").value = loc.object[i];
            }

            for (var i=0; i<loc.option.length; i++) {
                if (loc.option[i] == EMPTY) continue;
                if (i == 0) document.getElementById("loc_opt1").value = loc.option[i];
                if (i == 1) document.getElementById("loc_opt2").value = loc.option[i];
                if (i == 2) document.getElementById("loc_opt3").value = loc.option[i];
            }

            if (loc.listen != EMPTY)
                document.getElementById("loc_listen").value = loc.listen;
        }
    }

    console.log("DOM.loc_id.val=" + document.getElementById("loc_id").value);
    
    // Show the division element.
    document.getElementById("loc_div").hidden = false;
}

//=====================================================================
// <div> button Events (when editing the location).

function on_btn_ok() {
    
    const loc_id = document.getElementById("loc_id");
    const loc_name = document.getElementById("loc_name");
    const loc_desc = document.getElementById("loc_desc");
    
    const loc_obj1 = document.getElementById("loc_obj1");
    const loc_obj2 = document.getElementById("loc_obj2");
    const loc_obj3 = document.getElementById("loc_obj3");
    
    const loc_opt1 = document.getElementById("loc_opt1");
    const loc_opt2 = document.getElementById("loc_opt2");
    const loc_opt3 = document.getElementById("loc_opt3");
    
    const loc_lis = document.getElementById("loc_listen");

    set_location_data(loc_id.value, loc_name.value, loc_desc.value,
                      loc_obj1.value, loc_obj2.value, loc_obj3.value,
                      loc_opt1.value, loc_opt2.value, loc_opt3.value,
                      loc_lis.value);
dump_location();

    // Hide the division element.
    document.getElementById("loc_div").hidden = true;
    
    dply.repaint();
}


function on_btn_cancel() {

    // Hide the division element.
    document.getElementById("loc_div").hidden = true;
    
    dply.repaint();
}

//=====================================================================
// Set data for specific location.

function set_location_data(loc_id, loc_name, loc_desc, loc_obj1, loc_obj2, loc_obj3,
                           loc_opt1, loc_opt2, loc_opt3, loc_lis) {

    // Walk the list of Locations.
    for (var i = 0; i < locationArr.length; i++) {
        console.log("Does >>" + locationArr[i].id + "<< == >>" + loc_id + "<<");
        
        // Check for ID match.
        if (locationArr[i].id == loc_id) {

            console.log("HERE10:" + loc_id + " " + loc_name + " " + loc_desc + " " + loc_obj1 + " " + loc_obj2 + " " + loc_obj3 + " " + loc_opt1 + " " + loc_opt2 + " " + loc_opt3 + " " + loc_lis);

            locationArr[i].name = loc_name;
            locationArr[i].description = loc_desc;

            // Clear Object Array.
            locationArr[i].object.length = 0;

            if (loc_obj1 != EMPTY) locationArr[i].object.push(loc_obj1);
            if (loc_obj2 != EMPTY) locationArr[i].object.push(loc_obj2);
            if (loc_obj3 != EMPTY) locationArr[i].object.push(loc_obj3);
            
            // Clear Object Array.
            locationArr[i].option.length = 0;

            if (loc_opt1 != EMPTY) locationArr[i].option.push(loc_opt1);
            if (loc_opt2 != EMPTY) locationArr[i].option.push(loc_opt2);
            if (loc_opt3 != EMPTY) locationArr[i].option.push(loc_opt3);
    
            locationArr[i].listen = loc_lis;

            break;
        }
    }
}

//=====================================================================
// Remove all reference to 'id' from Location Array.

function remove_ref(id) {
    var cnt = 0;

    // Walk the list of Locations.
    for (var loc of locationArr) {
    
        // Walk the direction squares looking for any reference to 'id'.
        for (var ds of loc.squ) {
            
            if (ds.connected_id == id) {
                ds.connected_id = EMPTY;
                ds.connected_dir = EMPTY;
                cnt++;
            }
        }
    }
    return cnt;
}

//=====================================================================
// Add location with very minimal data.
//  mx & my - Mouse click (Screen coordinates).

function add_location(mx, my) {
    var ds;

    // Firstly, snap the mouse coords to grid.
    var grid = snap_to_grid(mx, my);

    
    // Secondly, check if a new location box rectangle would intersect any
    // of the existing location boxes. 
    // If it intersects then do NOT allow.
    var rect1 = new Rectangle(grid.x, grid.y, LOCATION_BOX_W, LOCATION_BOX_H);

    for (var loc of locationArr) {
        if (is_AABB_collision(rect1, loc.rect))
            return;
    }


    // No collision detected, so continue with adding location.
    var loc = new Location();
    var wld = dply.screen2world(grid.x, grid.y);

    loc.rect.x = wld.x;
    loc.rect.y = wld.y;
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
    var xstart = 0, ystart = 0, txth = 0;
    var yoffset;
    var txt = "";

    // Walk the list of Locations.
    for (var loc of locationArr) {
        yoffset = LOCATION_TEXT_PAD;

        // Where to draw on canvas.
        var dWidth  = loc.rect.w;
        var dHeight = loc.rect.h;
        var scrn = dply.world2screen(loc.rect.x, loc.rect.y);

        // Fill all rectangle.
        if (loc.selected == false)
            ctx.fillStyle = COLOR_LT_BLUE;
        else
            ctx.fillStyle = COLOR_LT_YELLOW;
        ctx.fillRect(scrn.x, scrn.y, dWidth, dHeight);
        
        // Draw outer edge.
        ctx.strokeStyle = COLOR_BLACK;
        ctx.strokeRect(scrn.x, scrn.y, dWidth, dHeight);
        
        // Setup Font.
        ctx.font = "10px Arial";
        ctx.fillStyle = COLOR_BLACK;
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        
        // Text: ID
        xstart = (dWidth - get_font_width(ctx, loc.id)) / 2;
        ystart = scrn.y + yoffset;
        txth = get_font_height(ctx, loc.id);
        ctx.fillText(loc.id, scrn.x+xstart, ystart);
        yoffset += txth + LOCATION_TEXT_PAD;
        
        // Text: Name.
        txt = crop_text_to_size(ctx, loc.name, dWidth);
        xstart = (dWidth - get_font_width(ctx, txt)) / 2;
        ystart = scrn.y + yoffset;
        ctx.fillText(txt, scrn.x+xstart, ystart);
        yoffset += txth + LOCATION_TEXT_PAD;

        
        // Render a square for each direction (N,S,E & W).
        for (var ds of loc.squ) {
            ctx.fillRect(scrn.x+ds.offset.x, scrn.y+ds.offset.y, ds.offset.w, ds.offset.h);
        }

        txt = "N";
        xstart = (dWidth + DIR_BOX_SZ) / 2;
        ystart = LOCATION_TEXT_PAD;
        ctx.textBaseline = "bottom";
        ctx.fillText(txt, scrn.x+xstart+LOCATION_TEXT_PAD, scrn.y-ystart);

        txt = "S";
        xstart = (dWidth + DIR_BOX_SZ) / 2;
        ystart = dHeight + LOCATION_TEXT_PAD
        ctx.textBaseline = "top";
        ctx.fillText(txt, scrn.x+xstart+LOCATION_TEXT_PAD, scrn.y+ystart);

        txt = "E";
        xstart = get_font_width(ctx, txt) + LOCATION_TEXT_PAD;
        ystart = (dHeight / 2) + get_font_height(ctx, txt);
        ctx.textBaseline = "top";
        ctx.fillText(txt, scrn.x-xstart, scrn.y+ystart);

        txt = "W";
        xstart = dWidth + LOCATION_TEXT_PAD;
        ystart = (dHeight / 2) + get_font_height(ctx, txt);
        ctx.textBaseline = "top";
        ctx.fillText(txt, scrn.x+xstart, scrn.y+ystart);
    }
}

//=====================================================================
// Check for a click in the area around the location box.

function on_click_location_box(mx, my) {
    var box = new Rectangle(0, 0, 0, 0);
    
    // Convert mouse coords (screen) to World coord.
    var wld = dply.screen2world(mx, my);
    
    // Unselect all locations.
    unselect_all_locations();
    
    // Walk the list of Locations.
    for (var loc of locationArr) {

        if (is_point_in_rect(wld.x, wld.y, loc.rect)) {
            // Hit a location box, select it.
            loc.selected = true;
            console.log("Hit location=" + loc.id);
        }

        for (ds of loc.squ) {

            box.x = loc.rect.x + ds.offset.x;
            box.y = loc.rect.y + ds.offset.y;
            box.w = ds.offset.w;
            box.h = ds.offset.h;
            
            if (is_point_in_rect(wld.x, wld.y, box)) {
                // Hit a location box.
                console.log("Hit Squ=" + ds.direction);
            }
        }
    }
}

//=====================================================================

function start_select_box(mx, my) {
    var wld = dply.screen2world(mx, my);

    ss.x = wld.x;
    ss.y = wld.y;
    
    // Reset the height & width of selection box.
    ss.w = 0;
    ss.h = 0;
}

function move_select_box(mx, my) {
    var wld = dply.screen2world(mx, my);

    if (ss.x != -1 && ss.y != -1) {
        ss.w = wld.x - ss.x;
        ss.h = wld.y - ss.y;
    }
}

function finish_select_box(mx, my) {
    
    // Check that the selection box is valid.
    if (ss.w == 0 || ss.h == 0)
        return;
    
    // Make sure selection rectangle has (ss_x,ss_y) point at top left corner.
    if (ss.w < 0) {
        ss.x = ss.x + ss.w;
        ss.w = Math.abs(ss.w);
    }
    if (ss.h < 0) {
        ss.y = ss.y + ss.h;
        ss.h = Math.abs(ss.h);
    }

    // Walk the location array and check which boxes are fully encompased
    // by selection rectangle.
    for (var loc of locationArr) {

        if (is_rect_fully_within(loc.rect, ss)) {
            loc.selected = true;
        }
    }

    // Reset the start, height & width of selection box.
    ss.w = 0;
    ss.h = 0;
    ss.x = -1;
    ss.y = -1;
}

function paint_select_box(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Convert from World to Screen coord.
    var scrn = dply.world2screen(ss.x, ss.y);
    
    ctx.setLineDash([3, 2]);

    // Draw a dashed line
    ctx.beginPath();
    ctx.moveTo(scrn.x, scrn.y);
    ctx.lineTo(scrn.x+ss.w, scrn.y);
    ctx.lineTo(scrn.x+ss.w, scrn.y+ss.h);
    ctx.lineTo(scrn.x, scrn.y+ss.h);
    ctx.lineTo(scrn.x, scrn.y);
    ctx.stroke();
    
    // Disable the dotted line.
    ctx.setLineDash([1, 0]);
}

//=====================================================================
// Snap coordinates mx,my to grid.
// Returns: Vector2 of nearst grid coordinates (Screen coord).

function snap_to_grid(mx, my) {
    var tmp = new Vector(mx, my);
    
    // Get screen offset coordinates.
    var offset = dply.get_screen_offset();
    
    // Find world coordinates.
    tmp.x += offset.x;
    tmp.y += offset.y;

    // Find remainder.
    var remx = tmp.x % GRID_THROW_X;
    var remy = tmp.y % GRID_THROW_Y;

    // Decide whether to round up or down.
    if (remx >= GRID_THROW_X>>1)
        tmp.x += (GRID_THROW_X - remx);  // Round Up X
    else
        tmp.x -= remx;                    // Round Down X
        
    if (remy >= GRID_THROW_Y>>1)
        tmp.y += (GRID_THROW_Y - remy);  // Round Up Y
    else
        tmp.y -= remy;                    // Round Down Y
    
    // Convert back to screen coordinates.
    tmp.x -= offset.x;
    tmp.y -= offset.y;
    
    return tmp;
}

//=====================================================================
//=====================================================================
// DEBUG.

// Dump the location Array.
function dump_location() {
    console.log("DUMP =======================");
    for (var loc of locationArr) {
        
       var sel = EMPTY;
       if (loc.selected)
           sel = "[SELECTED]";
       
       console.log("------");
       console.log("ID: " + loc.id + " " + sel);
            
       console.log("Location: " + loc.name);
            
       console.log("Description:");
       console.log("  " + loc.description );

       for (var i=0; i<loc.object.length; i++) {
            console.log( "Object #" + i + ": " + loc.object[i] );
       }
            
       for (var i=0; i<loc.option.length; i++) {
            console.log( "Option #" + i + ": " + loc.option[i] );
       }

       console.log("Listen: " + loc.listen);
    }
}
