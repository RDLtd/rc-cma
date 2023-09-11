import { Injectable } from '@angular/core';
import { Notifier } from '@airbrake/browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../init/config.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private airbrake = new Notifier({
    projectId: 480741,
    projectKey: '1fdebb905739780366a931460fb6958c',
    environment: 'production',
  });

  private brand;


  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.brand = this.config.brand$;
  }

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

    // send email to tech
    const msg = `## The apptiser CMS Application has recorded an Error\n\n` +
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
        company_name: 'apptiser',
        company_prefix: 'app',
        email_to: this.brand.emails.tech,
        email_from: this.brand.emails.support,
        email_subject: 'apptiser CMS Error',
        email_body: msg,
        userCode: this.config.userAPICode,
        token: this.config.token
      });
  }

  dspSnackBar(msg: string, action = 'OK', d = 10, style = 'info') {
    this.snackBar.open(msg, action, {
      duration: d * 1000,
      panelClass: [`rc-mat-snack-${style}`]
    });
  }

}
