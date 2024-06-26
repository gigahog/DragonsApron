
const COMPOSER_TITLE = "Adventurer Composer";

var master = new AdventureMaster();     // Adventure Master Class (title, author, etc).
var dply = new display();               // Display Class.
var lnk  = new link();                  // Link Class.
var user = new User();                  // User structure.
let locationArr = [];                   // Location Array.
let location_idx = -1;                  // Index into locationArr.
let location_next_id = 1;
var flist = [];                         // List of files that gets passed around.

// Selection Rectangle (World coords).
var ss = new Rectangle(-1, -1, 0, 0);

// Timer objects.
var timer1, timer2;

// Current Google File info.
var current_file_id = -1;
var current_file_name = "";

// Doing Work (affects cursor).
var doing_work = false;

// Change flag, used to save changes in timer.
var change_flag = false;

const COMPOSER_VERSION_MAJOR = "01";
const COMPOSER_VERSION_MINOR = "10";

const ADV_COMPOSER_HOME_URL = "home.html";

const FONT_TITLE = "bold 18px Helvetica, Arial, sans-serif";
const FONT_NORMAL = "normal 11px Helvetica, Arial, sans-serif";

const LOCATION_BOX_W = 100;             // Width of Location box (pixels).
const LOCATION_BOX_H = 60;              // Height of Location box (pixels)
const LOCATION_TEXT_PAD = 2;
const DIR_BOX_SZ = 8;                   // Size of direction square in pixels.
const EMPTY = "";
const TIMER_FREQ_5SEC = 5000;           // Timer frequency in ms.
const TIMER_FREQ_1SEC = 1000;           // Timer frequency in ms.

window.addEventListener("load", start_composer);

//=====================================================================

function AdventureMaster() {
    this.title = "";
    this.author = "";
    this.url = "";
    this.start_id = "ID001";
    this.copyright = "";
}

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
    this.connected_id = "";         // The ID of the location we are linked to.
    this.connected_dir = "";        // The direction of the location we are linked to.
    this.connected = false;
}

function XmlFile() {
    this.txt = "";                  // XML text ball.
    this.fname = "";                // Google Drive filename of XML.
    this.id = "";                   // Google Drive file id.
}

function User() {
    this.name = "";
    this.pic_url = "";
    this.email = "";
    this.is_drive_ready = false;
}

//=====================================================================

function start_composer() {
    print_version();

    dply.setup_canvas();

    // Initialize Google Drive Authentication.
    gg_init();

    // Start the main callback timers.
    timer1 = setInterval(on_timer_5sec, TIMER_FREQ_5SEC);
    timer2 = setInterval(on_timer_1sec, TIMER_FREQ_1SEC);
}

//=====================================================================

function print_version() {
    console.log("Game   : " + COMPOSER_TITLE);
    console.log("Version: " + COMPOSER_VERSION_MAJOR + "." + COMPOSER_VERSION_MINOR);
}

//=====================================================================

function get_link_class() {
    return lnk;
}

//=====================================================================
// Toolbar Callbacks.

function on_add_location(select) {
}

function on_select_location(select) {
}

function on_select_all(select) {

    for (var loc of locationArr)
        loc.selected = true;
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
        fixed += remove_ref(id);
    }
    console.log("Fixed " + fixed + " hanging refs.");
    set_change_flag();
}

function on_link(select) {
}

function on_banner(select) {
    // The Banner was clicked.  Open another browser tab with the URL of
    // the Home Page of 'Adventure Composer'.

    //window.open(ADV_COMPOSER_HOME_URL, "_blank");
    gg_drive_about();
}

function on_new_location() {
    // Reset Location Array.
    locationArr.length = 0;
    location_next_id = 1;
}

function on_load_xml_location() {
    // Create list of google Drive files (stored in global 'flist').
    gg_show_list();
}
                        
function on_save_xml_location() {
    doing_work = true;

    // Generate XML string.
    xmlstr = create_xml();

    // Set the Status line text.
    dply.set_status_line("Saving project to Cloud...");

    // Save XML string to Google file.
    if (current_file_id == -1) {
        // Create new file.
        var value = gg_upload(xmlstr);

    } else {
        // Save to existing file ID.
        gg_update_file(current_file_id, xmlstr);
    }
}

function on_download_xml_file() {
    // Download the XML File (for the Adventure currently being displayed).
    
    var xml_file = new XmlFile();

    xml_file.id = current_file_id;
    xml_file.fname = current_file_name;
        
    gg_read_download(xml_file, "download");
}

function on_google_id() {

    if (gg_is_signedin()) {
        console.log("Name: " + user.name);
        console.log("Pic : " + user.pic_url);
    }
}

