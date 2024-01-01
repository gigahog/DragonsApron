// File: google_drive.js


const COMPOSER_FOLDER = "Adventure Composer";

var CLIENT_ID = '625039578770-9gqlav5o8lbr9tp7pje0ssub319uvmr7.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAkEDnDMbcLG5MsO9k064-bV7k1FDPkECg';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';
var signinButton = document.getElementById('gsiph');
var signoutButton = document.getElementById('gsoph');
let tokenClient;
let gapiInited = false;
let gisInited = false;
let signedin = false;

//==============================================================================
// Google sign initialize.

function gg_init() {
    console.log("gg_init()");
    gg_gapi_loaded();
    gg_gis_loaded()
}


function gg_gapi_loaded() {
    gapi.load('client', gg_initialize_gapi_client);
}


async function gg_initialize_gapi_client() {
    console.log("gg_initialize_gapi_client()");
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    gg_maybe_enable_buttons();
}


function gg_gis_loaded() {

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: ''
    });
    console.log("gg_gis_loaded() tokenClient=" + tokenClient);
    gisInited = true;
    gg_maybe_enable_buttons();
}


function gg_maybe_enable_buttons() {
    console.log("gg_maybe_enable_buttons()");
    console.log(" gapiInited=" + gapiInited);
    console.log(" gisInited=" + gisInited);
    if (gapiInited && gisInited) {
        signinButton.style.display = 'block';
        signoutButton.style.display = 'none';
        
        // We are not signed in yet.
        signedin = false;
    }
}

//==============================================================================
// Is user signed into Google ?

function gg_is_signedin() {
    return signedin;
}

//==============================================================================
// Authenticate (Sign-in).

signinButton.onclick = () => gg_handle_authenicate();

function gg_handle_authenicate() {
    console.log("gg_handle_authenicate()");

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
            console.log("HERE01");
        }
        // Show sign-out button.
        signinButton.style.display = 'none';
        signoutButton.style.display = 'block';
        signedin = true;
        gg_check_folder(COMPOSER_FOLDER);
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

//==============================================================================
// Sign-out.

signoutButton.onclick = () => gg_handle_signout();

function gg_handle_signout() {
    console.log("gg_handle_signout()");
    const token = gapi.client.getToken();

    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        // Show sign-in button.
        signinButton.style.display = 'block';
        signoutButton.style.display = 'none';
        signedin = false;
    }
}

//==============================================================================
// Check for a Backup Folder in google drive.

function gg_check_folder(folder) {
    console.log("gg_check_folder(" + folder + ")");

    gapi.client.drive.files.list({
        'q': 'name = "' + folder + '"',
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                localStorage.setItem('parent_folder', file.id);
                console.log('Folder Available');
                // Get file list if folder available
                gg_show_list();
            }
        } else {
            // If folder is not available then create it.
            gg_create_folder(folder);
        }
    })
}

//==============================================================================
// Generate filename for Composer XML file.

function gg_gen_composer_fname() {
    const dn = new Date();
    var filename = "composer_" + dn.getFullYear() + "-" +
                            padIt(dn.getUTCMonth(), 2, '0') + "-" +
                            padIt(dn.getUTCDay(), 2, '0') + "-" +
                            padIt(dn.getUTCHours(), 2, '0') +
                            padIt(dn.getUTCMinutes(), 2, '0') +
                            padIt(dn.getUTCSeconds(), 2, '0') + ".xml";
    return filename;
}

//==============================================================================
// Create a function to upload file.

function gg_upload(txt) {

    if (txt != "") {
        const blob = new Blob([txt], { type: 'plain/text' });
        // get parent folder id from localstorage
        const parentFolder = localStorage.getItem('parent_folder');

        var filename = gg_gen_composer_fname();

        // set file metadata
        var metadata = {
            // get first two words from the input text and set as file name instead of backup-file
            name: filename,
            mimeType: 'plain/text',
            parents: [parentFolder]
        };
        var formData = new FormData();
        formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append("file", blob);

        fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
            method: 'POST',
            headers: new Headers({ "Authorization": "Bearer " + gapi.auth.getToken().access_token }),
            body: formData
        }).then(function (response) {
            //console.log("**response.id=" + response.json());
            return response.json();
        }).then(function (value) {
            console.log(value);
            
            // Return new files info (name, id).
            current_file_id = value.id;
            current_file_name = value.name;
            console.log("current_file_id: " + current_file_id);
            
            doing_work = false;
        });
    }
}

//==============================================================================

function gg_create_folder(folder) {
    console.log("gg_show_list()");

    var access_token = gapi.auth.getToken().access_token;
    var request = gapi.client.request({
        'path': 'drive/v2/files',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token,
        },
        'body': {
            'title': folder,
            'mimeType': 'application/vnd.google-apps.folder'
        }
    });
    request.execute(function (response) {
        console.log("parent_folder id=" + response.id);
        localStorage.setItem('parent_folder', response.id);
    })
}

//==============================================================================
// Function to list files.

function gg_show_list() {
    console.log("gg_show_list()");

    gapi.client.drive.files.list({
        // get parent folder id from localstorage
        'q': `parents in "${localStorage.getItem('parent_folder')}"`
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            console.log("File List:");
            for (var i = 0; i < files.length; i++) {
                console.log( files[i].id + "  " + files[i].name );
            }
        } else {
            console.log("No Files");
        }
    })
}

//==============================================================================
// Read or Download a file.
//  xml_file  - Indicates the ID of file to read/download.
//  condition - Either "read" or "download".

function gg_read_download(xml_file, condition) {

    gapi.client.drive.files.get({
        fileId: xml_file.id,
        alt: 'media'
    }).then(function (res) {
        
        if (condition == 'read') {
            xml_file.txt = res.body;
            console.log('Read File:' + xml_file.fname);

        } else if (condition == 'download') {
            var blob = new Blob([res.body], { type: 'plain/text' });
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = xml_file.fname;
            a.click();
        }
    })
}

//==============================================================================
// Create new/update function.

function gg_update_file(id, txt) {
    console.log('Updating File:' + id);
    
    var url = 'https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media';

    fetch(url, {
        method: 'PATCH',
        headers: new Headers({
            Authorization: 'Bearer ' + gapi.auth.getToken().access_token,
            'Content-type': 'plain/text'
        }),
        body: txt
    }).then(value => {
        console.log('File updated successfully');
        doing_work = false;
    }).catch(err => {
        console.error(err);
        doing_work = false;
    })
}

//==============================================================================
// Delete file.
//  id  - ID of file on Google Drive to delete. 

function gg_delete_file(id) {
    var request = gapi.client.drive.files.delete({
        'fileId': id
    });
    request.execute(function (res) {
        console.log('File Deleted');

        // After delete update the list.
        showList();
    })
}

//==============================================================================