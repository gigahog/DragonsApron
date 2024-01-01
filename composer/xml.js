
//=====================================================================

function create_xml() {

    var doc = document.implementation.createDocument("", "", null);
    var root = doc.createElement("root");

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
        desc.innerHTML = loc.description;
        location.appendChild(desc);

        for (var i = 0; i < loc.object.length; i++) {
            var obj = doc.createElement("object" + i.toString());
            obj.innerHTML = loc.object[i];
            location.appendChild(obj);
        }

        for (var i = 0; i < loc.option.length; i++) {
            var opt = doc.createElement("option" + i.toString());
            opt.innerHTML = loc.option[i];
            location.appendChild(opt);
        }

        var dir_n = doc.createElement("north");
        dir_n.innerHTML = get_id_of_direction(loc.squ, "N");
        location.appendChild(dir_n);

        var dir_n = doc.createElement("south");
        dir_n.innerHTML = get_id_of_direction(loc.squ, "S");
        location.appendChild(dir_n);

        var dir_n = doc.createElement("east");
        dir_n.innerHTML = get_id_of_direction(loc.squ, "E");
        location.appendChild(dir_n);

        var dir_n = doc.createElement("west");
        dir_n.innerHTML = get_id_of_direction(loc.squ, "W");
        location.appendChild(dir_n);

        root.appendChild(location);
    }

    doc.appendChild(root);
    
    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(doc);

    console.log('xmlString :\n' + xmlString);

    return xmlString;
}

//=====================================================================
// Return the ID assiociated with
//  ds_array - Direction Square array.
//  dirstr   - Direction string e.g "north"

function get_id_of_direction(ds_array, dirstr) {
    
    // Walk the direction squares looking for any reference to 'id'.
    for (var ds of ds_array) {
            
        if (ds.connected_dir == dirstr)
            return ds.connected_id;
    }
    return EMPTY;
}

//=====================================================================

