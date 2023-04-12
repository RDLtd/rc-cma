import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

// Suppress console.logs if we're in production mode
// unless the API has been set to local or staging
if (environment.production && environment.API_URL.includes('rc-server-prod')) {
  // Disable Angular's dev mode
  enableProdMode();
  // Kill all console logging
  console.log = () => {};
}

platformBrowserDynamic().bootstrapModule(AppModule);

