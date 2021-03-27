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
  lang: string;

  defaultImages: Array<any> = [];
  imgRestPlaceholderUrl;
  isDemoMember = false;
  showLoader = false;
  referrer: any;
  showRestaurantFinder = true;
  clPublicId: string;
  d_member_signedup: string;

  products: [any];
  productRenewalDate: Date;
  currentProduct: any;


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
      this.lang = localStorage.getItem('rd_language');
  }

  ngOnInit() {
    this.member = JSON.parse(localStorage.getItem('rd_profile'));
    this.setMember();
    console.log(this.member);
    moment.locale(this.lang);

    // Update header label
    this.header.updateSectionName(this.translate.instant('HUB.sectionSettings'));

    // Add restaurant placeholder
    this.imgRestPlaceholderUrl =
      `https://via.placeholder.com/360x240?text=${this.translate.instant('SETTINGS.labelAwaitingImage')}`;

    this.setProducts();

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
    // in case of rogue values from the db
    if (this.member.member_image_path === 'null' || this.member.member_image_path === 'undefined') {
      this.member.member_image_path = null;
    }
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

      if (!!url && url !== 'null') {

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
    return `${this.appConfig.brand.joinUrl}?referral=${this.member.member_promo_code}`;
  }

  // Does the current plan allow for more restaurants to be added?
  checkAllowance() {
    console.log(this.currentProduct, this.restaurants.length);
    if (this.currentProduct.product_max_restaurants > this.restaurants.length) {
      this.addRestaurants();
    } else {
      this.viewMemberPlans();
    }
  }

  addRestaurants() {

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
            .subscribe(() => {
                this.cmsLocalService.dspSnackbar(this.translate.instant('SETTINGS.msgNewRequestReceived'), 'OK', 20, 'info');
                this.showRestaurantFinder = false;
              },
              error => {
                console.log(error);
                this.showRestaurantFinder = false;
              }
            );
        } else {
          this.showRestaurantFinder = false;
          this.getAssociatedRestaurants(this.member.member_id);
        }
        this.dialog.closeAll();
      });
  }

  setProducts(): void {
    this.memberService.getUpcomingInvoice(this.member.member_customer_id).subscribe(data => {
      // console.log('getUpcomingInvoice', new Date(data['invoice']['period_end']*1000).toDateString());
      this.productRenewalDate = new Date(data['invoice']['period_end'] * 1000);
    });

    this.memberService.getProducts().subscribe(obj => {
      this.products = obj['products'];
      // Set current product
      //
      // If this is an old registration then just use
      // the first product to keep things working
      //
      this.currentProduct =
        this.products.find(p => p.product_stripe_id === this.member.member_product_id) || this.products[0];
      console.log(this.currentProduct);
    });
  }

  viewMemberPlans(): void {
    //
    // this fallbackDate is just to stop old registrations breaking
    let fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 2);
    //
    let dialogRef = this.dialog.open(MembershipPlanComponent, {
      maxWidth: '600px',
      data: {
        currencyCode: this.appConfig.brand.currency.code,
        currentPlanId: this.currentProduct.product_id,
        products: this.products,
        renewal: this.productRenewalDate || fallbackDate,
        max: this.restaurants.length
      }
    });

    dialogRef.afterClosed().subscribe(changed => {
      // console.log(this.member);
      if (changed) {

        this.loadService.open(this.translate.instant('LOADER.msgUpdatingPlan'));

        // Change membership plan
        this.memberService.changeSubscription( this.member.member_id, this.member.member_subscription_id, changed.priceId )
         .subscribe(result => {
           this.currentProduct = this.products.find(p => p.product_stripe_id === changed.productId);
           // reload member & update local storage
           this.memberService.getById(this.member.member_id).subscribe(m => {
             this.member = this.member = m['member'][0];
             localStorage.setItem('rd_profile', JSON.stringify(this.member));
             this.openSnackBar(this.translate.instant(
               'SETTINGS.msgPlanUpdated',
               { plan: this.currentProduct.product_name }),
               'OK');
              });
             this.loadService.close();
         },
           error => {
             console.log('Subscription Error', error);
             this.loadService.close();
         });
      }
    });
  }

  managePayments() {
    // First get the stripe customer number for this member from the database
    this.memberService.getStripeCustomerNumber(this.member.member_id)
      .subscribe( (customer) => {
          // need to send stripe back to this window
          // @ts-ignore
          this.memberService.accessCustomerPortal(customer.customer_number, window.location.href)
            .subscribe( (data) => {
                // console.log('accessed CustomerPortal OK', data);
                // @ts-ignore
                window.open(data.url, '_self');
              },
              error => {
                console.log('accessCustomerPortal error', error);
              }
            );
        },
        error => {
          console.log('getStripeCustomerNumber error', error);
        }
      );
  }

}
