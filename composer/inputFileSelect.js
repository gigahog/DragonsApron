// File: inputFileSelect.js

const FILE_DIV = "file_div";

//=====================================================================
// Display Google Drive File List
// NOTE: Prerequisite - 'flist' must be filled in.

function on_select_filelist() {

    // Clear all the HTML fields.
    clear_file_select_form();

    for (var i = 0; i < flist.length; i++)
        console.log( "FLIST: " + flist[i].id + "  " + flist[i].fname );


    // Fill in the listbox with file names and titles.
    var select = document.getElementById("file_box");

    // Remove all elements from listbox.
    select.innerHTML = "";

    // Now add current element back to listbox.
    for (var i=flist.length-1; i >= 0; i--) {
        var option = document.createElement('option');
        option.text = flist[i].fname;
        option.value = flist[i].id;
        select.add(option, 0);
    }
    
    document.getElementById(FILE_DIV).style.position = 'absolute';
    document.getElementById(FILE_DIV).style.left = '50px';
    document.getElementById(FILE_DIV).style.top = '70px';
    document.getElementById(FILE_DIV).style.height = '520px';
    document.getElementById(FILE_DIV).style.width = '400px';
    document.getElementById(FILE_DIV).style.border = '5px outset red';
    document.getElementById(FILE_DIV).style.backgroundColor = 'lightblue';
    document.getElementById(FILE_DIV).style.textAlign = 'left';
    document.getElementById(FILE_DIV).style.padding = '10px';

    // Show the division element.
    document.getElementById(FILE_DIV).hidden = false;
}

//=====================================================================
// <div> button Events (when editing the location).

function on_btn_file_ok() {
    
    // Hide the division element.
    document.getElementById(FILE_DIV).hidden = true;
    
    // Was a file selected ?
    var itemList = document.getElementById("file_box");
    var xml_file = new XmlFile();

    xml_file.id = -1;
    
    if (itemList.selectedOptions.length > 0) {
        xml_file.id = itemList.selectedOptions[0].value;
        xml_file.fname = itemList.selectedOptions[0].text;
    }
      
    console.log( "Selected ID: " + xml_file.id );

    if (xml_file.id == -1) return;

    
    gg_read_download(xml_file, 'read');
    
    // Call composers repaint function.
    repaint();
}


function on_btn_file_cancel() {

    // Hide the division element.
    document.getElementById(FILE_DIV).hidden = true;
    
    // Call composers repaint function.
    repaint();
}

//=====================================================================
// Clear all HTML elements in Form.

function clear_file_select_form() {
    
    document.getElementById("file_box").value = EMPTY;
    document.getElementById("file_title").value = EMPTY;
}

//=====================================================================
