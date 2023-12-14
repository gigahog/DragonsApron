
var response = "";

//=====================================================================

addEventListener("message", event => {

    console.log("Starting Worker Thread...");
    console.log("Worker: Received Msg: '" + event.data + "'");

    if (event.data == "message") {
        loadxml();
        
        console.log("Post Response Message from WorkerThread...");
        postMessage(response);
        
        console.log("Closing Worker Thread...");
        close();
    }
});

//=====================================================================
// Load XML file.

function loadxml() {

    xhttp = new XMLHttpRequest();

    xhttp.overrideMimeType('text/xml');
    xhttp.responseType = 'document';
    
    xhttp.onload = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("XML data received.");
            response = xhttp.response;
            //console.log(">>" + response + "<<");
        }
    };

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 1) {
            console.log('Request started.')
        }

        if (xhttp.readyState == 2) {
            console.log('Headers received.')
        }

        if (xhttp.readyState == 3) {
            console.log('Data loading..!')
        }
        
        if (xhttp.readyState == 4) {
            console.log('Request ended.')
        }
    };
    
    xhttp.onerror = () => {
        console.error('Request failed.')
    };
    
    xhttp.onprogress = event => {
        // event.loaded returns how many bytes are downloaded
        // event.total returns the total number of bytes
        // event.total is only available if server sends `Content-Length` header
        console.log(`Downloaded ${event.loaded} of ${event.total}`)
    };

    xhttp.open("GET", "../XML/DragonsApron.xml", false);
    xhttp.send();
}
