// File: google_drive.js


const COMPOSER_FOLDER = "Adventure Composer";

// List of ALL Scopes: https://developers.google.com/identity/protocols/oauth2/scopes

var CLIENT_ID = '625039578770-9gqlav5o8lbr9tp7pje0ssub319uvmr7.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAkEDnDMbcLG5MsO9k064-bV7k1FDPkECg';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive  https://www.googleapis.com/auth/userinfo.profile';
var signinButton = document.getElementById('gsiph');
var signoutButton = document.getElementById('gsoph');
let tokenClient;
let access_token;
let gapiInited = false;
let gisInited = false;
let signedin_flag = false;
let credentials_new_flag = false;
let credentials = new UserInfo();
let driveinfo_new_flag = false;


//==============================================================================

function UserInfo() {
    this.name = "";
    this.picture = "";
    this.email = "";
    this.is_drive_ready = false;
}

//==============================================================================
// Google sign initialize.

function gg_init() {
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
        prompt: '',
        callback: (tokenResponse) => {
            access_token = tokenResponse.access_token;
            console.log("gg_gis_loaded() access_token=" + access_token);
        },
    });
    //console.log("gg_gis_loaded() tokenClient=" + tokenClient.access_token);
    gisInited = true;
    gg_maybe_enable_buttons();
}


function gg_maybe_enable_buttons() {

    if (gapiInited && gisInited) {
        signinButton.style.display = 'block';
        signoutButton.style.display = 'none';
        
        // We are not signed in yet.
        signedin_flag = false;
    }
}

//==============================================================================
// Is user signed into Google ?

function gg_is_signedin() {
    return signedin_flag;
}

//==============================================================================
// Google Credentials.

function gg_is_credential_new() {
    var tmp = credentials_new_flag;
    credentials_new_flag = false;
    return tmp;
}

function gg_get_credentials() {
    return credentials;
}

function gg_is_driveinfo_new() {
    var tmp = driveinfo_new_flag;
    driveinfo_new_flag = false;

    return tmp;
}

//==============================================================================
// Authenticate (Sign-in).

signinButton.onclick = () => gg_handle_authenicate();

function gg_handle_authenicate() {
    console.log("gg_handle_authenicate()");

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
            console.log("ERROR: Authentication failed !");
            return;
        }
        // Show sign-out button.
        signinButton.style.display = 'none';
        signoutButton.style.display = 'block';
        signedin_flag = true;

        gg_check_currentuser();
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

        // Set flags and clear the credentials.
        signedin_flag = false;
        credentials_new_flag = true;
        credentials.name = "";
        credentials.picture = "";
        driveinfo_new_flag = true;
        credentials.is_drive_ready = false;
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
                
                driveinfo_new_flag = true;
                credentials.is_drive_ready = true;
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
    console.log("gg_create_folder()");

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

        driveinfo_new_flag = true;
        credentials.is_drive_ready = true;
    })
}

//==============================================================================
// Function to list files.

function gg_show_list() {
    console.log("gg_show_list()");

    // Clear File list.
    flist.length = 0;

    gapi.client.drive.files.list({
        // get parent folder id from localstorage
        'q': `parents in "${localStorage.getItem('parent_folder')}"`
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            console.log("File List:");
            
            for (var i = 0; i < files.length; i++) {
                console.log( files[i].id + "  " + files[i].name );

                var f = new XmlFile();
                f.fname = files[i].name;
                f.id = files[i].id;

                flist.push(f);
            }

            on_select_filelist();
        } else {
            console.log("No Files");
        }
    }) /* .catch(err => {
        console.error("CAUGHT ERROR: " + err);
    }) */
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
            console.log("Read File: " + xml_file.fname);
            console.log("Loaded: " + xml_file.txt );
            
            // Set current file details.
            current_file_id = xml_file.id;
            current_file_name = xml_file.fname;
            
            // Parse XML to Location Array.
            parse_xml_to_location_array(xml_file.txt);
            
            // Parse XML to Master Record.
            parse_xml_to_master_record(xml_file.txt);
            
            // Update the variable 'location_next_id'.
            update_location_next_id();
            
            // Redraw display.
            repaint();

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
// Check current user.

function gg_check_currentuser() {
    console.log("gg_check_currentuser()");

    gapi.client.load('oauth2', 'v2', function () {
        gapi.client.oauth2.userinfo.get().execute(function (resp) {
            // Shows user email
            console.log(resp.name);
            credentials.name = resp.name;
            credentials.picture = resp.picture;
            credentials_new_flag = true;
        })
    });
}

//==============================================================================
