
function loadxml() {
    // load xml file
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {    // IE 5/6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.overrideMimeType('text/xml');

    xhttp.open("GET", "../XML/DragonsApron.xml", false);
    xhttp.send();
    xhttp.onreadystatechange = function(){
        if (xhttp.status == "200")
            xmlDoc = xhttp.responseXML; 
    } 

    var uurloon = xmlDoc.getElementsByTagName("uurloon")[0].childNodes[0].textContent;
    var setloon = xmlDoc.getElementsByTagName("setloon")[0].childNodes[0].textContent;
    console.log(uurloon,setloon);
}

