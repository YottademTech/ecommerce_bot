export enum SessionStep {
  USER_CONNECTED = 1,
  OTP_SENT = 2,
  OTP_VERIFIED = 3,
  SHOW_SERVICES = 4
}

export interface BotSession {
  phone?: string;
  id?: number;
  requestId: string;
  step: SessionStep;
  [key: string]: any;
} 