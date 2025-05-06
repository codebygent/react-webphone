export interface CallState {
  isInCall: boolean;
  isMuted: boolean;
  isHold: boolean;
  speakerOn: boolean;
  callDuration: string;
  callerName: string;
  callerNumber: string;
}

export interface TransferState {
  isTransferring: boolean;
  transferNumber: string;
  isAttendedTransfer: boolean;
}

export interface PhoneState {
  dialNumber: string;
  showDTMF: boolean;
  showTransfer: boolean;
  callState: CallState;
  transferState: TransferState;
}

export interface PhoneProps {
  config?: {
    sipServer: string;
    username: string;
    password: string;
  };
  onCallStateChange?: (state: CallState) => void;
}