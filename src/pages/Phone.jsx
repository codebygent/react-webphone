import '../assets/styles/uj-phone.scss';
import DialPad from '../components/phone/DialPad';
import * as UJP from '../store/uj-phone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faUser,
  faArrowRight,
  faArrowRightArrowLeft,
  faMicrophone,
  faVolumeXmark,
  faVolumeHigh,
  faMicrophoneSlash,
  faCirclePause,
  faCirclePlay,
  faKeyboard,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import {
} from '@fortawesome/free-regular-svg-icons';
import usePhoneStore from '../store/phone.store';
import useHistoryStore from '../store/history.store';
import { initializeStores } from '../store/uj-phone';
import { useState, useEffect } from 'react';

export default function Phone() {
  const { isInCall, isIncomingCall, setInCall, setIncomingCall } = usePhoneStore();
  const historyStore = useHistoryStore();

  useEffect(() => {
    initializeStores({
      phoneStore: {
        setInCall: setInCall,
        setIncomingCall: setIncomingCall
      },
      historyStore: {
        addCall: historyStore.addCall
      }
    });
  }, []);

  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDialByLine = () => {
    if (phoneNumber) {
      UJP.DialByLine("", phoneNumber)
      clearNumberName();
    }
  };

  const handleDigitClick = (digit) => {
    setPhoneNumber(phoneNumber + digit);
  };

  const handleDtmfClick = (digit) => {
    UJP.sendDTMF(null, digit)
  };
  return (

    <div id="uj-webphone-widget" className="uj-webrtc-container" >
      <h3><b id="regStatus"></b></h3>


      <div className="uj-divDialPad" style={{ display: isInCall || isIncomingCall ? "none" : "block" }} >
        <div className="flex flex-col items-center div-height">
          <div className='min-h-10'></div>
          <div className='w-full relative'>

            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Phone Number..."
              className="text-center text-2xl font-bold uj-inputnumber "
              maxLength="15"
            />

            <button
              onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title="Clear number"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <DialPad onDigitClick={handleDigitClick} />
          <div className='mb-4'>
            <button onClick={handleDialByLine} className="uj-btn-circle text-white bg-green-600">
              <FontAwesomeIcon icon={faPhone} size="2x" className="" />
            </button>
          </div>
        </div>
      </div>

      <div className="uj-divInCallContainer" style={{ display: isInCall ? "block" : "none" }} >
        <div className="flex flex-col items-center div-height" >
          <div className="text-center">
            <audio id="line-transfer-remoteAudio" className="d-none" > </audio>
            <audio id="line-conference-remoteAudio" className="d-none" > </audio>
            <audio id="line-remoteAudio" className="d-none" > </audio>

            <div className="text-center">
              <div className="uj-avatar">
                <FontAwesomeIcon icon={faUser} size="4x" />
              </div>
              <div className="callingDisplayName">Unknown</div>
              <div className="callingDisplayNumber"></div>
            </div>
            <h3><span id="line-timer" ></span> <span id="line-msg"></span></h3>

          </div>

          <div className="uj-inCallButtons grid grid-cols-3 gap-6 mt-4 mb-4">
            <button id="line-btn-SpeakerOff" onClick={() => UJP.SpeakerOffSession()} className="uj-btn-call" title="Voice Off">
              <i><FontAwesomeIcon icon={faVolumeXmark} /></i>
              <span>Speaker Off</span>
            </button>

            <button id="line-btn-SpeakerOn"
              onClick={() => UJP.SpeakerOnSession()}
              className="uj-btn-call uj-btn-red d-none"
              title="Voice On">
              <i><FontAwesomeIcon icon={faVolumeHigh} /></i>
              <span>Speaker On</span>
            </button>

            <button id="line-btn-Mute"
              onClick={() => UJP.MuteSession()}
              className="uj-btn-call"
              title="Mute">
              <i><FontAwesomeIcon icon={faMicrophoneSlash} /></i>
              <span>Mute</span>
            </button>

            <button id="line-btn-Unmute"
              onClick={() => UJP.UnmuteSession()}
              className="uj-btn-call uj-btn-red d-none"
              title="Unmute">
              <i><FontAwesomeIcon icon={faMicrophone} /></i>
              <span>Unmute</span>
            </button>

            <button id="line-btn-Hold"
              onClick={() => UJP.holdSession()}
              className="uj-btn-call"
              title="Hold Call">
              <i><FontAwesomeIcon icon={faCirclePause} /></i>
              <span>Hold</span>
            </button>

            <button id="line-btn-Unhold"
              onClick={() => UJP.unholdSession()}
              className="uj-btn-call uj-btn-red d-none"
              title="Resume Call">
              <i><FontAwesomeIcon icon={faCirclePlay} /></i>
              <span>Resume</span>
            </button>

            <button id="line-btn-ShowDtmf"
              onClick={() => UJP.ShowDtmfMenu(true)}
              className="uj-btn-call"
              title="Send DTMF">
              <i><FontAwesomeIcon icon={faKeyboard} /></i>
              <span>DTMF</span>
            </button>

            <button id="line-btn-Transfer"
              onClick={() => UJP.StartTransferSession()}
              className="uj-btn-call"
              title="Transfer Call">
              <i><FontAwesomeIcon icon={faArrowRight} /></i>
              <span>Transfer</span>
            </button>

            <button id="line-btn-CancelTransfer"
              onClick={() => UJP.CancelTransferSession()}
              className="uj-btn-call uj-btn-red d-none"
              title="Cancel Transfer">
              <i><FontAwesomeIcon icon={faArrowRightArrowLeft} /></i>
              <span>Cancel</span>
            </button>
          </div>
          <div id="line-Transfer" className="uj-line-Transfer hidden mb-4">
            <input type="text" id="line-txt-FindTransfer" name="FindTransfer"
              placeholder='Transfer Number'
              className="text-center font-bold uj-inputnumber" />
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
              className="uj-btn-circle text-white bg-red-600 rotate-135"
              title="End Call">
              <i className=''> <FontAwesomeIcon icon={faPhone} size="2x" /> </i>
            </button>
            <button id="line-btn-HideDTMF"
              onClick={() => UJP.ShowDtmfMenu(false)}
              className="uj-btn-circle text-black bg-gray-200">
              Hide
            </button>
          </div>
        </div>
      </div>

      <div id="line-AnswerCall" className="uj-DivAnswerCall" style={{ display: isIncomingCall ? "block" : "none" }} >
        <div className="flex flex-col items-center div-height"  >
          <div className="text-center">

            <div className="uj-avatar">
              <FontAwesomeIcon icon={faUser} size="4x" />
            </div>
            <div className="callingDisplayName">Unknown</div>
            <div className="callingDisplayNumber"></div>
          </div>
          <div className="flex justify-around w-full">
            <button
              onClick={() => UJP.RejectCall()}
              className="uj-btn-circle rejectButton text-white bg-red-600 rotate-135"
              title="Reject">
              <i className=''> <FontAwesomeIcon icon={faPhone} size="2x" /> </i>
            </button>
            <button onClick={() => UJP.AnswerAudioCall()}
              title='Answer'
              className="uj-btn-circle answerButton text-white bg-green-600">
              <FontAwesomeIcon icon={faPhone} size="2x" className="" />
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
