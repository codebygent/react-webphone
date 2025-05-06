//#region Global Settings
// ===============
const appversion = "0.3.29";
const sipjsversion = "0.20.0";
const navUserAgent = window.navigator.userAgent;  // TO DO change to Navigator.userAgentData
const instanceID = String(Date.now());
const localDB = window.localStorage;


let profileUserID = getDbItem("profileUserID", null);   // Internal reference ID. (DON'T CHANGE THIS!)
let profileName = getDbItem("profileName", null);       // eg: Keyla James
let wssServer = getDbItem("wssServer", null);           // eg: raspberrypi.local
let WebSocketPort = getDbItem("WebSocketPort", null);   // eg: 444 | 4443
let ServerPath = getDbItem("ServerPath", null);         // eg: /ws
let SipDomain = getDbItem("SipDomain", null);           // eg: raspberrypi.local
let SipUsername = getDbItem("SipUsername", null);       // eg: webrtc
let SipPassword = getDbItem("SipPassword", null);       // eg: webrtc

let SingleInstance = (getDbItem("SingleInstance", "1") == "1");      // Un-registers this account if the phone is opened in another tab/window

let TransportConnectionTimeout = parseInt(getDbItem("TransportConnectionTimeout", 15));          // The timeout in seconds for the initial connection to make on the web socket port
let TransportReconnectionAttempts = parseInt(getDbItem("TransportReconnectionAttempts", 999));   // The number of times to attempt to reconnect to a WebSocket when the connection drops.
let TransportReconnectionTimeout = parseInt(getDbItem("TransportReconnectionTimeout", 3));       // The time in seconds to wait between WebSocket reconnection attempts.

let VoiceMailSubscribe = (getDbItem("VoiceMailSubscribe", "1") == "1");                // Enable Subscribe to voicemail
let VoicemailDid = getDbItem("VoicemailDid", "");                                      // Number to dial for VoicemialMain()
let SubscribeVoicemailExpires = parseInt(getDbItem("SubscribeVoicemailExpires", 300)); // Voceimail Subscription expiry time (in seconds)
let ContactUserName = getDbItem("ContactUserName", "");                                // Optional name for contact header uri
let hostingPrefix = getDbItem("hostingPrefix", "");                                // Optional name for contact header uri
let userAgentStr = getDbItem("UserAgentStr", "Browser Phone " + appversion + " (SIPJS - " + sipjsversion + ") " + navUserAgent);   // Set this to whatever you want.
let RegisterExpires = parseInt(getDbItem("RegisterExpires", 300));                     // Registration expiry time (in seconds)
let RegisterExtraHeaders = getDbItem("RegisterExtraHeaders", "{}");                    // Parsable Json string of headers to include in register process. eg: '{"foo":"bar"}'
let RegisterExtraContactParams = getDbItem("RegisterExtraContactParams", "{}");        // Parsable Json string of extra parameters add to the end (after >) of contact header during register. eg: '{"foo":"bar"}'
let RegisterContactParams = getDbItem("RegisterContactParams", "{}");                  // Parsable Json string of extra parameters added to contact URI during register. eg: '{"foo":"bar"}'
let WssInTransport = (getDbItem("WssInTransport", "1") == "1");                        // Set the transport parameter to wss when used in SIP URIs. (Required for ujApp as it doesn't support Path)
let IpInContact = (getDbItem("IpInContact", "1") == "1");                              // Set a random IP address as the host value in the Contact header field and Via sent-by parameter. (Suggested for ujApp)
let BundlePolicy = getDbItem("BundlePolicy", "balanced");                              // SDP Media Bundle: max-bundle | max-compat | balanced https://webrtcstandards.info/sdp-bundle/
let IceStunServerJson = getDbItem("IceStunServerJson", "");                            // Sets the JSON string for ice Server. Default: [{ "urls": "stun:stun.l.google.com:19302" }] Must be https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration/iceServers
let IceStunCheckTimeout = parseInt(getDbItem("IceStunCheckTimeout", 500));             // Set amount of time in milliseconds to wait for the ICE/STUN server
let InviteExtraHeaders = getDbItem("InviteExtraHeaders", "{}");                       // Extra SIP headers to be included in the initial INVITE message for each call. (Added to the extra headers in the DialByLine() parameters. e.g {"foo":"bar"})

let NoAnswerTimeout = parseInt(getDbItem("NoAnswerTimeout", 120));          // Time in seconds before automatic Busy Here sent
let AutoAnswerEnabled = (getDbItem("AutoAnswerEnabled", "0") == "1");       // Automatically answers the phone when the call comes in, if you are not on a call already
let DoNotDisturbEnabled = (getDbItem("DoNotDisturbEnabled", "0") == "1");   // Rejects any inbound call, while allowing outbound calls
let CallWaitingEnabled = (getDbItem("CallWaitingEnabled", "1") == "1");     // Rejects any inbound call if you are on a call already.
let RecordAllCalls = (getDbItem("RecordAllCalls", "0") == "1");             // Starts Call Recording when a call is established.
let SelectRingingLine = (getDbItem("SelectRingingLine", "1") == "1");       // Selects the ringing line if you are not on another call ()

let AutoGainControl = (getDbItem("AutoGainControl", "1") == "1");        // Attempts to adjust the microphone volume to a good audio level. (OS may be better at this)
let EchoCancellation = (getDbItem("EchoCancellation", "1") == "1");      // Attempts to remove echo over the line.
let NoiseSuppression = (getDbItem("NoiseSuppression", "1") == "1");      // Attempts to clear the call quality of noise.
let maxFrameRate = getDbItem("FrameRate", "");                           // Suggests a frame rate to your webcam if possible.
let NotificationsActive = (getDbItem("Notifications", "0") == "1");

let MaxDataStoreDays = parseInt(getDbItem("MaxDataStoreDays", 0));          // Defines the maximum amount of days worth of data (calls, recordings, messages, etc) to store locally. 0=Stores all data always. >0 Trims n days back worth of data at various events where. 

let DidLength = parseInt(getDbItem("DidLength", 6));                 // DID length from which to decide if an incoming caller is a "contact" or an "extension".
let MaxDidLength = parseInt(getDbItem("MaxDidLength", 16));          // Maximum length of any DID number including international dialled numbers.
let DisplayDateFormat = getDbItem("DateFormat", "YYYY-MM-DD");       // The display format for all dates. https://momentjs.com/docs/#/displaying/
let DisplayTimeFormat = getDbItem("TimeFormat", "h:mm:ss A");        // The display format for all times. https://momentjs.com/docs/#/displaying/
let Language = getDbItem("Language", "auto");                        // Overrides the language selector or "automatic". Must be one of availableLang[]. If not defaults to en.

// Permission Settings
let EnableTextMessaging = (getDbItem("EnableTextMessaging", "1") == "1");               // Enables the Text Messaging
let EnableTransfer = (getDbItem("EnableTransfer", "1") == "1");                         // Controls Transferring during a call
let EnableujCollab = (getDbItem("EnableujCollab", "1") == "1");                     // Controls ujCollab during a call
let AutoAnswerPolicy = getDbItem("AutoAnswerPolicy", "allow");                          // allow = user can choose | disabled = feature is disabled | enabled = feature is always on
let DoNotDisturbPolicy = getDbItem("DoNotDisturbPolicy", "allow");                      // allow = user can choose | disabled = feature is disabled | enabled = feature is always on
let CallWaitingPolicy = getDbItem("CallWaitingPolicy", "allow");                        // allow = user can choose | disabled = feature is disabled | enabled = feature is always on
let CallRecordingPolicy = getDbItem("CallRecordingPolicy", "allow");                    // allow = user can choose | disabled = feature is disabled | enabled = feature is always on
let IntercomPolicy = getDbItem("IntercomPolicy", "enabled");                            // disabled = feature is disabled | enabled = feature is always on
let EnableAccountSettings = (getDbItem("EnableAccountSettings", "1") == "1");           // Controls the Account tab in Settings
let EnableAppearanceSettings = (getDbItem("EnableAppearanceSettings", "1") == "1");     // Controls the Appearance tab in Settings
let EnableNotificationSettings = (getDbItem("EnableNotificationSettings", "1") == "1"); // Controls the Notifications tab in Settings
let EnableAlphanumericDial = (getDbItem("EnableAlphanumericDial", "0") == "1");         // Allows calling /[^\da-zA-Z\*\#\+\-\_\.\!\~\'\(\)]/g default is /[^\d\*\#\+]/g 
let EnableTextExpressions = (getDbItem("EnableTextExpressions", "1") == "1");           // Enables Expressions (Emoji) glyphs when texting
let EnableTextDictate = (getDbItem("EnableTextDictate", "1") == "1");                   // Enables Dictate (speech-to-text) when texting
let EnableRingtone = (getDbItem("EnableRingtone", "1") == "1");                         // Enables a ring tone when an inbound call comes in.  (media/Ringtone_1.mp3)

let ChatEngine = getDbItem("ChatEngine", "SIMPLE");    // Select the chat engine XMPP | SIMPLE


