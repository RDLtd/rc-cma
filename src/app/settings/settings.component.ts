import { Component, OnInit, ViewChild } from '@angular/core';
import { Restaurant, Member } from '../_models';
import {
  RestaurantService,
  MemberService,
  CMSService,
  AnalyticsService
} from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { PasswordComponent } from './password.component';
import { ContactsComponent } from './contacts.component';
import { ImageComponent } from './image.component';
import { RestaurantLookupComponent } from './restaurant-lookup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ClipboardService } from 'ngx-clipboard';
import { AppConfig } from '../app.config';
import { CmsLocalService } from '../cms';
import { LoadService, ConfirmCancelComponent, HelpService } from '../common';
import { HeaderService } from '../common/header.service';
import { MembershipPlanComponent } from '../join/membership-plan.component';


@Component({
  selector: 'rc-settings',
  templateUrl: './settings.component.html'
})

export class SettingsComponent implements OnInit {

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
  clPublicId: string;
  brand: any;
  d_member_signedup: string;
  lang: string;

  membershipPlans = [
    {
      id: 1,
      name: 'Single-Site',
      benefits: 'Content management and hosted Single Page Website for one restaurant. Full access to the Hub' +
        ' including Community Forum and Knowledge Base.',
      cost: {
        monthly: 999,
        yearly: 9900
      }
    },
    {
      id: 2,
      name: 'Multi-Site',
      benefits: 'Community Forum, Knowledge Base and Web Content Management and hosted SPW licences for up to 3' +
        ' restaurants, plus 1 hour per month of technical support',
      cost: {
        monthly: 1825,
        yearly: 18900
      }
    },
    {
      id: 3,
      name: 'Group',
      benefits: 'Community Forum, Knowledge Base and Web Content Management and hosted SPW licences for up to 6' +
        ' restaurants, plus 2 hours per month of technical support',
      cost: {
        monthly: 2825,
        yearly: 29800
      }
    },
    {
      id: 4,
      name: 'Large Group',
      benefits: 'Community Forum, Knowledge Base and Web Content Management and hosted SPW licences for up to 10' +
        ' restaurants, plus 3 hours per month technical support',
      cost: {
        monthly: 3825,
        yearly: 40900
      }
    }
  ]


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
    public appConfig: AppConfig,
    private _clipboardService: ClipboardService,
    private loadService: LoadService,
    public dialog: MatDialog) {
      this.loadService.open();
  }

  ngOnInit() {

    this.brand = this.appConfig.brand;
    this.member = JSON.parse(localStorage.getItem('rd_profile'));
    this.lang = localStorage.getItem('rd_language');

    moment.locale(this.lang);

    this.setMember();

    // Update header label
    this.header.updateSectionName(this.translate.instant('HUB.sectionSettings'));

    // Add member name to avatar url
    if (this.member.member_image_path) {
      setTimeout(() => this.header.updateAvatar(this.member.member_image_path), 0);
      //this.header.updateAvatar(this.member.member_image_path);
    }

    // Add restaurant placeholder
    this.imgRestPlaceholderUrl =
      `https://via.placeholder.com/360x240?text=${this.translate.instant('SETTINGS.labelAwaitingImage')}`;
  }
  // Switch language
  setLanguage(lang): void {
    localStorage.setItem('rd_language', lang);
    window.location.reload();
  }

  openSnackBar(msg: string, act = '', dur = 5000) {
    this.snackBar.open(msg, act, {
      verticalPosition: 'top',
      duration: dur
    });
  }

  setMember() {
    this.d_member_signedup = moment(this.member.member_signedup).format('DD MMMM YYYY');
    // Get Cloudinary img path
    this.clPublicId = this.getMemberClPublicId(this.member.member_image_path);
    this.getAssociatedRestaurants(this.member.member_id);
  }

  // getReferrerInfo() {
  //   this.memberService.getPromo(this.member.member_promo_code).subscribe(
  //     data => {
  //       console.log('REF', data);
  //       if (data['promos'].length > 0) {
  //         this.referrer['type'] = 'member';
  //         this.referrer['name'] = data['promos'][0].member_first_name + ' ' + data['promos'][0].member_last_name;
  //       } else {
  //         this.referrer['type'] = 'self';
  //       }
  //     },
  //     error => {
  //       console.log(JSON.stringify(error));
  //       this.referrer.type = 'self';
  //     });
  // }

  getReferralLink(): string {
    const origin = window.location.origin;
    console.log('Host', origin);
    return `${origin}/join/${this.member.member_promo_code}`;
  }

  copied(): void {
    this.openSnackBar(this.translate.instant('SETTINGS.msgLinkCopied'), 'OK');
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
    const rest = this.restaurants[index];
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        body: this.translate.instant('SETTINGS.msgRemoveRestaurant', { name: rest.restaurant_name }),
        confirm: this.translate.instant('SETTINGS.labelBtnRemove')
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {

      if (confirmed) {
        this.restaurantService.removeAssociation(rest['association_id'])
          .subscribe(
            () => {
              this.restaurants.splice(index, 1);
              this.defaultImages.splice(index, 1);
              this.openSnackBar(this.translate.instant('SETTINGS.msgRestaurantRemoved', { name: rest.restaurant_name }), 'OK');
              // record event
              this.ga.sendEvent('Profile', 'Edit', 'Remove Association');
            },
            error => {
              console.log(error);
            });
      }
    });
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

      if(!!url) {
        //this.header.updateAvatar(url);
        const arr = url.split('/');

        return arr.splice(arr.length - 3).join('/');

      } else {
        return null;
      }

  }

  updateMemberContacts() {
    // save a reference to the current member details
    // in case the update is cancelled
    const cachedMember = Object.assign([], this.member);
    const dialogRef = this.dialog.open(ContactsComponent, {
      data: {
        member: this.member
      }
    });
    dialogRef.afterClosed().subscribe( res => {

      if (res.confirmed) {
        // console.log('Update with:', res.member);
        this.updateMember(res.member);

      } else {

        // Cancelled updates so revert
        console.log('Revert');
        // Reset form data from cache
        this.member = Object.assign({}, cachedMember);
      }
    });
  }

  updateMember(member) {
    // console.log('update:', member);
    // update member
    this.memberService.update(member)
      .subscribe(
        () => {
          localStorage.setItem('rd_profile', JSON.stringify(this.member));
          localStorage.setItem('rd_username', `${this.member.member_first_name} ${this.member.member_last_name}`);
          this.openSnackBar(this.translate.instant('SETTINGS.msgContactsUpdated'));
        },
        error => {
          console.log(error);
          this.openSnackBar(this.translate.instant('SETTINGS.msgUpdateFailed'));
        });
  }

  updatePassword () {
    const dialogRef = this.dialog.open(PasswordComponent);
    dialogRef.componentInstance.member = this.member;
    dialogRef.componentInstance.dialog = dialogRef;
  }

  updateImage() {
    const dialogRef = this.dialog.open(ImageComponent, {
      data: {
        member: this.member
      }
    });
    dialogRef.componentInstance.dialog = dialogRef;
    dialogRef.afterClosed().subscribe(data => {
      console.log('Close dialog', data);
      if (!!data) {
        console.log('!!', data);
        if (data.str === 'delete') {

          this.member.member_image_path = null;
          this.clPublicId = null;
          localStorage.removeItem('rd_avatar');
          this.header.updateAvatar(null);


        } else {

          const imgUrl = data.str;
          // Get cloudinary reference
          this.clPublicId = this.getMemberClPublicId(imgUrl);
          // update member local storage
          this.member.member_image_path = imgUrl;
          localStorage.setItem('rd_avatar', this.clPublicId);
          this.header.updateAvatar(data.str);
        }
        localStorage.setItem('rd_profile', JSON.stringify(this.member));
        this.openSnackBar(this.translate.instant('SETTINGS.msgAvatarUpdated'), 'OK');
      }
    });
  }

  getReferralCode(): string {
    return `${this.appConfig.brand.joinUrl}?referral=${this.member.member_promo_code}`
  }

  addRestaurants() {

    // Check teh Member's plan. Can we add a restaurant
    // or do they need to upgrade?

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
          `# New Restaurant\n\n` +
          `Please create:\n\n` +
          ` - **Restaurant**: ${result.newRestaurantName}\n` +
          ` - **Code**: ${result.newRestaurantPostcode}\n` +
          ` - **Telephone**: ${result.newRestaurantTel}\n` +
          ` - **Member name**: ${this.member.member_first_name} ${this.member.member_last_name}\n` +
          ` - **Member ID: ${this.member.member_id}\n` +
          ` - **Member Email**: ${this.member.member_email}\n\n` +
          `Contact the user directly if any clarification is required.\n\n` +
          `Thank you`;

        this.memberService.sendEmailRequest(
          'curation',
          'support',
          'New Restaurant',
          bodyContent)
          .subscribe( () => {
            this.cmsLocalService.dspSnackbar(this.translate.instant('SETTINGS.msgNewRequestReceived'), 'OK', 20, 'info');
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

  viewMemberPlans(): void {
    let dialogRef = this.dialog.open(MembershipPlanComponent, {
      data: {
        plans: this.membershipPlans
      }
    });
  }
}
