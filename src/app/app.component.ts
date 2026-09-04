import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    Webex: any;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
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
  
  private appInstance: any;

  ngOnInit() {
    this.initWebex();
  }

  initWebex() {
    if (typeof window.Webex !== 'undefined') {
      this.appInstance = new window.Webex.Application();
      
      const timeout = setTimeout(() => {
        if (!this.isReady()) {
          this.errorMessage.set('Bağlantı zaman aşımına uğradı. Uygulamayı normal bir tarayıcıda değil, Webex veya Webex Emulator içinde açtığınızdan emin olun.');
        }
      }, 5000);

      this.appInstance.onReady().then(() => {
        clearTimeout(timeout);
        this.isReady.set(true);
        this.displayContext.set(this.appInstance.displayContext || 'Unknown');
        
        // 1. Dinamik Tema Senkronizasyonu
        this.appInstance.on('application:themeChanged', (theme: string) => {
          this.theme.set(theme);
          document.body.setAttribute('data-theme', theme);
        });

        // Başlangıç temasını uygula
        if (this.appInstance.theme) {
          this.theme.set(this.appInstance.theme);
          document.body.setAttribute('data-theme', this.appInstance.theme);
        }

        // 2. Kullanıcı ve Toplantı Bilgilerini Çek ve Servise Bildir
        Promise.all([
          this.appInstance.context.getUser().catch(() => null),
          this.appInstance.context.getMeeting().catch(() => null)
        ]).then(([user, meeting]) => {
           if (user && user.displayName) this.userName.set(user.displayName);
           if (meeting && meeting.id) this.meetingId.set(meeting.id);
          
           console.log("User bilgisi:", user, "Meeting bilgisi:", meeting);
           // Kendi servisinize bildirim gönderin
           //this.notifyBackendService(user, meeting);
        });

      }).catch((err: any) => {
        clearTimeout(timeout);
        console.error('Webex App Init Error:', err);
        this.errorMessage.set('Failed to initialize Webex App: ' + (err.message || err));
      });
    } else {
      this.errorMessage.set('Webex SDK bulunamadı.');
    }
  }

  // Dis servislere istek
  notifyBackendService(user: any, meeting: any) {
    const payload = {
      event: 'APP_OPENED',
      webexUserId: user?.id || 'Unknown',
      userName: user?.displayName || 'Unknown',
      meetingId: meeting?.id || null,
      context: this.appInstance.displayContext || 'Unknown',
      timestamp: new Date().toISOString()
    };

    console.log('Servise gönderilecek veri:', payload);

    fetch('https://webhook.hasapi.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => console.log('✅ Bildirim servise başarıyla iletildi:', res.status))
    .catch(err => console.error('❌ Servise bildirim gönderilirken hata oluştu:', err));
  }

  // 3. "Herkes İçin Aç" Butonu (Share Together)
  shareWithEveryone() {
    if (this.appInstance) {
      const currentUrl = window.location.href;
      this.appInstance.setShareUrl(currentUrl, currentUrl, 'Webex Plugin Shared').then(() => {
        console.log('Share URL başarıyla ayarlandı.');
      }).catch((error: any) => {
        console.error('Share URL ayarlanamadı:', error);
      });
    }
  }

  // 4. Güvenli Harici Link Açma (External Browser)
  openExternalLink() {
    if (this.appInstance) {
      this.appInstance.openUrlInSystemBrowser('https://developer.webex.com');
    }
  }
}
