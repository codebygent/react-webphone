import '../assets/styles/uj-phone.scss';
import DialPad from '../components/phone/DialPad';
import * as UJP from '../store/uj-phone';
import { useState } from 'react';


export default function Phone() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDialByLine = () => {
    UJP.DialByLine("",phoneNumber)
  };

  const handleDigitClick = (digit) => {
    setPhoneNumber(phoneNumber + digit)
  };

  const handleDtmfClick = (digit) => {
    UJP.sendDTMF(null,digit)
  };
  return (

    <div id="uj-webphone-widget" className="uj-webrtc-container" >
      <h3><b id="regStatus">Starting connection ....</b></h3>
      
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
            <button id="line-btn-SpeakerOff" onClick={() => UJP.SpeakerOffSession()} className="uj-btn" title="Voice Off">
              <i className="fa fa-volume-off "></i>
              <span>Speaker Off</span>
            </button>

            <button id="line-btn-SpeakerOn" 
              onClick={() => UJP.SpeakerOnSession()} 
              className="uj-btn uj-btn-red d-none" 
              title="Voice On">
              <i className="fa fa-volume-up "></i>
              <span>Speaker On</span>
            </button>

            <button id="line-btn-Mute" 
              onClick={() => UJP.MuteSession()} 
              className="uj-btn" 
              title="Mute">
              <i className="fa fa-microphone-slash "></i>
              <span>Mute</span>
            </button>

            <button id="line-btn-Unmute" 
              onClick={() => UJP.UnmuteSession()} 
              className="uj-btn uj-btn-red d-none" 
              title="Unmute">
              <i className="fa fa-microphone "></i>
              <span>Unmute</span>
            </button>

            <button id="line-btn-Hold" 
              onClick={() => UJP.holdSession()} 
              className="uj-btn" 
              title="Hold Call">
              <i className="fa fa-pause "></i>
              <span>Hold</span>
            </button>

            <button id="line-btn-Unhold" 
              onClick={() => UJP.unholdSession()} 
              className="uj-btn uj-btn-red d-none" 
              title="Resume Call">
              <i className="fa fa-play "></i>
              <span>Resume</span>
            </button>
            <button id="line-btn-ShowDtmf" 
              onClick={() => UJP.ShowDtmfMenu(true)} 
              className="uj-btn" 
              title="Send DTMF">
              <i className="fa fa-keyboard-o "></i>
              <span>DTMF</span>
            </button>

            <button id="line-btn-Transfer" 
              onClick={() => UJP.StartTransferSession()} 
              className="uj-btn scale-x-[-1]" 
              title="Transfer Call">
              <i className="fa fa-reply"></i>
              <span>Transfer</span>
            </button>

            <button id="line-btn-CancelTransfer" 
              onClick={() => UJP.CancelTransferSession()} 
              className="uj-btn uj-btn-red d-none" 
              title="Cancel Transfer">
              <i className="fa fa-reply "></i>
              <span>Cancel</span>
            </button>
          </div>
          <div id="line-Transfer" className="uj-line-Transfer hidden">
            <input type="text" id="line-txt-FindTransfer" name="FindTransfer" className="form-control" />
            <div className="uj-line-transfer-btn">
              <button id="line-btn-blind-transfer" 
                onClick={() => UJP.BlindTransfer()} 
                className="uj-btn">
                <i className="fa fa-reply rotate-y-180"></i>
                <span>Blind Transfer</span>
              </button>
              <button id="line-btn-attended-transfer" 
                onClick={() => UJP.AttendedTransfer()} 
                className="uj-btn">
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
            <DialPad onDigitClick={handleDtmfClick} />
          </div>
          <div className="flex justify-around w-full">
            <button id="line-btn-End" 
              onClick={() => UJP.endSession()} 
              className="uj-btn uj-btn-red rotate-135" 
              title="End Call">
              <i className="fa fa-phone fa-2x"></i>
              <span className="-mt-1">End</span>
            </button>
            <button id="line-btn-HideDTMF" 
              onClick={() => UJP.ShowDtmfMenu(false)} 
              className="uj-btn">
              Hide
            </button>
          </div>
        </div>
      </div>

      <div className="uj-divDialPad">
        <div className="flex flex-col items-center div-height">
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            placeholder="Phone Number..."
            className="form-control text-center text-2xl font-semibold border-0 p-0 max-w-[15ch]"
            maxLength="15"
          />
          <DialPad onDigitClick={handleDigitClick} />
          <div>
            <button onClick={handleDialByLine} className="uj-btn">
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
            <button 
              onClick={() => UJP.RejectCall()} 
              className="rejectButton uj-btn uj-btn-red rotate-135" 
              title="Reject">
              <i className="fa fa-phone fa-2x"></i>
            </button>
            <button 
              onClick={() => UJP.AnswerAudioCall()} 
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
