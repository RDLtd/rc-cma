import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AuthenticationService } from './_services';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { MatDialog } from '@angular/material';
import { AppConfig } from './app.config';
import { AboutComponent } from './about.component';

@Component({
  selector: 'rc-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

  @Output() navtoggled = new EventEmitter();
  lblMemberLogin: string = 'User Login';
  displayName: string = this.lblMemberLogin;
  dialogRef: any;
  company_name;

  constructor(public authService: AuthenticationService,
              private translate: TranslateService,
              private dialog: MatDialog,
              private router: Router,
              private config: AppConfig ) { }

  ngOnInit() {

    this.company_name = localStorage.getItem('rd_company_name');

    // If app is refreshed
    if (this.authService.isAuth()) {
      this.displayName = localStorage.getItem('rd_user');
    } else {
      this.displayName = this.lblMemberLogin;
    }
    // Get notified anytime the login status changes
    this.authService.memberSessionSubject.subscribe(
      sessionStatus => {

        // console.log(sessionStatus);

        switch (sessionStatus) {
          case 'active': {
            // Successful login
            this.displayName = localStorage.getItem('rd_user');
            break;
          }
          case 'closed': {
            // User logged out
            this.displayName = this.lblMemberLogin;
            this.router.navigate(['/']);
            break;
          }
          case 'expired': {
            // Session expired
            this.displayName = this.lblMemberLogin;
            // this.login(true);
            // new login page
            this.router.navigate(['/signin']);

            break;
          }
        }
      },
      err => console.log(err)
    );
  }

  rcNavToggle(): void {
    this.navtoggled.emit();
  };

  logout(): void {
    this.authService.logout('closed');
    this.router.navigate(['/']);
  };

  login(): void {

    this.router.navigate(['/']);
    // this.dialogRef = this.dialog.open(LoginComponent);
    // // Self reference
    // this.dialogRef.componentInstance.thisDialog = this.dialogRef;
    // // Due to expired session
    // if(extSession){
    //   this.dialogRef.componentInstance.errorMsg = 'Session Expired';
    //   this.dialogRef.componentInstance.tgtRoute = this.router.url;
    // }
  };

  about(): void {
    const dialogRef = this.dialog.open(AboutComponent);
    dialogRef.componentInstance.build = this.config.build;
  }

  setLanguage(lang) {
    this.translate.use(lang);
    localStorage.setItem('rd_country', lang);
  }

}
