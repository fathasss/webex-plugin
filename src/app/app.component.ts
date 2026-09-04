import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WEBEX_SERVICE, IWebexService } from './core/webex/webex.service';
import { WebexDebugPanelComponent } from './components/webex-debug-panel/webex-debug-panel.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WebexDebugPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isReady = signal(false);
  errorMessage = signal<string | null>(null);
  
  displayContext = signal<string>('');
  theme = signal<string>('dark');
  userName = signal<string>('Webex Kullanıcısı');
  meetingId = signal<string>('');
  
  constructor(
    @Inject(WEBEX_SERVICE) private webex: IWebexService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    try {
      await this.webex.init();
      this.isReady.set(true);

      // Event Listener (Abstraction)
      this.webex.on('themeChanged', (theme: string) => {
        this.theme.set(theme);
        document.body.setAttribute('data-theme', theme);
      });

      // Context
      const context = await this.webex.getContext();
      this.displayContext.set(context.environment);
      
      if (context.user) this.userName.set(context.user.displayName);
      if (context.meeting) this.meetingId.set(context.meeting.id);

      console.log("Webex Context loaded:", context);

      // notifyBackendService
      //this.notifyBackendService(context.user, context.meeting, context.environment);

    } catch (err: any) {
      console.error('Webex App Init Error:', err);
      this.errorMessage.set('Failed to initialize Webex App: ' + (err.message || err));
    }
  }

  notifyBackendService(user: any, meeting: any, environment: string) {
    const payload = {
      event: 'APP_OPENED',
      webexUserId: user?.id || 'Unknown',
      userName: user?.displayName || 'Unknown',
      meetingId: meeting?.id || null,
      context: environment,
      timestamp: new Date().toISOString()
    };

    console.log('Servise gönderilecek veri:', payload);

    this.http.post('https://webhook.hasapi.com/', payload).subscribe({
      next: () => console.log('✅ Bildirim servise başarıyla iletildi'),
      error: (err) => console.error('❌ Servise bildirim gönderilirken hata oluştu:', err)
    });
  }

  async shareWithEveryone() {
    const currentUrl = window.location.href;
    try {
      await this.webex.setShareUrl(currentUrl, 'Webex Plugin Shared');
      console.log('Share URL başarıyla ayarlandı.');
    } catch (error) {
      console.error('Share URL ayarlanamadı:', error);
    }
  }

  openExternalLink() {
    this.webex.openUrlInSystemBrowser('https://developer.webex.com');
  }
}
