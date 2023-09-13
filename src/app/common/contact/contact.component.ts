import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "../../_services";
import { ConfigService } from '../../init/config.service';

@Component({
  selector: 'app-rc-contact',
  templateUrl: './contact.component.html'
})

export class ContactComponent implements OnInit {

  brand: any;
  member: any;
  email_message: string;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private error: ErrorService,
    public dialog: MatDialogRef<ContactComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log('DATA', this.data);
    this.member = this.data.member;
    this.config.brand.subscribe(obj => this.brand = obj);
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
        email_to: this.brand.emails.tech,
        email_from: this.member.member_email,
        email_subject: 'Support Request',
        email_body: msg,
        userCode: this.config.userAPICode,
        token: this.brand.token
      });
  }
}
