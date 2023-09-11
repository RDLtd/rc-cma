import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ConfigService } from './config.service';
import { take } from 'rxjs';

/**
 * This is our pre-bootstrap module
 */

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (config: ConfigService) => {
        // this won't return and continuing the bootstrapping
        // until is receives a return object itself
        return () => {
          // set up the translations
          config.setLanguage();
          // make a call to the backend to retrieve/set brand config
          config.getBrandConfig();
          // We return on the first response
          // which kicks off the bootstrapping
          return config.brand$.pipe(take(1))
        }
      },
      deps: [ConfigService]
    }
  ]
})

export class InitModule { }
