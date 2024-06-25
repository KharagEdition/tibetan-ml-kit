export interface TranslateData {
  token: Token;
  generated_text: string;
  details: any;
}

export interface Token {
  id: number;
  text: string;
  logprob: number;
  special: boolean;
}

export interface TranslateResponse {
  code: number;
  message: Message;
  generated_text: string;
}

export interface Message {
  token: Token;
  generated_text: string;
  details: any;
}

export interface Token {
  id: number;
  text: string;
  logprob: number;
  special: boolean;
}
