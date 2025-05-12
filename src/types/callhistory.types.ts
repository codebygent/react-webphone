export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'Answered' | 'Missed' | 'Rejected';

export interface Call {
  id: number;
  timestamp: string;
  duration: number;
  number: string | undefined;
  name: string | undefined;
  direction: CallDirection;
  status: CallStatus;
  recording: string | null;
}

export interface CallHistoryStore {
  calls: Call[];
  addCall: (call: Partial<Call>) => void;
  removeCall: (id: number) => void;
  clearHistory: () => void;
  getCallById: (id: number) => Call | undefined;
  getFilteredCalls: (filter: string) => Call[];
}