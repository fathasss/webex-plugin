import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IWebexService } from './webex.service';
import { WebexUser, WebexSpace, WebexMeeting, WebexContext, WebexEvent } from './webex.models';

declare global {
  interface Window {
    Webex: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RealWebexService implements IWebexService {
  private eventsSubject = new Subject<{ event: WebexEvent; payload?: any }>();
  public events$ = this.eventsSubject.asObservable();
  
  private appInstance: any = null;
  private isReady = false;

  constructor() {}

  async init(): Promise<void> {
    if (typeof window.Webex === 'undefined') {
      throw new Error('Webex SDK not found on window object.');
    }

    this.appInstance = new window.Webex.Application();
    
    await this.appInstance.onReady();
    this.isReady = true;

    // Attach listeners
    this.appInstance.on('application:themeChanged', (theme: string) => {
      this.eventsSubject.next({ event: 'themeChanged', payload: theme });
    });
    this.appInstance.on('meeting:infoChanged', (info: any) => {
      // Very basic translation for example
      this.eventsSubject.next({ event: 'meetingStarted', payload: info });
    });
  }

  isWebexAvailable(): boolean {
    return typeof window.Webex !== 'undefined' && this.isReady;
  }

  getEnvironment(): 'mock' | 'real' {
    return 'real';
  }

  async getUser(): Promise<WebexUser | null> {
    if (!this.isReady) return null;
    const user = await this.appInstance.context.getUser();
    return user ? { id: user.id, displayName: user.displayName, email: user.email } : null;
  }

  async getSpace(): Promise<WebexSpace | null> {
    if (!this.isReady) return null;
    try {
      const space = await this.appInstance.context.getSpace();
      return space ? { id: space.id, title: space.title, type: space.type } : null;
    } catch {
      return null; // Might not be in a space
    }
  }

  async getMeeting(): Promise<WebexMeeting | null> {
    if (!this.isReady) return null;
    try {
      const meeting = await this.appInstance.context.getMeeting();
      return meeting ? { id: meeting.id, title: meeting.title, status: meeting.state } : null;
    } catch {
      return null;
    }
  }

  async getContext(): Promise<WebexContext> {
    const user = await this.getUser();
    const space = await this.getSpace();
    const meeting = await this.getMeeting();
    
    return {
      user,
      space,
      meeting,
      environment: 'real'
    };
  }

  on(eventName: WebexEvent, callback: (payload?: any) => void): void {
    this.events$.subscribe((msg) => {
      if (msg.event === eventName) {
        callback(msg.payload);
      }
    });
  }

  async setShareUrl(url: string, title?: string): Promise<void> {
    if (this.isReady) {
      await this.appInstance.setShareUrl(url, url, title || 'Shared App');
    }
  }

  openUrlInSystemBrowser(url: string): void {
    if (this.isReady) {
      this.appInstance.openUrlInSystemBrowser(url);
    }
  }
}