//=====================================================================
// Timer Callback function.  Should be called every 1 seconds.

function on_timer_1sec() {
    var ggtxt = gg_get_status();

    // Check if current Google Drive status is non-blank.
    if (ggtxt != "") {
    //    var status = dply.get_status_line();
    //    if (status != ggtxt) {
        dply.set_status_line(ggtxt);
    }

}

//=====================================================================
// Timer Callback function.  Should be called every 5 seconds.

function on_timer_5sec() {

    // Set cursor.
    if (doing_work)
        cursor_wait();
    else
        cursor_clear();
    
    //-----------------------------------------------------------------
    // Check if any changes need to be saved (User must be authenticated).

    if (get_change_flag() && gg_is_signedin()) {

        // Reset the 'change' flag.
        reset_change_flag();

        // Save changes.
        on_save_xml_location();
    }

    //-----------------------------------------------------------------
    // Set the credentials.

    if (gg_is_credential_new()) {

        var cred = gg_get_credentials();

        user.name = cred.name;
        user.pic_url = cred.picture;
        user.email = EMPTY;

        console.log("Name: " + user.name);
        console.log("Pic : " + user.pic_url);

        if (user.pic_url != EMPTY)
            dply.toolbar.set_icon("ID", user.pic_url);
    }
    
    //--------------------------------------------------------------
    // Check if Google Drive & folder are ready.
    
    if (gg_is_driveinfo_new()) {

        var cred = gg_get_credentials();
        console.log(cred);
        if (cred.is_drive_ready) {
            // Enable the Load & Save Menu.
            dply.toolbar.set_enabled("Load", true);
            dply.toolbar.set_enabled("Save", true);
            dply.toolbar.set_enabled("Download", true);
            dply.toolbar.set_enabled("ID", true);
            user.is_drive_ready = true;
        } else {
            // Disable the Load & Save Menu.
            dply.toolbar.set_enabled("Load", false);
            dply.toolbar.set_enabled("Save", false);
            dply.toolbar.set_enabled("Download", false);
            dply.toolbar.set_enabled("ID", false);
            user.is_drive_ready = false;
        }
    }
}

//=====================================================================
// Repaint function.

function repaint() {

    // Call the display class repaint function.
    //dply.repaint(lnk);
    dply.repaint();
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
                ds.connected = false;
                cnt++;
            }
        }
    }
    return cnt;
}

//=====================================================================
// After a XML file has been loaded walk all IDs to update the 'location_next_id' global.

function update_location_next_id() {
    var max = 0;

    // Walk the list of Locations.
    for (var loc of locationArr) {
        var str = loc.id.slice(2);      // Returns '001' from 'ID001' string.
        var nbr = parseInt(str);
        
        if (nbr > max)
            max = nbr;
    }
    
    // Update the 'location_next_id' variable.
    location_next_id = max + 1;
    console.log("Update: location_next_id=" + location_next_id);
}

//=====================================================================
// Add location with very minimal data.
//  mx & my - Mouse click (World coordinates).

function add_location(mx, my) {
    var ds;
    
    // Unselect all locations.
    unselect_all_locations();

    // Firstly, snap the mouse coords to grid (Returns World coordinates).
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

    loc.rect.x = grid.x;
    loc.rect.y = grid.y;
    loc.rect.w = LOCATION_BOX_W;
    loc.rect.h = LOCATION_BOX_H;
    loc.id = "ID" + location_next_id.toString().padStart(3, '0');
    loc.name = "";
    
    set_north_square(loc, EMPTY, EMPTY);
    set_south_square(loc, EMPTY, EMPTY);
    set_east_square(loc, EMPTY, EMPTY);
    set_west_square(loc, EMPTY, EMPTY);
    
    // Make sure this new location will be selected.
    loc.selected = true;

    locationArr.push(loc);
    console.log("Location " + loc.id + " added (" + grid.x + "," + grid.y + ")");

    // Increment for next location.
    location_next_id++;
}

//=====================================================================
// loc      - Location Object.
// id       - The ID that this Square is connnected to.
// con_dir  - The direction that this square is connected to.

function set_north_square(loc, id, con_dir) {
    // North Square.
    ds = new DirSquare();
    ds.direction = "N";
    ds.offset.x = (LOCATION_BOX_W-DIR_BOX_SZ)/2;
    ds.offset.y = -DIR_BOX_SZ;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    ds.connected_id = id;
    ds.connected_dir = con_dir;
    if (ds.connected_id != EMPTY && ds.connected_dir != EMPTY)
        ds.connected = true;
    else
        ds.connected = false;
    loc.squ.push(ds);
}

