import { Component, OnInit, ViewChild } from '@angular/core';
import { Restaurant, Member } from '../_models';
import {
  RestaurantService,
  MemberService,
  AuthenticationService,
  CMSService,
  AnalyticsService
} from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { PasswordComponent } from './password.component';
import { ProfileDetailComponent } from './profile-detail.component';
import { ProfileImageComponent } from './profile-image.component';
import { RestaurantLookupComponent } from './restaurant-lookup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ReferralsComponent } from './referrals.component';
import { ClipboardService } from 'ngx-clipboard';
import { AppConfig } from '../app.config';
import { CmsLocalService } from '../cms';
import { LoadService, ConfirmCancelComponent, HelpService } from '../common';
import { HeaderService } from '../common/header.service';


@Component({
  selector: 'rc-profile-page',
  templateUrl: './profile-page.component.html'
})

export class ProfilePageComponent implements OnInit {

  @ViewChild('card') card;
  restaurants: Array<Restaurant>;
  restaurant: Restaurant;
  member: Member;

  defaultImages: Array<any> = [];
  imgRestPlaceholderUrl;
  isDemoMember = false;
  showLoader = false;
  referrer: any;
  showRestaurantFinder = true;
  imgAvatarPlaceholderUrl: string = 'https://eu.ui-avatars.com/api/?format=svg&size=48&background=fff&color=000&name=';
  imgUserPlaceHolderUrl = 'https://res.cloudinary.com/rdl/image/upload/v1501827164/avatars/placeholder-male.jpg';
  clPublicId: string;
  // translation variables
  t_data: any;
  brand: any;
  d_member_signedup: string;
  d_member_job: string;
  memberImagePath = this.imgUserPlaceHolderUrl;

  constructor(
    private header: HeaderService,
    private cmsLocalService: CmsLocalService,
    private restaurantService: RestaurantService,
    private memberService: MemberService,
    private ga: AnalyticsService,
    private cms: CMSService,
    public snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService,
    public help: HelpService,
    public authService: AuthenticationService,
    public appConfig: AppConfig,
    private _clipboardService: ClipboardService,
    private loadService: LoadService,
    public dialog: MatDialog) {

      this.loadService.open();

      // detect language changes... need to check for change in texts
      // translate.onLangChange.subscribe(() => {
      //   this.translate.get('Profile-Page').subscribe(data => {
      //     this.t_data = data;
      //     this.d_member_job = this.t_data[this.member.member_job];
      //     this.d_member_signedup = moment(this.member.member_signedup).format('DD MMMM YYYY');
      //     this.imgRestPlaceholderUrl = `https://via.placeholder.com/800x450?text=${this.t_data.AwaitingImage}`;
      //   });
      // });

  }

  ngOnInit() {

    this.brand = this.appConfig.brand;
    this.member = JSON.parse(localStorage.getItem('rd_profile'));

    // Updare header label
    this.header.updateSectionName(this.translate.instant('HUB.sectionSettings'));

    // Add member name to avatar url
    this.imgAvatarPlaceholderUrl += `${this.member.member_first_name} ${this.member.member_last_name}`;

    moment.locale(localStorage.getItem('rd_language'));
    this.translate.get('Profile-Page').subscribe(data => {
      this.t_data = data;
      this.imgRestPlaceholderUrl = `https://via.placeholder.com/800x450?text=${this.t_data.AwaitingImage}`;
      this.setMember();
    },
      error => console.log('No t_data', error));
  }

  setLanguage(lang): void {
    localStorage.setItem('rd_language', lang);
    window.location.reload();
  }

  openSnackBar(msg: string, act = '', dur = 5000) {
    this.snackBar.open(msg, act, {
      duration: dur
    });
  }

  setMember() {
    this.isDemoMember = (this.member.member_id === '42');
    this.d_member_signedup = moment(this.member.member_signedup).format('DD MMMM YYYY');
    // Get Cloudinary img path
    this.clPublicId = this.getMemberClPublicId(this.member.member_image_path);
    this.getAssociatedRestaurants(this.member.member_id);
    // Make sure we've loaded the translations before
    // trying to access
    if(!!this.t_data) {
      this.d_member_job = this.t_data[this.member.member_job];
    }
  }

  getReferrerInfo() {
    this.memberService.getPromo(this.member.member_promo_code).subscribe(
      data => {
        console.log('REF', data);
        if (data['promos'].length > 0) {
          this.referrer['type'] = 'member';
          this.referrer['name'] = data['promos'][0].member_first_name + ' ' + data['promos'][0].member_last_name;
        } else {
          this.referrer['type'] = 'self';
        }
      },
      error => {
        console.log(JSON.stringify(error));
        this.referrer.type = 'self';
      });
  }

  getReferralLink(): string {
    const origin = window.location.origin;
    console.log('Host', origin);
    return `${origin}/join/${this.member.member_promo_code}`;
  }

  getAssociatedRestaurants(id) {

    this.restaurantService.getMemberRestaurants(id)
      .subscribe(
        data => {
          this.restaurants = data['restaurants'];
          if (this.restaurants.length) {
            this.getDefaultImages();
          } else if (this.showRestaurantFinder) {
            this.showRestaurantFinder = false;
            this.addRestaurants();
          }
          this.loadService.close();
        },
        error => {
          console.log(error);
          this.loadService.close();
        });
  }

