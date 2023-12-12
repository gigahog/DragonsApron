
var canvasW = 0;
var canvasH = 0;
var marginW = 20;
var lineSkip = 10;
var currenty = 20;

const BOTTOM_PAD = 150;
const BOTTOM_TEXT = 75;

var scroll = new Rectangle(0, 0, 12, 0);
var drag = new Rectangle(0, 0, 10, 40);

var mousepos = new Vector(0, 0);
var grabdelta = new Vector(0, 0);
var ismousedown = false;
var last_mouse_down_tgt;

var parser, xmlDoc;

var playertxt = "";                     // Players current input text.
let objArr = [];                        // EditBox Array.
let inventoryArr = [];                  // Inventory Array.
let locationArr = [];                   // Location Array.
let locationID = "";                    // e.g. "ID001".
let location_idx = -1;                  // Index into locationArr. 

const COLOR_BLACK = "#000000";
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

const COLOR_TITLE_TXT = COLOR_RED;
const COLOR_PLAYER_TXT = COLOR_DK_GREEN;
const COLOR_NARRATOR_TXT = COLOR_BLUE;

const FONT_TITLE = "bold 18px Helvetica, Arial, sans-serif";
const FONT_NORMAL = "normal 11px Helvetica, Arial, sans-serif";

const PROMPT = ">> ";
const SPACE = " ";
const GAME_TITLE = "The Dragons Apron";
const start_location = "ID001";

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

window.addEventListener("load", start_game);

//=====================================================================

function start_game() {
    kickoff_worker();
    
    setup_canvas();
}

//=====================================================================
// Start the worker thread that will retrieve the XML.

function kickoff_worker() {
    
    worker = new Worker("worker.js");
    
    // Pass data to worker thread.
    worker.postMessage("message");
    
    // Listen for any message (data) passed back from worker thread.
    worker.addEventListener("message", event => {
        if (event.data) {
            console.log("Response from Worker thread recieved:");
            console.log(event.data);
            
            parse_xml_to_array(event.data);
            
            initial_display();
            
            debug_text();
        }
    });
}

//=====================================================================
// Display initial location text.

function initial_display() {
    // Add Title Text.
    add_string(GAME_TITLE, COLOR_TITLE_TXT, FONT_TITLE);

    // Move to initial location.
    move_to_location(start_location);

    // Display Players input prompt.
    playertxt = PROMPT;
    add_string(playertxt, COLOR_PLAYER_TXT, FONT_NORMAL);
}

//=====================================================================
// Convert the XML into an array of locations.

function parse_xml_to_array(data) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(data, "text/xml");
            
    var x = xmlDoc.getElementsByTagName("location")[0];
    //console.log( x );

    while (x != null) {
                
        var y = x.childNodes[0];
        console.log( "------" );

        // New location.
        var l = new Location();
        
        while (y != null && y.nodeType == 1) {
            console.log( y.nodeName + " " + y.textContent );
            
            switch ( y.nodeName ) {
                case "locationID":
                    l.id = y.textContent;
                    break;
                case "name":
                    l.name = y.textContent;
                    break;
                case "description":
                    l.description = y.textContent;
                    break;
                case "drop":
                    l.drop = y.textContent;
                    break;
                case "pickup":
                    l.pickup = y.textContent;
                    break;
                case "object1":
                    l.object1 = y.textContent;
                    break;
                case "object2":
                    l.object2 = y.textContent;
                    break;
                case "object3":
                    l.object3 = y.textContent;
                    break;
                case "option1":
                    l.option1 = y.textContent;
                    break;
                case "option2":
                    l.option2 = y.textContent;
                    break;
                case "option3":
                    l.option3 = y.textContent;
                    break;
                case "validdir":
                    l.validdir = y.textContent;
                    break;
            }
            
            // Add location onto the location Array.
            locationArr.push(l);

            // Move to next sibling (location).
            y = y.nextSibling;
        }

        x = x.nextSibling;
    }
}


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

function InventoryText(name) {
    this.name = name;
}

function Location() {
    this.id = "IDXXX";
    this.name = "";
    this.description = "";
    this.drop = false;
    this.pickup = false;
    this.object1 = "";
    this.object2 = "";
    this.object3 = "";
    this.option1 = "";
    this.option2 = "";
    this.option3 = "";
    this.validdir = "";
}

