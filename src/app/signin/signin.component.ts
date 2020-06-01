import { Component, OnInit } from '@angular/core';
import { AuthenticationService, MemberService } from '../_services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-signin',
  templateUrl: './signin.component.html'
})

export class SigninComponent implements OnInit {

  isReferral = false;
  isSubmitting: boolean;
  dbOffline: boolean = false;
  errorMsg: string;
  pwdReset: boolean = false;
  user_email: string;

  company_name;
  company_logo_root;
  company_url;

  // translation variables
  t_data: any;

  constructor(
    private authService: AuthenticationService,
    private memberService: MemberService,
    public snackBar: MatSnackBar,
    private translate: TranslateService,
    private activeRoute: ActivatedRoute
  ) {  }

  ngOnInit() {

    this.translate.get('SignIn').subscribe(data => {
      this.t_data = data;
      console.log(this.t_data);
    });

    this.company_name = localStorage.getItem('rd_company_name');
    this.company_logo_root = localStorage.getItem('rd_company_logo_root');
    this.company_url = localStorage.getItem('rd_company_url');

    // console.log('GET LS', localStorage.getItem('rd_company_logo_root'));
    // this.authService.memberSessionSubject.next('null');

  }

  signIn(formValue) {

    // need this in here since the NgInit here executes too soon!
    this.translate.get('SignIn').subscribe(data => {
      this.t_data = data;
    });

    // console.log('form', formValue);
    this.isSubmitting = true;
    this.authService.login(formValue)
      .subscribe(
        authResult => {
          this.isSubmitting = false;
          this.authService.setMember(authResult['member']);
          if (authResult && authResult['token']) {
            // console.log('Auth OK');
            this.authService.setAuthSession(authResult['member'], authResult['token'], this.dbOffline);
          } else {
            // console.log('Auth Failed');
          }
          // this.router.navigate([this.tgtRoute || localStorage.getItem('rd_home')]);
        },
        error => {
          // translation problem here - this error is not translated... Hmmm
          // Indeed, the returned 401 gives the unauthorised, we need to deal with this through translation
          // this.errorMsg = error.statusText;
          this.openSnackBar(this.t_data.Unauth);
          this.isSubmitting = false;
        });
  }

  showPwdReset(boo: boolean) {
    this.pwdReset = boo;
    this.errorMsg = '';
  }

  resetPwd(formValue) {
    this.memberService.sendrecoveryemail(formValue.email).subscribe(
      data => {
        console.log(data);
        if (data['status'] === 'OK') {
          this.openSnackBar(this.t_data.NewPassword);
          this.pwdReset = false;
        } else {
          this.openSnackBar(this.t_data.Unknown);
        }
      },
      error => {
        console.log(JSON.stringify(error));
        this.openSnackBar(error);
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, null, {
      duration: 5000
    });
  }

}