function set_south_square(loc, id, con_dir) {
    // South Square.
    ds = new DirSquare();
    ds.direction = "S";
    ds.offset.x = (LOCATION_BOX_W-DIR_BOX_SZ)/2;
    ds.offset.y = LOCATION_BOX_H;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    ds.connected_id = id;
    ds.connected_dir = con_dir;
    if (ds.connected_id != EMPTY && ds.connected_dir != EMPTY)
        ds.connected = true;
    else
        ds.connected = false;
    loc.squ.push(ds);
}

function set_east_square(loc, id, con_dir) {
    // East Square.
    ds = new DirSquare();
    ds.direction = "E";
    ds.offset.x = -DIR_BOX_SZ;
    ds.offset.y = (LOCATION_BOX_H-DIR_BOX_SZ)/2;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    ds.connected_id = id;
    ds.connected_dir = con_dir;
    if (ds.connected_id != EMPTY && ds.connected_dir != EMPTY)
        ds.connected = true;
    else
        ds.connected = false;
    loc.squ.push(ds);
}

function set_west_square(loc, id, con_dir) {
    // West Square.
    ds = new DirSquare();
    ds.direction = "W";
    ds.offset.x = LOCATION_BOX_W;
    ds.offset.y = (LOCATION_BOX_H-DIR_BOX_SZ)/2;
    ds.offset.w = DIR_BOX_SZ;
    ds.offset.h = DIR_BOX_SZ;
    ds.connected_id = id;
    ds.connected_dir = con_dir;
    if (ds.connected_id != EMPTY && ds.connected_dir != EMPTY)
        ds.connected = true;
    else
        ds.connected = false;    
    loc.squ.push(ds);
}

//=====================================================================
// Unselect all locations.

function unselect_all_locations() {

    for (var loc of locationArr)
        loc.selected = false;
}

//=====================================================================
// Are any locations selected ?
// Return:
//  true  - One (or more) locations are selected.
//  false - No items are selected.

function is_anything_selected() {
    
    for (var loc of locationArr)
        if (loc.selected == true)
            return true;
    return false;
}

//=====================================================================
// Move selected location boxes.

function on_move_selected_locations(dx, dy) {
    
    for (var loc of locationArr) {
        if (loc.selected == true) {
            loc.rect.x += dx;
            loc.rect.y += dy;
        }
    }
}

//=====================================================================
// Paint the Location Boxes.

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
        txt = loc.name;
        if (txt == EMPTY)
            txt = "default"; 
        txt = crop_text_to_size(ctx, txt, dWidth);
        xstart = (dWidth - get_font_width(ctx, txt)) / 2;
        ystart = scrn.y + yoffset;
        ctx.fillText(txt, scrn.x+xstart, ystart);
        yoffset += txth + LOCATION_TEXT_PAD;


        // Render a square for each direction (N,S,E & W).
        for (var ds of loc.squ)
            ctx.fillRect(scrn.x+ds.offset.x, scrn.y+ds.offset.y, ds.offset.w, ds.offset.h);

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
// An XML file has just been loaded, update the size of the world.

function update_world_size() {
    
    if (dply.should_world_expand())
        dply.set_canvas_size();
}

//=====================================================================
// Get the min/max rectangle around all the location boxes.
// NOTE: This function should not be called if locationArr.length == 0.
// Returns:
//  rect - min/max rectangle.

function get_min_max_rect() {
    var xmin = Number.MAX_SAFE_INTEGER;
    var xmax = 0;
    var ymin = Number.MAX_SAFE_INTEGER;
    var ymax = 0;

    //----------------------------------------------------------------------
    // Find the min/max rectangle.

    for (var loc of locationArr) {

        if (loc.rect.x < xmin) xmin = loc.rect.x;
        if (loc.rect.x > xmax) xmax = loc.rect.x;
        if (loc.rect.y < ymin) ymin = loc.rect.y;
        if (loc.rect.y > ymax) ymax = loc.rect.y;
    }
    
    var rect = new Rectangle(xmin, ymin, xmax-xmin, ymax-ymin);

    return rect;
}

//=====================================================================
// Return size of location Array.

function get_location_array_len() {
    return locationArr.length;
}

//=====================================================================
// Functions to keep track of changes.

function get_change_flag() {
    return change_flag;
}

function set_change_flag() {
    change_flag = true;
}

function reset_change_flag() {
    change_flag = false;
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
            
       console.log("Description: " + loc.description );

       for (var i=0; i<loc.object.length; i++) {
            console.log( "Object #" + i + ": " + loc.object[i] );
       }
            
       for (var i=0; i<loc.option.length; i++) {
            console.log( "Option #" + i + ": " + loc.option[i] );
       }

       console.log("Listen: " + loc.listen);
    }
}
