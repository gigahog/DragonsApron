// File: link.js

//=====================================================================
// Constants.

const FORCE_FIELD_PAD = 4;


//=====================================================================
// Structure Definition.



//=====================================================================
// Class Definition.

class link {

    constructor() {
        this.a_id = "";
        this.a_direction = "";
        this.a_pos = new Vector(0, 0);
        this.b_id = "";
        this.b_direction = "";
        this.b_pos = new Vector(0, 0);
        
        this.current = false;
    }

//=====================================================================
// Event: Mouse button down.
//  mx - Mouse X Position (World coordinates).
//  my - Mouse Y Position (World coordinates).

on_add_link(mx, my) {

    // Check if mouse is on a N,S,E,W direction square of a location box.

    var box = new Rectangle(0, 0, 0, 0);

    for (var loc of locationArr) {

        for (var ds of loc.squ) {

            // Force field around Direction Square.
            box.x = loc.rect.x + ds.offset.x - FORCE_FIELD_PAD;
            box.y = loc.rect.y + ds.offset.y - FORCE_FIELD_PAD;
            box.w = ds.offset.w + (FORCE_FIELD_PAD*2);
            box.h = ds.offset.h + (FORCE_FIELD_PAD*2);

            if (is_point_in_rect(mx, my, box)) {
                // Hit a location box.

                // Direction Square.
                box.x = loc.rect.x + ds.offset.x;
                box.y = loc.rect.y + ds.offset.y;
                box.w = ds.offset.w;
                box.h = ds.offset.h;

                this.a_id = loc.id;
                this.a_direction = ds.direction;
                // World coordinates of box.
                this.a_pos.x = box.x;
                this.a_pos.y = box.y;
                console.log("HIT: Loc A:" + this.a_id + " Dir:" + this.a_direction);
                
                this.b_id = EMPTY;
                this.b_direction = EMPTY;
                this.b_pos.x = mx;
                this.b_pos.y = my;
            
                this.current = true;
                return true;
            }
        }
    }

    return false;
}

//=====================================================================
// Event: Move mouse
//  mx - Mouse X Position (World coordinates).
//  my - Mouse Y Position (World coordinates).

on_move_link(mx, my) {
    
    if (this.current == true) {
        this.b_id = EMPTY;
        this.b_direction = EMPTY;
        this.b_pos.x = mx;
        this.b_pos.y = my;
    }
}

//=====================================================================
// Event: Mouse button up.
//  mx - Mouse X Position (World coordinates).
//  my - Mouse Y Position (World coordinates).

on_finish_link(mx, my) {
    if (this.current == true) {
        this.current = false;
            
        // Check if mouse is on a location box direction square.
        var box = new Rectangle(0, 0, 0, 0);

        for (var loc of locationArr) {

            for (var ds of loc.squ) {

                // Force field around Direction Square.
                box.x = loc.rect.x + ds.offset.x - FORCE_FIELD_PAD;
                box.y = loc.rect.y + ds.offset.y - FORCE_FIELD_PAD;
                box.w = ds.offset.w + (FORCE_FIELD_PAD*2);
                box.h = ds.offset.h + (FORCE_FIELD_PAD*2);
                
                if (is_point_in_rect(mx, my, box)) {
                    // Hit a location box.

                    // Direction Square.
                    box.x = loc.rect.x + ds.offset.x;
                    box.y = loc.rect.y + ds.offset.y;
                    box.w = ds.offset.w;
                    box.h = ds.offset.h;
                
                    this.b_id = loc.id;
                    this.b_direction = ds.direction;
                    this.b_pos.x = mx;
                    this.b_pos.y = my;
                    console.log("HIT: Loc B:" + this.b_id + " Dir:" + this.b_direction);
                }
            }
        }


        // Make sure a_id != b_id.
        if (this.a_id == this.b_id) {
            console.log("WARNING: Link a_id == b_id !");
            return;
        }

        // Transfer A-B link data to location array.
        this.set_location_array_from_link();
    }
}

//=====================================================================
// Transfer the A-B link data to the location array.

set_location_array_from_link() {

    // Make sure the A-B link is valid.
    if (this.a_id == EMPTY || this.b_id == EMPTY)
        return;

    for (var loc of locationArr) {

        for (var ds of loc.squ) {

            if (this.a_id == loc.id && this.a_direction == ds.direction) {
                console.log("A ID=" + this.a_id + " DIR=" + this.a_direction);
                console.log(" B ID=" + this.b_id + " DIR=" + this.b_direction);
                ds.connected_id  = this.b_id; 
                ds.connected_dir = this.b_direction;
                ds.connected = true;
            }

            if (this.b_id == loc.id && this.b_direction == ds.direction) {
                console.log("B ID=" + this.b_id + " DIR=" + this.b_direction);
                console.log(" A ID=" + this.a_id + " DIR=" + this.a_direction);
                ds.connected_id  = this.a_id; 
                ds.connected_dir = this.a_direction;
                ds.connected = true;
            }
        }
    }

    return;
}

//=====================================================================
// Paint the current link we are working on.

paint_current_link(canvas) {
    const ctx = canvas.getContext('2d');
    
    if (this.current == true) {
        // Paint current link.
        
        // Where to draw on canvas (screen coord).
        var a_end = dply.world2screen(this.a_pos.x, this.a_pos.y);
        var b_end = dply.world2screen(this.b_pos.x, this.b_pos.y);
        
        ctx.beginPath();                // Start a new path.
        ctx.strokeStyle = COLOR_BLACK;
        ctx.moveTo(a_end.x+(DIR_BOX_SZ>>1), a_end.y+(DIR_BOX_SZ>>1));   // Move the pen.
        ctx.lineTo(b_end.x, b_end.y);   // Draw a line.
        ctx.stroke();                   // Render the path

        // Fill rectangles at both ends of the link.
        ctx.fillStyle = COLOR_RED;
        ctx.fillRect(a_end.x, a_end.y, DIR_BOX_SZ, DIR_BOX_SZ);
        ctx.fillRect(b_end.x-(DIR_BOX_SZ>>1), b_end.y-(DIR_BOX_SZ>>1), DIR_BOX_SZ, DIR_BOX_SZ);
    }
}

//=====================================================================
// Paint the Baked (already created) links.

paint_baked_links(canvas) {
    const ctx = canvas.getContext('2d');
    var box2 = new Rectangle(0, 0, 0, 0);

    for (var loc of locationArr) {

        for (var ds of loc.squ) {

            if (ds.connected == true) {
                
                // NOTE: This is returned in screen coordinates.
                var box1 = this.get_direction_square_rect(ds.connected_id, ds.connected_dir);
                
                // Make sure this is also in screen coordinates.
                var point = dply.world2screen(loc.rect.x + ds.offset.x, loc.rect.y + ds.offset.y);
                box2.x = point.x;
                box2.y = point.y;
                box2.w = ds.offset.w;
                box2.h = ds.offset.h;
                
                ctx.beginPath();                // Start a new path.
                ctx.strokeStyle = COLOR_BLACK;
                ctx.moveTo(box1.x+(box1.w>>1), box1.y+(box1.h>>1));     // Move the pen.
                ctx.lineTo(box2.x+(box2.w>>1), box2.y+(box2.h>>1));     // Draw a line.
                ctx.stroke();
                
                // Fill in squares at either end of the link.
                ctx.fillStyle = COLOR_RED;
                ctx.fillRect(box1.x, box1.y, box1.w, box1.h);
                ctx.fillRect(box2.x, box2.y, box2.w, box2.h);
            }
        }
    }
}

//=====================================================================
// 
// Return the rectangle in Screen coordinates.

get_direction_square_rect(id, dir) {
    var box = new Rectangle(0, 0, 0, 0);

    for (var loc of locationArr) {

        for (var ds of loc.squ) {

            if (loc.id == id && ds.direction == dir) {
                
                var point = dply.world2screen(loc.rect.x + ds.offset.x, loc.rect.y + ds.offset.y);
                
                box.x = point.x;
                box.y = point.y;
                box.w = ds.offset.w;
                box.h = ds.offset.h;
            
                return box;
            }
        }
    }
    
    return box;
}

//=====================================================================
// 
//=====================================================================

}  // End of Class

