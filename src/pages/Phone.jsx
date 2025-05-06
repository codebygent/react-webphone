import '../assets/styles/uj-phone.scss';
import DialPad from '../components/phone/DialPad';


export default function Phone() {

  const handleDigitClick = (digit) => {
    // This will replace the addNumber2 function
    // You can implement your digit handling logic here
    const dialText = document.getElementById('dialText');
    if (dialText) {

    }
  };
  return (

    <div id="uj-webphone-widget" className="uj-webrtc-container" >
      <h3><b id="regStatus">Starting connection ....</b></h3>
      <div className="uj-notif"></div>
      <div className="uj-divInCallContainer hidden">
        <div className="flex flex-col items-center div-height" >
          <div className="text-center">
            <audio id="line-transfer-remoteAudio" className="d-none" > </audio>
            <audio id="line-conference-remoteAudio" className="d-none" > </audio>
            <audio id="line-remoteAudio" className="d-none" > </audio>

            <div className="text-center">
              <div className="uj-avatar">
                <i className="fa fa-user fa-5x" ></i>
                <span className="uj-name-prefix"></span>
              </div>
              <div className="callingDisplayName">Unknown</div>
              <div className="callingDisplayNumber"></div>
            </div>
            <h3><span id="line-timer" ></span></h3>
            <span id="line-msg"></span>
          </div>

          <div className="uj-inCallButtons grid grid-cols-3 gap-4 mt-8">
            <button id="line-btn-SpeakerOff" data-onclick="SpeakerOffSession()" className="uj-btn" title="Voice Off">
              <i className="fa fa-volume-off "></i>
              <span>Speaker Off</span>
            </button>

            <button id="line-btn-SpeakerOn" data-onclick="SpeakerOnSession()" className="uj-btn uj-btn-red d-none" title="Voice On">
              <i className="fa fa-volume-up "></i>
              <span>Speaker On</span>
            </button>

            <button id="line-btn-Mute" data-onclick="MuteSession()" className="uj-btn" title="Mute">
              <i className="fa fa-microphone-slash "></i>
              <span>Mute</span>
            </button>

            <button id="line-btn-Unmute" data-onclick="UnmuteSession()" className="uj-btn uj-btn-red d-none" title="Unmute">
              <i className="fa fa-microphone "></i>
              <span>Unmute</span>
            </button>

            <button id="line-btn-Hold" data-onclick="holdSession()" className="uj-btn" title="Hold Call">
              <i className="fa fa-pause "></i>
              <span>Hold</span>
            </button>

            <button id="line-btn-Unhold" data-onclick="unholdSession()" className="uj-btn uj-btn-red d-none" title="Resume Call">
              <i className="fa fa-play "></i>
              <span>Resume</span>
            </button>
            <button id="line-btn-ShowDtmf" data-onclick="ShowDtmfMenu(true)" className="uj-btn" title="Send DTMF">
              <i className="fa fa-keyboard-o "></i>
              <span>DTMF</span>
            </button>

            <button id="line-btn-Transfer" data-onclick="StartTransferSession()"
              className="uj-btn scale-x-[-1]" title="Transfer Call">
              <i className="fa fa-reply"></i>
              <span>Transfer</span>
            </button>

            <button id="line-btn-CancelTransfer" data-onclick="CancelTransferSession()" className="uj-btn uj-btn-red d-none" title="Cancel Transfer">
              <i className="fa fa-reply "></i>
              <span>Cancel</span>
            </button>
          </div>
          <div id="line-Transfer" className="uj-line-Transfer hidden">
            <input type="text" id="line-txt-FindTransfer" name="FindTransfer" className="form-control" />
            <div className="uj-line-transfer-btn">
              <button id="line-btn-blind-transfer" className="uj-btn" data-onclick="BlindTransfer()">
                <i className="fa fa-reply rotate-y-180"></i>
                <span>Blind Transfer</span>
              </button>
              <button id="line-btn-attended-transfer" className="uj-btn" data-onclick="AttendedTransfer()">
                <i className="fa fa-reply-all rotate-y-180"></i>
                <span>Attended Transfer</span>
              </button>
              <button id="line-btn-complete-attended-transfer" className="uj-btn hidden">
                <i className="fa fa-reply-all rotate-y-180"></i>
                <span>Complete Transfer</span>
              </button>
              <button id="line-btn-cancel-attended-transfer" className="uj-btn hidden">
                <i className="fa fa-phone rotate-135"></i>
                <span>Cancel Transfer</span>
              </button>
              <button id="line-btn-terminate-attended-transfer" className="uj-btn hidden">
                <i className="fa fa-phone rotate-135"></i>
                <span>End Transfer Call</span>
              </button>
            </div>
          </div>
          <div className="uj-divDTMFmenu hidden">

            <div className="grid grid-cols-3 gap-4">
              <button className="uj-btn" data-onclick="sendDTMF(null,'1')"> <p className="">1</p> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'2')"> <p className="">2</p> <span className="">ABC</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'3')"> <p className="">3</p> <span className="">DEF</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'4')"> <p className="">4</p> <span className="">GHI</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'5')"> <p className="">5</p> <span className="">JKL</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'6')"> <p className="">6</p> <span className="">MNO</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'7')"> <p className="">7</p> <span className="">PQRS</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'8')"> <p className="">8</p> <span className="">TUV</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'9')"> <p className="">9</p> <span className="">WXYZ</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'*')">
                <p className="text-5xl -mb-5">*</p>
              </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'0')"> <p className="">0</p> <span className="">+</span> </button>
              <button className="uj-btn" data-onclick="sendDTMF(null,'#')"> <p className="">#</p> </button>
            </div>
          </div>
          <div className="flex justify-around w-full">
            <button id="line-btn-End" data-onclick="endSession()"
              className="uj-btn uj-btn-red rotate-135" title="End Call">
              <i className="fa fa-phone fa-2x"></i>
              <span className="-mt-1">End</span>
            </button>
            <button id="line-btn-HideDTMF" className="uj-btn" data-onclick="ShowDtmfMenu(false)"> Hide </button>
          </div>
        </div>
      </div>
      <div className="uj-divDialPad">
        <div className="flex flex-col items-center div-height">
          <input
            type="tel"
            id="dialText"
            placeholder="Phone Number..."
            data-oninput="handleDialInput(this, event)"
            data-onkeydown="dialOnkeydown(event, this)"
            className="form-control text-center text-2xl font-semibold border-0 p-0 max-w-[15ch]"
            maxLength="15"
          />
          <DialPad onDigitClick={handleDigitClick} />
          <div>
            <button data-onclick="DialByLine()" className="uj-btn">
              <i className="fa fa-phone fa-2x text-green-600"></i>
            </button>
          </div>
        </div>
      </div>

      <div id="line-AnswerCall" className="uj-DivAnswerCall hidden">
        <div className="flex flex-col items-center div-height"  >
          <div className="text-center">

            <div className="uj-avatar">
              <i className="fa fa-user fa-5x" ></i>
              <span className="uj-name-prefix"></span>
            </div>
            <div className="callingDisplayName">Unknown</div>
            <div className="callingDisplayNumber"></div>
          </div>
          <div className="flex justify-around w-full">
            <button data-onclick="RejectCall()"
              className="rejectButton uj-btn uj-btn-red rotate-135"
              title="Reject">
              <i className="fa fa-phone fa-2x"></i>
            </button>
            <button data-onclick="AnswerAudioCall()"
              className="uj-btn answerButton"
              title="Answer">
              <i className="fa fa-phone text-green-600 fa-2x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
