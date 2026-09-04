import { ApplicationConfig } from '@angular/core';
import { environment } from '../environments/environment';
import { WEBEX_SERVICE } from './core/webex/webex.service';
import { WebexMockService } from './core/webex/webex-mock.service';
import { RealWebexService } from './core/webex/webex-real.service';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    {
      provide: WEBEX_SERVICE,
      useClass: environment.webexMode === 'mock' ? WebexMockService : RealWebexService
    }
  ]
};