// System variables
// ================
let userAgent = null;
let CanvasCollection = [];
let _selectedLine = null;
let windowObj = null;
let alertObj = null;
let confirmObj = null;
let promptObj = null;
let menuObj = null;
let HasVideoDevice = false;
let HasAudioDevice = false;
let HasSpeakerDevice = false;
let AudioinputDevices = [];
let VideoinputDevices = [];
let SpeakerDevices = [];
let Lines = [];
let audioBlobs = {}
let _newLineNumber = 0;
let _lineObj = null;
let telNumericRegEx = /[^\d\*\#\+]/g
let telAlphanumericRegEx = /[^\da-zA-Z\*\#\+\-\_\.\!\~\'\(\)]/g

let settingsMicrophoneStream = null;
let settingsMicrophoneStreamTrack = null;

let CallRecordingsIndexDb = null;
//#endregion

//#region Utilities
// =========
function uID() {
    return Date.now() + Math.floor(Math.random() * 10000).toString(16).toUpperCase();
}
function utcDateNow() {
    return moment().utc().format("YYYY-MM-DD HH:mm:ss UTC");
}
function getDbItem(itemIndex, defaultValue) {
    if (localDB.getItem(itemIndex) != null) return localDB.getItem(itemIndex);
    return defaultValue;
}
function getAudioSrcID() {
    var id = localDB.getItem("AudioSrcId");
    return (id != null) ? id : "default";
}
function getAudioOutputID() {
    var id = localDB.getItem("AudioOutputId");
    return (id != null) ? id : "default";
}
function getRingerOutputID() {
    var id = localDB.getItem("RingOutputId");
    return (id != null) ? id : "default";
}
function formatDuration(seconds) {
    var sec = Math.floor(parseFloat(seconds));
    if (sec < 0) {
        return sec;
    }
    else if (sec >= 0 && sec < 60) {
        return sec + " " + ((sec > 1) ? lang.seconds_plural : lang.second_single);
    }
    else if (sec >= 60 && sec < 60 * 60) { // greater then a minute and less then an hour
        var duration = moment.duration(sec, 'seconds');
        return duration.minutes() + " " + ((duration.minutes() > 1) ? lang.minutes_plural : lang.minute_single) + " " + duration.seconds() + " " + ((duration.seconds() > 1) ? lang.seconds_plural : lang.second_single);
    }
    else if (sec >= 60 * 60 && sec < 24 * 60 * 60) { // greater than an hour and less then a day
        var duration = moment.duration(sec, 'seconds');
        return duration.hours() + " " + ((duration.hours() > 1) ? lang.hours_plural : lang.hour_single) + " " + duration.minutes() + " " + ((duration.minutes() > 1) ? lang.minutes_plural : lang.minute_single) + " " + duration.seconds() + " " + ((duration.seconds() > 1) ? lang.seconds_plural : lang.second_single);
    }
    //  Otherwise.. this is just too long
}
function formatShortDuration(seconds) {
    var sec = Math.floor(parseFloat(seconds));
    if (sec < 0) {
        return sec;
    }
    else if (sec >= 0 && sec < 60) {
        return "00:" + ((sec > 9) ? sec : "0" + sec);
    }
    else if (sec >= 60 && sec < 60 * 60) { // greater then a minute and less then an hour
        var duration = moment.duration(sec, 'seconds');
        return ((duration.minutes() > 9) ? duration.minutes() : "0" + duration.minutes()) + ":" + ((duration.seconds() > 9) ? duration.seconds() : "0" + duration.seconds());
    }
    else if (sec >= 60 * 60 && sec < 24 * 60 * 60) { // greater than an hour and less then a day
        var duration = moment.duration(sec, 'seconds');
        return ((duration.hours() > 9) ? duration.hours() : "0" + duration.hours()) + ":" + ((duration.minutes() > 9) ? duration.minutes() : "0" + duration.minutes()) + ":" + ((duration.seconds() > 9) ? duration.seconds() : "0" + duration.seconds());
    }
    //  Otherwise.. this is just too long
}
function formatBytes(bytes, decimals) {
    if (bytes === 0) return "0 " + lang.bytes;
    var k = 1024;
    var dm = (decimals && decimals >= 0) ? decimals : 2;
    var sizes = [lang.bytes, lang.kb, lang.mb, lang.gb, lang.tb, lang.pb, lang.eb, lang.zb, lang.yb];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
function getFilter(filter, keyword) {
    if (filter.indexOf(",", filter.indexOf(keyword + ": ") + keyword.length + 2) != -1) {
        return filter.substring(filter.indexOf(keyword + ": ") + keyword.length + 2, filter.indexOf(",", filter.indexOf(keyword + ": ") + keyword.length + 2));
    }
    else {
        return filter.substring(filter.indexOf(keyword + ": ") + keyword.length + 2);
    }
}
function base64toBlob(base64Data, contentType) {
    if (base64Data.indexOf("," != -1)) base64Data = base64Data.split(",")[1]; // [data:image/png;base64] , [xxx...]
    var byteCharacters = atob(base64Data);
    var slicesCount = Math.ceil(byteCharacters.length / 1024);
    var byteArrays = new Array(slicesCount);
    for (var s = 0; s < slicesCount; ++s) {
        var begin = s * 1024;
        var end = Math.min(begin + 1024, byteCharacters.length);
        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[s] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
function MakeDataArray(defaultValue, count) {
    var rtnArray = new Array(count);
    for (var i = 0; i < rtnArray.length; i++) {
        rtnArray[i] = defaultValue;
    }
    return rtnArray;
}
//#endregion

//#region Window and Document Events
// ==========================
$(window).on("beforeunload", function (event) {
    var CurrentCalls = countSessions("0");
    if (CurrentCalls > 0) {
        console.warn("Warning, you have current calls open");
        event.preventDefault();
        return (event.returnValue = "You have ongoing calls. Are you sure you want to leave?");
    }
    Unregister(true);
});

$(window).on("unload", function () {
    if (countSessions("0") > 0) {
        endSession();
    }
});

$(window).on("offline", function () {
    console.warn('Offline!');

    $("#regStatus").html(lang.disconnected_from_web_socket);
    $("#WebRtcFailed").show();

    // If there is an issue with the WS connection
    // We unregister, so that we register again once its up
    console.log("Disconnect Transport...");
    try {
        // userAgent.registerer.unregister();
        userAgent.transport.disconnect();
    } catch (e) {
        // I know!!!
    }
});
$(window).on("online", function () {
    console.log('Online!');
    ReconnectTransport();
});
$(window).on("keypress", function (event) {
    // TO DO Add Shortcuts

    // console.log(event);
    if (event.ctrlKey) {
        // You have the Ctrl Key pressed, this could be a Call Function
        // Blind Transfer the current Call
        if (event.key == "b") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: Start Blind Transfer");
        }
        // Attended Transfer the current Call
        if (event.key == "a") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: Start Attended Transfer");
        }
        // Hold (Toggle)
        if (event.key == "h") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: Hold Toggle");
        }
        // Mute (Toggle)
        if (event.key == "m") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: Mute Toggle");
        }
        // End current call
        if (event.key == "e") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: End current call");
        }
        // Recording (Start/Stop)
        if (event.key == "r") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: Recording Toggle");
        }
        // Select line 1-9
        if (event.key == "1" || event.key == "2" | event.key == "3" || event.key == "4" || event.key == "5" || event.key == "6" || event.key == "7" || event.key == "8" || event.key == "9") {
            event.preventDefault();
            console.log("Keyboard Shortcut for: Select Line", event.key);
        }
    }
});
$(document).ready(function () {

    // We will use the IndexDB, so connect to it now, and perform any upgrade options
    PrepareIndexDB();

    // Load phoneOptions
    // =================
    // Note: These options can be defined in the containing HTML page, and simply defined as a global variable
    // var phoneOptions = {} // would work in index.html
    // Even if the setting is defined on the database, these variables get loaded after.

    var options = (typeof phoneOptions !== 'undefined') ? phoneOptions : {};
    if (options.profileName !== undefined) profileName = options.profileName;
    if (options.wssServer !== undefined) wssServer = options.wssServer;
    if (options.WebSocketPort !== undefined) WebSocketPort = options.WebSocketPort;
    if (options.ServerPath !== undefined) ServerPath = options.ServerPath;
    if (options.SipDomain !== undefined) SipDomain = options.SipDomain;
    if (options.SipUsername !== undefined) SipUsername = options.SipUsername;
    if (options.SipPassword !== undefined) SipPassword = options.SipPassword;
    if (options.SingleInstance !== undefined) SingleInstance = options.SingleInstance;
    if (options.TransportConnectionTimeout !== undefined) TransportConnectionTimeout = options.TransportConnectionTimeout;
    if (options.TransportReconnectionAttempts !== undefined) TransportReconnectionAttempts = options.TransportReconnectionAttempts;
    if (options.TransportReconnectionTimeout !== undefined) TransportReconnectionTimeout = options.TransportReconnectionTimeout;
    if (options.VoiceMailSubscribe !== undefined) VoiceMailSubscribe = options.VoiceMailSubscribe;
    if (options.VoicemailDid !== undefined) VoicemailDid = options.VoicemailDid;
    if (options.SubscribeVoicemailExpires !== undefined) SubscribeVoicemailExpires = options.SubscribeVoicemailExpires;
    if (options.ContactUserName !== undefined) ContactUserName = options.ContactUserName;
    if (options.userAgentStr !== undefined) userAgentStr = options.userAgentStr;
    if (options.hostingPrefix !== undefined) hostingPrefix = options.hostingPrefix;
    if (options.RegisterExpires !== undefined) RegisterExpires = options.RegisterExpires;
    if (options.RegisterExtraHeaders !== undefined) RegisterExtraHeaders = options.RegisterExtraHeaders;
    if (options.RegisterExtraContactParams !== undefined) RegisterExtraContactParams = options.RegisterExtraContactParams;
    if (options.RegisterContactParams !== undefined) RegisterContactParams = options.RegisterContactParams;
    if (options.WssInTransport !== undefined) WssInTransport = options.WssInTransport;
    if (options.IpInContact !== undefined) IpInContact = options.IpInContact;
    if (options.BundlePolicy !== undefined) BundlePolicy = options.BundlePolicy;
    if (options.IceStunServerJson !== undefined) IceStunServerJson = options.IceStunServerJson;
    if (options.IceStunCheckTimeout !== undefined) IceStunCheckTimeout = options.IceStunCheckTimeout;
    if (options.ProfileDisplayPrefix !== undefined) ProfileDisplayPrefix = options.ProfileDisplayPrefix;
    if (options.ProfileDisplayPrefixSeparator !== undefined) ProfileDisplayPrefixSeparator = options.ProfileDisplayPrefixSeparator;
    if (options.InviteExtraHeaders !== undefined) InviteExtraHeaders = options.InviteExtraHeaders;
    if (options.NoAnswerTimeout !== undefined) NoAnswerTimeout = options.NoAnswerTimeout;
    if (options.AutoAnswerEnabled !== undefined) AutoAnswerEnabled = options.AutoAnswerEnabled;
    if (options.DoNotDisturbEnabled !== undefined) DoNotDisturbEnabled = options.DoNotDisturbEnabled;
    if (options.CallWaitingEnabled !== undefined) CallWaitingEnabled = options.CallWaitingEnabled;
    if (options.RecordAllCalls !== undefined) RecordAllCalls = options.RecordAllCalls;
    if (options.SelectRingingLine !== undefined) SelectRingingLine = options.SelectRingingLine;
    
    if (options.AutoGainControl !== undefined) AutoGainControl = options.AutoGainControl;
    if (options.EchoCancellation !== undefined) EchoCancellation = options.EchoCancellation;
    if (options.NoiseSuppression !== undefined) NoiseSuppression = options.NoiseSuppression;
    if (options.maxFrameRate !== undefined) maxFrameRate = options.maxFrameRate;
    if (options.NotificationsActive !== undefined) NotificationsActive = options.NotificationsActive;
    if (options.StreamBuffer !== undefined) StreamBuffer = options.StreamBuffer;
    if (options.PosterJpegQuality !== undefined) PosterJpegQuality = options.PosterJpegQuality;
    if (options.RecordingLayout !== undefined) RecordingLayout = options.RecordingLayout;
    if (options.DidLength !== undefined) DidLength = options.DidLength;
    if (options.MaxDidLength !== undefined) MaxDidLength = options.MaxDidLength;
    if (options.DisplayDateFormat !== undefined) DisplayDateFormat = options.DisplayDateFormat;
    if (options.DisplayTimeFormat !== undefined) DisplayTimeFormat = options.DisplayTimeFormat;
    if (options.Language !== undefined) Language = options.Language;
    if (options.SortByTypeOrder !== undefined) SortByTypeOrder = options.SortByTypeOrder;
    if (options.EnableTextMessaging !== undefined) EnableTextMessaging = options.EnableTextMessaging;
    if (options.DisableFreeDial !== undefined) DisableFreeDial = options.DisableFreeDial;
    if (options.EnableTransfer !== undefined) EnableTransfer = options.EnableTransfer;
    if (options.EnableujCollab !== undefined) EnableujCollab = options.EnableujCollab;
    if (options.AutoAnswerPolicy !== undefined) AutoAnswerPolicy = options.AutoAnswerPolicy;
    if (options.DoNotDisturbPolicy !== undefined) DoNotDisturbPolicy = options.DoNotDisturbPolicy;
    if (options.CallWaitingPolicy !== undefined) CallWaitingPolicy = options.CallWaitingPolicy;
    if (options.CallRecordingPolicy !== undefined) CallRecordingPolicy = options.CallRecordingPolicy;
    if (options.IntercomPolicy !== undefined) IntercomPolicy = options.IntercomPolicy;
    if (options.EnableAccountSettings !== undefined) EnableAccountSettings = options.EnableAccountSettings;
    if (options.EnableAppearanceSettings !== undefined) EnableAppearanceSettings = options.EnableAppearanceSettings;
    if (options.EnableNotificationSettings !== undefined) EnableNotificationSettings = options.EnableNotificationSettings;
    if (options.EnableAlphanumericDial !== undefined) EnableAlphanumericDial = options.EnableAlphanumericDial;
    if (options.EnableTextExpressions !== undefined) EnableTextExpressions = options.EnableTextExpressions;
    if (options.EnableTextDictate !== undefined) EnableTextDictate = options.EnableTextDictate;
    if (options.EnableRingtone !== undefined) EnableRingtone = options.EnableRingtone;
    if (options.ChatEngine !== undefined) ChatEngine = options.ChatEngine;

    // Single Instance Check 
    if (SingleInstance == true) {
        console.log("Instance ID :", instanceID);
        // First we set (or try to set) the instance ID
        localDB.setItem("InstanceId", instanceID);

        // Now we attach a listener
        window.addEventListener('storage', onLocalStorageEvent, false);
    }

});

function onLocalStorageEvent(event) {
    if (event.key == "InstanceId") {
        // Another script is writing to the local storage,
        // because the event lister is attached after the 
        // Instance ID, its from another window/tab/script.

        // Because you cannot change focus to another tab (even
        // from a tab with the same domain), and because you cannot
        // close a tab, the best we can do is de-register this
        // UserAgent, so that we are only registered here.

        Unregister();
        // TOO: what if you re-register?
        // Should this unload the entire page, what about calls? 
    }
}
function PrepareIndexDB() {
    // Call Recordings
    // ===============
    const CallRecordingsOpenRequest = window.indexedDB.open("CallRecordings", 1);
    // If this is the first visit to this page, this would have now made an empty IndexDB
    CallRecordingsOpenRequest.onerror = function (event) {
        console.error("CallRecordings DBOpenRequest Error:", event);
    }
    CallRecordingsOpenRequest.onupgradeneeded = function (event) {
        console.warn("Upgrade Required for CallRecordings IndexDB... probably because of first time use.");
        CallRecordingsIndexDb = event.target.result;
        // Now the CallRecordingsIndexDb is activated, but its still empty

        if (CallRecordingsIndexDb.objectStoreNames.contains("Recordings") == false) {
            // Create Object Store (Note: This can only be done here .onupgradeneeded)
            var objectStore = CallRecordingsIndexDb.createObjectStore("Recordings", { keyPath: "uID" });
            objectStore.createIndex("sessionid", "sessionid", { unique: false });
            objectStore.createIndex("bytes", "bytes", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("mediaBlob", "mediaBlob", { unique: false });
            console.log("IndexDB created ObjectStore Recordings");
        }
        else {
            console.warn("IndexDB requested upgrade, but object store was in place");
        }
        // Will fire .onsuccess now
    }
    CallRecordingsOpenRequest.onsuccess = function (event) {
        CallRecordingsIndexDb = event.target.result;

        CallRecordingsIndexDb.onerror = function (event) {
            console.error("IndexDB Error:", event);
        }

        // Double check structure
        if (CallRecordingsIndexDb.objectStoreNames.contains("Recordings") == false) {
            console.warn("IndexDB is open but Recordings does not exist.");
            // Close the connection to the database
            CallRecordingsIndexDb.close();
            console.log("IndexDB is closed.");
            // Drop the Database
            const DBDeleteRequest = window.indexedDB.deleteDatabase("CallRecordings");
            DBDeleteRequest.onerror = function (event) {
                console.error("Error deleting database CallRecordings");
            }
            DBDeleteRequest.onsuccess = function (event) {
                console.log("Database deleted successfully");

                // Call the PrepareIndexDB() function again, this time it should make the DB correctly.
                window.setTimeout(function () {
                    // This could create a loop if the database keeps failing to create correctly.
                    PrepareIndexDB();
                }, 500);
            }
            return;
        }
        console.log("IndexDB connected to CallRecordings");
    }
}
//#endregion


// #region Init UI
// =======

function InitUi() {
    PreloadAudioFiles()
    CreateUserAgent();
    RegisterEvents();
}

function PreloadAudioFiles() {
    audioBlobs.Alert = { file: "Alert.mp3", url: hostingPrefix + "media/Alert.mp3" }
    audioBlobs.Ringtone = { file: "Ringtone_1.mp3", url: hostingPrefix + "media/Ringtone_1.mp3" }
    audioBlobs.CallWaiting = { file: "Tone_CallWaiting.mp3", url: hostingPrefix + "media/Tone_CallWaiting.mp3" }
    audioBlobs.EarlyMedia_US = { file: "Tone_EarlyMedia-US.mp3", url: hostingPrefix + "media/Tone_EarlyMedia-US.mp3" }

    $.each(audioBlobs, function (i, item) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", item.url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var reader = new FileReader();
            reader.readAsDataURL(oReq.response);
            reader.onload = function () {
                item.blob = reader.result;
            }
        }
        oReq.send();
    });
}

//#endregion

//#region Create User Agent
// =================
function CreateUserAgent() {
    console.log("Creating User Agent...");
    if (SipDomain == null || SipDomain == "" || SipDomain == "null" || SipDomain == "undefined") SipDomain = wssServer; // Sets globally
    var options = {
        logConfiguration: false,            // If true, constructor logs the registerer configuration.
        uri: SIP.UserAgent.makeURI("sip:" + SipUsername + "@" + SipDomain),
        transportOptions: {
            server: wssServer,
            // server: "wss://" + wssServer + ":" + WebSocketPort + "" + ServerPath,
            traceSip: false,
            connectionTimeout: TransportConnectionTimeout
            // keepAliveInterval: 30 // Uncomment this and make this any number greater then 0 for keep alive... 
            // NB, adding a keep alive will NOT fix bad internet, if your connection cannot stay open (permanent WebSocket Connection) you probably 
            // have a router or ISP issue, and if your internet is so poor that you need to some how keep it alive with empty packets
            // upgrade you internet connection. This is voip we are talking about here.
        },
        sessionDescriptionHandlerFactoryOptions: {
            peerConnectionConfiguration: {
                bundlePolicy: BundlePolicy,
                // certificates: undefined,
                // iceCandidatePoolSize: 10,
                // iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                // iceTransportPolicy: "all",
                // peerIdentity: undefined,
                // rtcpMuxPolicy: "require",
            },
            iceGatheringTimeout: IceStunCheckTimeout
        },
        contactName: ContactUserName,
        displayName: profileName,
        authorizationUsername: SipUsername,
        authorizationPassword: SipPassword,
        hackIpInContact: IpInContact,           // ujApp should also be set to rewrite contact
        userAgentString: userAgentStr,
        autoStart: false,
        autoStop: true,
        register: false,
        noAnswerTimeout: NoAnswerTimeout,
        // sipExtension100rel: // UNSUPPORTED | SUPPORTED | REQUIRED NOTE: rel100 is not supported
        contactParams: {},
        delegate: {
            onInvite: function (sip) {
                ReceiveCall(sip);
            },
            onMessage: function (sip) {
                ReceiveOutOfDialogMessage(sip);
            }
        }
    }
    if (IceStunServerJson != "") {
        options.sessionDescriptionHandlerFactoryOptions.peerConnectionConfiguration.iceServers = JSON.parse(IceStunServerJson);
    }

    // Added to the contact BEFORE the '>' (permanent)
    if (RegisterContactParams && RegisterContactParams != "" && RegisterContactParams != "{}") {
        try {
            options.contactParams = JSON.parse(RegisterContactParams);
        } catch (e) { }
    }
    if (WssInTransport) {
        try {
            options.contactParams.transport = "wss";
        } catch (e) { }
    }
    userAgent = new SIP.UserAgent(options);
    userAgent.isRegistered = function () {
        return (userAgent && userAgent.registerer && userAgent.registerer.state == SIP.RegistererState.Registered);
    }
    // For some reason this is marked as private... not sure why
    userAgent.sessions = userAgent._sessions;
    userAgent.registrationCompleted = false;
    userAgent.registering = false;
    userAgent.transport.ReconnectionAttempts = TransportReconnectionAttempts;
    userAgent.transport.attemptingReconnection = false;
    userAgent.BlfSubs = [];
    userAgent.lastVoicemailCount = 0;

    console.log("Creating User Agent... Done");
    // Custom Web hook
    if (typeof web_hook_on_userAgent_created !== 'undefined') web_hook_on_userAgent_created(userAgent);

    userAgent.transport.onConnect = function () {
        onTransportConnected();
    }
    userAgent.transport.onDisconnect = function (error) {
        if (error) {
            onTransportConnectError(error);
        }
        else {
            onTransportDisconnected();
        }
    }

    var RegistererOptions = {
        logConfiguration: false,            // If true, constructor logs the registerer configuration.
        expires: RegisterExpires,
        extraHeaders: [],
        extraContactHeaderParams: [],
        refreshFrequency: 75              // Determines when a re-REGISTER request is sent. The value should be specified as a percentage of the expiration time (between 50 and 99).
    }

    // Added to the SIP Headers
    if (RegisterExtraHeaders && RegisterExtraHeaders != "" && RegisterExtraHeaders != "{}") {
        try {
            var registerExtraHeaders = JSON.parse(RegisterExtraHeaders);
            for (const [key, value] of Object.entries(registerExtraHeaders)) {
                if (value != "") {
                    RegistererOptions.extraHeaders.push(key + ": " + value);
                }
            }
        } catch (e) { }
    }

    // Added to the contact AFTER the '>' (not permanent)
    if (RegisterExtraContactParams && RegisterExtraContactParams != "" && RegisterExtraContactParams != "{}") {
        try {
            var registerExtraContactParams = JSON.parse(RegisterExtraContactParams);
            for (const [key, value] of Object.entries(registerExtraContactParams)) {
                if (value == "") {
                    RegistererOptions.extraContactHeaderParams.push(key);
                } else {
                    RegistererOptions.extraContactHeaderParams.push(key + "=" + value);
                }
            }
        } catch (e) { }
    }

    userAgent.registerer = new SIP.Registerer(userAgent, RegistererOptions);
    console.log("Creating Registerer... Done");

    userAgent.registerer.stateChange.addListener(function (newState) {
        console.log("User Agent Registration State:", newState);
        switch (newState) {
            case SIP.RegistererState.Initial:
                // Nothing to do
                break;
            case SIP.RegistererState.Registered:
                onRegistered();
                break;
            case SIP.RegistererState.Unregistered:
                onUnregistered();
                break;
            case SIP.RegistererState.Terminated:
                // Nothing to do
                break;
        }
    });

    console.log("User Agent Connecting to WebSocket...");
    userAgent.start().catch(function (error) {
        onTransportConnectError(error);
    });

}
//#endregion

