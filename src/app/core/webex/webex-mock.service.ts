import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IWebexService } from './webex.service';
import { WebexUser, WebexSpace, WebexMeeting, WebexContext, WebexEvent } from './webex.models';

@Injectable({
  providedIn: 'root'
})
export class WebexMockService implements IWebexService {
  private eventsSubject = new Subject<{ event: WebexEvent; payload?: any }>();
  public events$ = this.eventsSubject.asObservable();

  private isReady = false;

  private mockUser: WebexUser = {
    id: "mock-user-001",
    displayName: "Fatih Has",
    email: "fatih@example.com"
  };

  private mockSpace: WebexSpace | null = {
    id: "mock-space-001",
    title: "Webex Plugin Development",
    type: "group"
  };

  private mockMeeting: WebexMeeting | null = {
    id: "mock-meeting-001",
    title: "Webex Plugin Test Meeting",
    status: "active"
  };

  constructor() {}

  async init(): Promise<void> {
    console.log('[WebexMockService] Initialization started...');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isReady = true;
    console.log('[WebexMockService] Initialization complete.');
  }

  isWebexAvailable(): boolean {
    return this.isReady;
  }

  getEnvironment(): 'mock' | 'real' {
    return 'mock';
  }

  async getUser(): Promise<WebexUser | null> {
    this.ensureReady();
    return { ...this.mockUser };
  }

  async getSpace(): Promise<WebexSpace | null> {
    this.ensureReady();
    return this.mockSpace ? { ...this.mockSpace } : null;
  }

  async getMeeting(): Promise<WebexMeeting | null> {
    this.ensureReady();
    return this.mockMeeting ? { ...this.mockMeeting } : null;
  }

  async getContext(): Promise<WebexContext> {
    this.ensureReady();
    const user = await this.getUser();
    const space = await this.getSpace();
    const meeting = await this.getMeeting();
    
    return {
      user,
      space,
      meeting,
      environment: 'mock'
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
    console.log(`[WebexMockService] Shared URL: ${url} (Title: ${title})`);
  }

  openUrlInSystemBrowser(url: string): void {
    console.log(`[WebexMockService] Opening system browser for: ${url}`);
    window.open(url, '_blank');
  }

  // --- Mock Specific Methods (Used by Debug Panel) ---

  simulateEvent(event: WebexEvent, payload?: any) {
    console.log(`[WebexMockService] Simulating event: ${event}`, payload);
    this.eventsSubject.next({ event, payload });
  }

  simulateMeetingEnd() {
    this.mockMeeting = null;
    this.simulateEvent('meetingEnded');
  }

  simulateMeetingStart() {
    this.mockMeeting = {
      id: "mock-meeting-002",
      title: "New Test Meeting",
      status: "active"
    };
    this.simulateEvent('meetingStarted');
  }

  private ensureReady() {
    if (!this.isReady) {
      throw new Error("Webex SDK is not initialized yet.");
    }
  }
}
