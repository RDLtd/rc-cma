import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TranslateService} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AppConfig} from "../../app.config";
import {ErrorService} from "../../_services";

@Component({
  selector: 'app-rc-contact',
  templateUrl: './contact.component.html'
})

export class ContactComponent implements OnInit {

  member: any;
  email_message: string;

  private token = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  public authToken = this.token.asObservable();
  private currentAuthToken;

  constructor(
    private config: AppConfig,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private error: ErrorService,
    public dialog: MatDialogRef<ContactComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log('DATA', this.data);
    this.member = this.data.member;
  }

  dspSnackbarMsg(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  sendEmail(): void {
    console.log(this.email_message);

    if (!this.email_message) {
      this.dspSnackbarMsg(this.translate.instant('CONTACT.noText'), null);
      return;
    }

    this.authToken.subscribe( tkn => { this.currentAuthToken = tkn; });

    // send email to tech
    const msg = `## RDL User Support Request\n\n` +
      `From ${this.member.member_first_name} ${this.member.member_last_name}, User ID ${this.member.member_membership_number}\n\n` +
      `Email contact ${this.member.member_email}\n\n` +
      `**${this.email_message}**\n\n` +
      `Please contact ${this.member.member_first_name} as soon as possible\n`;

    this.sendEmailRequest(msg)
      .subscribe({
        next: () => {
          console.log('Support request email sent');
          this.dspSnackbarMsg(this.translate.instant('CONTACT.emailSent'), null);
          this.dialog.close();
        },
        error: error => {
          console.log('Failed to send support request email', error);
          this.error.handleError('failedToSendSupportEmail', error);
        }
      });

  }

  sendEmailRequest(msg) {
    return this.http.post(this.config.apiUrl + '/members/sendemail',
      {
        company_name: 'RDL',
        company_prefix: 'rc',
        email_to: this.config.brand.email.tech,
        email_from: this.member.member_email,
        email_subject: 'Support Request',
        email_body: msg,
        userCode: this.config.userAPICode,
        token: this.currentAuthToken
      });
  }
}
