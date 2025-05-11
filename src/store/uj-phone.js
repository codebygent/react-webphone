import $ from 'jquery';
import * as SIP from 'sip.js';
import moment from 'moment';
import { Line } from '../types/line.types';
import { message } from 'antd';
import useHistoryStore from './history.store';

//#region Global Settings
// ===============
const appversion = "0.3.29";
const sipjsversion = "0.20.0";
const navUserAgent = window.navigator.userAgent;  // TO DO change to Navigator.userAgentData
const localDB = window.localStorage;

let profileUserID = null;   // Internal reference ID. (DON'T CHANGE THIS!)
let profileName = null;     // eg: Keyla James
let wssServer = null;       // eg: raspberrypi.local
let WebSocketPort = null;   // eg: 444 | 4443 
let ServerPath = null;      // eg: /ws
let SipDomain = null;       // eg: raspberrypi.local
let SipUsername = null;     // eg: webrtc
let SipPassword = null;     // eg: webrtc

let TransportConnectionTimeout = 15;          // The timeout in seconds for the initial connection
let TransportReconnectionAttempts = 999;      // Number of reconnection attempts
let TransportReconnectionTimeout = 3;         // Seconds between reconnection attempts

let VoiceMailSubscribe = false;               // Enable Subscribe to voicemail
let SubscribeVoicemailExpires = 300;         // Voicemail Subscription expiry time (seconds)
let ContactUserName = "";                     // Optional name for contact header uri
let hostingPrefix = "/";                       // Optional prefix
let userAgentStr = "Browser Phone " + appversion + " (SIPJS - " + sipjsversion + ") " + navUserAgent;
let RegisterExpires = 300;                    // Registration expiry time (seconds)
let RegisterExtraHeaders = "{}";              // Headers for register process
let RegisterExtraContactParams = "{}";        // Parameters for contact header
let RegisterContactParams = "{}";             // Parameters for contact URI
let WssInTransport = true;                    // Use wss in SIP URIs
let IpInContact = true;                       // Use IP in Contact header
let BundlePolicy = "balanced";                // SDP Media Bundle policy
let IceStunServerJson = "";                   // ICE Server config
let IceStunCheckTimeout = 500;                // ICE/STUN timeout (ms)
let InviteExtraHeaders = "{}";                // Extra headers for INVITE

let NoAnswerTimeout = 120;                    // Auto Busy Here timeout
let AutoAnswerEnabled = false;                // Auto answer calls
let DoNotDisturbEnabled = false;              // Reject inbound calls
let CallWaitingEnabled = true;                // Allow call waiting

let AutoGainControl = true;                   // Auto mic volume
let EchoCancellation = true;                  // Remove echo
let NoiseSuppression = true;                  // Reduce noise


let MaxDidLength = 16;                        // Max DID length

// Permission Settings
let AutoAnswerPolicy = "allow";               // Auto answer policy
let DoNotDisturbPolicy = "allow";             // DND policy  
let IntercomPolicy = "enabled";               // Intercom policy
let EnableAlphanumericDial = false;           // Allow alpha characters in dialing
let EnableRingtone = true;                    // Enable ringtone

