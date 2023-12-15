


var parser, xmlDoc;

//var playertxt = "";                     // Players current input text.
var dbox = new displaybox();            // DisplayBox Class.
let inventoryArr = [];                  // Inventory Array.
let locationArr = [];                   // Location Array.
let locationID = "";                    // e.g. "ID001".
let location_idx = -1;                  // Index into locationArr. 
let holding = "";

const GAME_VERSION_MAJOR = "02";
const GAME_VERSION_MINOR = "09";

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
    this.object = [];
    this.option = [];
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

    // Pass data to worker thread.
    console.log("Main thread sending message...");
    worker.postMessage("startworker");
}

//=====================================================================
// Display initial location text.

function initial_display() {

    // Add Title Text & Version.
    var txt = GAME_TITLE;
    dbox.add_string(txt, COLOR_TITLE_TXT, FONT_TITLE);

    txt = "Version: " + GAME_VERSION_MAJOR + "." + GAME_VERSION_MINOR;
    dbox.add_string(txt, COLOR_DK_BROWN, FONT_NORMAL);
    
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
                    if (y.textContent != "")
                        l.object.push(y.textContent);
                    break;
                case "object2":
                    if (y.textContent != "")
                        l.object.push(y.textContent);
                    break;
                case "object3":
                    if (y.textContent != "")
                        l.object.push(y.textContent);
                    break;
                case "option1":
                    if (y.textContent != "")
                        l.option.push(y.textContent);
                    break;
                case "option2":
                    if (y.textContent != "")
                        l.option.push(y.textContent);
                    break;
                case "option3":
                    if (y.textContent != "")
                        l.option.push(y.textContent);
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
    var object = "";
    
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
                response_direction_cmd(cmd);
                break;
            case "SOUTH":
                response_direction_cmd(cmd);
                break;
            case "EAST":
                response_direction_cmd(cmd);
                break;
            case "WEST":
                response_direction_cmd(cmd);
                break;
            case "FIGHT":
                response_fight_cmd(commands);
                break;
            case "THROW":
                response_throw_cmd(commands);
                break;
            case "USING":
                // Ignore string.
                break;
            case "PICKUP":
                response_pickup_cmd(commands);
                break;
            case "DROP":
                response_drop_cmd(commands);
                break;
            case "OBJECTS":
                response_objects_cmd(cmd);
                break;
            case "WHEREAMI":
                response_whereami_cmd(cmd);
                break;
            case "STORE":
                response_store_cmd(commands);
                break;
            case "RETRIEVE":
                response_retrieve_cmd(commands);
                break;
            default:
                console.log("unknown cmd=" + cmd);
                if (is_inventory_object(cmd) || is_holding_object(cmd) || is_room_object(cmd))
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
    var txt = PROMPT + "Inventory List: ";

    if (inventoryArr.length > 0) {
        for (var item of inventoryArr)
            txt += item + ", ";

        // Remove last two chars (", ").
        txt = txt.slice(0, -2);
    } else {
        txt += "<empty>";
    }

    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Narrators Response: Current Object List.

function response_objects_cmd(cmd) {
    var txt = PROMPT + "Current Object List:";
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    
    // Holding.
    var txt = PROMPT + "You are holding: ";
    if (holding != "")
        txt += holding;
    else
        txt += "<empty>";
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    
    // Inventory list.
    response_inventory_cmd("");
    
    // Location Objects list.
    room_object_list();
}

//=====================================================================
// Narrators Response: Command List.

function response_cmdlist_cmd(cmd) {
    var txt = PROMPT + "Command List: ";

    // Default Commands.
    txt += "HELP, INVENTORY, COMMANDS, OBJECTS";
    
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
    txt += ", THROW <object>";
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
// Is 'cmd' an object in current room.
//  Returns:
//    true  - 'object' is in room.
//    false - 'object' is not in room.

function room_object_list() {
    var txt = PROMPT + "The objects at this location: ";

    if (locationArr[location_idx].object.length > 0) {
        for (var location_obj of locationArr[location_idx].object)
            txt += location_obj + ", ";
        
        // Remove last two chars (", ").
        txt = txt.slice(0, -2);
    } else {
        txt += "There are no objects here.";
    }

    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
}

//=====================================================================
// Is 'cmd' an inventory object.
//  Returns:
//    true  - 'object' is in inventory.
//    false - 'object' is not in inventory.

function is_inventory_object(object) {

    for (var item of inventoryArr) {
        if (object.toUpperCase() == item.toUpperCase())
            return true;
    }

    return false;
}

//=====================================================================
// Is 'cmd' an object player is holding.
//  Returns:
//    true  - player is holding 'object'.
//    false - player is not holding 'object'.

function is_holding_object(object) {

    if (object.toUpperCase() == holding.toUpperCase())
        return true;

    return false;
}

//=====================================================================
// Is 'cmd' an object in current room.
//  Returns:
//    true  - 'object' is in room.
//    false - 'object' is not in room.

function is_room_object(object) {

    for (var location_obj of locationArr[location_idx].object) {
        //console.log("ROOM:>>" + location_obj.toUpperCase() + "<< >>" + object + "<<");
        if (object.toUpperCase() == location_obj.toUpperCase())
            return true;
    }
    return false;
}

//=====================================================================
// Narrators Response: Pickup <obj> command.

function response_pickup_cmd(commands) {
    var txt = "";
    
    // Walk command list looking for an object.
    for (var obj of commands) {
        
        var cmd_obj = obj.toUpperCase();
        
        for (var location_obj of locationArr[location_idx].object) {
            if (cmd_obj == location_obj.toUpperCase()) {

                // Remove the object from the location Array.
                var idx = locationArr[location_idx].object.indexOf(location_obj);
                locationArr[location_idx].object.splice(idx, 1);
                
                // If player is holding an object then drop it (add back to location Array).
                if (holding != "") {
                    locationArr[location_idx].object.push(holding);
                    txt = PROMPT + "You drop the " + holding + " to the ground.";
                    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
                }
                
                // Change what object the player is holding.
                holding = obj;
                
                var txt = PROMPT + "You are now holding the " + holding + ".";
                dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
                
                return;
            }
        }
    }
}

//=====================================================================
// Narrators Response: Drop <obj> command.

function response_drop_cmd(commands) {
    var txt = "";
    var dropped = false;
    
    // If there is object then try to match it to the inventory.
    // If no match is found then try to drop the one you are holding.

    // Walk command list looking for an object.
    for (var obj of commands) {

        var cmd_obj = obj.toUpperCase();
        
        for (var inv_obj of inventoryArr) {
            if (cmd_obj == inv_obj.toUpperCase()) {

                // Remove the object from the inventory Array.
                var idx = inventoryArr.indexOf(inv_obj);
                inventoryArr.splice(idx, 1);
                dropped = true;
                
                // Add object to location Array.
                locationArr[location_idx].object.push(inv_obj);

                txt = PROMPT + "You drop the " + inv_obj + " to the ground.";
                dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
                return;
            }
        }
    }

    // Drop what player is holding.
    if (dropped == false && holding != "") {
        // Add holding object to location Array.
        locationArr[location_idx].object.push(holding);

        txt = PROMPT + "You drop the " + holding + " to the ground.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);

        txt = PROMPT + "You are holding nothing.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
        holding = "";
        dropped = true;
    }
    
    // Check if no object was found to drop.
    if (dropped == false) {
        txt = PROMPT + "There was no object found to drop.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    }
}

//=====================================================================
// Narrators Response: Throw <obj> command.

function response_throw_cmd(commands) {
    var txt;

    // Throw the object player is holding.
    if (holding != "") {
        txt = PROMPT + "You throw the " + holding + ".";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
        
        //TODO
        
        txt = PROMPT + "You are holding nothing.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
        holding = "";
    } else {
        txt = PROMPT + "Can't throw because you are not holding an object.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    }
}

//=====================================================================
// Narrators Response: Fight <obj> command.

function response_fight_cmd(commands) {
    var txt = PROMPT;

    // Fight using the object player is holding.
    if (holding != "") {
        txt += "You fight using the " + holding + " you are holding.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
        
        //TODO

    } else {
        txt += "You can't fight because you are not holding an object.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    }
}

//=====================================================================
// Narrators Response: Store to Inventory <obj> command.

function response_store_cmd(commands) {
    var txt;

    if ( inventoryArr.length > 5) {
        txt = PROMPT + "You can't store any more objects in your inventory.";
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    } else {
        
        // Walk command list looking for an object.
        for (var obj of commands) {
            console.log("obj=" + obj);
            if (is_holding_object(obj)) {
                // Add holding object to inventory Array.
                inventoryArr.push(holding);
                holding = "";
                //console.log("inv=" + inventoryArr);
                
                txt = PROMPT + "Added the " + obj + " to the inventory.";
                dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
                
                txt = PROMPT + "You are holding nothing.";
                dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
                return;
            }
            
            if (is_room_object(obj)) {
                console.log("room - obj=" + obj);

                // Remove the object from the location Array.
                var idx = find_index_of_object(obj);
                var tmp = locationArr[location_idx].object[idx];
                locationArr[location_idx].object.splice(idx, 1);
                console.log("loc=" + locationArr[location_idx].object + " idx=" + idx);

                // Add object to inventory Array.
                inventoryArr.push(tmp);
                console.log("inv=" + inventoryArr);

                txt = PROMPT + "Added the " + tmp + " to the inventory.";
                dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
                return;
            }
        }
    }
}

//=====================================================================
// Narrators Response: Retrieve from Inventory <obj> command.

function response_retrieve_cmd(commands) {
    var txt = "";

    // Try and match the command objects to an object in the inventory.
    // If no match is found then error.
    // If match then remove from inventory.
    // If holding an object then drop it.
    // Hold the newly removed inventory object.

    // Walk command list looking for an object.
    for (var obj of commands) {

        if (is_inventory_object(obj)) {

            // Remove the object from the inventory Array.
            var idx = inventoryArr.indexOf(obj);
            inventoryArr.splice(idx, 1);
           
            // If holding an object then drop it.
            if (holding != "") {
                locationArr[location_idx].object.push(holding);
                holding = "";
            }

            // Hold the newly removed object from the inventory.
            holding = obj;

            return;
        }
    }
}

//=====================================================================
// Return the array index of the matching location ID.

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
// Return the array index of the matching location object.

function find_index_of_object(obj) {
    var index = -1;
    
    for (let i = 0; i < locationArr[location_idx].object.length; i++) {
        if (obj.toUpperCase() == locationArr[location_idx].object[i].toUpperCase())
            index = i;
    }
    
    return index;
}

//=====================================================================
// Player moves to location 'id' (e.g. "ID005").

function move_to_location(id) {
    var txt;

    // Set the current location.
    locationID = id;
    
    // Find the matching ID in the locationArr.
    var i = find_location(id);
    if (i != -1) {
        txt = PROMPT + locationArr[i].name + ": " + locationArr[i].description;
        location_idx = i;
    } else {
        txt = PROMPT + "ERROR: Can't find location '" + id + "' in database.";
    }
    
    dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    
    if (i != -1) {
        if (locationArr[i].object.length > 0) {
            txt = PROMPT + "The objects at this location: ";
            for(const obj of locationArr[i].object)
                txt += obj + ", ";
            console.log(">>" + txt + "<<");
            // Remove last two chars (", ").
            txt = txt.slice(0, -2);
            console.log(">>" + txt + "<<");
        } else 
            txt = PROMPT + "There are no object here.";
        
        dbox.add_string(txt, COLOR_NARRATOR_TXT, FONT_NORMAL);
    }
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