//=====================================================================

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

        //e.preventDefault();
        //e.stopPropagation();

        get_mouse_pos(canvas);
        console.log("Coordinate x: " + mousepos.x, " y: " + mousepos.y);
        
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
    
    document.addEventListener("mousedown", function(e) 
    {
        // Store target of where the mouse was last clicked.
        last_mouse_down_tgt = event.target;
        console.log("doc md");
    });
    
    
    document.addEventListener("keydown", function(e) 
    {
        const canvas = document.getElementById("gamechat");
                
        if (last_mouse_down_tgt == canvas) {
            on_key_press(canvas, event.key, event.keyCode);

            e.preventDefault();
            e.stopPropagation();
        }
    }); 
}

//=====================================================================
// Returns mouse position relative to canvas.

function get_mouse_pos(canvas) {
    let rect = canvas.getBoundingClientRect(); 
    mousepos.x = event.clientX - rect.left; 
    mousepos.y = event.clientY - rect.top;
    return mousepos;
}

//=====================================================================
// Collision: Point and Rectangle.

function is_point_in_rect(x, y, rect) {
    if (x >= rect.x && x <= (rect.x + rect.w) &&
        y >= rect.y && y <= (rect.y + rect.h) )
        return true;
    return false;
}

//=====================================================================
// Draw the scroll bar.

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

//=====================================================================
// Main Paint function.

function paint(canvas) {
    paint_scrollbar(canvas);

    // Find total length in pixels.
    var len = get_total_length();

    var percent = drag.y / (scroll.h - drag.h);     // Gives value between 0 and 1.0.

    // Calculate the pixel to start rendering at.
    var pxl_start = (len * percent) - drag.h;
    // Make sure pxl_start is not (-ve).
    if (pxl_start < 0) pxl_start = 0;

    //console.log("pxl_start=" + pxl_start.toFixed(3) + " percent=" + percent.toFixed(3));

    // Render text.
    render_history(canvas, pxl_start);
}

//=====================================================================
// Walk through text until we hit pxl_start then render (for scroll.h pixels).