//#region Transport Events
// ================
function onTransportConnected() {
    console.log("Connected to Web Socket!");
    userAgent.isReRegister = false;
    userAgent.transport.attemptingReconnection = false;
    userAgent.transport.ReconnectionAttempts = TransportReconnectionAttempts;
    if (userAgent.transport.attemptingReconnection == false && userAgent.registering == false) {
        window.setTimeout(function () {
            Register();
        }, 500);
    } else {
        console.warn("onTransportConnected: Register() called, but attemptingReconnection is true or registering is true")
    }
}
function onTransportConnectError(error) {
    console.warn("WebSocket Connection Failed:", error);

    // We set this flag here so that the re-register attempts are fully completed.
    userAgent.isReRegister = false;

    // If there is an issue with the WS connection
    // We unregister, so that we register again once its up
    console.log("Unregister...");
    try {
        userAgent.registerer.unregister();
    } catch (e) {
        // I know!!!
    }

    ReconnectTransport();

    // Custom Web hook
    if (typeof web_hook_on_transportError !== 'undefined') web_hook_on_transportError(userAgent.transport, userAgent);
}
function onTransportDisconnected() {
    console.log("Disconnected from Web Socket!");
    userAgent.isReRegister = false;
}
function ReconnectTransport() {
    if (userAgent == null) return;

    userAgent.registering = false; // if the transport was down, you will not be registered
    if (userAgent.transport && userAgent.transport.isConnected()) {
        // Asked to re-connect, but ws is connected
        onTransportConnected();
        return;
    }
    console.log("Reconnect Transport...");

    window.setTimeout(function () {
        console.log("ReConnecting to WebSocket...");

        if (userAgent.transport && userAgent.transport.isConnected()) {
            // Already Connected
            onTransportConnected();
            return;
        } else {
            userAgent.transport.attemptingReconnection = true
            userAgent.reconnect().catch(function (error) {
                userAgent.transport.attemptingReconnection = false
                console.warn("Failed to reconnect", error);
                ReconnectTransport();
            });
        }
    }, TransportReconnectionTimeout * 1000);

    $("#regStatus").show().html(lang.connecting_to_web_socket);
    console.log("Waiting to Re-connect...", TransportReconnectionTimeout, "Attempt remaining", userAgent.transport.ReconnectionAttempts);
    userAgent.transport.ReconnectionAttempts = userAgent.transport.ReconnectionAttempts - 1;
}
//#endregion

//#region Registration
// ============
function Register() {
    if (userAgent == null) return;
    if (userAgent.registering == true) return;
    if (userAgent.isRegistered()) return;

    var RegistererRegisterOptions = {
        requestDelegate: {
            onReject: function (sip) {
                onRegisterFailed(sip.message.reasonPhrase, sip.message.statusCode);
            }
        }
    }

    console.log("Sending Registration...");
    $("#regStatus").html(lang.sending_registration);
    userAgent.registering = true
    userAgent.registerer.register(RegistererRegisterOptions);
}
function Unregister(skipUnsubscribe) {
    if (userAgent == null || !userAgent.isRegistered()) return;

    if (skipUnsubscribe == true) {
        console.log("Skipping Unsubscribe");
    } else {
        console.log("Unsubscribing...");
        $("#regStatus").html(lang.unsubscribing);
        try {
            UnsubscribeAll();
        } catch (e) { }
    }

    console.log("Unregister...");
    $("#regStatus").html(lang.disconnecting);
    userAgent.registerer.unregister();

    userAgent.transport.attemptingReconnection = false;
    userAgent.registering = false;
    userAgent.isReRegister = false;
}

// Registration Events
// ===================
/**
 * Called when account is registered
 */
function onRegistered() {
    // This code fires on re-register after session timeout
    // to ensure that events are not fired multiple times
    // a isReRegister state is kept.
    // TO DO This check appears obsolete

    userAgent.registrationCompleted = true;
    if (!userAgent.isReRegister) {
        console.log("Registered!");

        // Start Subscribe Loop
        window.setTimeout(function () {
            SubscribeAll();
        }, 500);

        console.log(lang.registered);

        userAgent.registering = false;

        // Close possible Alerts that may be open. (Can be from failed registers)
        if (alertObj != null) {
            alertObj.dialog("close");
            alertObj = null;
        }

        // Custom Web hook
        if (typeof web_hook_on_register !== 'undefined') web_hook_on_register(userAgent);
    }
    else {
        userAgent.registering = false;

        console.log("ReRegistered!");
    }
    userAgent.isReRegister = true;
}
/**
 * Called if UserAgent can connect, but not register.
 * @param {string} response Incoming request message
 * @param {string} cause Cause message. Unused
**/
function onRegisterFailed(response, cause) {
    console.log("Registration Failed: " + response);
    $("#regStatus").html(lang.registration_failed);

    Alert(lang.registration_failed + ":" + response, lang.registration_failed);

    userAgent.registering = false;

    if (typeof web_hook_on_registrationFailed !== 'undefined') web_hook_on_registrationFailed(response);
}
/**
 * Called when Unregister is requested
 */
function onUnregistered() {
    if (userAgent.registrationCompleted) {
        console.log("Unregistered, bye!");
        $("#regStatus").html(lang.unregistered);

        $("#reglink").show();
        $("#dereglink").hide();

        // Custom Web hook
        if (typeof web_hook_on_unregistered !== 'undefined') web_hook_on_unregistered();
    }
    else {
        // Was never really registered, so cant really say unregistered
    }

    // We set this flag here so that the re-register attempts are fully completed.
    userAgent.isReRegister = false;
}

//#endregion

