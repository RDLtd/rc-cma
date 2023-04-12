import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Notifier } from '@airbrake/browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private token = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  public authToken = this.token.asObservable();
  private currentAuthToken;

  private airbrake = new Notifier({
    projectId: 480741,
    projectKey: '1fdebb905739780366a931460fb6958c',
    environment: 'production',
  });

  constructor(
    private config: AppConfig,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  handleError(code: string, error: any): void {
    // only show the user if a code has been supplied (so this can be looked up in the translation database)
    if (!!code) {
      this.dspSnackBar(this.translate.instant('ERRORS.' + code));
    }
    // but notify for all errors
    if (this.config.useAirBrake) {
      // sometimes there will be no information in the error, so we attach the code as well
      this.airbrake.notify(code + ', ' + JSON.stringify(error)).then();
    } else {
      // just send an email
      this.reportError(JSON.stringify(error));
    }
  }

  reportError(info) {
    this.authToken.subscribe( tkn => {
      this.currentAuthToken = tkn;
    });
    // send email to tech
    const msg = `## The CMA Application has recorded an Error\n\n` +
      `${info}\n\n` +
      `Please refer to the transaction log for further information\n`;

    this.sendEmailRequest(msg)
      .subscribe({
        next: () => {
          console.log('Tech email sent');
        },
        error: error => {
          console.log('Failed to send tech email', error)
        }
      });
  }

  sendEmailRequest(msg) {
    return this.http.post(this.config.apiUrl + '/members/sendemail',
      {
        company_name: this.config.brand.name,
        company_prefix: this.config.brand.prefix,
        email_to: this.config.brand.email.tech,
        email_from: this.config.brand.email.support,
        email_subject: 'CMA Error',
        email_body: msg,
        userCode: this.config.userAPICode,
        token: this.currentAuthToken
      });
  }

  dspSnackBar(msg: string, action = 'OK', d = 10, style = 'info') {
    this.snackBar.open(msg, action, {
      duration: d * 1000,
      panelClass: [`rc-mat-snack-${style}`]
    });
  }

}
