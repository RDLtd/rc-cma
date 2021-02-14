import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppConfig } from '../app.config';
import { AboutComponent } from './about.component';

@Component({
  selector: 'rc-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
  lblMemberLogin: string = 'User Login';
  displayName: string = this.lblMemberLogin;
  dialogRef: any;
  company_name;
  inSession = true;
  avatarId: any;
  placeholderAvatar = null;
  placeholderUrl = 'https://eu.ui-avatars.com/api/?format=svg&size=40&background=fff&color=000&name='


  constructor(
    public authService: AuthenticationService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private config: AppConfig ) { }

  ngOnInit() {

    this.company_name = this.config.brand.name;
    // If page refreshed
    this.displayName = (this.authService.isAuth() ? localStorage.getItem('rd_username') : this.lblMemberLogin);
    this.avatarId = localStorage.getItem('rd_avatar');
    this.placeholderAvatar = this.placeholderUrl + this.displayName;
    // Get notified anytime the login status changes
    this.authService.memberSessionSubject.subscribe(
      sessionStatus => {
        switch (sessionStatus) {
          case 'active': {
            // Successful login
            this.displayName = localStorage.getItem('rd_username');
            this.avatarId = localStorage.getItem('rd_avatar');
            this.placeholderAvatar = this.placeholderUrl + this.displayName;
            break;
          }
          case 'closed': {
            // User logged out
            this.displayName = this.lblMemberLogin;
            this.inSession = false;
            this.router.navigate(['/']);
            break;
          }
          case 'expired': {
            // Session expired
            this.displayName = this.lblMemberLogin;
            // new login page
            this.inSession = false;
            this.router.navigate(['/']);
            break;
          }
        }
      },
      err => console.log(err)
    );
  }

  logout(): void {
    this.authService.logout('closed');
  };

  login(): void {
    this.router.navigate(['/']);
  };

  about(): void {
    const dialogRef = this.dialog.open(AboutComponent);
    dialogRef.componentInstance.build = this.config.build;
  }
}
