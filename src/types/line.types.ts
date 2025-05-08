import { Inviter,SessionState } from 'sip.js';

interface CallData {
  line: number;
  calldirection: 'outbound' | 'inbound';
  dst: string;
  callstart: string;
  callTimer: number;
  ismute?: boolean;
  ishold?: boolean;
  AudioOutputDevice: string;
  AudioSourceDevice: string;
  VideoSourceDevice: string | null;
  earlyReject: boolean;
  reasonCode?: number;
  reasonText?: string;
  ringerObj: any | null;
  teardownComplete: boolean;
  terminateby?: 'them' | 'us';
  withvideo: boolean;
}

interface ExtendedInviter extends Inviter {
  data: CallData;
  isOnHold: boolean;
  _contact: string;
  callId?: string;
  sessionState: SessionState;
  startTime?: Date;
  endTime?: Date;
  customHeaders?: { [key: string]: string };
  mediaConstraints?: MediaStreamConstraints;
  audioElement?: HTMLAudioElement;
}

interface Line {
  LineNumber: number;
  DisplayName: string;
  DisplayNumber: string; 
  IsSelected: boolean;
  SipSession: ExtendedInviter | null;
  Status: 'idle' | 'ringing' | 'connected' | 'holding';
  LastCallTimestamp?: Date;
  HasIncomingCall: boolean;
}

class LineImpl implements Line {
  LineNumber: number;
  DisplayName: string;
  DisplayNumber: string;
  IsSelected: boolean = false;
  SipSession: ExtendedInviter | null = null;
  Status: 'idle' | 'ringing' | 'connected' | 'holding' = 'idle';
  LastCallTimestamp?: Date;
  IsMuted: boolean = false;
  HasIncomingCall: boolean = false;

  constructor(lineNumber: number, displayName: string, displayNumber: string) {
    this.LineNumber = lineNumber;
    this.DisplayName = displayName;
    this.DisplayNumber = displayNumber;
  }
}

export type { ExtendedInviter, CallData };
export { LineImpl as Line };