//#region Inbound Calls
// =============
function ReceiveCall(session) {
    // First Determine Identity from From
    var callerID = session.remoteIdentity.displayName;
    var did = session.remoteIdentity.uri.user;
    if (typeof callerID === 'undefined') callerID = did;

    var sipHeaders = session.incomingInviteRequest.message.headers;
    // If a P-Asserted-Identity is parsed, use that
    if (sipHeaders.hasOwnProperty("P-Asserted-Identity")) {
        var rawUri = sipHeaders["P-Asserted-Identity"][0].raw;
        if (rawUri.includes("<sip:")) {
            var uriParts = rawUri.split("<sip:");
            if (uriParts[1].endsWith(">")) uriParts[1] = uriParts[1].substring(0, uriParts[1].length - 1);
            if (uriParts[1].endsWith("@" + SipDomain)) {
                var assertId = SIP.UserAgent.makeURI("sip:" + uriParts[1]); // should be sip:123@domain.com
                did = assertId.user;
                console.log("Found P-Asserted-Identity, will use that to identify user:", did);
            }
            else {
                console.warn("Found P-Asserted-Identity but not in trust domain: ", rawUri);
            }
        }
        else {
            console.warn("Found P-Asserted-Identity but not in a URI: ", rawUri);
        }
    }

    console.log("New Incoming Call!", callerID + " <" + did + ">");

    var CurrentCalls = countSessions(session.id);
    console.log("Current Call Count:", CurrentCalls);

    var startTime = moment.utc();

    // Create the line and add the session so we can answer or reject it.
    _newLineNumber = _newLineNumber + 1;
    var lineObj = new Line(_newLineNumber, callerID, did);
    lineObj.SipSession = session;
    lineObj.SipSession.data = {}
    lineObj.SipSession.data.line = 1;
    lineObj.SipSession.data.calldirection = "inbound";
    lineObj.SipSession.data.terminateby = "";
    lineObj.SipSession.data.src = did;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function () {
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-timer").html(timeStr);
        $("#line-datetime").html(timeStr);
    }, 1000);
    lineObj.SipSession.data.earlyReject = false;
    Lines.push(lineObj);
    // Session Delegates
    lineObj.SipSession.delegate = {
        onBye: function (sip) {
            onSessionReceivedBye(lineObj, sip)
        },
        onMessage: function (sip) {
            onSessionReceivedMessage(lineObj, sip);
        },
        onInvite: function (sip) {
            onSessionReinvited(lineObj, sip);
        },
        onSessionDescriptionHandler: function (sdh, provisional) {
            onSessionDescriptionHandlerCreated(lineObj, sdh, provisional, false);
        }
    }
    // incomingInviteRequestDelegate
    lineObj.SipSession.incomingInviteRequest.delegate = {
        onCancel: function (sip) {
            onInviteCancel(lineObj, sip)
        }
    }

    // Possible Early Rejection options
    if (DoNotDisturbEnabled == true || DoNotDisturbPolicy == "enabled") {
        console.log("Do Not Disturb Enabled, rejecting call.");
        lineObj.SipSession.data.earlyReject = true;
        RejectCall(lineObj.LineNumber);
        return;
    }
    if (CurrentCalls >= 1) {
        if (CallWaitingEnabled == false || CallWaitingEnabled == "disabled") {
            console.log("Call Waiting Disabled, rejecting call.");
            lineObj.SipSession.data.earlyReject = true;
            RejectCall(lineObj.LineNumber);
            return;
        }
    }


    // Auto Answer options
    var autoAnswerRequested = false;
    var answerTimeout = 1000;
    if (!AutoAnswerEnabled && IntercomPolicy == "enabled") { // Check headers only if policy is allow

        // https://github.com/InnovateAsterisk/Browser-Phone/issues/126
        // Alert-Info: info=alert-autoanswer
        // Alert-Info: answer-after=0
        // Call-info: answer-after=0; x=y
        // Call-Info: Answer-After=0
        // Alert-Info: ;info=alert-autoanswer
        // Alert-Info: <sip:>;info=alert-autoanswer
        // Alert-Info: <sip:domain>;info=alert-autoanswer

        var ci = session.request.headers["Call-Info"];
        if (ci !== undefined && ci.length > 0) {
            for (var i = 0; i < ci.length; i++) {
                var raw_ci = ci[i].raw.toLowerCase();
                if (raw_ci.indexOf("answer-after=") > 0) {
                    var temp_seconds_autoanswer = parseInt(raw_ci.substring(raw_ci.indexOf("answer-after=") + "answer-after=".length).split(';')[0]);
                    if (Number.isInteger(temp_seconds_autoanswer) && temp_seconds_autoanswer >= 0) {
                        autoAnswerRequested = true;
                        if (temp_seconds_autoanswer > 1) answerTimeout = temp_seconds_autoanswer * 1000;
                        break;
                    }
                }
            }
        }
        var ai = session.request.headers["Alert-Info"];
        if (autoAnswerRequested === false && ai !== undefined && ai.length > 0) {
            for (var i = 0; i < ai.length; i++) {
                var raw_ai = ai[i].raw.toLowerCase();
                if (raw_ai.indexOf("auto answer") > 0 || raw_ai.indexOf("alert-autoanswer") > 0) {
                    var autoAnswerRequested = true;
                    break;
                }
                if (raw_ai.indexOf("answer-after=") > 0) {
                    var temp_seconds_autoanswer = parseInt(raw_ai.substring(raw_ai.indexOf("answer-after=") + "answer-after=".length).split(';')[0]);
                    if (Number.isInteger(temp_seconds_autoanswer) && temp_seconds_autoanswer >= 0) {
                        autoAnswerRequested = true;
                        if (temp_seconds_autoanswer > 1) answerTimeout = temp_seconds_autoanswer * 1000;
                        break;
                    }
                }
            }
        }
    }

    if (AutoAnswerEnabled || AutoAnswerPolicy == "enabled" || autoAnswerRequested) {
        if (CurrentCalls == 0) { // There are no other calls, so you can answer
            console.log("Going to Auto Answer this call...");
            window.setTimeout(function () {
                AnswerAudioCall(lineObj.LineNumber);
            }, answerTimeout);

            return;
        }
        else {
            console.warn("Could not auto answer call, already on a call.");
        }
    }

    // Play Ring Tone if not on the phone
    if (EnableRingtone == true) {
        if (CurrentCalls >= 1) {
            // Play Alert
            console.log("Audio:", audioBlobs.CallWaiting.url);
            var ringer = new Audio(audioBlobs.CallWaiting.blob);
            ringer.preload = "auto";
            ringer.loop = false;
            ringer.oncanplaythrough = function (e) {
                if (typeof ringer.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                    ringer.setSinkId(getRingerOutputID()).then(function () {
                        console.log("Set sinkId to:", getRingerOutputID());
                    }).catch(function (e) {
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                // If there has been no interaction with the page at all... this page will not work
                ringer.play().then(function () {
                    // Audio Is Playing
                }).catch(function (e) {
                    console.warn("Unable to play audio file.", e);
                });
            }
            lineObj.SipSession.data.ringerObj = ringer;
        } else {
            // Play Ring Tone
            console.log("Audio:", audioBlobs.Ringtone.url);
            var ringer = new Audio(audioBlobs.Ringtone.blob);
            ringer.preload = "auto";
            ringer.loop = true;
            ringer.oncanplaythrough = function (e) {
                if (typeof ringer.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                    ringer.setSinkId(getRingerOutputID()).then(function () {
                        console.log("Set sinkId to:", getRingerOutputID());
                    }).catch(function (e) {
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                // If there has been no interaction with the page at all... this page will not work
                ringer.play().then(function () {
                    // Audio Is Playing
                }).catch(function (e) {
                    console.warn("Unable to play audio file.", e);
                });
            }
            lineObj.SipSession.data.ringerObj = ringer;
        }

    }

    // Custom Web hook
    if (typeof web_hook_on_invite !== 'undefined') web_hook_on_invite(lineObj);
}
function AnswerAudioCall(lineNumber) {
    lineNumber = lineNumber || _newLineNumber;
    var lineObj = FindLineByNumber(lineNumber);
    if (lineObj == null) {
        console.warn("Failed to get line (" + lineNumber + ")");
        return;
    }
    var session = lineObj.SipSession;
    // Stop the ringtone
    if (session.data.ringerObj) {
        session.data.ringerObj.pause();
        session.data.ringerObj.removeAttribute('src');
        session.data.ringerObj.load();
        session.data.ringerObj = null;
    }
    $("#line-AnswerCall").hide();
    // Check vitals
    if (HasAudioDevice == false) {
        Alert(lang.alert_no_microphone);
        $("#line-msg").html(lang.call_failed);
        return;
    }


    // Start SIP handling
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId: "default" },
                video: false
            }
        }
    }

    // Configure Audio
    var currentAudioDevice = getAudioSrcID();
    if (currentAudioDevice != "default") {
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if (currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if (confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    // Add additional Constraints
    if (supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if (supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if (supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }

    // Save Devices
    lineObj.SipSession.data.withvideo = false;
    lineObj.SipSession.data.VideoSourceDevice = null;
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();

    // Send Answer
    lineObj.SipSession.accept(spdOptions).then(function () {
        onInviteAccepted(lineObj, false);
    }).catch(function (error) {
        console.warn("Failed to answer call", error, lineObj.SipSession);
        lineObj.SipSession.data.reasonCode = 500;
        lineObj.SipSession.data.reasonText = "Client Error";
        teardownSession(lineObj);
    });
}
function RejectCall(lineNumber) {
    lineNumber = lineNumber || _newLineNumber;
    var lineObj = FindLineByNumber(lineNumber);
    if (lineObj == null) {
        console.warn("Unable to find line (" + lineNumber + ")");
        return;
    }
    var session = lineObj.SipSession;
    if (session == null) {
        console.warn("Reject failed, null session");
        $("#line-msg").html(lang.call_failed);
        $("#line-AnswerCall").hide();
    }
    if (session.state == SIP.SessionState.Established) {
        session.bye().catch(function (e) {
            console.warn("Problem in RejectCall(), could not bye() call", e, session);
        });
    }
    else {
        session.reject({
            statusCode: 486,
            reasonPhrase: "Busy Here"
        }).catch(function (e) {
            console.warn("Problem in RejectCall(), could not reject() call", e, session);
        });
    }
    $("#line-msg").html(lang.call_rejected);

    session.data.terminateby = "us";
    session.data.reasonCode = 486;
    session.data.reasonText = "Busy Here";
    teardownSession(lineObj);
}
//#endregion

//#region Session Events
// ==============

// Incoming INVITE
function onInviteCancel(lineObj, response) {
    // Remote Party Canceled while ringing...

    // Check to see if this call has been completed elsewhere
    // https://github.com/InnovateAsterisk/Browser-Phone/issues/405
    var temp_cause = 0;
    var reason = response.headers["Reason"];
    if (reason !== undefined && reason.length > 0) {
        for (var i = 0; i < reason.length; i++) {
            var cause = reason[i].raw.toLowerCase().trim(); // Reason: Q.850 ;cause=16 ;text="Terminated"
            var items = cause.split(';');
            if (items.length >= 2 && (items[0].trim() == "sip" || items[0].trim() == "q.850") && items[1].includes("cause") && cause.includes("call completed elsewhere")) {
                temp_cause = parseInt(items[1].substring(items[1].indexOf("=") + 1).trim());
                // No sample provided for "token"
                break;
            }
        }
    }

    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.reasonCode = temp_cause;
    if (temp_cause == 0) {
        lineObj.SipSession.data.reasonText = "Call Cancelled";
        console.log("Call canceled by remote party before answer");
    } else {
        lineObj.SipSession.data.reasonText = "Call completed elsewhere";
        console.log("Call completed elsewhere before answer");
    }

    lineObj.SipSession.dispose().catch(function (error) {
        console.log("Failed to dispose the cancel dialog", error);
    })

    teardownSession(lineObj);
}
// Both Incoming an outgoing INVITE
function onInviteAccepted(lineObj, includeVideo, response) {
    // Call in progress
    var session = lineObj.SipSession;
    SelectLine(lineObj.LineNumber)
    if (session.data.earlyMedia) {
        session.data.earlyMedia.pause();
        session.data.earlyMedia.removeAttribute('src');
        session.data.earlyMedia.load();
        session.data.earlyMedia = null;
    }
    // Stop the ringtone
    if (lineObj.SipSession.data.ringerObj) {
        lineObj.SipSession.data.ringerObj.pause();
        lineObj.SipSession.data.ringerObj.removeAttribute('src');
        lineObj.SipSession.data.ringerObj.load();
        lineObj.SipSession.data.ringerObj = null;
    }

    window.clearInterval(session.data.callTimer);
    $("#line-timer").show();
    var startTime = moment.utc();
    session.data.startTime = startTime;
    session.data.callTimer = window.setInterval(function () {
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-timer").html(timeStr);
        $("#line-datetime").html(timeStr);
    }, 1000);
    session.isOnHold = false;
    session.data.started = true;


    $("#line-msg").html(lang.call_in_progress);


    $(document).trigger("uj_on_modify", ["accepted", lineObj]);
}
// Outgoing INVITE
function onInviteTrying(lineObj, response) {
    $(document).trigger("uj_on_modify", ["trying", lineObj]);
}
function onInviteProgress(lineObj, response) {
    console.log("Call Progress:", response.message.statusCode);

    // Provisional 1xx
    // response.message.reasonPhrase
    if (response.message.statusCode == 180) {
        $("#line-msg").html(lang.ringing);

        var soundFile = audioBlobs.EarlyMedia_US;

        // Play Early Media
        console.log("Audio:", soundFile.url);
        if (lineObj.SipSession.data.earlyMedia) {
            // There is already early media playing
            // onProgress can be called multiple times
            // Don't add it again
            console.log("Early Media already playing");
        }
        else {
            var earlyMedia = new Audio(soundFile.blob);
            earlyMedia.preload = "auto";
            earlyMedia.loop = true;
            earlyMedia.oncanplaythrough = function (e) {
                if (typeof earlyMedia.sinkId !== 'undefined' && getAudioOutputID() != "default") {
                    earlyMedia.setSinkId(getAudioOutputID()).then(function () {
                        console.log("Set sinkId to:", getAudioOutputID());
                    }).catch(function (e) {
                        console.warn("Failed not apply setSinkId.", e);
                    });
                }
                earlyMedia.play().then(function () {
                    // Audio Is Playing
                }).catch(function (e) {
                    console.warn("Unable to play audio file.", e);
                });
            }
            lineObj.SipSession.data.earlyMedia = earlyMedia;
        }
    }
    else if (response.message.statusCode === 183) {
        $("#line-msg").html(response.message.reasonPhrase + "...");

        // Stop the ringtone
        if (lineObj.SipSession.data.ringerObj) {
            lineObj.SipSession.data.ringerObj.pause();
            lineObj.SipSession.data.ringerObj.removeAttribute('src');
            lineObj.SipSession.data.ringerObj.load();
            lineObj.SipSession.data.ringerObj = null;
        }
        // Add UI to allow DTMF
        $("#line-early-dtmf").show();
    }
    else {
        // 181 = Call is Being Forwarded
        // 182 = Call is queued (Busy server!)
        // 199 = Call is Terminated (Early Dialog)

        $("#line-msg").html(response.message.reasonPhrase + "...");
    }

    // Custom Web hook
    $(document).trigger("uj_on_modify", ["progress", lineObj.SipSession]);
}
function onInviteRejected(lineObj, response) {
    console.log("INVITE Rejected:", response.message.reasonPhrase);

    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.reasonCode = response.message.statusCode;
    lineObj.SipSession.data.reasonText = response.message.reasonPhrase;

    teardownSession(lineObj);
}
function onInviteRedirected(response) {
    console.log("onInviteRedirected", response);
    // Follow???
}

// General Session delegates
function onSessionReceivedBye(lineObj, response) {
    // They Ended the call
    $("#line-msg").html(lang.call_ended);
    console.log("Call ended, bye!");

    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.reasonCode = 16;
    lineObj.SipSession.data.reasonText = "Normal Call clearing";

    response.accept(); // Send OK

    teardownSession(lineObj);
}
function onSessionReinvited(lineObj, response) {
    
}
function onSessionReceivedMessage(lineObj, response) {
    var messageType = (response.request.headers["Content-Type"].length >= 1) ? response.request.headers["Content-Type"][0].parsed : "Unknown";
    if (messageType.indexOf("application/x-asterisk-confbridge-event") > -1) {
        // ujCollab Events JSON
        var msgJson = JSON.parse(response.request.body);

        var session = lineObj.SipSession;
        if (!session.data.ConfbridgeChannels) session.data.ConfbridgeChannels = [];
        if (!session.data.ConfbridgeEvents) session.data.ConfbridgeEvents = [];

        if (msgJson.type == "ConfbridgeStart") {
            console.log("ConfbridgeStart!");
        }
        else if (msgJson.type == "ConfbridgeWelcome") {
            console.log("Welcome to the ujApp ujCollab");
            console.log("Bridge ID:", msgJson.bridge.id);
            console.log("Bridge Name:", msgJson.bridge.name);
            console.log("Created at:", msgJson.bridge.creationtime);

            session.data.ConfbridgeChannels = msgJson.channels; // Write over this
            session.data.ConfbridgeChannels.forEach(function (chan) {
                // The mute and unmute status doesn't appear to be a realtime state, only what the 
                // startmuted= setting of the default profile is.
                console.log(chan.caller.name, "Is in the ujCollab. Muted:", chan.muted, "Admin:", chan.admin);
            });
        }
        else if (msgJson.type == "ConfbridgeJoin") {
            msgJson.channels.forEach(function (chan) {
                var found = false;
                session.data.ConfbridgeChannels.forEach(function (existingChan) {
                    if (existingChan.id == chan.id) found = true;
                });
                if (!found) {
                    session.data.ConfbridgeChannels.push(chan);
                    session.data.ConfbridgeEvents.push({ event: chan.caller.name + " (" + chan.caller.number + ") joined the ujCollab", eventTime: utcDateNow() });
                    console.log(chan.caller.name, "Joined the ujCollab. Muted: ", chan.muted);
                }
            });
        }
        else if (msgJson.type == "ConfbridgeLeave") {
            msgJson.channels.forEach(function (chan) {
                session.data.ConfbridgeChannels.forEach(function (existingChan, i) {
                    if (existingChan.id == chan.id) {
                        session.data.ConfbridgeChannels.splice(i, 1);
                        console.log(chan.caller.name, "Left the ujCollab");
                        session.data.ConfbridgeEvents.push({ event: chan.caller.name + " (" + chan.caller.number + ") left the ujCollab", eventTime: utcDateNow() });
                    }
                });
            });
        }
        else if (msgJson.type == "ConfbridgeMute") {
            msgJson.channels.forEach(function (chan) {
                session.data.ConfbridgeChannels.forEach(function (existingChan) {
                    if (existingChan.id == chan.id) {
                        console.log(existingChan.caller.name, "is now muted");
                        existingChan.muted = true;
                    }
                });
            });
        }
        else if (msgJson.type == "ConfbridgeUnmute") {
            msgJson.channels.forEach(function (chan) {
                session.data.ConfbridgeChannels.forEach(function (existingChan) {
                    if (existingChan.id == chan.id) {
                        console.log(existingChan.caller.name, "is now unmuted");
                        existingChan.muted = false;
                    }
                });
            });
        }
        else if (msgJson.type == "ConfbridgeEnd") {
            console.log("The ujApp ujCollab has ended, bye!");
        }
        else {
            console.warn("Unknown ujApp ujCollab Event:", msgJson.type, msgJson);
        }
        RefreshLineActivity(lineObj.LineNumber);
        response.accept();
    }
    else if (messageType.indexOf("application/x-myphone-confbridge-chat") > -1) {
        console.log("x-myphone-confbridge-chat", response);


        response.accept();
    }
    else {
        console.warn("Unknown message type")
        response.reject();
    }
}

function onSessionDescriptionHandlerCreated(lineObj, sdh, provisional) {
    if (sdh) {
        if (sdh.peerConnection) {
            // console.log(sdh);
            sdh.peerConnection.ontrack = function (event) {
                // console.log(event);
                onTrackAddedEvent(lineObj);
            }
        }
        else {
            console.warn("onSessionDescriptionHandler fired without a peerConnection");
        }
    }
    else {
        console.warn("onSessionDescriptionHandler fired without a sessionDescriptionHandler");
    }
}
function onTrackAddedEvent(lineObj) {
    // Gets remote tracks
    var session = lineObj.SipSession;

    var pc = session.sessionDescriptionHandler.peerConnection;

    var remoteAudioStream = new MediaStream();

    pc.getTransceivers().forEach(function (transceiver) {
        // Add Media
        var receiver = transceiver.receiver;
        if (receiver.track) {
            if (receiver.track.kind == "audio") {
                console.log("Adding Remote Audio Track");
                remoteAudioStream.addTrack(receiver.track);
            }
        }
    });

    // Attach Audio
    if (remoteAudioStream.getAudioTracks().length >= 1) {
        var remoteAudio = $("#line-remoteAudio").get(0);
        remoteAudio.srcObject = remoteAudioStream;
        remoteAudio.onloadedmetadata = function (e) {
            if (typeof remoteAudio.sinkId !== 'undefined') {
                remoteAudio.setSinkId(getAudioOutputID()).then(function () {
                    console.log("sinkId applied: " + getAudioOutputID());
                }).catch(function (e) {
                    console.warn("Error using setSinkId: ", e);
                });
            }
            remoteAudio.play();
        }
    }


    // Custom Web hook
    $(document).trigger("uj_on_modify", ["trackAdded", session]);
}

// General end of Session
function teardownSession(lineObj) {
    if (lineObj == null || lineObj.SipSession == null) return;

    var session = lineObj.SipSession;
    if (session.data.teardownComplete == true) return;
    session.data.teardownComplete = true; // Run this code only once

    // Call UI
    if (session.data.earlyReject != true) {
    }

    // End any child calls
    if (session.data.childsession) {
        session.data.childsession.dispose().then(function () {
            session.data.childsession = null;
        }).catch(function (error) {
            session.data.childsession = null;
            // Suppress message
        });
    }

    // Mixed Tracks
    if (session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio") {
        session.data.AudioSourceTrack.stop();
        session.data.AudioSourceTrack = null;
    }
    // Stop any Early Media
    if (session.data.earlyMedia) {
        session.data.earlyMedia.pause();
        session.data.earlyMedia.removeAttribute('src');
        session.data.earlyMedia.load();
        session.data.earlyMedia = null;
    }
    // Stop any ringing calls
    if (session.data.ringerObj) {
        session.data.ringerObj.pause();
        session.data.ringerObj.removeAttribute('src');
        session.data.ringerObj.load();
        session.data.ringerObj = null;
    }


    // Make sure you have released the microphone
    if (session && session.sessionDescriptionHandler && session.sessionDescriptionHandler.peerConnection) {
        var pc = session.sessionDescriptionHandler.peerConnection;
        pc.getSenders().forEach(function (RTCRtpSender) {
            if (RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                RTCRtpSender.track.stop();
            }
        });
    }

    // End timers
    window.clearInterval(session.data.callTimer);

    $(document).trigger("uj_terminate", lineObj);
    window.setTimeout(function () {
        RemoveLine(lineObj);
    }, 1000);

}

//#endregion


//#region Presence / Subscribe
// ====================
function SubscribeAll() {
    if (!userAgent.isRegistered()) return;

    if (VoiceMailSubscribe) {
        SubscribeVoicemail();
    }

    // Start subscribe all
    if (userAgent.BlfSubs && userAgent.BlfSubs.length > 0) {
        UnsubscribeAll();
    }
    userAgent.BlfSubs = [];
}
function SelfSubscribe() {
    if (!userAgent.isRegistered()) return;

    if (userAgent.selfSub) {
        console.log("Unsubscribe from old self subscribe...");
        SelfUnsubscribe();
    }

    var targetURI = SIP.UserAgent.makeURI("sip:" + SipUsername + "@" + SipDomain);

    var options = {
    }
    var SubscribeEvent;

    userAgent.selfSub = new SIP.Subscriber(userAgent, targetURI, SubscribeEvent, options);
    userAgent.selfSub.delegate = {
        onNotify: function (sip) {
            // ReceiveNotify(sip, true);
        }
    }
    console.log("SUBSCRIBE Self: " + SipUsername + "@" + SipDomain);
    userAgent.selfSub.subscribe().catch(function (error) {
        console.warn("Error subscribing to yourself:", error);
    });
}

function SubscribeVoicemail() {
    if (!userAgent.isRegistered()) return;

    if (userAgent.voicemailSub) {
        console.log("Unsubscribe from old voicemail Messages...");
        UnsubscribeVoicemail();
    }

    var vmOptions = { expires: SubscribeVoicemailExpires }
    var targetURI = SIP.UserAgent.makeURI("sip:" + SipUsername + "@" + SipDomain);
    userAgent.voicemailSub = new SIP.Subscriber(userAgent, targetURI, "message-summary", vmOptions);
    userAgent.voicemailSub.delegate = {
        onNotify: function (sip) {
            // VoicemailNotify(sip);
        }
    }
    console.log("SUBSCRIBE VOICEMAIL: " + SipUsername + "@" + SipDomain);
    userAgent.voicemailSub.subscribe().catch(function (error) {
        console.warn("Error subscribing to voicemail notifications:", error);
    });
}


function UnsubscribeAll() {
    if (!userAgent.isRegistered()) return;

    console.log("Unsubscribe from voicemail Messages...");
    UnsubscribeVoicemail();

    if (userAgent.BlfSubs && userAgent.BlfSubs.length > 0) {
        console.log("Unsubscribing " + userAgent.BlfSubs.length + " subscriptions...");
        for (var blf = 0; blf < userAgent.BlfSubs.length; blf++) {
            UnsubscribeBlf(userAgent.BlfSubs[blf]);
        }
        userAgent.BlfSubs = [];
    }
}
function UnsubscribeVoicemail() {
    if (!userAgent.isRegistered()) return;

    if (userAgent.voicemailSub) {
        console.log("Unsubscribe to voicemail Messages...", userAgent.voicemailSub.state);
        if (userAgent.voicemailSub.state == SIP.SubscriptionState.Subscribed) {
            userAgent.voicemailSub.unsubscribe().catch(function (error) {
                console.warn("Error removing voicemail notifications:", error);
            });
        }
        userAgent.voicemailSub.dispose().catch(function (error) {
            console.warn("Error disposing voicemail notifications:", error);
        });
    } else {
        console.log("Not subscribed to MWI");
    }
    userAgent.voicemailSub = null;
}
function SelfUnsubscribe() {
    if (!userAgent.isRegistered()) return;

    if (userAgent.selfSub) {
        console.log("Unsubscribe from yourself...", userAgent.selfSub.state);
        if (userAgent.selfSub.state == SIP.SubscriptionState.Subscribed) {
            userAgent.selfSub.unsubscribe().catch(function (error) {
                console.warn("Error self subscription:", error);
            });
        }
        userAgent.selfSub.dispose().catch(function (error) {
            console.warn("Error disposing self subscription:", error);
        });
    } else {
        console.log("Not subscribed to Yourself");
    }
    userAgent.selfSub = null;
}



//#region Outbound Calling
// ================

function AudioCall(lineObj, dialledNumber, extraHeaders) {
    if (userAgent == null) return;
    if (userAgent.isRegistered() == false) return;
    if (lineObj == null) return;

    if (HasAudioDevice == false) {
        Alert(lang.alert_no_microphone);
        return;
    }

    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

    var spdOptions = {
        earlyMedia: true,
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId: "default" },
                video: false
            }
        }
    }
    // Configure Audio
    var currentAudioDevice = getAudioSrcID();
    if (currentAudioDevice != "default") {
        var confirmedAudioDevice = false;
        for (var i = 0; i < AudioinputDevices.length; ++i) {
            if (currentAudioDevice == AudioinputDevices[i].deviceId) {
                confirmedAudioDevice = true;
                break;
            }
        }
        if (confirmedAudioDevice) {
            spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: currentAudioDevice }
        }
        else {
            console.warn("The audio device you used before is no longer available, default settings applied.");
            localDB.setItem("AudioSrcId", "default");
        }
    }
    // Add additional Constraints
    if (supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if (supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if (supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }
    // Added to the SIP Headers
    if (extraHeaders) {
        spdOptions.extraHeaders = extraHeaders;
    } else {
        spdOptions.extraHeaders = [];
    }
    if (InviteExtraHeaders && InviteExtraHeaders != "" && InviteExtraHeaders != "{}") {
        try {
            var inviteExtraHeaders = JSON.parse(InviteExtraHeaders);
            for (const [key, value] of Object.entries(inviteExtraHeaders)) {
                if (value == "") {
                    // This is a header, must be format: "Field: Value"
                } else {
                    spdOptions.extraHeaders.push(key + ": " + value);
                }
            }
        } catch (e) { }
    }


    $("#line-msg").html(lang.starting_audio_call);
    $("#line-timer").show();

    var startTime = moment.utc();

    // Invite
    console.log("INVITE (audio): " + dialledNumber + "@" + SipDomain);

    var targetURI = SIP.UserAgent.makeURI("sip:" + dialledNumber + "@" + SipDomain);
    //var targetURI = SIP.UserAgent.makeURI("sip:" + dialledNumber.replace(/#/g, "%23") + "@" + SipDomain);
    lineObj.SipSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    lineObj.SipSession.data = {}
    lineObj.SipSession.data.line = 1;
    lineObj.SipSession.data.calldirection = "outbound";
    lineObj.SipSession.data.dst = dialledNumber;
    lineObj.SipSession.data.callstart = startTime.format("YYYY-MM-DD HH:mm:ss UTC");
    lineObj.SipSession.data.callTimer = window.setInterval(function () {
        var now = moment.utc();
        var duration = moment.duration(now.diff(startTime));
        var timeStr = formatShortDuration(duration.asSeconds());
        $("#line-timer").html(timeStr);
        $("#line-datetime").html(timeStr);
    }, 1000);
    lineObj.SipSession.data.VideoSourceDevice = null;
    lineObj.SipSession.data.AudioSourceDevice = getAudioSrcID();
    lineObj.SipSession.data.AudioOutputDevice = getAudioOutputID();
    lineObj.SipSession.data.terminateby = "them";
    lineObj.SipSession.data.withvideo = false;
    lineObj.SipSession.data.earlyReject = false;
    lineObj.SipSession.isOnHold = false;
    
    
    try {
        var ringer = new Audio(audioBlobs.CallWaiting.blob);
        ringer.preload = "auto";
        ringer.loop = true;
        ringer.oncanplaythrough = function (e) {
            if (typeof ringer.sinkId !== 'undefined' && getRingerOutputID() != "default") {
                ringer.setSinkId(getRingerOutputID()).then(function () {
                    console.log("Set sinkId to:", getRingerOutputID());
                }).catch(function (e) {
                    console.warn("Failed not apply setSinkId.", e);
                });
            }
            // If there has been no interaction with the page at all... this page will not work
            ringer.play().then(function () {
                // Audio Is Playing
            }).catch(function (e) {
                console.warn("Unable to play audio file.", e);
            });
        }
        lineObj.SipSession.data.ringerObj = ringer;
    } catch { }

    lineObj.SipSession.delegate = {
        onBye: function (sip) {
            onSessionReceivedBye(lineObj, sip);
        },
        onMessage: function (sip) {
            onSessionReceivedMessage(lineObj, sip);
        },
        onInvite: function (sip) {
            onSessionReinvited(lineObj, sip);
        },
        onSessionDescriptionHandler: function (sdh, provisional) {
            onSessionDescriptionHandlerCreated(lineObj, sdh, provisional);
        }
    }
    var inviterOptions = {
        requestDelegate: { // OutgoingRequestDelegate
            onTrying: function (sip) {
                onInviteTrying(lineObj, sip);
            },
            onProgress: function (sip) {
                onInviteProgress(lineObj, sip);
            },
            onRedirect: function (sip) {
                onInviteRedirected(lineObj, sip);
            },
            onAccept: function (sip) {
                onInviteAccepted(lineObj, false, sip);
            },
            onReject: function (sip) {
                onInviteRejected(lineObj, sip);
            }
        }
    }
    lineObj.SipSession.invite(inviterOptions).catch(function (e) {
        console.warn("Failed to send INVITE:", e);
    });

    console.log("Outbound call initiated. Showing call controls.")

    $(document).trigger("uj_Outbound_initiated", lineObj)
}
//#endregion

//#region Sessions & During Call Activity
// ===============================
function getSession() {
    if (userAgent == null) {
        console.warn("userAgent is null");
        return null;
    }
    if (userAgent.isRegistered() == false) {
        console.warn("userAgent is not registered");
        return null;
    }
    return rtnSession;
}
function countSessions(id) {
    var rtn = 0;
    if (userAgent == null) {
        console.warn("userAgent is null");
        return 0;
    }
    $.each(userAgent.sessions, function (i, session) {
        if (id != session.id) rtn++;
    });
    return rtn;
}

//#endregion

// Stream Manipulations
// ====================
function MixAudioStreams(MultiAudioTackStream) {
    // Takes in a MediaStream with any number of audio tracks and mixes them together

    var audioContext = null;
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    catch (e) {
        console.warn("AudioContext() not available, cannot record");
        return MultiAudioTackStream;
    }
    var mixedAudioStream = audioContext.createMediaStreamDestination();
    MultiAudioTackStream.getAudioTracks().forEach(function (audioTrack) {
        var srcStream = new MediaStream();
        srcStream.addTrack(audioTrack);
        var streamSourceNode = audioContext.createMediaStreamSource(srcStream);
        streamSourceNode.connect(mixedAudioStream);
    });

    return mixedAudioStream.stream;
}



//#region Call Transfer
// =============
function StartTransferSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    $("#line-btn-Transfer,#line-btn-ShowDtmf").hide();
    $("#line-btn-CancelTransfer").show();
    $(".uj-divDTMFmenu").hide();
    $(".uj-avatar").hide();

    holdSession(lineNum);

    $("#line-btn-blind-transfer").show();
    $("#line-btn-attended-transfer").show();
    $("#line-btn-complete-transfer").hide();
    $("#line-btn-cancel-transfer").hide();

    $("#line-btn-complete-attended-transfer").hide();
    $("#line-btn-cancel-attended-transfer").hide();
    $("#line-btn-terminate-attended-transfer").hide();

    $("#line-transfer-status").hide();

    $("#line-Transfer").show();
}
function CancelTransferSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) {
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;
    if (session.data.childsession) {
        console.log("Child Transfer call detected:", session.data.childsession.state);
        session.data.childsession.dispose().then(function () {
            session.data.childsession = null;
        }).catch(function (error) {
            session.data.childsession = null;
            // Suppress message
        });
    }

    $("#line-session-avatar").css("width", "");
    $("#line-session-avatar").css("height", "");

    $("#line-btn-Transfer,#line-btn-ShowDtmf").show();
    $(".uj-avatar").show();
    $("#line-btn-CancelTransfer").hide();

    unholdSession(lineNum);
    $("#line-Transfer").hide();


}
function transferOnkeydown(event, obj, lineNum) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        event.preventDefault();
        if (event.ctrlKey) {
            AttendedTransfer(lineNum);
        }
        else {
            BlindTransfer(lineNum);
        }

        return false;
    }
}
function BlindTransfer(lineNum) {
    lineNum = lineNum || _selectedLine;
    var dstNo = $("#line-txt-FindTransfer").val();
    if (EnableAlphanumericDial) {
        dstNo = dstNo.replace(telAlphanumericRegEx, "").substring(0, MaxDidLength);
    }
    else {
        dstNo = dstNo.replace(telNumericRegEx, "").substring(0, MaxDidLength);
    }
    if (dstNo == "") {
        console.warn("Cannot transfer, no number");
        return;
    }

    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) {
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;

    if (!session.data.transfer) session.data.transfer = [];
    session.data.transfer.push({
        type: "Blind",
        to: dstNo,
        transferTime: utcDateNow(),
        disposition: "refer",
        dispositionTime: utcDateNow(),
        accept: {
            complete: null,
            eventTime: null,
            disposition: ""
        }
    });
    var transferId = session.data.transfer.length - 1;

    var transferOptions = {
        requestDelegate: {
            onAccept: function (sip) {
                console.log("Blind transfer Accepted");

                session.data.terminateby = "us";
                session.data.reasonCode = 202;
                session.data.reasonText = "Transfer";

                session.data.transfer[transferId].accept.complete = true;
                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                // TO DO use lang pack
                $("#line-msg").html("Call Blind Transferred (Accepted)");



                session.bye().catch(function (error) {
                    console.warn("Could not BYE after blind transfer:", error);
                });
                teardownSession(lineObj);
            },
            onReject: function (sip) {
                console.warn("REFER rejected:", sip);

                session.data.transfer[transferId].accept.complete = false;
                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                $("#line-msg").html("Call Blind Failed!");



                // Session should still be up, so just allow them to try again
            }
        }
    }
    console.log("REFER: ", dstNo + "@" + SipDomain);
    var referTo = SIP.UserAgent.makeURI("sip:" + dstNo.replace(/#/g, "%23") + "@" + SipDomain);
    session.refer(referTo, transferOptions).catch(function (error) {
        console.warn("Failed to REFER", error);
    });;

    $("#line-msg").html(lang.call_blind_transfered);


}
function AttendedTransfer(lineNum) {
    lineNum = lineNum || _selectedLine;
    var dstNo = $("#line-txt-FindTransfer").val();
    if (EnableAlphanumericDial) {
        dstNo = dstNo.replace(telAlphanumericRegEx, "").substring(0, MaxDidLength);
    }
    else {
        dstNo = dstNo.replace(telNumericRegEx, "").substring(0, MaxDidLength);
    }
    if (dstNo == "") {
        console.warn("Cannot transfer, no number");
        return;
    }

    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) {
        console.warn("Null line or session");
        return;
    }
    var session = lineObj.SipSession;

    $("#line-btn-blind-transfer").hide();
    $("#line-btn-attended-transfer").hide();

    $("#line-btn-complete-attended-transfer").hide();
    $("#line-btn-cancel-attended-transfer").hide();
    $("#line-btn-terminate-attended-transfer").hide();


    var newCallStatus = $("#line-transfer-status");
    newCallStatus.html(lang.connecting);
    newCallStatus.show();

    if (!session.data.transfer) session.data.transfer = [];
    session.data.transfer.push({
        type: "Attended",
        to: dstNo,
        transferTime: utcDateNow(),
        disposition: "invite",
        dispositionTime: utcDateNow(),
        accept: {
            complete: null,
            eventTime: null,
            disposition: ""
        }
    });
    var transferId = session.data.transfer.length - 1;



    // SDP options
    var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    var spdOptions = {
        earlyMedia: true,
        sessionDescriptionHandlerOptions: {
            constraints: {
                audio: { deviceId: "default" },
                video: false
            }
        }
    }
    if (session.data.AudioSourceDevice != "default") {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.deviceId = { exact: session.data.AudioSourceDevice }
    }
    // Add additional Constraints
    if (supportedConstraints.autoGainControl) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.autoGainControl = AutoGainControl;
    }
    if (supportedConstraints.echoCancellation) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.echoCancellation = EchoCancellation;
    }
    if (supportedConstraints.noiseSuppression) {
        spdOptions.sessionDescriptionHandlerOptions.constraints.audio.noiseSuppression = NoiseSuppression;
    }

    // Create new call session
    console.log("TRANSFER INVITE: ", "sip:" + dstNo + "@" + SipDomain);
    var targetURI = SIP.UserAgent.makeURI("sip:" + dstNo.replace(/#/g, "%23") + "@" + SipDomain);
    var newSession = new SIP.Inviter(userAgent, targetURI, spdOptions);
    newSession.data = {}
    newSession.delegate = {
        onBye: function (sip) {
            console.log("New call session ended with BYE");
            newCallStatus.html(lang.call_ended);
            session.data.transfer[transferId].disposition = "bye";
            session.data.transfer[transferId].dispositionTime = utcDateNow();

            $("#line-txt-FindTransfer").parent().show();
            $("#line-btn-blind-transfer").show();
            $("#line-btn-attended-transfer").show();

            $("#line-btn-complete-attended-transfer").hide();
            $("#line-btn-cancel-attended-transfer").hide();
            $("#line-btn-terminate-attended-transfer").hide();

            $("#line-msg").html(lang.attended_transfer_call_terminated);



            window.setTimeout(function () {
                newCallStatus.hide();

            }, 1000);
        },
        onSessionDescriptionHandler: function (sdh, provisional) {
            if (sdh) {
                if (sdh.peerConnection) {
                    sdh.peerConnection.ontrack = function (event) {
                        var pc = sdh.peerConnection;

                        // Gets Remote Audio Track (Local audio is setup via initial GUM)
                        var remoteStream = new MediaStream();
                        pc.getReceivers().forEach(function (receiver) {
                            if (receiver.track && receiver.track.kind == "audio") {
                                remoteStream.addTrack(receiver.track);
                            }
                        });
                        var remoteAudio = $("#line-transfer-remoteAudio").get(0);
                        remoteAudio.srcObject = remoteStream;
                        remoteAudio.onloadedmetadata = function (e) {
                            if (typeof remoteAudio.sinkId !== 'undefined') {
                                remoteAudio.setSinkId(session.data.AudioOutputDevice).then(function () {
                                    console.log("sinkId applied: " + session.data.AudioOutputDevice);
                                }).catch(function (e) {
                                    console.warn("Error using setSinkId: ", e);
                                });
                            }
                            remoteAudio.play();
                        }

                    }
                }
                else {
                    console.warn("onSessionDescriptionHandler fired without a peerConnection");
                }
            }
            else {
                console.warn("onSessionDescriptionHandler fired without a sessionDescriptionHandler");
            }
        }
    }
    session.data.childsession = newSession;
    var inviterOptions = {
        requestDelegate: {
            onTrying: function (sip) {
                newCallStatus.html(lang.trying);
                session.data.transfer[transferId].disposition = "trying";
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                $("#line-msg").html(lang.attended_transfer_call_started);
            },
            onProgress: function (sip) {
                newCallStatus.html(lang.ringing);
                session.data.transfer[transferId].disposition = "progress";
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                $("#line-msg").html(lang.attended_transfer_call_started);

                var CancelAttendedTransferBtn = $("#line-btn-cancel-attended-transfer");
                CancelAttendedTransferBtn.off('click');
                CancelAttendedTransferBtn.on('click', function () {
                    newSession.cancel().catch(function (error) {
                        console.warn("Failed to CANCEL", error);
                    });
                    newCallStatus.html(lang.call_cancelled);
                    console.log("New call session canceled");

                    session.data.transfer[transferId].accept.complete = false;
                    session.data.transfer[transferId].accept.disposition = "cancel";
                    session.data.transfer[transferId].accept.eventTime = utcDateNow();

                    $("#line-msg").html(lang.attended_transfer_call_cancelled);


                });
                CancelAttendedTransferBtn.show();


            },
            onRedirect: function (sip) {
                console.log("Redirect received:", sip);
            },
            onAccept: function (sip) {
                newCallStatus.html(lang.call_in_progress);
                $("#line-btn-cancel-attended-transfer").hide();
                session.data.transfer[transferId].disposition = "accepted";
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                var CompleteTransferBtn = $("#line-btn-complete-attended-transfer");
                CompleteTransferBtn.off('click');
                CompleteTransferBtn.on('click', function () {
                    var transferOptions = {
                        requestDelegate: {
                            onAccept: function (sip) {
                                console.log("Attended transfer Accepted");

                                session.data.terminateby = "us";
                                session.data.reasonCode = 202;
                                session.data.reasonText = "Attended Transfer";

                                session.data.transfer[transferId].accept.complete = true;
                                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                                $("#line-msg").html(lang.attended_transfer_complete_accepted);



                                // We must end this session manually
                                session.bye().catch(function (error) {
                                    console.warn("Could not BYE after blind transfer:", error);
                                });

                                teardownSession(lineObj);
                            },
                            onReject: function (sip) {
                                console.warn("Attended transfer rejected:", sip);

                                session.data.transfer[transferId].accept.complete = false;
                                session.data.transfer[transferId].accept.disposition = sip.message.reasonPhrase;
                                session.data.transfer[transferId].accept.eventTime = utcDateNow();

                                $("#line-msg").html("Attended Transfer Failed!");


                            }
                        }
                    }

                    // Send REFER
                    session.refer(newSession, transferOptions).catch(function (error) {
                        console.warn("Failed to REFER", error);
                    });

                    newCallStatus.html(lang.attended_transfer_complete);


                });
                CompleteTransferBtn.show();



                var TerminateAttendedTransferBtn = $("#line-btn-terminate-attended-transfer");
                TerminateAttendedTransferBtn.off('click');
                TerminateAttendedTransferBtn.on('click', function () {
                    newSession.bye().catch(function (error) {
                        console.warn("Failed to BYE", error);
                    });
                    newCallStatus.html(lang.call_ended);
                    console.log("New call session end");

                    session.data.transfer[transferId].accept.complete = false;
                    session.data.transfer[transferId].accept.disposition = "bye";
                    session.data.transfer[transferId].accept.eventTime = utcDateNow();

                    $("#line-btn-complete-attended-transfer").hide();
                    $("#line-btn-cancel-attended-transfer").hide();
                    $("#line-btn-terminate-attended-transfer").hide();

                    $("#line-msg").html(lang.attended_transfer_call_ended);



                    window.setTimeout(function () {
                        newCallStatus.hide();
                        CancelTransferSession(lineNum);

                    }, 1000);
                });
                TerminateAttendedTransferBtn.show();


            },
            onReject: function (sip) {
                console.log("New call session rejected: ", sip.message.reasonPhrase);
                newCallStatus.html(lang.call_rejected);
                session.data.transfer[transferId].disposition = sip.message.reasonPhrase;
                session.data.transfer[transferId].dispositionTime = utcDateNow();

                $("#line-txt-FindTransfer").parent().show();
                $("#line-btn-blind-transfer").show();
                $("#line-btn-attended-transfer").show();

                $("#line-btn-complete-attended-transfer").hide();
                $("#line-btn-cancel-attended-transfer").hide();
                $("#line-btn-terminate-attended-transfer").hide();

                $("#line-msg").html(lang.attended_transfer_call_rejected);



                window.setTimeout(function () {
                    newCallStatus.hide();

                }, 1000);
            }
        }
    }
    newSession.invite(inviterOptions).catch(function (e) {
        console.warn("Failed to send INVITE:", e);
    });
}

//#endregion


//#region In-Session Call Functionality
// =============================

function holdSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;
    var session = lineObj.SipSession;
    if (session.isOnHold == true) {
        console.log("Call is is already on hold:", lineNum);
        return;
    }
    console.log("Putting Call on hold:", lineNum);
    session.isOnHold = true;

    var sessionDescriptionHandlerOptions = session.sessionDescriptionHandlerOptionsReInvite;
    sessionDescriptionHandlerOptions.hold = true;
    session.sessionDescriptionHandlerOptionsReInvite = sessionDescriptionHandlerOptions;

    var options = {
        requestDelegate: {
            onAccept: function () {
                if (session && session.sessionDescriptionHandler && session.sessionDescriptionHandler.peerConnection) {
                    var pc = session.sessionDescriptionHandler.peerConnection;
                    // Stop all the inbound streams
                    pc.getReceivers().forEach(function (RTCRtpReceiver) {
                        if (RTCRtpReceiver.track) RTCRtpReceiver.track.enabled = false;
                    });
                    // Stop all the outbound streams (especially useful for ujCollab Calls!!)
                    pc.getSenders().forEach(function (RTCRtpSender) {
                        // Mute Audio
                        if (RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                            if (RTCRtpSender.track.IsMixedTrack == true) {
                                if (session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio") {
                                    console.log("Muting Mixed Audio Track : " + session.data.AudioSourceTrack.label);
                                    session.data.AudioSourceTrack.enabled = false;
                                }
                            }
                            console.log("Muting Audio Track : " + RTCRtpSender.track.label);
                            RTCRtpSender.track.enabled = false;
                        }
                    });
                }
                session.isOnHold = true;
                console.log("Call is is on hold:", lineNum);

                $("#line-btn-Hold").hide();
                $("#line-btn-Unhold").show();
                $("#line-msg").html(lang.call_on_hold);

                // Log Hold
                if (!session.data.hold) session.data.hold = [];
                session.data.hold.push({ event: "hold", eventTime: utcDateNow() });
                // Custom Web hook
                $(document).trigger("uj_on_modify", ["hold", lineObj]);
            },
            onReject: function () {
                session.isOnHold = false;
                console.warn("Failed to put the call on hold:", lineNum);
            }
        }
    };
    session.invite(options).catch(function (error) {
        session.isOnHold = false;
        console.warn("Error attempting to put the call on hold:", error);
    });
}
function unholdSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;
    var session = lineObj.SipSession;
    if (session.isOnHold == false) {
        console.log("Call is already off hold:", lineNum);
        return;
    }
    console.log("Taking call off hold:", lineNum);
    session.isOnHold = false;

    var sessionDescriptionHandlerOptions = session.sessionDescriptionHandlerOptionsReInvite;
    sessionDescriptionHandlerOptions.hold = false;
    session.sessionDescriptionHandlerOptionsReInvite = sessionDescriptionHandlerOptions;

    var options = {
        requestDelegate: {
            onAccept: function () {
                if (session && session.sessionDescriptionHandler && session.sessionDescriptionHandler.peerConnection) {
                    var pc = session.sessionDescriptionHandler.peerConnection;
                    // Restore all the inbound streams
                    pc.getReceivers().forEach(function (RTCRtpReceiver) {
                        if (RTCRtpReceiver.track) RTCRtpReceiver.track.enabled = true;
                    });
                    // Restore all the outbound streams
                    pc.getSenders().forEach(function (RTCRtpSender) {
                        // Unmute Audio
                        if (RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
                            if (RTCRtpSender.track.IsMixedTrack == true) {
                                if (session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio") {
                                    console.log("Unmuting Mixed Audio Track : " + session.data.AudioSourceTrack.label);
                                    session.data.AudioSourceTrack.enabled = true;
                                }
                            }
                            console.log("Unmuting Audio Track : " + RTCRtpSender.track.label);
                            RTCRtpSender.track.enabled = true;
                        }
                    });
                }
                session.isOnHold = false;
                console.log("Call is off hold:", lineNum);

                $("#line-btn-Hold").show();
                $("#line-btn-Unhold").hide();
                $("#line-msg").html(lang.call_in_progress);

                // Log Hold
                if (!session.data.hold) session.data.hold = [];
                session.data.hold.push({ event: "unhold", eventTime: utcDateNow() });


                $(document).trigger("uj_on_modify", ["unhold", lineObj]);
            },
            onReject: function () {
                session.isOnHold = true;
                console.warn("Failed to put the call on hold", lineNum);
            }
        }
    };
    session.invite(options).catch(function (error) {
        session.isOnHold = true;
        console.warn("Error attempting to take to call off hold", error);
    });
}
function SpeakerOffSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;

    $("#line-btn-SpeakerOff").hide();
    $("#line-btn-SpeakerOn").show();

    var session = lineObj.SipSession;
    var pc = session.sessionDescriptionHandler.peerConnection;

    pc.getReceivers().forEach(function (RTCRtpReceiver) {
        if (RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio") {
            console.log("Disabling Speaker Audio Track : " + RTCRtpReceiver.track.label);
            RTCRtpReceiver.track.enabled = false; // Disables the audio output
        }
    });

    if (!session.data.speakerMute) session.data.speakerMute = [];
    session.data.speakerMute.push({ event: "speakerOff", eventTime: utcDateNow() });
    session.data.isSpeakerMute = true;

    $(document).trigger("uj_on_modify", ["speakerOff", lineObj]);
}

function SpeakerOnSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;

    $("#line-btn-SpeakerOff").show();
    $("#line-btn-SpeakerOn").hide();

    var session = lineObj.SipSession;
    var pc = session.sessionDescriptionHandler.peerConnection;

    pc.getReceivers().forEach(function (RTCRtpReceiver) {
        if (RTCRtpReceiver.track && RTCRtpReceiver.track.kind == "audio") {
            console.log("Enabling Speaker Audio Track : " + RTCRtpReceiver.track.label);
            RTCRtpReceiver.track.enabled = true; // Enables the audio output
        }
    });

    if (!session.data.speakerMute) session.data.speakerMute = [];
    session.data.speakerMute.push({ event: "speakerOn", eventTime: utcDateNow() });
    session.data.isSpeakerMute = false;

    $(document).trigger("uj_on_modify", ["speakerOn", lineObj]);
}

function MuteSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;

    $("#line-btn-Unmute").show();
    $("#line-btn-Mute").hide();

    var session = lineObj.SipSession;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if (RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if (RTCRtpSender.track.IsMixedTrack == true) {
                if (session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio") {
                    console.log("Muting Mixed Audio Track : " + session.data.AudioSourceTrack.label);
                    session.data.AudioSourceTrack.enabled = false;
                }
            }
            console.log("Muting Audio Track : " + RTCRtpSender.track.label);
            RTCRtpSender.track.enabled = false;
        }
    });

    if (!session.data.mute) session.data.mute = [];
    session.data.mute.push({ event: "mute", eventTime: utcDateNow() });
    session.data.ismute = true;


    $(document).trigger("uj_on_modify", ["mute", lineObj]);

}
function UnmuteSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;

    $("#line-btn-Unmute").hide();
    $("#line-btn-Mute").show();

    var session = lineObj.SipSession;
    var pc = session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach(function (RTCRtpSender) {
        if (RTCRtpSender.track && RTCRtpSender.track.kind == "audio") {
            if (RTCRtpSender.track.IsMixedTrack == true) {
                if (session.data.AudioSourceTrack && session.data.AudioSourceTrack.kind == "audio") {
                    console.log("Unmuting Mixed Audio Track : " + session.data.AudioSourceTrack.label);
                    session.data.AudioSourceTrack.enabled = true;
                }
            }
            console.log("Unmuting Audio Track : " + RTCRtpSender.track.label);
            RTCRtpSender.track.enabled = true;
        }
    });

    if (!session.data.mute) session.data.mute = [];
    session.data.mute.push({ event: "unmute", eventTime: utcDateNow() });
    session.data.ismute = false;

    $("#line-msg").html(lang.call_off_mute);

    // Custom Web hook
    $(document).trigger("uj_on_modify", ["unmute", lineObj]);
}
function endSession(lineNum) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;

    if (lineObj.SipSession.state == SIP.SessionState.Initial || lineObj.SipSession.state == SIP.SessionState.Establishing) {

        console.log("Cancelling session : " + lineNum);

        lineObj.SipSession.data.terminateby = "us";
        lineObj.SipSession.data.reasonCode = 0;
        lineObj.SipSession.data.reasonText = "Call Cancelled";

        lineObj.SipSession.cancel();

        $("#line-msg").html(lang.call_cancelled);

    } else {

        console.log("Ending call with: " + lineNum);
        lineObj.SipSession.data.terminateby = "us";
        lineObj.SipSession.data.reasonCode = 16;
        lineObj.SipSession.data.reasonText = "Normal Call clearing";

        lineObj.SipSession.bye().catch(function (e) {
            console.warn("Failed to bye the session!", e);
        });
        $("#line-msg").html(lang.call_ended);


    }

    teardownSession(lineObj);

}



