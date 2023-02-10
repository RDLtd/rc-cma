import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Notifier } from '@airbrake/browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  airbrake = new Notifier({
    projectId: 480741,
    projectKey: '1fdebb905739780366a931460fb6958c',
    environment: 'production',
  });

  constructor(
    private config: AppConfig,
    private   translate: TranslateService,
    private   snackBar: MatSnackBar
  ) { }

  handleError(code: string, error: any): void {
    this.dspSnackBar(this.translate.instant('ERRORS.' + code));
    // sometimes there will be no information in the error, so we attach the code as well
    this.airbrake.notify(code + ', ' + JSON.stringify(error)).then();
  }

  dspSnackBar(msg: string, action = 'OK', d = 10, style = 'info') {
    this.snackBar.open(msg, action, {
      duration: d * 1000,
      panelClass: [`rc-mat-snack-${style}`]
    });
  }

}
