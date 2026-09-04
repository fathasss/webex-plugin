import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WEBEX_SERVICE, IWebexService } from '../../core/webex/webex.service';
import { WebexMockService } from '../../core/webex/webex-mock.service';
import { WebexContext } from '../../core/webex/webex.models';

@Component({
  selector: 'app-webex-debug-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webex-debug-panel.component.html',
  styleUrl: './webex-debug-panel.component.css'
})
export class WebexDebugPanelComponent implements OnInit {
  context: WebexContext | null = null;
  isOpen = true;

  constructor(@Inject(WEBEX_SERVICE) private webex: IWebexService) {}

  ngOnInit() {
    this.refreshContext();
    
    // Auto refresh context on events
    this.webex.events$.subscribe(() => {
      this.refreshContext();
    });
  }

  async refreshContext() {
    try {
      this.context = await this.webex.getContext();
    } catch (e) {
      console.error('Debug Panel failed to get context', e);
    }
  }

  get isMock(): boolean {
    return this.webex.getEnvironment() === 'mock';
  }

  get mockService(): WebexMockService | null {
    if (this.isMock) {
      return this.webex as WebexMockService;
    }
    return null;
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  // --- Mock Test Controls ---

  testStartMeeting() {
    this.mockService?.simulateMeetingStart();
  }

  testEndMeeting() {
    this.mockService?.simulateMeetingEnd();
  }

  testChangeTheme(theme: 'light' | 'dark') {
    this.mockService?.simulateEvent('themeChanged', theme);
  }
}