  removeAssociation(index) {

    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoAssociated);
    } else {
      const rest = this.restaurants[index];
      const dialogRef = this.dialog.open(ConfirmCancelComponent, {
        data: {
          body: this.t_data.AboutRemove + rest.restaurant_name + this.t_data.ListAssociated,
          confirm: this.t_data.Remove,
          cancel: this.t_data.Cancel
        }
      });

      dialogRef.afterClosed().subscribe(confirmed => {

        if (confirmed) {
          this.restaurantService.removeAssociation(rest['association_id'])
            .subscribe(
              () => {
                this.restaurants.splice(index, 1);
                this.defaultImages.splice(index, 1);
                this.openSnackBar(rest.restaurant_name + this.t_data.Removed, 'OK');
                // record event
                this.ga.sendEvent('Profile', 'Edit', 'Remove Association');
              },
              error => {
                console.log(error);
              });
        }
      });
    }
  }

  getDefaultImages() {
    const numberOfRestaurants = this.restaurants.length;
    for (let i = 0; i < numberOfRestaurants; i++) {
      this.cms.getElementClass(this.restaurants[i].restaurant_id, 'Image', 'Y')
        .subscribe(
        data => {
          if (data['count'] > 0) {
            this.defaultImages[i] = data['elements'][0].cms_element_image_path;
          } else {
            this.defaultImages[i] = null;
          }
        },
        error => {
          console.log(error);
        });
    }
  }

  getClPublicId(idx) {

    if (this.defaultImages[idx]) {
      const a = this.defaultImages[idx].split('/');
      return a.splice(a.length - 3).join('/');
    } else {
        return this.imgRestPlaceholderUrl;
    }
  }
  getMemberClPublicId(url) {
      const a = url.split('/');
      return a.splice(a.length - 3).join('/');
  }

  updateProfile() {
    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoProfile, '');
    } else {
      const dialogRef = this.dialog.open(ProfileDetailComponent);
      dialogRef.componentInstance.member = this.member;
      dialogRef.componentInstance.dialog = dialogRef;
    }
  }

  updatePassword () {
    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoPassword, '');
    } else {
      const dialogRef = this.dialog.open(PasswordComponent);
      dialogRef.componentInstance.member = this.member;
      dialogRef.componentInstance.dialog = dialogRef;
    }
  }

  updateImage() {
    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoImage, '');
    } else {
      const dialogRef = this.dialog.open(ProfileImageComponent, {
        data: {
          member: this.member
        }
      });
      dialogRef.componentInstance.dialog = dialogRef;
      dialogRef.afterClosed().subscribe(data => {
        console.log('str', data.str);
        if (data.str.length) {
          if (data.str === 'delete') {
            this.member.member_image_path = this.imgUserPlaceHolderUrl;
            localStorage.setItem('rd_profile', JSON.stringify(this.member));
            this.clPublicId = this.getMemberClPublicId(this.imgUserPlaceHolderUrl);
            localStorage.removeItem('rd_avatar');
            this.header.updateAvatar(null);
          } else {
            const imgUrl = data.str;
            // Get cloudinary reference
            this.clPublicId = this.getMemberClPublicId(imgUrl);
            // update member local storage
            this.member.member_image_path = imgUrl;
            localStorage.setItem('rd_profile', JSON.stringify(this.member));
            localStorage.setItem('rd_avatar', this.clPublicId);
            this.header.updateAvatar(data.str);
          }
        }
      });
    }

  }

  dspReferrals() {

    const dialogRef = this.dialog.open(ReferralsComponent, {
      data: {
        brand: this.appConfig.brand.name,
        member: this.member,
        joinUrl: this.getReferralLink()
      }
    });

    dialogRef.afterClosed().subscribe( tgt => {

      switch (tgt) {
        case 'code': {
          this._clipboardService.copyFromContent(this.member.member_promo_code);
          this.openSnackBar(
            this.t_data.Copied,
            'OK',
            10000
          );
          break;
        }
        case 'link': {
          this._clipboardService.copyFromContent(this.getReferralLink());
          this.openSnackBar(
            this.t_data.Copied,
            'OK',
            10000
          );
          break;
        }
        default: {
          break;
        }
      }

    });
  }

  addRestaurants() {

    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoAdd, '');
    } else {

      const dialogRef = this.dialog.open(RestaurantLookupComponent, {
        width: '480px',
        position: {'top': '10vh'},
        data: {
          associatedRestaurants: this.restaurants,
          member: this.member
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('AC', result);
          // Form markdown message
          const bodyContent =
            `# ${this.t_data.NewReq}\n\n` +
            `${this.t_data.PleaseCreate}\n\n` +
            ` - **${this.t_data.Rname}**: ${result.newRestaurantName}\n` +
            ` - **${this.t_data.Rcode}**: ${result.newRestaurantPostcode}\n` +
            ` - **${this.t_data.Rtel}**: ${result.newRestaurantTel}\n` +
            ` - **${this.t_data.Uname}**: ${this.member.member_first_name} ${this.member.member_last_name}\n` +
            ` - **${this.t_data.Uid}**: ${this.member.member_id}\n` +
            ` - **${this.t_data.Uemail}**: ${this.member.member_email}\n\n` +
            `${this.t_data.Clarification}\n\n` +
            `${this.t_data.Ta}`;

          this.memberService.sendEmailRequest(
            'curation',
            'support',
            this.t_data.NewRest,
             bodyContent)
            .subscribe( () => {
              this.cmsLocalService.dspSnackbar(this.t_data.NewRequest, 'OK', 20, 'info');
              this.showRestaurantFinder = false;
            },
              error => {
              console.log(error);
              this.showRestaurantFinder = false;
            }
          )
        } else {
          this.showRestaurantFinder = false;
          this.getAssociatedRestaurants(this.member.member_id);
        }
        this.dialog.closeAll();
      });
    }
  }
}
