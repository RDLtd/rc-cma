import { Component, OnInit, ViewChild } from '@angular/core';
import { Restaurant, Member } from '../_models';
import {
  RestaurantService,
  MemberService,
  CMSService,
  AnalyticsService, ErrorService
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
import { AppConfig } from '../app.config';
import { CmsLocalService } from '../cms';
import { LoadService, ConfirmCancelComponent, HelpService } from '../common';
import { HeaderService } from '../common/header.service';
import { CurrencyPipe } from '@angular/common';
import { ImageService } from '../_services/image.service';
import { CloudinaryImage } from '@cloudinary/url-gen';


@Component({
  selector: 'app-rc-settings',
  templateUrl: './settings.component.html'
})

export class SettingsComponent implements OnInit {

  @ViewChild('card') card;
  restaurants: Array<Restaurant>;
  restaurant: Restaurant;
  member: Member;
  lang: string;

  defaultImages: Array<CloudinaryImage> = [];
  showRestaurantFinder = true;
  d_member_signedup: string;
  restProd: any;
  cachedRestaurantsLength = null;

  products: [any];
  productRenewalDate: Date;
  currentProduct: any;
  isFreeMembership = false;
  freeMembershipExpiry = '';

  clImage: CloudinaryImage;
  clPlugins: any[];

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
    private loadService: LoadService,
    private currencyPipe: CurrencyPipe,
    private imgService: ImageService,
    private error: ErrorService,
    public dialog: MatDialog) {

    this.loadService.open();
    this.lang = localStorage.getItem('rd_language');
    this.member = JSON.parse(localStorage.getItem('rd_profile'));
    moment.locale(this.lang);
    this.clPlugins = this.imgService.cldBasePlugins;
  }

  ngOnInit() {

    // Update header label
    this.header.updateSectionName(this.translate.instant('SETTINGS.titleSection'));

    this.setMember();
    this.setProducts();
    this.getAssociatedRestaurants(this.member.member_id);
  }

  setMember(): void {
    console.log('USER', this.member);

    // Is it a founder or BJT introduction
    this.isFreeMembership = this.member.member_membership_type === 'Free';
    if (!!this.member.member_free_expiry) {
      this.freeMembershipExpiry = `(${moment(this.member.member_free_expiry).format('DD-MM-YYYY')})`;
    }

    // in case of rogue values from the db
    if (this.member.member_image_path === 'null' || this.member.member_image_path === 'undefined') {
      this.member.member_image_path = null;
    }
    this.d_member_signedup = moment(this.member.member_signedup).format('DD MMMM YYYY');
    // Get Cloudinary img path
    if(this.member.member_image_path !== null){
      this.clImage = this.imgService.getCldImage(this.member.member_image_path);
      // console.log(this.clImage);
    }
  }

  setProducts(): void {
    // Any pending invoices
    if (!this.isFreeMembership) {
      this.memberService.getUpcomingInvoice(this.member.member_customer_id)
        .subscribe({
          next: data => {
            // create renewal date obj.
            this.productRenewalDate = new Date(data['invoice']['period_end'] * 1000);
          },
          error: error => {
            console.log(error);
            this.error.handleError('', 'Failed to get upcoming invoice in settings component! ' + error);
          }
        });
    }

    this.memberService.getProducts()
      .subscribe({
        next: obj => {
          this.products = obj['products'];
          // Set current product
          // *** If it's an old registration, use product[0] to keep things working
          // console.log('Products loaded', this.products);
          // Find & store the current Member product
          this.currentProduct =
            this.products.find(p => p.product_stripe_id === this.member.member_product_id) || this.products[0];
        },
        error: error => {
          console.log(error);
          this.error.handleError('', 'Failed to get products in settings component! ' + error);
        }
      });
  }

  getAssociatedRestaurants(id): void {

    this.restaurantService.getMemberRestaurants(id)
      .subscribe({
        next: data => {
          this.restaurants = data['restaurants'];
          if (this.restaurants.length) {
            this.getDefaultImages();

            // Have any new restaurants just been added?
            if (!!this.cachedRestaurantsLength && this.cachedRestaurantsLength < this.restaurants.length) {
              // Do we need to charge the Member?
              if (!this.isFreeMembership) {
                this.addRestaurantSubscription();
              }
            }
          } else if (this.showRestaurantFinder) {
            this.showRestaurantFinder = false;
            // Members no longer need to have a restaurant
            // so stop automatically prompting everytime
            // they are in settings
            // this.addRestaurants();
          }
          this.loadService.close();
        },
        error: error => {
          console.log(error);
          this.error.handleError('failedToLoadAssociatedRestaurants', 'Failed to load associated restaurants! ' + error);
          this.loadService.close();
        }
      });
  }

  checkAllowance(): void {
    // Cache the current restaurant length
    this.cachedRestaurantsLength = this.restaurants.length;
    console.log('cachedRestaurantsLength =', this.cachedRestaurantsLength);

    if (this.restaurants.length === 0 || this.isFreeMembership) {
      // No restaurants have been added yet so
      //  no need to update the subscription
      this.addRestaurants();
    } else {
      // This is an additional restaurant

      this.restProd = this.getRestaurantProduct();
      console.log('Product', this.restProd);
      // Calculate the new total subscription
      const newTotal = (this.restProd.product_price * this.cachedRestaurantsLength) + Number(this.currentProduct.product_price);
      // Confirm charges
      const dialogRef = this.dialog.open(ConfirmCancelComponent, {
        data: {
          title: this.translate.instant('SETTINGS.titleConfirmAddRestaurant'),
          body: this.translate.instant(
            'SETTINGS.msgAddRestaurant_' + this.currentProduct.product_period,
            {
              price: this.currencyPipe.transform(
                this.restProd.product_price,
                this.appConfig.brand.currency.code),
              total: this.currencyPipe.transform(newTotal,
                this.appConfig.brand.currency.code)
            }),
          confirm: 'Continue'
        }
      });

      dialogRef.afterClosed().subscribe( confirmed => {
        // Member agrees to the charges
        if (confirmed) {
          this.addRestaurants();
        }
      });
    }
  }

  getRestaurantProduct(): object {
    // Find the restaurant subscription product by filtering
    // and using the 1st element of the filtered array
    // apptiser prods need product_max_restaurants set to 3
    console.log('getRestaurantProduct', this.products);

    this.products.forEach((product) => {
      console.log(product.product_max_restaurants, product.product_period, this.currentProduct.product_period[0]);
    });

    return this.products.filter(
      p => p.product_max_restaurants === 3 && p.product_period === this.currentProduct.product_period)[0];
  }

  addRestaurants(): void {

    // Open restaurant search
    const dialogRef = this.dialog.open(RestaurantLookupComponent, {
      width: '480px',
      position: {'top': '10vh'},
      data: {
        associatedRestaurants: this.restaurants,
        member: this.member
      }
    });

    dialogRef.afterClosed().subscribe(userRequest => {

      // If the restaurant is not found
      // ask curators to add it
      if (userRequest) {
        console.log('New restaurant listing requested', userRequest);
        // Todo: new email service?
        // New restaurant listing request message to curators
        const bodyContent =
          `# New Restaurant\n\n` +
          `Please create:\n\n` +
          ` - **Restaurant**: ${userRequest.newRestaurantName}\n` +
          ` - **Code**: ${userRequest.newRestaurantPostcode}\n` +
          ` - **Telephone**: ${userRequest.newRestaurantTel}\n` +
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
          .subscribe({
            next: () => {
              this.cmsLocalService.dspSnackbar(this.translate.instant('SETTINGS.msgNewRequestReceived'), 'OK', 20, 'info');
              this.showRestaurantFinder = false;
            },
            error: error => {
              console.log(error);
              // no need to show user
              this.error.handleError('', 'Failed to send curation request email! ' + bodyContent + ', ' + error);
              this.showRestaurantFinder = false;
            }
          });
      } else {
        // All good
        this.showRestaurantFinder = false;
        this.getAssociatedRestaurants(this.member.member_id);
      }
      this.dialog.closeAll();
    });
  }

  addRestaurantSubscription(): void {
    console.log(`Cached = ${this.cachedRestaurantsLength}, New = ${this.restaurants.length}`);

    // If this is the first additional restaurant
    // i.e. it's the 2nd restaurant that's been associated
    // then we need to create the subscription
    if (this.restaurants.length === 2) {
      this.loadService.open('Create Restaurant Subscription');
      this.memberService.createRestaurantSubscription(
        this.member.member_id,
        this.member.member_customer_id,
        this.restProd.product_stripe_price_id,
        this.restProd.product_tax_id,
        1
      ).subscribe({
        next: res => {
          console.log(res);
          // Now update member's subscription id
          this.member.member_subscription_id = res['subscription_id'];
          localStorage.setItem('rd_profile', JSON.stringify(this.member));
          this.loadService.close();
        },
        error: error => {
          console.log(error);
          this.error.handleError('', 'Failed to create restaurant subscription! ' + error);
          this.loadService.close();
        }
      });
    } else {
      // update subscription charge
      this.updateRestaurantSubscription(this.restaurants.length - 1);
    }
  }

  updateRestaurantSubscription(qty: number): void {
    this.loadService.open('Update Subscription');
    this.restProd = this.getRestaurantProduct();
    this.memberService.addRestaurantSubscription(
      this.member.member_id,
      this.member.member_subscription_id,
      this.restProd.product_stripe_price_id,
      this.restProd.product_tax_id,
      qty
    )
      .subscribe({
        next: res => {
          console.log(res);
          this.loadService.close();
        },
        error: error => {
          console.log(error);
          this.error.handleError('', 'Failed to update restaurant subscription! ' + error);
          this.loadService.close();
        }
      });
  }

  removeAssociation(event, index): void {
    event.stopPropagation();
    const rest = this.restaurants[index];
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        body: this.translate.instant('SETTINGS.msgRemoveRestaurant', { name: rest.restaurant_name }),
        confirm: this.translate.instant('SETTINGS.labelBtnRemove')
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {

      if (confirmed) {
        const addedRestaurantCount = this.restaurants.length - 1;
        // do we need to update the restaurant subscription?

        if (addedRestaurantCount && !this.isFreeMembership) {
          addedRestaurantCount === 1 ?
            this.deleteRestaurantSubscription() : this.updateRestaurantSubscription(addedRestaurantCount - 1);
        }

        this.restaurantService.removeAssociation(rest['association_id'])
          .subscribe({
            next: () => {
              this.restaurants.splice(index, 1);
              this.defaultImages.splice(index, 1);
              this.openSnackBar(this.translate.instant('SETTINGS.msgRestaurantRemoved', {name: rest.restaurant_name}), 'OK');
              // record event
              this.ga.sendEvent('Profile', 'Edit', 'Remove Association');
            },
            error: error => {
              this.error.handleError('', 'Failed to remove restaurant subscription! ' + error);
              console.log(error);
            }
          });
      }
    });
  }

  deleteRestaurantSubscription(): void {
    this.loadService.open('Removing Restaurant');
    this.memberService.deleteRestaurantSubscription( this.member.member_subscription_id)
      .subscribe({
        next: res => {
          console.log(res);
          this.loadService.close();
        },
        error: error => {
          console.log(error);
          this.error.handleError('', 'Failed to remove restaurant! ' + error);
          this.loadService.close();
        }
      });
  }

  viewMemberPlans(): void {
    const msg = this.currentProduct.product_period === 'm' ?
      'SETTINGS.msgChangePlanToYearly' : 'SETTINGS.msgChangePlanToMonthly';
    this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: this.translate.instant('SETTINGS.titleSubscription'),
        body: this.translate.instant( msg, { plan: this.currentProduct.product_name }),
        confirm: 'OK',
        cancel: 'hide'
      }
    });
  }

  managePayments(): void {
    // First get the stripe customer number for this member from the database
    this.memberService.getStripeCustomerNumber(this.member.member_id)
      .subscribe({
        next: (customer) => {
          console.log(customer);
          // need to send stripe back to this window
          // @ts-ignore
          this.memberService.accessCustomerPortal(customer.customer_number, window.location.href)
              .subscribe({
                next: (data) => {
                  // console.log('accessed CustomerPortal OK', data);
                  // @ts-ignore
                  window.open(data.url, '_self');
                },
                error: error => {
                  console.log('accessCustomerPortal error', error);
                  this.error.handleError('', 'Unable to access stripe customer portal for member id ' +
                    this.member.member_id + '! ' + error);
                }
              });
        },
        error: error => {
          this.error.handleError('', 'Failed to get stripe customer number for member id ' +
            this.member.member_id + '! ' + error);
          console.log('getStripeCustomerNumber error', error);
        }
      });
  }

  updateMemberContacts(): void {
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

  updateMember(member): void {
    // console.log('update:', member);
    // update member
    this.memberService.update(member)
      .subscribe({
        next: () => {
          localStorage.setItem('rd_profile', JSON.stringify(this.member));
          localStorage.setItem('rd_username', `${this.member.member_first_name} ${this.member.member_last_name}`);
          this.openSnackBar(this.translate.instant('SETTINGS.msgContactsUpdated'));
        },
        error: error => {
          console.log(error);
          this.error.handleError('', 'Failed to update member settings for member id ' +
            this.member.member_id + '! ' + error);
          this.openSnackBar(this.translate.instant('SETTINGS.msgUpdateFailed'));
        }
      });
  }

  updatePassword (): void {
    const dialogRef = this.dialog.open(PasswordComponent);
    dialogRef.componentInstance.member = this.member;
    dialogRef.componentInstance.dialog = dialogRef;
  }

  updateImage(): void {
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
          this.clImage = null;
          localStorage.removeItem('rd_avatar');
          this.header.updateAvatar(null);

        } else {

          const imgUrl = data.str;
          // Get cloudinary reference
          this.clImage = this.imgService.getCldImage(imgUrl);
          // update member local storage
          this.member.member_image_path = imgUrl;
          localStorage.setItem('rd_avatar', imgUrl);
          this.header.updateAvatar(data.str);
        }
        localStorage.setItem('rd_profile', JSON.stringify(this.member));
        this.openSnackBar(this.translate.instant('SETTINGS.msgAvatarUpdated'), 'OK');
      }
    });
  }

  getReferralCode(): string {
    return `${origin}/join/${this.member.member_promo_code}`;
  }

  getDefaultImages(): void {
    // console.log(this.restaurants);
    const numberOfRestaurants = this.restaurants.length;
    for (let i = 0; i < numberOfRestaurants; i++) {
      this.cms.getElementClass(this.restaurants[i].restaurant_id, 'Image', 'Y')
        .subscribe({
          next: data => {
            if (data['elements'].length === 0) {
              this.defaultImages[i] = null;
              return;
            }
            this.defaultImages[i] = this.imgService.getCldImage(data['elements'][0].cms_element_image_path);
          },
          error: error => {
            console.log(error);
            this.error.handleError('', 'Failed to get default images for restaurant id ' +
              this.restaurants[i].restaurant_id + '! ' + error);
          }
        });
    }
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

  notificationUpdated(e): void {
    console.log('Accept', e.source.name, e.checked);
    // Todo: update notifications api call
    this.openSnackBar(
      this.translate.instant('SETTINGS.msgNotificationsUpdated'),
      null,
      2000
    );
  }

  // getReferralLink(): string {
  //   const origin = window.location.origin;
  //   console.log('Host', origin);
  //   return `${origin}/join/${this.member.member_promo_code}`;
  // }

  copied(): void {
    this.openSnackBar(this.translate.instant('SETTINGS.msgLinkCopied'), 'OK');
  }

  // Switch language
  setLanguage(lang): void {
    localStorage.setItem('rd_language', lang);
    window.location.reload();
  }

  openSnackBar(msg: string, act = '', dur = 5000, pos: any = 'top'): void {
    this.snackBar.open(msg, act, {
      verticalPosition: pos,
      duration: dur
    });
  }
}