// System variables
// ================
let userAgent = null;
let _selectedLine = null;
let alertObj = null;
let HasAudioDevice = false;
let HasSpeakerDevice = false;
let AudioinputDevices = [];
let SpeakerDevices = [];
let Lines = [];
let audioBlobs = {}
let _newLineNumber = 0;
let _lineObj = null;
let telNumericRegEx = /[^\d\*\#\+]/g
let telAlphanumericRegEx = /[^\da-zA-Z\*\#\+\-\_\.\!\~\'\(\)]/g

//#endregion

//#region Utilities
// =========
function utcDateNow() {
    return moment().utc().format("YYYY-MM-DD HH:mm:ss UTC");
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
//#endregion


// #region Init UI
// =======

export function InitUi(data) {

    $("#regStatus").html("Starting connection ....")
    profileName = data.userDisplayName;
    wssServer = data.wsDomain;
    SipDomain = data.sipDomain;
    SipUsername = data.username;
    SipPassword = data.password;
    profileUserID = data.extensionId;

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
    lineObj.SipSession.data = {
        line: 1,
        calldirection: "inbound",
        terminateby: "",
        src: did,
        callstart: startTime.format("YYYY-MM-DD HH:mm:ss UTC"),
        callTimer: window.setInterval(function () {
            var now = moment.utc();
            var duration = moment.duration(now.diff(startTime));
            var timeStr = formatShortDuration(duration.asSeconds());
            $("#line-timer").html(timeStr);
            $("#line-datetime").html(timeStr);
        }, 1000),
        earlyReject: false,
        startTime: null
    };
    Lines.push(lineObj);
    // Session Delegates
    lineObj.SipSession.delegate = {
        onBye: function (sip) {
            onSessionReceivedBye(lineObj, sip)
        },
        onMessage: function (sip) {
            // onSessionReceivedMessage(lineObj, sip);
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

    // Add call to history
    const { addCall } = useHistoryStore.getState();
    
    // Calculate duration
    const duration = session.data.startTime ? 
        moment.duration(moment.utc().diff(moment.utc(session.data.startTime))).asSeconds() : 0;

    // Add to history store
    addCall({
        number: decodeURIComponent(session.data.dst || session.data.src),
        name: session.DisplayName || 'Unknown',
        direction: session.data.calldirection,
        duration: duration,
        status: determineCallStatus(session),
        timestamp: moment.utc().format(),
        recording: session.data.recording || null,
        status : duration > 0 ? 'answered' : 'missed'
    });

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

function determineCallStatus(session) {
    if (session.data.terminateby === "us") {
        return "ended";
    }
    if (session.data.reasonCode === 486) {
        return "rejected";
    }
    if (session.data.earlyReject) {
        return "rejected";
    }
    if (!session.data.startTime) {
        return "missed";
    }
    return "completed";
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
//#endregion

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
            // onSessionReceivedMessage(lineObj, sip);
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


//#region Call Transfer
// =============
export function StartTransferSession(lineNum) {
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
export function CancelTransferSession(lineNum) {
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
export function BlindTransfer(lineNum) {
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
export function AttendedTransfer(lineNum) {
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

export function holdSession(lineNum) {
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
export function unholdSession(lineNum) {
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
export function SpeakerOffSession(lineNum) {
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

export function SpeakerOnSession(lineNum) {
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

export function MuteSession(lineNum) {
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
export function UnmuteSession(lineNum) {
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
export function endSession(lineNum) {
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

/**
 * Primary method for sending DTMF. 
 * @param {number} lineNum (optional) Line number.
 * @param {number} itemStr (required) The number to send as DTMF.
 */
export function sendDTMF(lineNum, itemStr) {
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
        }
        else {
            console.warn("Cannot Send DTMF (" + itemStr + "): " + 1 + " session is not establishing or established");
        }
    }
}

//#endregion

//#region Phone Lines
// ===========

/**
 * Primary method for making a call. 
 * @param {string} displayName (required) Display Name of receiver.
 * @param {sting} numToDial (required) The number to dial.
 * @param {Array<string>} extraHeaders = (optional) Array of headers to include in the INVITE eg: ["foo: bar"] (Note the space after the :)
 */
export function DialByLine(displayName, numToDial, extraHeaders) {

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

}

//#endregion

//#region Device Detection
// ================
function DetectDevices() {
    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        // deviceInfos will not have a populated lable unless to accept the permission
        // during getUserMedia. This normally happens at startup/setup
        // so from then on these devices will be with lables.
        HasAudioDevice = false;
        HasSpeakerDevice = false; // Safari and Firefox don't have these
        AudioinputDevices = [];
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
//#endregion

// #region Handle UI

function Alert(msg) {
    console.log(msg);
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

    if (decodeURIComponent(session.DisplayNumber).indexOf("555#") == 0) {
        $("#line-btn-ShowDtmf").hide();
        $("#line-btn-Transfer").hide();
    } else {
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
    // Remove existing document events
    $(document).off("uj_terminate");
    $(document).off("uj_Outbound_initiated");
    $(document).off("uj_refresh_CallActivity");
    $(document).off("uj_on_modify");


    $(document).on("uj_terminate", function (event, line) {
        if (_selectedLine == line.LineNumber || line.IsSelected == false) {
            var statusCode = line.SipSession.data.reasonCode;
            $(".uj-divDialPad").show();
            $("#dialText").val("");
            $(".uj-divInCallContainer").hide();
            $(".uj-DivAnswerCall").hide();
            var msg = codes[statusCode] || `Status : ${statusCode} `;
            message.error(msg);
            console.log(" Call Teminated ==== > ", statusCode, msg, line)
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
            CallInitiated('in', session)
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

    //#region Window and Document Events
    // ==========================

    // Remove existing window events
    $(window).off("beforeunload");
    $(window).off("unload");
    $(window).off("offline");
    $(window).off("online");

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

    //#endregion


}

export function ShowDtmfMenu(show) {
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