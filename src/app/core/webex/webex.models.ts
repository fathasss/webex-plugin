export interface WebexUser {
  id: string;
  displayName: string;
  email?: string;
}

export interface WebexSpace {
  id: string;
  title: string;
  type: string; // e.g. "group", "direct"
}

export interface WebexMeeting {
  id: string;
  title: string;
  status: string; // e.g. "active", "ended"
}

export interface WebexContext {
  user: WebexUser | null;
  space: WebexSpace | null;
  meeting: WebexMeeting | null;
  environment: 'mock' | 'real';
}

export type WebexEvent = 
  | 'userChanged'
  | 'spaceChanged'
  | 'meetingStarted'
  | 'meetingEnded'
  | 'themeChanged';
