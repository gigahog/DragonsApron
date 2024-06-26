// File: inputLocation.js

const LOC_DIV = "loc_div";

//=====================================================================
// Start editing Location.

function on_edit_location() {
    
    // Clear all the HTML fields.
    clear_location_form();
    
    // Walk the list of Locations.
    for (var loc of locationArr) {
        //console.log("ID=" + loc.id + " selected=" + loc.selected);

        // Check for ID match.
        if (loc.selected == true) {

            document.getElementById("loc_id").textContent = loc.id;

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

    document.getElementById(LOC_DIV).style.position = 'absolute';
    document.getElementById(LOC_DIV).style.left = '50px';
    document.getElementById(LOC_DIV).style.top = '70px';
    document.getElementById(LOC_DIV).style.height = '520px';
    document.getElementById(LOC_DIV).style.width = '400px';
    document.getElementById(LOC_DIV).style.border = '5px outset red';
    document.getElementById(LOC_DIV).style.backgroundColor = 'lightblue';
    document.getElementById(LOC_DIV).style.textAlign = 'left';
    document.getElementById(LOC_DIV).style.padding = '10px';

    // Show the division element.
    document.getElementById(LOC_DIV).hidden = false;
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

    set_location_data(loc_id.textContent, loc_name.value, loc_desc.value,
                      loc_obj1.value, loc_obj2.value, loc_obj3.value,
                      loc_opt1.value, loc_opt2.value, loc_opt3.value,
                      loc_lis.value);
    dump_location();

    // Hide the division element.
    document.getElementById(LOC_DIV).hidden = true;
    
    // Flag that there has been a change.
    set_change_flag();
    
    // Call composers repaint function.
    repaint();
}


function on_btn_cancel() {

    // Hide the division element.
    document.getElementById(LOC_DIV).hidden = true;
    
    // Call composers repaint function.
    repaint();
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

            console.log("SET_LOCATION: " + loc_id + " " + loc_name + " " + loc_desc + " " + loc_obj1 + " " + loc_obj2 + " " + loc_obj3 + " " + loc_opt1 + " " + loc_opt2 + " " + loc_opt3 + " " + loc_lis);

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
// Clear all HTML elements in Form.

function clear_location_form() {
    
    document.getElementById("loc_id").value = EMPTY;
    document.getElementById("loc_name").value = EMPTY;
    document.getElementById("loc_desc").value = EMPTY;
            
    document.getElementById("loc_obj1").value = EMPTY;
    document.getElementById("loc_obj2").value = EMPTY;
    document.getElementById("loc_obj3").value = EMPTY;

    document.getElementById("loc_opt1").value = EMPTY;
    document.getElementById("loc_opt2").value = EMPTY;
    document.getElementById("loc_opt3").value = EMPTY;

    document.getElementById("loc_listen").value = EMPTY;
}

//=====================================================================