function sendDTMF(lineNum, itemStr) {
    lineNum = lineNum || _selectedLine;
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) return;

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCDTMFSender/insertDTMF
    var options = {
        duration: 100,
        interToneGap: 70
    }

    if (lineObj.SipSession.isOnHold == true) {
        if (lineObj.SipSession.data.childsession) {
            if (lineObj.SipSession.data.childsession.state == SIP.SessionState.Established) {
                console.log("Sending DTMF (" + itemStr + "): " + 1 + " child session");

                var result = lineObj.SipSession.data.childsession.sessionDescriptionHandler.sendDtmf(itemStr, options);
                if (result) {
                    console.log("Sent DTMF (" + itemStr + ") child session");
                }
                else {
                    console.log("Failed to send DTMF (" + itemStr + ") child session");
                }
            }
            else {
                console.warn("Cannot Send DTMF (" + itemStr + "): " + 1 + " is on hold, and the child session is not established");
            }
        }
        else {
            console.warn("Cannot Send DTMF (" + itemStr + "): " + 1 + " is on hold, and there is no child session");
        }
    }
    else {
        if (lineObj.SipSession.state == SIP.SessionState.Established || lineObj.SipSession.state == SIP.SessionState.Establishing) {
            console.log("Sending DTMF (" + itemStr + "): " + 1);

            var result = lineObj.SipSession.sessionDescriptionHandler.sendDtmf(itemStr, options);
            if (result) {
                console.log("Sent DTMF (" + itemStr + ")");
            }
            else {
                console.log("Failed to send DTMF (" + itemStr + ")");
            }

            $("#line-msg").html(lang.send_dtmf + ": " + itemStr);



            // Custom Web hook
            if (typeof web_hook_on_dtmf !== 'undefined') web_hook_on_dtmf(itemStr, lineObj.SipSession);
        }
        else {
            console.warn("Cannot Send DTMF (" + itemStr + "): " + 1 + " session is not establishing or established");
        }
    }
}


