interface AppInstance {
    guid: string;
    type: string;
}

interface AssociatedNumber {
    guid: string;
    associatedNumber: string;
    country: string;
    city: string;
    prefix: string;
    tag: string;
    isPrimary: boolean;
    tollFree: boolean;
    appInstance: AppInstance;
}

interface UserNumber {
    guid: string;
    number: string;
    associatedNumber: AssociatedNumber;
}

interface VerifiedEmail {
    emailId: string;
    isVerified: boolean;
    primary: boolean;
}

export interface User {
    userId: string;
    firstName: string;
    lastName: string;
    paymentGateway: string;
    contactNumber: string;
    userNumbers: UserNumber[];
    language: string;
    bookmark: string;
    linkedAccounts: any[]; // no details provided, so using any[]
    verifiedEmails: VerifiedEmail[];
    imAddresses: any[]; // no details provided, so using any[]
    keyValuePairs: string; // looks like a JSON string
    features: any[]; // no details provided, so using any[]
    appInstances: AppInstance[];
    callTransferActive: boolean;
    isAccountBlocked: boolean;
    smsSendingActive: boolean;
    restricted: boolean;
    dialExtension: boolean;
    dialExtensionText: string;
    userExtensionId: string;
    isConnected: boolean;
}

export interface AuthUser {
    role?: string;
    email?: string;
    mobile?: string;
    lang: string;
    voiceMailbox: boolean;
    active: boolean;
    extensionId: string;
    permissions?: {
      [key: string]: string;
    };
}

export interface WebRTCCredential {
    wsDomain: string;
    password: string;
    sipDomain: string;
    mobileNumber: string;
    userDisplayName: string;
    transport: string;
    username: string;
    extensionId:string;
}


export interface BusinessNumber {
  country: string; // e.g., "GH"
  formattedAssociatedNumber: string; // e.g., "+233 (0242) 439-881"
  city: string; // e.g., "MTN"
  prefix: string; // e.g., "024"
  isPrimary: boolean;
  guid: string;
  tag: string; // e.g., "Team"
  appInstance: {
    guid: string;
    type: string; // e.g., "miniIVR"
  };
  tollFree: boolean;
  associatedNumber: string; // e.g., "+233242439881"
}
