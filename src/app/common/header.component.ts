import { Component, OnInit } from '@angular/core';
import {AuthenticationService } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from './about.component';
import { HeaderService } from './header.service';
import { ImageService } from '../_services/image.service';
import { CloudinaryImage } from '@cloudinary/url-gen';
import { ContactComponent } from "./contact/contact.component";
import { FaqsComponent } from "./faqs/faqs.component";
import { StorageService } from "../_services/storage.service";
import { ConfigService } from '../init/config.service';

@Component({
  selector: 'app-rc-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
  lblMemberLogin = 'User Login';
  displayName: string = this.lblMemberLogin;
  dialogRef: any;
  company_name;
  brandPrefix;
  inSession = true;
  avatarUrl = null;
  placeholderUrl = 'https://eu.ui-avatars.com/api/?format=svg&size=40&background=fff&color=000&name=';
  navLabel: string;
  member: any;
  clPlugins: any[];
  clImage: CloudinaryImage;
  lastRestaurantId: string;
  brand$: any;

  constructor(
    public authService: AuthenticationService,
    private translate: TranslateService,
    private storage: StorageService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private header: HeaderService,
    private imgService: ImageService,
    private config: ConfigService ) {
      this.clPlugins = this.imgService.cldBasePlugins;
  }

  ngOnInit() {

    // console.log('Init header');

    this.brand$ = this.config.brand;

    this.company_name = this.brand$.name;
    this.brandPrefix = this.brand$.prefix;
    this.displayName = localStorage.getItem('rd_username');
    this.member = this.storage.get('rd_profile');


    // Set default avatar/placeholder
    // Force different thread to ensure member is set

    setTimeout(() => {
      // watch for rogue values coming from the db
        // console.log(this.member.member_image_path);
        if (this.member.member_image_path !== null && this.member.member_image_path !== 'null') {
          this.clImage = this.imgService.getCldImage(this.member.member_image_path);
          // console.log(this.member.member_image_path);
        } else {
          this.header.updateAvatar( null);
        }
      }, 0);

    // Listen for changes to the section
    this.header.sectionName.subscribe(str => {
      this.navLabel = str;
      this.lastRestaurantId = this.storage.get('rd_last_restaurant');
    });

    // Listen for changes to the avatar
    this.header.currentAvatar.subscribe(url => {
      if(url === null) {
        this.avatarUrl = `${this.placeholderUrl}${this.displayName}`;
        this.clImage = null;
      } else {
        this.clImage = this.imgService.getCldImage(url);
      }
      // console.log('Avatar change', url === null, this.clImage, this.avatarUrl);
    });

    // Get notified anytime the login status changes
    this.authService.memberSessionSubject.subscribe({
      next: sessionStatus => {
        switch (sessionStatus) {
          case 'active': {
            // Successful login
            this.displayName = localStorage.getItem('rd_username');
            break;
          }
          case 'closed': {
            // User logged out
            this.inSession = false;
            this.router.navigate(['/']).then();
            break;
          }
          case 'expired': {
            // Session expired, logout
            this.inSession = false;
            this.router.navigate(['/']).then();
            break;
          }
        }
      },
      error: err => console.log(err)
    });
  }

  logout(): void {
    this.authService.logout('closed');
  }

  login(): void {
    this.router.navigate(['/']).then();
  }

  about(): void {
    const dialogRef = this.dialog.open(AboutComponent);
    dialogRef.componentInstance.build = this.config.build;
  }

  contact(): void {
    const dialogRef = this.dialog.open(ContactComponent, {
      width: '480px',
      position: {'top': '10vh'},
      data: {
        member: this.member
      }
    });
  }

  faqs(): void {
    const dialogRef = this.dialog.open(FaqsComponent, {
      width: '640px',
      position: {'top': '10vh'},
      data: {
        member: this.member
      }
    });
  }
}
