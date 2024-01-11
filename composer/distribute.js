// File: distribute.js

//=====================================================================
//=====================================================================
// Snap coordinates mx,my to grid.
// Returns: Vector2 of nearst grid coordinates (Screen coord).

function snap_to_grid(mx, my) {
    var tmp = new Vector(mx, my);
    
    // Get screen offset coordinates.
    var offset = dply.get_screen_offset();
    
    // Find world coordinates.
    tmp.x += offset.x;
    tmp.y += offset.y;

    // Find remainder.
    var remx = tmp.x % GRID_THROW_X;
    var remy = tmp.y % GRID_THROW_Y;

    // Decide whether to round up or down.
    if (remx >= GRID_THROW_X>>1)
        tmp.x += (GRID_THROW_X - remx);  // Round Up X
    else
        tmp.x -= remx;                    // Round Down X
        
    if (remy >= GRID_THROW_Y>>1)
        tmp.y += (GRID_THROW_Y - remy);  // Round Up Y
    else
        tmp.y -= remy;                    // Round Down Y
    
    // Convert back to screen coordinates.
    tmp.x -= offset.x;
    tmp.y -= offset.y;
    
    return tmp;
}

//=====================================================================
// Evenly Distribute location boxes.

function on_evenly_distribute() {
    var SLICE_MULTI = 1.5;
    var xmin = Number.MAX_SAFE_INTEGER;
    var xmax = 0;
    var ymin = Number.MAX_SAFE_INTEGER;
    var ymax = 0;

    console.log("on_evenly_distribute()");

    //----------------------------------------------------------------------
    // Find the min/max rectangle for X.

    for (var loc of locationArr) {
        if (!loc.selected) continue;

        if (loc.rect.x < xmin) xmin = loc.rect.x;
        if (loc.rect.x > xmax) xmax = loc.rect.x;
        if (loc.rect.y < ymin) ymin = loc.rect.y;
        if (loc.rect.y > ymax) ymax = loc.rect.y;
        
        loc.tmp = -1;
    }

    console.log("xmin=" + xmin + " xmax=" + xmax);
    console.log("ymin=" + ymin + " ymax=" + ymax);

    // Split the min/max rectangle into horizontal slices (Distribute horizontally).
    var dx = Math.round(SLICE_MULTI*LOCATION_BOX_W);
    var sortme = [];
    var count = 0;
    for (let xx = xmin; xx < xmax; xx+=dx) {

        // Create a slice (rectangle).
        var slice = new Rectangle(xx, ymin, SLICE_MULTI*LOCATION_BOX_W, ymax-ymin);
        var slice_cnt = 0;
        
        for (var loc of locationArr) {
            if (!loc.selected) continue;
        
            if (is_point_in_rect(loc.rect.x, loc.rect.y, slice) == true) {
                
                // The location box falls into the slice so assign it a tmp index.
                loc.tmp = count;
                slice_cnt++;
            }
        }

        if (slice_cnt > 0)
            count++;        
    }

    // Adjust 'count'.
    count--;

    for (var loc of locationArr) {
        if (!loc.selected) continue;

        if (loc.tmp != -1)
            loc.rect.x = (((xmax - xmin) / count) * loc.tmp) + xmin;
    }


    //----------------------------------------------------------------------
    // Find the min/max rectangle for Y.

    xmin = Number.MAX_SAFE_INTEGER;
    xmax = 0;
    ymin = Number.MAX_SAFE_INTEGER;
    ymax = 0;

    for (var loc of locationArr) {
        if (!loc.selected) continue;

        if (loc.rect.x < xmin) xmin = loc.rect.x;
        if (loc.rect.x > xmax) xmax = loc.rect.x;
        if (loc.rect.y < ymin) ymin = loc.rect.y;
        if (loc.rect.y > ymax) ymax = loc.rect.y;

        loc.tmp = -1;
    }

    console.log("xmin=" + xmin + " xmax=" + xmax);
    console.log("ymin=" + ymin + " ymax=" + ymax);


    // Split the min/max rectangle into horizontal slices (Distribute horizontally).
    var dy = Math.round(SLICE_MULTI*LOCATION_BOX_H);
    var count = 0;
    for (let yy = ymin; yy < ymax; yy+=dy) {

        // Create a slice (rectangle).
        var slice = new Rectangle(xmin, yy, xmax-xmin, SLICE_MULTI*LOCATION_BOX_H);
        var slice_cnt = 0;
        
        for (var loc of locationArr) {
            if (!loc.selected) continue;

            if (is_point_in_rect(loc.rect.x, loc.rect.y, slice) == true) {
                
                // The location box falls into the slice so assign it a tmp index.
                loc.tmp = count;
                slice_cnt++;
            }
        }

        if (slice_cnt > 0)
            count++;
    }

    // Adjust 'count'.
    count--;

    for (var loc of locationArr) {
        if (!loc.selected) continue;

        if (loc.tmp != -1)
            loc.rect.y = (((ymax - ymin) / count) * loc.tmp) + ymin;
    }

}

//=====================================================================

