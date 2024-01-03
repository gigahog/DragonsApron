// File: inputAdventure.js


//=====================================================================
// Start editing Master Adventure.

function on_edit_master() {

    // Clear all the HTML fields.
    clear_master_form();

    if (master.title != EMPTY)
        document.getElementById("adv_title").value = master.title;

    if (master.author != EMPTY)
        document.getElementById("adv_author").value = master.author;

    if (master.url != EMPTY)
        document.getElementById("adv_url").value = master.url;

    if (master.copyright != EMPTY)
        document.getElementById("adv_cright").value = master.copyright;


    // Fill in the listbox for possible "Start ID".
    var select = document.getElementById("adv_sid");
    var sel = 0;

    // Remove all elements from listbox.
    select.innerHTML = "";

    if (locationArr.length > 0) {
        // Now walk the list of current locations and add their ID's to dropdown listbox.
        for (var i=locationArr.length-1; i >= 0; i--) {
            var option = document.createElement('option');
            option.text = option.value = locationArr[i].id;
            select.add(option, 0);
            
            if (locationArr[i].id == master.start_id) {
                console.log("selected index=" + i);
                sel = i;
            }
        }

        document.getElementById("adv_sid")[sel].setAttribute('selected','selected');
    } else {
        // Add a default ID of 'ID001'.
        var option = document.createElement('option');
        option.text = option.value = "ID001";
        select.add(option, 0);
    }


    // Show the division element.
    document.getElementById("adv_div").hidden = false;
}

//=====================================================================
// <div> button Events (when editing the location).

function on_btn_adv_ok() {
    
    master.title = document.getElementById("adv_title").value;
    master.author = document.getElementById("adv_author").value;
    master.url = document.getElementById("adv_url").value;
    master.start_id = document.getElementById("adv_sid").value;
    master.copyright = document.getElementById("adv_cright").value;

    // Hide the division element.
    document.getElementById("adv_div").hidden = true;
    
    // Flag that there has been a change.
    set_change_flag();
    
    dply.repaint();
}


function on_btn_adv_cancel() {

    // Hide the division element.
    document.getElementById("adv_div").hidden = true;
    
    dply.repaint();
}

//=====================================================================
// Clear all HTML elements in Form.

function clear_master_form() {
    
    document.getElementById("adv_title").value = EMPTY;
    document.getElementById("adv_author").value = EMPTY;
    document.getElementById("adv_url").value = EMPTY;
    document.getElementById("adv_sid").value = EMPTY;
    document.getElementById("adv_cright").value = EMPTY;
}

//=====================================================================