function render_history(canvas, pxl_start) {
    const ctx = canvas.getContext("2d");

    for (const obj of objArr) {

//        console.log("obj.y=" + (obj.y).toString() + 
//                    " pxl_start:" + pxl_start + 
//                    " end:" + (pxl_start + scroll.h));
        
        if (obj.y > pxl_start &&
            obj.y < (pxl_start + scroll.h) ) {
            
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
// Add string.

function add_string(text, color, font) {
    const canvas = document.getElementById("gamechat");
    const ctx = canvas.getContext("2d");
    const myArray = text.split(" ");
    var sentence = "";

    ctx.font = font;

    for (const word of myArray) {
        var tmp = sentence + SPACE + word;

        var l = ctx.measureText(tmp).width;

        // Check for full width sentence.
        if (l > (canvasW - marginW - scroll.w) ) {
            var gt = new GameText(marginW, currenty,  color, font, sentence);
            objArr.push(gt);
            sentence = "";
            currenty += get_font_height(ctx, sentence);
            currenty += lineSkip;
        }

        sentence += word + SPACE;
    }

    // Add the final part of the sentence.
    if (sentence != "" ) {
        var gt = new GameText(marginW, currenty,  color, font, sentence);
        objArr.push(gt);
        currenty += get_font_height(ctx, sentence);
        currenty += lineSkip;
    }
    
    paint(canvas);
}

//=====================================================================
// Get length of text in pixels.

function get_total_length() {

    var len = currenty - scroll.h;

    if (len < 0)
        len = 0;

    len += BOTTOM_PAD;

    return len;
}

//=====================================================================
// Get font height in whole pixels.

function get_font_height(ctx, text) {
    var fM = ctx.measureText(text);
    var txtH = fM.actualBoundingBoxAscent + fM.actualBoundingBoxDescent;

    return Math.ceil(txtH);
}

//=====================================================================
// Key Press.

function on_key_press(canvas, key, code) {
    console.log("Key pressed: " + key);

    switch (code) {
        case KEY_CODE.BACKSPACE:
            // Make sure we don't delete the PROMPT text.
            if (playertxt.length > 4) {
                playertxt = playertxt.slice(0, -1);
                edit_player_string(playertxt);
            }
            break;
        case KEY_CODE.TAB:
            break;
        case KEY_CODE.ENTER:
            get_game_response(playertxt);
            playertxt = PROMPT;
            add_string(playertxt, COLOR_PLAYER_TXT, FONT_NORMAL);
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
            playertxt += key;
            console.log("Player Text: " + playertxt);
            edit_player_string(playertxt);
            break;
    }
    
    paint(canvas);
}

//=====================================================================

function edit_player_string(txt) {
    var len = objArr.length;
    
    objArr[len-1].text = txt;
}

//=====================================================================
// Get the Games response to the players input.

function get_game_response(playertxt) {
    var flag_examine = false;
    var flag_fight = false;
    var commands = playertxt.split(" ");
    
    for (var cmd of commands) {
        
        cmd = cmd.toUpperCase();
        
        switch (cmd) {
            case ">>":
                // Ignore prompt string.
                break;
            case "HELP":
                response_help_cmd(cmd);
                break;
            case "INVENTORY":
                response_inventory_cmd(cmd);
                break;
            case "COMMANDS":
                response_cmdlist_cmd(cmd);
                break;
            case "EXAMINE":
                flag_examine = true;
                break;
            case "NORTH":
                response_direction_cmd(cmd)
                break;
            case "SOUTH":
                response_direction_cmd(cmd)
                break;
            case "EAST":
                response_direction_cmd(cmd)
                break;
            case "WEST":
                response_direction_cmd(cmd)
                break;
            case "FIGHT":
                break;
            case "SPELL":
                break;
            case "USING":
                // Ignore.
                break;
            case "PICKUP":
                break;
            case "DROP":
                break;
            case "WHEREAMI":
                response_whereami_cmd(cmd);
                break;
            default:
                if (is_inventory_object(cmd))
                    object = cmd;
                else
                    response_unknown_cmd(cmd);
                break;
        }
    }
}

//=====================================================================
// Narrators Response: Invalid/Unknown command.

function response_unknown_cmd(cmd) {
    var txt;

    txt = PROMPT + "The narrator does not understand '" + cmd + "'";
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);

    txt = PROMPT + "Use 'COMMANDS' for a list of valid commands.";
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Help command.

function response_help_cmd(cmd) {
    var txt;

    txt = PROMPT + "Type 'COMMANDS' for a list of valid commands.";
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: WhereAmI command.

function response_whereami_cmd(cmd) {
    var txt;

    //TODO
    // Lookup the description for 'locationID'.
    txt = PROMPT + "This is where you are...";
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Inventory command.

function response_inventory_cmd(cmd) {
    var txt = PROMPT + "Inventory: ";

    if (inventoryArr.length > 0) {
        for (var item of inventoryArr)
            txt += item.name + " ";
    } else {
        txt += "Inventory is Empty.";
    }
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Command List.

function response_cmdlist_cmd(cmd) {
    var txt = PROMPT + "Command List: ";

    // Default Commands.
    txt += "HELP, INVENTORY, COMMANDS";
    
    //TODO
    txt += ", EXAMINE <object>";

    //TODO
    txt += ", NORTH";
    txt += ", SOUTH";
    txt += ", EAST";
    txt += ", WEST";

    //TODO
    txt += ", FIGHT USING <object>";
    txt += ", SPELL <object>";
    txt += ", PICKUP <object>";
    txt += ", DROP <object>";
    
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Direction command (North, South, East, West).

function response_direction_cmd(cmd) {
    // Check if the direction is valid.
    //TODO

    var txt = PROMPT + "You walk to the " + cmd + "...";
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);

    //TODO
    //player_walks_direction(cmd);
}

//=====================================================================
// Is 'cmd' an inventory object.
//  Returns:
//    true  - 'object' is in inventory.
//    false - 'object' is not in inventory.

function is_inventory_object(object) {

    for (item of inventoryArr) {
        if (object == item.name)
            return true;
    }

    return false;
}

//=====================================================================
// Return the array index of the matching location object.

function find_location(id) {
    var index = -1;

    for (let i = 0; i < locationArr.length; i++) {
        if (locationArr[i].id == id) {
            index = i;
        }
    }

    return index;
}

//=====================================================================
// Play moves to location 'id'.

function move_to_location(id) {
    var txt = PROMPT + "ERROR: Can't find location '" + id + "' in database.";

    // Set the current location.
    locationID = id;
    
    // Find the matching ID in the locationArr.
    var i = find_location(id);
    if (i != -1) {
        txt = PROMPT + locationArr[i].description;
        location_idx = i;
    }
    
    add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Debug.
// - List history in editbox.
// - List inventory items.
// - List location items.

function debug_text() {
    
    for (const obj of objArr) {
        console.log("Y:" + (obj.y).toString() + " " + obj.text);
    }
    
    for (const item of inventoryArr) {
        console.log("Inventory Item: " + item.name);
    }
    
    for (const loc of locationArr) {
        console.log("Location: " + loc.id + " " + loc.name + " " + loc.validdir);
    }
}
