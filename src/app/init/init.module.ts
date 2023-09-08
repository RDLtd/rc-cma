import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';



@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (config: ConfigService) => {
        return () => {
          const b = config.getBrandConfig();
          const t = config.setLanguage();
          Promise.all([b, t]).then( () => {
            return new Observable();
          });
        }
      },
      deps: [ConfigService]
    }
  ]
})

export class InitModule { }