function ShowCallTimeline(lineNum) {
    console.log("Show Timeline");
    RestoreCallControls(lineNum)

    if ($("#line-AudioStats").is(":visible")) {
        // The AudioStats is open, they can't take the same space
        HideCallStats(lineNum)
    }

    $("#line-CallDetails").show();

    $("#line-btn-ShowTimeline").hide();
    $("#line-btn-HideTimeline").show();
}
function HideCallTimeline(lineNum) {
    console.log("Hide Timeline");

    $("#line-CallDetails").hide();

    $("#line-btn-ShowTimeline").show();
    $("#line-btn-HideTimeline").hide();
}
function ShowCallStats(lineNum) {
    console.log("Show Call Stats");
    RestoreCallControls(lineNum)

    if ($("#line-CallDetails").is(":visible")) {
        // The Timeline is open, they can't take the same space
        HideCallTimeline(lineNum)
    }
    $("#line-AudioStats").show();

    $("#line-btn-ShowCallStats").hide();
    $("#line-btn-HideCallStats").show();
}
function HideCallStats(lineNum) {
    console.log("Hide Call Stats");

    $("#line-AudioStats").hide();

    $("#line-btn-ShowCallStats").show();
    $("#line-btn-HideCallStats").hide();
}
function ToggleMoreButtons(lineNum) {
    if ($("#line-btn-more").is(":visible")) {
        // The more buttons are showing, drop them down
        RestoreCallControls(lineNum);
    } else {
        ExpandCallControls(lineNum);
    }
}
function ExpandCallControls(lineNum) {
    $("#line-btn-more").show(200);
    $("#line-btn-ControlToggle").html('<i class=\"fa fa-chevron-down\"></i>');
}
function RestoreCallControls(lineNum) {
    $("#line-btn-more").hide(200);
    $("#line-btn-ControlToggle").html('<i class=\"fa fa-chevron-up\"></i>');
}


//#endregion

