import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { WebexUser, WebexSpace, WebexMeeting, WebexContext, WebexEvent } from './webex.models';

export interface IWebexService {
  /** Observable stream of all Webex events */
  events$: Observable<{ event: WebexEvent; payload?: any }>;

  /** Fetch current user */
  getUser(): Promise<WebexUser | null>;

  /** Fetch current space */
  getSpace(): Promise<WebexSpace | null>;

  /** Fetch current meeting */
  getMeeting(): Promise<WebexMeeting | null>;

  /** Fetch combined context */
  getContext(): Promise<WebexContext>;

  /** Returns 'mock' or 'real' */
  getEnvironment(): 'mock' | 'real';

  /** Check if Webex SDK is actually available/ready */
  isWebexAvailable(): boolean;

  /** Listen to specific event */
  on(eventName: WebexEvent, callback: (payload?: any) => void): void;

  /** Initialize the SDK */
  init(): Promise<void>;

  /** Webex advanced actions */
  setShareUrl(url: string, title?: string): Promise<void>;
  openUrlInSystemBrowser(url: string): void;
}

/** 
 * DI Token to inject the service. 
 * Usage in component: constructor(@Inject(WEBEX_SERVICE) private webex: IWebexService)
 */
export const WEBEX_SERVICE = new InjectionToken<IWebexService>('WEBEX_SERVICE');
