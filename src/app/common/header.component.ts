import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppConfig } from '../app.config';
import { AboutComponent } from './about.component';
import { HeaderService } from './header.service';

@Component({
  selector: 'rc-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
  lblMemberLogin: string = 'User Login';
  displayName: string = this.lblMemberLogin;
  dialogRef: any;
  company_name;
  brandPrefix;
  inSession = true;
  avatarUrl = null;
  placeholderUrl = 'https://eu.ui-avatars.com/api/?format=svg&size=40&background=fff&color=000&name=';
  navLabel: string;
  member: any;

  constructor(
    public authService: AuthenticationService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private header: HeaderService,
    private config: AppConfig ) {

  }

  ngOnInit() {

    // console.log('Init header');

    this.company_name = this.config.brand.name;
    this.brandPrefix = this.config.brand.prefix;
    this.displayName = localStorage.getItem('rd_username');
    this.member = JSON.parse(localStorage.getItem('rd_profile'));

    // Set default avatar/placeholder
    // Force different thread to ensure member is set
    setTimeout(() => this.avatarUrl = this.member.member_image_path || this.placeholderUrl + this.displayName, 0);

    // Listen for changes to the section
    this.header.sectionName.subscribe(str => {
      this.navLabel = str;
    });

    // Listen for changes to the avatar
    this.header.currentAvatar.subscribe(url => {
      this.avatarUrl = url || this.placeholderUrl + this.displayName;
      // console.log('Avatar change', this.avatarUrl);
    });

    // Get notified anytime the login status changes
    this.authService.memberSessionSubject.subscribe(
      sessionStatus => {
        switch (sessionStatus) {
          case 'active': {
            // Successful login
            this.displayName = localStorage.getItem('rd_username');
            break;
          }
          case 'closed': {
            // User logged out
            this.inSession = false;
            this.router.navigate(['/']);
            break;
          }
          case 'expired': {
            // Session expired, logout
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
