
//=====================================================================

function create_xml() {

    var doc = document.implementation.createDocument("", "", null);
    var root = doc.createElement("root");

    //--------------------------------------------------------------
    // Add Master Record.
    var mstr = doc.createElement("master");

    var title = doc.createElement("title");
    title.innerHTML = master.title;
    mstr.appendChild(title);

    var author = doc.createElement("author");
    author.innerHTML = master.author;
    mstr.appendChild(author);

    var url = doc.createElement("url");
    url.innerHTML = master.url;
    mstr.appendChild(url);

    var sid = doc.createElement("start_id");
    sid.innerHTML = master.start_id;
    mstr.appendChild(sid);

    var cright = doc.createElement("copyright");
    cright.innerHTML = master.copyright;
    mstr.appendChild(cright);
    
    root.appendChild(mstr);


    //--------------------------------------------------------------
    // Walk the list of Locations.
    for (var loc of locationArr) {
    
        var location = doc.createElement("location");

        var id = doc.createElement("locationID");
        id.innerHTML = loc.id;
        location.appendChild(id);

        var name = doc.createElement("name");
        name.innerHTML = loc.name;
        location.appendChild(name);

        var desc = doc.createElement("description");
        desc.textContent = loc.description;
        location.appendChild(desc);

        for (var i = 0; i < loc.object.length; i++) {
            var j = i + 1;
            var obj = doc.createElement("object" + j.toString());
            obj.innerHTML = loc.object[i];
            location.appendChild(obj);
        }

        for (var i = 0; i < loc.option.length; i++) {
            var j = i + 1;
            var opt = doc.createElement("option" + j.toString());
            opt.innerHTML = loc.option[i];
            location.appendChild(opt);
        }


        var dir_n = doc.createElement("north");
        dir_n.innerHTML = get_id_of_direction(loc.squ, "N");
        location.appendChild(dir_n);

        var dir_s = doc.createElement("south");
        dir_s.innerHTML = get_id_of_direction(loc.squ, "S");
        location.appendChild(dir_s);

        var dir_e = doc.createElement("east");
        dir_e.innerHTML = get_id_of_direction(loc.squ, "E");
        location.appendChild(dir_e);

        var dir_w = doc.createElement("west");
        dir_w.innerHTML = get_id_of_direction(loc.squ, "W");
        location.appendChild(dir_w);

        var listen = doc.createElement("listen");
        listen.innerHTML = loc.listen;
        location.appendChild(listen);
        
        var x = doc.createElement("coord_x");
        x.innerHTML = loc.rect.x;
        location.appendChild(x);
        
        var y = doc.createElement("coord_y");
        y.innerHTML = loc.rect.y;
        location.appendChild(y);
        
        root.appendChild(location);
    }

    doc.appendChild(root);
    
    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(doc);

    console.log('xmlString :\n' + xmlString);

    return xmlString;
}

//=====================================================================
// Return the info assiociated with a direction.
//  ds_array - Direction Square array.
//  dirstr   - Direction string e.g "north"
// Returns:
//  String made up of: connection_id & connection_dir
//  e.g.   "ID003-S"  - Means it is connected to the south side of ID003.

function get_id_of_direction(ds_array, dirstr) {
    
    // Walk the direction squares looking for any reference to 'id'.
    for (var ds of ds_array) {
            
        if (ds.direction == dirstr  &&  ds.connected_id != EMPTY)
            return ds.connected_id + "-" + ds.connected_dir;
    }
    return EMPTY;
}

//=====================================================================
// Convert the XML into an array of locations.

function parse_xml_to_location_array(txt) {

    // Clear Location Array.
    locationArr.length = 0;
    
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(txt, "text/xml");
            
    var x = xmlDoc.getElementsByTagName("location")[0];
    //console.log( x );

    while (x != null) {
                
        var y = x.childNodes[0];
        console.log( "------" );

        // New location.
        var loc = new Location();
        
        while (y != null && y.nodeType == 1) {
            console.log( y.nodeName + ": " + y.textContent );
            
            switch ( y.nodeName ) {
                case "locationID":
                    loc.id = y.textContent;
                    break;
                case "name":
                    loc.name = y.textContent;
                    break;
                case "description":
                    loc.description = y.textContent;
                    break;
                case "object1":
                    if (y.textContent != "")
                        loc.object.push(y.textContent);
                    break;
                case "object2":
                    if (y.textContent != "")
                        loc.object.push(y.textContent);
                    break;
                case "object3":
                    if (y.textContent != "")
                        loc.object.push(y.textContent);
                    break;
                case "option1":
                    if (y.textContent != "")
                        loc.option.push(y.textContent);
                    break;
                case "option2":
                    if (y.textContent != "")
                        loc.option.push(y.textContent);
                    break;
                case "option3":
                    if (y.textContent != "")
                        loc.option.push(y.textContent);
                    break;
                case "north":
                    var parts = y.textContent.split('-');
                    if (parts.length == 2)
                        set_north_square(loc, parts[0], parts[1]);
                    else
                        set_north_square(loc, EMPTY, EMPTY);
                    break;
                case "south":
                    var parts = y.textContent.split('-');
                    if (parts.length == 2)
                        set_south_square(loc, parts[0], parts[1]);
                    else
                        set_south_square(loc, EMPTY, EMPTY);
                    break;
                case "east":
                    var parts = y.textContent.split('-');
                    if (parts.length == 2)
                        set_east_square(loc, parts[0], parts[1]);
                    else
                        set_east_square(loc, EMPTY, EMPTY);
                    break;
                case "west":
                    var parts = y.textContent.split('-');
                    if (parts.length == 2)
                        set_west_square(loc, parts[0], parts[1]);
                    else
                        set_west_square(loc, EMPTY, EMPTY);
                    break;
                case "listen":
                    if (y.textContent != "")
                        loc.listen = y.textContent;
                    break;
                case "coord_x":
                    loc.rect.x = parseInt(y.textContent);
                    break;
                case "coord_y":
                    loc.rect.y = parseInt(y.textContent);
                    break;
            }

            // Move to next sibling (location).
            y = y.nextSibling;
        }
        
        // Set defaults.
        loc.rect.w = LOCATION_BOX_W;
        loc.rect.h = LOCATION_BOX_H;
            
        // Add location onto the location Array.
        locationArr.push(loc);

        x = x.nextSibling;
    }
}

//=====================================================================
// Convert the XML into master record.

function parse_xml_to_master_record(txt) {

    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(txt, "text/xml");
            
    var x = xmlDoc.getElementsByTagName("master")[0];
    //console.log( x );
                
    var y = x.childNodes[0];
        
    while (y != null && y.nodeType == 1) {
        console.log( y.nodeName + ": " + y.textContent );
            
        switch ( y.nodeName ) {
            case "title":
                master.title = y.textContent;
                break;
            case "author":
                master.author = y.textContent;
                break;
            case "url":
                master.url = y.textContent;
                break;
            case "start_id":
                master.start_id = y.textContent;
                break;
            case "copyright":
                master.copyright = y.textContent;
                break;
        }

        // Move to next sibling.
        y = y.nextSibling;
    }
        
    console.log("Title: " + master.title);
    console.log("author: " + master.author);
    console.log("url: " + master.url);
    console.log("start_id: " + master.start_id);
    console.log("copyright: " + master.copyright);
}

//=====================================================================
