


var parser, xmlDoc;

//var playertxt = "";                     // Players current input text.
var dbox = new displaybox();            // DisplayBox Class.
let inventoryArr = [];                  // Inventory Array.
let locationArr = [];                   // Location Array.
let locationID = "";                    // e.g. "ID001".
let location_idx = -1;                  // Index into locationArr. 

const GAME_VERSION_MAJOR = "02";
const GAME_VERSION_MINOR = "05";

const FONT_TITLE = "bold 18px Helvetica, Arial, sans-serif";
const FONT_NORMAL = "normal 11px Helvetica, Arial, sans-serif";

const PROMPT = ">> ";
const SPACE = " ";
const GAME_TITLE = "The Dragons Apron";
const start_location = "ID001";


window.addEventListener("load", start_game);

//=====================================================================

function Location() {
    this.id = "IDXXX";
    this.name = "";
    this.description = "";
    this.object1 = "";
    this.object2 = "";
    this.object3 = "";
    this.option1 = "";
    this.option2 = "";
    this.option3 = "";
    this.north = "";
    this.south = "";
    this.east = "";
    this.west = "";
}

//=====================================================================

function start_game() {
    print_version();

    dbox.setup_canvas();
    
    kickoff_worker();
}

//=====================================================================

function print_version() {
    console.log("Game   : " + GAME_TITLE);
    console.log("Version: " + GAME_VERSION_MAJOR + "." + GAME_VERSION_MINOR);
}

//=====================================================================
// Start the worker thread that will retrieve the XML.

function kickoff_worker() {

    // Worker thread will load the X?ML asyncronously.
    worker = new Worker("worker.js");

    // Listen for any message (data) passed back from worker thread.
    worker.addEventListener("message", event => {
        if (event.data) {
            console.log("Response from Worker thread received:");
            console.log(event.data);

            parse_xml_to_array(event.data);

            initial_display();
        }
    });

    console.log("Main thread sending message...");
    // Pass data to worker thread.
    worker.postMessage("message");
}

//=====================================================================
// Display initial location text.

function initial_display() {

    // Add Title Text.
    dbox.add_string(GAME_TITLE, COLOR_TITLE_TXT, FONT_TITLE);

    // Move to initial location.
    move_to_location(start_location);

    // Setup the Players input prompt.
    dbox.setup_input_prompt();

    dbox.repaint();
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
            console.log( y.nodeName + ": " + y.textContent );
            
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
                case "north":
                    l.north = y.textContent;
                    break;
                case "south":
                    l.south = y.textContent;
                    break;
                case "east":
                    l.east = y.textContent;
                    break;
                case "west":
                    l.west = y.textContent;
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
// Get the Games response to the players input.

function get_game_response(player_txt) {
    var flag_examine = false;
    var flag_fight = false;
    var commands = player_txt.split(" ");
    
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
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);

    txt = PROMPT + "Use 'COMMANDS' for a list of valid commands.";
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Help command.

function response_help_cmd(cmd) {
    var txt;

    txt = PROMPT + "Type 'COMMANDS' for a list of valid commands.";
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: WhereAmI command.

function response_whereami_cmd(cmd) {
    var txt;

    // Lookup the description for 'locationID'.
    txt = PROMPT + "This is where you are...";
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);

    move_to_location(locationID);
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

    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Command List.

function response_cmdlist_cmd(cmd) {
    var txt = PROMPT + "Command List: ";

    // Default Commands.
    txt += "HELP, INVENTORY, COMMANDS";
    
    //TODO
    txt += ", EXAMINE <object>";

    if (locationArr[location_idx].north != "")
        txt += ", NORTH";

    if (locationArr[location_idx].south != "")
        txt += ", SOUTH";

    if (locationArr[location_idx].east != "")
        txt += ", EAST";

    if (locationArr[location_idx].west != "")
        txt += ", WEST";

    //TODO
    txt += ", FIGHT USING <object>";
    txt += ", SPELL <object>";
    txt += ", PICKUP <object>";
    txt += ", DROP <object>";
    txt += ", WHEREAMI";
    
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Direction command (North, South, East, West).

function response_direction_cmd(cmd) {
    var id = "";

    // Check if the direction is valid.
    if (is_direction_valid(cmd) == false)
        return;

    var txt = PROMPT + "You walk to the " + cmd + "...";
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);

    // Find what the players new locationID will be.
    switch (cmd) {
        case "NORTH": 
            id = locationArr[location_idx].north;
            break;
        case "SOUTH": 
            id = locationArr[location_idx].south;
            break;
        case "EAST": 
            id = locationArr[location_idx].east;
            break;
        case "WEST": 
            id = locationArr[location_idx].west;
            break;
    }
    
    move_to_location(id);
}

//=====================================================================
// Check if the direction command is valid.
// Returns:
//  true  - Direction command is valid.
//  false - Direction command is invalid.

function is_direction_valid(cmd) {

    // Make sure that for a direction cmd there is a new locationID.
    if ((cmd == "NORTH" && locationArr[location_idx].north != "") ||
        (cmd == "SOUTH" && locationArr[location_idx].south != "") ||
        (cmd == "EAST" && locationArr[location_idx].east != "") ||
        (cmd == "WEST" && locationArr[location_idx].west != ""))
        return true;

    return false;
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
// Player moves to location 'id'.

function move_to_location(id) {
    var txt = PROMPT + "ERROR: Can't find location '" + id + "' in database.";

    // Set the current location.
    locationID = id;
    
    // Find the matching ID in the locationArr.
    var i = find_location(id);
    if (i != -1) {
        txt = PROMPT + locationArr[i].name + ": " + locationArr[i].description;
        location_idx = i;
    }
    
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
//=====================================================================
// Debug.
// - List inventory items.
// - List location items.

function debug() {
    
    for (const item of inventoryArr) {
        console.log("Inventory Item: " + item.name);
    }
    
    for (const loc of locationArr) {
        console.log("Location: " + loc.id + " " + loc.name);
    }
}

//=====================================================================
// Dump Object.
// Usage: console.log( getAllMethods(dbox) );

function getAllMethods(obj = this) {
    return Object.keys(obj)
         .filter((key) => typeof obj[key] === 'function')
         .map((key) => obj[key]);
    
}

//=====================================================================