//#region Phone Lines
// ===========
var Line = function (lineNumber, displayName, displayNumber) {
    this.LineNumber = lineNumber;
    this.DisplayName = displayName;
    this.DisplayNumber = displayNumber;
    this.IsSelected = false;
    this.SipSession = null;
}
function ShowDial() {
    CloseUpSettings();
}
function handleDialInput(obj, event) {
    if (EnableAlphanumericDial) {
        $("#dialText").val($("#dialText").val().replace(/[^\da-zA-Z\*\#\+]/g, "").substring(0, MaxDidLength));
    }
    else {
        $("#dialText").val($("#dialText").val().replace(/[^\d\*\#\+]/g, "").substring(0, MaxDidLength));
    }
    if ($("#dialText").val().length > 0) {
        //$("#dialText").css("width", "138px");
        $("#dialDeleteKey").show();
    } else {
        //$("#dialText").css("width", "170px");
        $("#dialDeleteKey").hide();
    }
}
function dialOnkeydown(event, obj) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        event.preventDefault();
        DialByLine();

        return false;
    }
}
function KeyPress(num) {
    var currVal = $("#dialText").val();
    var textElObj = $("#dialText").get(0);
    var ss = textElObj.selectionStart;
    var se = textElObj.selectionEnd;
    var ln = currVal.length;

    var newValue = "";
    if (ss == se) {
        // Cursor is in a spot with no selection
        if (num == "del") {
            newValue = currVal.substring(0, ss - 1) + currVal.substring(se, ln);
        } else {
            newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        }
        $("#dialText").val(newValue.substring(0, MaxDidLength));
        $("#dialText").focus();
        if (num == "del") {
            textElObj.setSelectionRange(ss - 1, ss - 1);
        } else {
            textElObj.setSelectionRange(ss + 1, ss + 1);
        }
    } else {
        if (num == "del") {
            newValue = currVal.substring(0, ss) + currVal.substring(se, ln);
        } else {
            newValue = currVal.substring(0, ss) + num + currVal.substring(se, ln);
        }
        $("#dialText").val(newValue.substring(0, MaxDidLength));
        $("#dialText").focus();
        if (num == "del") {
            textElObj.setSelectionRange(ss, ss);
        } else {
            textElObj.setSelectionRange(ss + 1, ss + 1);
        }
    }

    if ($("#dialText").val().length > 0) {
        $("#dialText").css("width", "138px");
        $("#dialDeleteKey").show();
    } else {
        $("#dialText").css("width", "170px");
        $("#dialDeleteKey").hide();
    }
}
function CloseUpSettings() {
    // Microphone Preview
    try {
        settingsMicrophoneStreamTrack.stop();
        console.log("settingsMicrophoneStreamTrack... stopped");
    }
    catch (e) { }
    settingsMicrophoneStream = null;


    // Speaker Preview
    try {
        window.SettingsOutputAudio.pause();
    }
    catch (e) { }
    window.SettingsOutputAudio = null;

    try {
        var tracks = window.SettingsOutputStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
    }
    catch (e) { }
    window.SettingsOutputStream = null;

    window.SettingsOutputStreamMeter = null;

    // Ringer Preview
    try {
        window.SettingsRingerAudio.pause();
    }
    catch (e) { }
    window.SettingsRingerAudio = null;

    try {
        var tracks = window.SettingsRingerStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
    }
    catch (e) { }
    window.SettingsRingerStream = null;

    window.SettingsRingerStreamMeter = null;
}
function ShowContacts() {

    CloseUpSettings()

    $("#actionArea").hide();
    $("#actionArea").empty();
    $("#myContacts").show();
    $("#searchArea").show();
}
//#endregion


/**
 * Primary method for making a call. 
 * @param {string} displayName (required) Display Name of receiver.
 * @param {sting} numToDial (required) The number to dial.
 * @param {Array<string>} extraHeaders = (optional) Array of headers to include in the INVITE eg: ["foo: bar"] (Note the space after the :)
 */
function DialByLine(displayName, numToDial, extraHeaders) {

    var numDial = (numToDial) ? numToDial : $("#dialText").val();
    if (EnableAlphanumericDial) {
        numDial = numDial.replace(telAlphanumericRegEx, "").substring(0, MaxDidLength);
    }
    else {
        numDial = numDial.replace(telNumericRegEx, "").substring(0, MaxDidLength);
    }
    if (numDial.length == 0) {
        console.warn("Enter number to dial");
        return;
    }
    numDial = encodeURIComponent(numDial);
    // Create a Line
    _newLineNumber = _newLineNumber + 1;
    _lineObj = new Line(_newLineNumber, displayName, numDial);
    Lines.push(_lineObj);
    SelectLine(_newLineNumber);

    AudioCall(_lineObj, numDial, extraHeaders);
}
function SelectLine(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null) return;
    console.log("Selecting Line : " + lineObj.LineNumber);
    SwitchLines(lineObj.LineNumber);
}
function FindLineByNumber(lineNum) {
    for (var l = 0; l < Lines.length; l++) {
        if (Lines[l].LineNumber == lineNum) return Lines[l];
    }
    return null;
}

function RemoveLine(lineObj) {
    if (lineObj == null) return;

    var earlyReject = lineObj.SipSession.data.earlyReject;
    for (var l = 0; l < Lines.length; l++) {
        if (Lines[l].LineNumber == lineObj.LineNumber) {
            Lines.splice(l, 1);
            break;
        }
    }
}
function SwitchLines(lineNum) {
    $.each(userAgent.sessions, function (i, session) {
        // All the other calls, not on hold
        if (session.state == SIP.SessionState.Established) {
            if (session.isOnHold == false && session.data.line != lineNum) {
                holdSession(session.data.line);
            }
        }
        session.data.IsCurrentCall = false;
    });

    var lineObj = FindLineByNumber(lineNum);
    if (lineObj != null && lineObj.SipSession != null) {
        var session = lineObj.SipSession;
        if (session.state == SIP.SessionState.Established) {
            if (session.isOnHold == true) {
                unholdSession(lineNum)
            }
        }
        session.data.IsCurrentCall = true;
    }
    _selectedLine = lineNum;

    RefreshLineActivity(lineNum);
}
function RefreshLineActivity(lineNum) {
    var lineObj = FindLineByNumber(lineNum);
    if (lineObj == null || lineObj.SipSession == null) {
        return;
    }
    var session = lineObj.SipSession;

    var callDetails = [];

    var ringTime = 0;
    var CallStart = moment.utc(session.data.callstart.replace(" UTC", ""));
    var CallAnswer = null;
    if (session.data.startTime) {
        CallAnswer = moment.utc(session.data.startTime);
        ringTime = moment.duration(CallAnswer.diff(CallStart));
    }
    CallStart = CallStart.format("YYYY-MM-DD HH:mm:ss UTC")
    CallAnswer = (CallAnswer) ? CallAnswer.format("YYYY-MM-DD HH:mm:ss UTC") : null,
        ringTime = (ringTime != 0) ? ringTime.asSeconds() : 0

    var srcCallerID = "";
    var dstCallerID = "";
    if (session.data.calldirection == "inbound") {
        srcCallerID = "<" + session.remoteIdentity.uri.user + "> " + session.remoteIdentity.displayName;
    }
    else if (session.data.calldirection == "outbound") {
        dstCallerID = session.data.dst;
    }

    var startCallMessage = (session.data.calldirection == "inbound") ? lang.you_received_a_call_from + " " + srcCallerID  : lang.you_made_a_call_to + " " + dstCallerID ;
    callDetails.push({
        Message: startCallMessage,
        TimeStr: CallStart
    });
    if (CallAnswer) {
        var answerCallMessage = (session.data.calldirection == "inbound") ? lang.you_answered_after + " " + ringTime + " " + lang.seconds_plural : lang.they_answered_after + " " + ringTime + " " + lang.seconds_plural;
        callDetails.push({
            Message: answerCallMessage,
            TimeStr: CallAnswer
        });
    }

    var Transfers = (session.data.transfer) ? session.data.transfer : [];
    $.each(Transfers, function (item, transfer) {
        var msg = (transfer.type == "Blind") ? lang.you_started_a_blind_transfer_to + " " + transfer.to + ". " : lang.you_started_an_attended_transfer_to + " " + transfer.to + ". ";
        if (transfer.accept && transfer.accept.complete == true) {
            msg += lang.the_call_was_completed
        }
        else if (transfer.accept.disposition != "") {
            msg += lang.the_call_was_not_completed + " (" + transfer.accept.disposition + ")"
        }
        callDetails.push({
            Message: msg,
            TimeStr: transfer.transferTime
        });
    });
    var Mutes = (session.data.mute) ? session.data.mute : []
    $.each(Mutes, function (item, mute) {
        callDetails.push({
            Message: (mute.event == "mute") ? lang.you_put_the_call_on_mute : lang.you_took_the_call_off_mute,
            TimeStr: mute.eventTime
        });
    });
    var Holds = (session.data.hold) ? session.data.hold : []
    $.each(Holds, function (item, hold) {
        callDetails.push({
            Message: (hold.event == "hold") ? lang.you_put_the_call_on_hold : lang.you_took_the_call_off_hold,
            TimeStr: hold.eventTime
        });
    });
    var ConfbridgeEvents = (session.data.ConfbridgeEvents) ? session.data.ConfbridgeEvents : []
    $.each(ConfbridgeEvents, function (item, event) {
        callDetails.push({
            Message: event.event,
            TimeStr: event.eventTime
        });
    });
    var Recordings = (session.data.recordings) ? session.data.recordings : []
    $.each(Recordings, function (item, recording) {
        var msg = lang.call_is_being_recorded;
        if (recording.startTime != recording.stopTime) {
            msg += "(" + lang.now_stopped + ")"
        }
        callDetails.push({
            Message: msg,
            TimeStr: recording.startTime
        });
    });
    var ConfCalls = (session.data.confcalls) ? session.data.confcalls : []
    $.each(ConfCalls, function (item, confCall) {
        var msg = lang.you_started_a_ujCollab_call_to + " " + confCall.to + ". ";
        if (confCall.accept && confCall.accept.complete == true) {
            msg += lang.the_call_was_completed
        }
        else if (confCall.accept.disposition != "") {
            msg += lang.the_call_was_not_completed + " (" + confCall.accept.disposition + ")"
        }
        callDetails.push({
            Message: msg,
            TimeStr: confCall.startTime
        });
    });

    callDetails.sort(function (a, b) {
        var aMo = moment.utc(a.TimeStr.replace(" UTC", ""));
        var bMo = moment.utc(b.TimeStr.replace(" UTC", ""));
        if (aMo.isSameOrAfter(bMo, "second")) {
            return -1;
        } else return 1;
        return 0;
    });

    $(document).trigger("uj_refresh_CallActivity", callDetails);
}

function DeleteCallRecordings(stream) {
    if (CallRecordingsIndexDb != null) {
        // Loop and Delete
        // Note: This database can only delete based on Primary Key
        // The Primary Key is arbitrary, but is saved in item.Recordings.uID
        $.each(stream.DataCollection, function (i, item) {
            if (item.ItemType == "CDR" && item.Recordings && item.Recordings.length) {
                $.each(item.Recordings, function (i, recording) {
                    console.log("Deleting Call Recording: ", recording.uID);
                    var objectStore = CallRecordingsIndexDb.transaction(["Recordings"], "readwrite").objectStore("Recordings");
                    try {
                        var deleteRequest = objectStore.delete(recording.uID);
                        deleteRequest.onsuccess = function (event) {
                            console.log("Call Recording Deleted: ", recording.uID);
                        }
                    } catch (e) {
                        console.log("Call Recording Delete failed: ", e);
                    }
                });
            }
        });
    }
    else {
        console.warn("CallRecordingsIndexDb is null.");
    }
}
function ToggleExtraButtons(lineNum, normal, expanded) {
    var extraButtons = $("#contact-extra-buttons");
    if (extraButtons.is(":visible")) {
        // Restore
        extraButtons.hide()
        $("#contact-action-buttons").css("width", normal + "px");
    } else {
        // Expand
        extraButtons.show()
        $("#contact-action-buttons").css("width", expanded + "px");
    }
}
function ShowChatMenu(obj) {
    $(obj).children("span").show();
}
function HideChatMenu(obj) {
    $(obj).children("span").hide();
}
function ExpandMessage(obj, ItemId) {
    $("#msg-text-" + ItemId).css("max-height", "");
    $("#msg-text-" + ItemId).css("overflow", "");
    $("#msg-readmore-" + ItemId).remove();

}
//#endregion


// Device Detection
// ================
function DetectDevices() {
    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        // deviceInfos will not have a populated lable unless to accept the permission
        // during getUserMedia. This normally happens at startup/setup
        // so from then on these devices will be with lables.
        HasVideoDevice = false;
        HasAudioDevice = false;
        HasSpeakerDevice = false; // Safari and Firefox don't have these
        AudioinputDevices = [];
        VideoinputDevices = [];
        SpeakerDevices = [];
        for (var i = 0; i < deviceInfos.length; ++i) {
            if (deviceInfos[i].kind === "audioinput") {
                HasAudioDevice = true;
                AudioinputDevices.push(deviceInfos[i]);
            }
            else if (deviceInfos[i].kind === "audiooutput") {
                HasSpeakerDevice = true;
                SpeakerDevices.push(deviceInfos[i]);
            }
        }
    }).catch(function (e) {
        console.error("Error enumerating devices", e);
    });
}
DetectDevices();
window.setInterval(function () {
    DetectDevices();
}, 10000);

// =================================================================================

let lang = {
    "create_group": "Create Group",
    "add_someone": "Add Someone",
    "find_someone": "Find someone...",
    "refresh_registration": "Refresh Registration",
    "configure_extension": "Configure Extension",
    "auto_answer": "Auto Answer",
    "do_no_disturb": "Do Not Disturb",
    "call_waiting": "Call Waiting",
    "record_all_calls": "Record All Calls",
    "extension_number": "Extension Number",
    "email": "Email",
    "mobile": "Mobile",
    "alternative_contact": "Alternate Contact",
    "full_name": "Full Name",
    "eg_full_name": "eg: Keyla James",
    "title_description": "Title / Description",
    "eg_general_manager": "eg: General Manager",
    "internal_subscribe_extension": "Subscribe Extension (Internal)",
    "eg_internal_subscribe_extension": "eg: 100 or john",
    "mobile_number": "Mobile Number",
    "eg_mobile_number": "eg: +44 123-456 7890",
    "eg_email": "eg: Keyla.James@innovateasterisk.com",
    "contact_number_1": "Contact Number 1",
    "eg_contact_number_1": "eg: +1 234 567 8901",
    "contact_number_2": "Contact Number 2",
    "eg_contact_number_2": "eg: +441234567890",
    "add": "Add",
    "cancel": "Cancel",
    "save": "Save",
    "reload_required": "Reload Required",
    "alert_settings": "In order to apply these settings, the page must reload, OK?",
    "account": "Account",
    "audio_video": "Audio & Video",
    "appearance": "Appearance",
    "notifications": "Notifications",
    "asterisk_server_address": "Secure WebSocket Server (TLS)",
    "eg_asterisk_server_address": "eg: ws.innovateasterisk.com",
    "websocket_port": "WebSocket Port",
    "eg_websocket_port": "eg: 4443",
    "websocket_path": "WebSocket Path",
    "eg_websocket_path": "/ws",
    "sip_domain": "Domain",
    "eg_sip_domain": "eg: innovateasterisk.com",
    "sip_username": "SIP Username",
    "eg_sip_username": "eg: webrtc",
    "sip_password": "SIP Password",
    "eg_sip_password": "eg: 1234",
    "speaker": "Speaker",
    "microphone": "Microphone",
    "camera": "Camera",
    "frame_rate": "Frame Rate (per second)",
    "quality": "Quality",
    "image_orientation": "Image Orientation",
    "image_orientation_normal": "Normal",
    "image_orientation_mirror": "Mirror",
    "aspect_ratio": "Aspect Ratio",
    "preview": "Preview",
    "ringtone": "Ringtone",
    "ring_device": "Ring Device",
    "auto_gain_control": "Auto Gain Control",
    "echo_cancellation": "Echo Cancellation",
    "noise_suppression": "Noise Suppression",
    "enable_onscreen_notifications": "Enabled Onscreen Notifications",
    "alert_notification_permission": "You need to accept the permission request to allow Notifications",
    "permission": "Permission",
    "error": "Error",
    "alert_media_devices": "MediaDevices was null -  Check if your connection is secure (HTTPS)",
    "alert_error_user_media": "Error getting User Media.",
    "alert_file_size": "The file is bigger than 50MB, you cannot upload this file",
    "alert_single_file": "Select a single file",
    "alert_not_found": "This item was not found",
    "edit": "Edit",
    "welcome": "Welcome",
    "accept": "Accept",
    "registered": "Registered",
    "registration_failed": "Registration Failed",
    "unregistered": "Unregistered, bye!",
    "connected_to_web_socket": "Connected to Web Socket!",
    "disconnected_from_web_socket": "Disconnected from Web Socket!",
    "web_socket_error": "Web Socket Error",
    "connecting_to_web_socket": "Connecting to Web Socket...",
    "error_connecting_web_socket": "Error connecting to the server on the WebSocket port",
    "sending_registration": "Sending Registration...",
    "unsubscribing": "Unsubscribing...",
    "disconnecting": "Disconnecting...",
    "incoming_call": "Incoming Call",
    "incoming_call_from": "Incoming call from:",
    "answer_call": "Answer Call",
    "reject_call": "Reject Call",
    "call_failed": "Call Failed",
    "alert_no_microphone": "Sorry, you don't have any Microphone connected to this computer. You cannot receive calls.",
    "call_in_progress": "Call in Progress!",
    "call_rejected": "Call Rejected",
    "trying": "Trying...",
    "ringing": "Ringing...",
    "call_cancelled": "Call Cancelled",
    "call_ended": "Call ended, bye!",
    "yes": "Yes",
    "no": "No",
    "receive_kilobits_per_second": "Receive Kilobits per second",
    "receive_packets_per_second": "Receive Packets per second",
    "receive_packet_loss": "Receive Packet Loss",
    "receive_jitter": "Receive Jitter",
    "receive_audio_levels": "Receive Audio Levels",
    "send_kilobits_per_second": "Send Kilobits Per Second",
    "send_packets_per_second": "Send Packets Per Second",
    "state_not_online": "Not online",
    "state_ready": "Ready",
    "state_on_the_phone": "On the phone",
    "state_ringing": "Ringing",
    "state_on_hold": "On hold",
    "state_unavailable": "Unavailable",
    "state_unknown": "Unknown",
    "alert_empty_text_message": "Please enter something into the text box provided and click send",
    "no_message": "No Message",
    "message_from": "Message from",
    "call_extension": "Call Extension",
    "call_mobile": "Call Mobile",
    "call_number": "Call Number",
    "call_group": "Call Group",
    "starting_audio_call": "Starting Audio Call...",
    "call_recording_started": "Call Recording Started",
    "call_recording_stopped": "Call Recording Stopped",
    "confirm_stop_recording": "Are you sure you want to stop recording this call?",
    "stop_recording": "Stop Recording?",
    "width": "Width",
    "height": "Height",
    "extension": "Extension",
    "call_blind_transfered": "Call Blind Transferred",
    "connecting": "Connecting...",
    "attended_transfer_call_started": "Attended Transfer Call Started...",
    "attended_transfer_call_cancelled": "Attended Transfer Call Cancelled",
    "attended_transfer_complete_accepted": "Attended Transfer Complete (Accepted)",
    "attended_transfer_complete": "Attended Transfer complete",
    "attended_transfer_call_ended": "Attended Transfer Call Ended",
    "attended_transfer_call_rejected": "Attended Transfer Call Rejected",
    "attended_transfer_call_terminated": "Attended Transfer Call Terminated",
    "null_session": "Session Error, Null",
    "call_on_hold": "Call on Hold",
    "send_dtmf": "Sent DTMF",
    "switching_to_canvas": "Switching to canvas",
    "switching_to_shared_screen": "Switching to Shared Screen",
    "line": "Line",
    "back": "Back",
    "audio_call": "Audio Call",
    "find_something": "Find Something",
    "remove": "Remove",
    "present": "Present",
    "scratchpad": "Scratchpad",
    "screen": "Screen",
    "blank": "Blank",
    "show_key_pad": "Show Key Pad",
    "mute": "Mute",
    "unmute": "Unmute",
    "start_call_recording": "Start Call Recording",
    "stop_call_recording": "Stop Call Recording",
    "transfer_call": "Transfer Call",
    "cancel_transfer": "Cancel Transfer",
    "hold_call": "Hold Call",
    "resume_call": "Resume Call",
    "end_call": "End Call",
    "search_or_enter_number": "Search or enter number",
    "blind_transfer": "Blind Transfer",
    "attended_transfer": "Attended Transfer",
    "complete_transfer": "Complete Transfer",
    "end_transfer_call": "End Transfer Call",
    "call": "Call",
    "cancel_call": "Cancel Call",
    "microphone_levels": "Microphone Levels",
    "speaker_levels": "Speaker Levels",
    "send_statistics": "Send Statistics",
    "receive_statistics": "Receive Statistics",
    "find_something_in_the_message_stream": "Find something in the message stream...",
    "type_your_message_here": "Type your message here...",
    "menu": "Menu",
    "read_more": "Read More",
    "started": "Started",
    "stopped": "Stopped",
    "recording_duration": "Recording Duration",
    "an_audio_call": "an audio call",
    "you_tried_to_make": "You tried to make",
    "you_made": "You made",
    "and_spoke_for": "and spoke for",
    "you_missed_a_call": "You missed a call",
    "you_received": "You received",
    "second_single": "second",
    "seconds_plural": "seconds",
    "minute_single": "minute",
    "minutes_plural": "minutes",
    "hour_single": "hour",
    "hours_plural": "hours",
    "bytes": "Bytes",
    "kb": "KB",
    "mb": "MB",
    "gb": "GB",
    "tb": "TB",
    "pb": "PB",
    "eb": "EB",
    "zb": "ZB",
    "yb": "YB",
    "call_on_mute": "Call on Mute",
    "call_off_mute": "Call off Mute",
    "tag_call": "Tag Call",
    "clear_flag": "Clear Flag",
    "flag_call": "Flag Call",
    "edit_comment": "Edit Comment",
    "copy_message": "Copy Message",
    "quote_message": "Quote Message",
    "select_expression": "Select Expression",
    "dictate_message": "Dictate Message",
    "alert_speech_recognition": "Your browser does not support this function, sorry",
    "speech_recognition": "Speech Recognition",
    "im_listening": "I'm listening...",
    "msg_silence_detection": "You were quiet for a while so voice recognition turned itself off.",
    "msg_no_speech": "No speech was detected. Try again.",
    "loading": "Loading...",
    "ok": "OK",
    "device_settings": "Device Settings",
    "call_stats": "Call Stats",
    "you_received_a_call_from": "You received a call from",
    "you_made_a_call_to": "You made a call to",
    "you_answered_after": "You answered after",
    "they_answered_after": "They answered after",
    "you_started_a_blind_transfer_to": "You started a blind transfer to",
    "you_started_an_attended_transfer_to": "You started an attended transfer to",
    "the_call_was_completed": "The call was completed.",
    "the_call_was_not_completed": "The call was not completed.",
    "you_put_the_call_on_mute": "You put the call on mute.",
    "you_took_the_call_off_mute": "You took the call off mute.",
    "you_put_the_call_on_hold": "You put the call on hold.",
    "you_took_the_call_off_hold": "You took the call off hold.",
    "you_ended_the_call": "You ended the call.",
    "they_ended_the_call": "They ended the call.",
    "call_is_being_recorded": "Call is being recorded.",
    "now_stopped": "Now Stopped",
    "show_call_detail_record": "Show Call Detail Record",
    "call_detail_record": "Call Detail Record",
    "call_direction": "Call Direction",
    "call_date_and_time": "Call Date & Time",
    "ring_time": "Ring Time",
    "talk_time": "Talk Time",
    "call_duration": "Call Duration",
    "flagged": "Flagged",
    "call_tags": "Call Tags",
    "call_notes": "Call Notes",
    "activity_timeline": "Activity Timeline",
    "call_recordings": "Call Recordings",
    "save_as": "Save As",
    "right_click_and_select_save_link_as": "Right click and select Save Link As",
    "send": "Send",
    "set_status": "Set Status",
    "default_status": "(No Status)",
    "is_typing": "is typing",
    "chat_engine": "Chat Engine",
    "xmpp_server_address": "Secure XMPP Server (TLS)",
    "eg_xmpp_server_address": "eg: xmpp.innovateasterisk.com",
    "allow_calls_on_dnd": "Allow calls during Do Not Disturb",
    "basic_extension": "Basic Extension",
    "extension_including_xmpp": "Extension including Message Exchange",
    "addressbook_contact": "Address Book Contact",
    "subscribe_to_dev_state": "Subscribe to Device State Notifications",
    "subscribe_voicemail": "Subscribe to VoiceMail (MWI)",
    "voicemail_did": "VoiceMail Management Number",
    "filter_and_sort": "Filter and Sort",
    "voice_mail": "VoiceMail",
    "you_have_new_voice_mail": "You have {0} new VoiceMail messages.",
    "new_voice_mail": "New VoiceMail Message"
}
let codes = {
    "400": "Corret the Number format",
    "403": "Call Failed. Try again or check balance.",
    "404": "Calling Network is not Responding",
    "480": "Called Number is not Available",
    "486": "Called Number is busy",
    "487": "Called Number cancelled the call",
    "488": "Audio/video format issue",
    "501": "Internal system error",
    "502": "CalledNetwork is not Responding",
    "503": "Calling Network is down or overloaded",
    "504": "Calling Network is not Responding",
}


// #region Handle UI

function addNumber2(digit) {
    const input = document.getElementById('dialText');
    input.value += digit;
}

function web_hook_on_register() {
    $(".uj-divDialPad").show();
    $("#regStatus").hide();
}

function web_hook_on_invite(session) {
    $("#uj-webphone-widget").show();
    $(".uj-DivAnswerCall").show();
    $(".uj-divDialPad").hide();
    $(".uj-divInCallContainer").hide();
    ShowCallerInfo(session);
}

function ShowCallerInfo(session) {
    if (!session) return;
    $(".uj-avatar").show();
    $(".callingDisplayNumber").text(decodeURIComponent(session.DisplayNumber))
    $(".callingDisplayName").text(session.DisplayName || decodeURIComponent(session.DisplayNumber))
    if (session.DisplayName) {
        $(".uj-avatar").find("i.fa").hide();
        let nameParts = session.DisplayName.trim().split(" ");
        let initials = "";
        if (nameParts.length > 1) {
            initials = nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
        } else {
            initials = nameParts[0].substring(0, 2).toUpperCase();
        }
        $(".uj-avatar").find(".uj-name-prefix").show().text(initials);
    } else {
        $(".uj-avatar").find("i.fa").show();
        $(".uj-avatar").find(".uj-name-prefix").hide();
    }

}

function CallInitiated(t, session) {
    $(".uj-divInCallContainer").show();

    $(".uj-divDialPad").hide();
    $(".uj-divDTMFmenu").hide();
    $("#line-Transfer").hide();
    $("#line-btn-HideDTMF").hide();
    $(".uj-DivAnswerCall").hide();

    $("#line-txt-FindTransfer").val("");


    // Buttons 

    if(decodeURIComponent(session.DisplayNumber).indexOf("555#")==0){
        $("#line-btn-ShowDtmf").hide();
        $("#line-btn-Transfer").hide();
    }else{
        $("#line-btn-ShowDtmf").show();
        $("#line-btn-Transfer").show();
    }

    $("#line-btn-SpeakerOff").show();
    $("#line-btn-Mute").show();
    $("#line-btn-Hold").show();
    $("#line-btn-End").show();

    $("#line-btn-Unhold").hide();
    $("#line-btn-SpeakerOn").hide();
    $("#line-btn-Unmute").hide();
    $("#line-btn-CancelTransfer").hide();
    ShowCallerInfo(session);
}

function RegisterEvents() {

    $(document).on("uj_terminate", function (event, line) {
        if (_selectedLine == line.LineNumber || line.IsSelected == false) {
            var statusCode = line.SipSession.data.reasonCode;
            $(".uj-divDialPad").show();
            $("#dialText").val("");
            $(".uj-divInCallContainer").hide();
            $(".uj-DivAnswerCall").hide();
            var msg = codes[statusCode] || `Status : ${statusCode} `;
            $(".uj-notif").text(msg).fadeIn('fast').delay(3000).fadeOut('slow')
            console.log(" Call Teminated ==== > ", statusCode, msg)
        }
    });

    $(document).on("uj_Outbound_initiated", function (event, session) {
        CallInitiated("out", session)
    });

    $(document).on("uj_refresh_CallActivity", function (event, callDetails) {
        console.log("refreshCallActivity", callDetails);
    });

    $(document).on("uj_on_modify", function (event, action, session) {
        if (action == "mute") {
            $("#line-btn-Unmute").show();
            $("#line-btn-Mute").hide();
        }
        if (action == "unmute") {

        }
        if (action == "accepted") {
            CallInitiated('in',session)
        }
        if (action == "trying") {

        }
        if (action == "progress") {

        }
        if (action == "trackAdded") {

        }
        if (action == "hold") {

        }
        if (action == "unhold") {

        }
    });

}
function ShowDtmfMenu(show) {
    if (show) {
        $(".uj-inCallButtons,.uj-avatar").hide();
        $(".uj-divDTMFmenu").show();
        $("#line-btn-HideDTMF").show();
    } else {
        $(".uj-inCallButtons,.uj-avatar").show();
        $(".uj-divDTMFmenu").hide();
        $("#line-btn-HideDTMF").hide();
    }
}
// #endregion