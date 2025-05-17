
export interface AgentStatus {
  inUseStatus: boolean;
  enableOutgoing: boolean;
  enableLeadCreationInCrm: boolean;
  isRegistered: boolean;
  agentAppStatus: string;
}

export interface Extension {
  extensionTypeId: string;
  extension: string;
  role: string;
  formattedMobileNumber: string;
  extensionTypeName: string;
  mobileNumber: string;
  extensionTypePricePlan: number;
  callLimit: number;
  registered: boolean;
  userAgent: string;
  isAdmin: boolean;
  avatar: string;
  type: string;
  agentStatus: AgentStatus;
  sipUserName: string;
  countryPhoneCode: string;
  remainingCallLimit: number;
  pinCode: string | null;
  name: string;
  extensionId: string;
  email: string;
  status: string;
  isCallRecordingEnabled: boolean;
}

export interface Contact {
  firstName: string;
  fullName: string;
  lastName: string;
  avatar: string;
  status: string;
  id: string;
  number: string;
}