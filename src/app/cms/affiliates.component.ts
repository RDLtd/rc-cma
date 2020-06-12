import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelpService, RestaurantService, CMSService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../_models';
import { AppConfig } from '../app.config';

@Component({
  selector: 'rc-affiliates',
  templateUrl: './affiliates.component.html'
})

export class AffiliatesComponent implements OnInit, OnDestroy {

  restaurant: Restaurant;
  affiliates: any[] = [];
  brand: any;

  // translation variables
  t_data: any;

  constructor(
    public help: HelpService,
    private cmsLocalService: CmsLocalService,
    private restaurantService: RestaurantService,
    private cmsService: CMSService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private config: AppConfig
  ) { }

  ngOnInit() {

    // Subscribe to observable
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (!!data.restaurant_id) {
            this.restaurant = data;
          }
        },
        error => console.log('Failed to load restaurant from local CMS : ', error));

    // Load offers
    this.getPartnerOffers();

    this.translate.get('Affiliates').subscribe(data => {
      this.t_data = data;
    });
  }

  ngOnDestroy() {
    // Record the access event for this restaurant
    this.restaurantService.recordAccess(Number(this.restaurant.restaurant_id), 0, 'Viewed Offers')
      .subscribe(
        () => {
          console.log('Access record updated - Viewed Offers');
          this.cmsLocalService.setOfferCount(0);
        },
        error => {
          console.log('Could not update access record' + error);
        });
  }

  getPartnerOffers(): void {

    this.restaurantService.getPartners(this.config.brand.prefix.toUpperCase())
      .subscribe(
        partners => {
          let len = partners['partners'].length, p, i;
          for (i = 0; i < len; i++) {
            // only load partners for which there is an offer
            // down the road might want to only load one that is valid?
            p = partners['partners'][i];
            if (p.offer_partner_id) {
              this.affiliates.push(p);
            }
          }
        },
        err => {
          console.log('No partner records found : ', err);
        });
  }

  viewMarketing(index) {

    if (this.restaurant.restaurant_rc_member_status !== 'Full') {
      this.dialog.open(PaymentComponent, {
        panelClass: 'rc-dialog-member',
        data: {
          restaurant: this.restaurant,
          dialog: this.dialog
        }
      });

    } else {

      // Record the access event for this restaurant
      this.restaurantService.recordAccess(Number(this.restaurant.restaurant_id),
        this.affiliates[index].partner_id, 'Viewed Marketing')
        .subscribe(
          () => {
            console.log('Access record updated - Viewed Marketing');
          },
          () => {
            console.log('Could not update access record');
          });
      //
    }
  }

  redeemOffer(index) {

    if (this.restaurant.restaurant_rc_member_status !== 'Full') {
      this.dialog.open(PaymentComponent, {
        panelClass: 'rc-dialog-member',
        data: {
          restaurant: this.restaurant,
          dialog: this.dialog
        }
      });

    } else {

      const aff = this.affiliates[index];
      const rst = this.restaurant;

      this.cmsService.sendOfferRequestToAffiliateEmail({
        affiliate_email: aff.partner_email,
        affiliate_name: aff.partner_name,
        restaurant_name:  rst.restaurant_name,
        restaurant_address: rst.restaurant_address_1 + ', ' + rst.restaurant_address_2 + ', '
          + rst.restaurant_address_3,
        restaurant_telephone: rst.restaurant_telephone,
        restaurant_email: rst.restaurant_email,
        admin_fullname: localStorage.getItem('rd_username'),
        restaurant_number: rst.restaurant_number,
        email_language: localStorage.getItem('rd_language')
      }).subscribe(
          () => {
            console.log('Email sent to ' + aff.partner_name + ' from ' +
              rst.restaurant_name);
          },
          error => {
            console.log('Could not send email to ' + aff.partner_name + ' from ' +
              rst.restaurant_name, error);
          });


      this.cmsService.sendOfferConfirmation({
        affiliate_name: aff.partner_name,
        affiliate_contact_message: aff.partner_contact_message,
        restaurant_name: rst.restaurant_name,
        restaurant_email: rst.restaurant_email,
        restaurant_number: rst.restaurant_number,
        email_language: localStorage.getItem('rd_language')
      }).subscribe(
          () => {
            console.log('Offer confirmation from ' + aff.partner_name + ' sent to ' +
              rst.restaurant_name);
          },
          error => {
            console.log('Could not send offer confirmation from ' + aff.partner_name + ' to ' +
              rst.restaurant_name, error);
          });

      // finally record the access event for this restaurant
      this.restaurantService.recordAccess(Number(rst.restaurant_id),
        aff.partner_id, 'Clicked Through')
        .subscribe(
          () => {
            console.log('Access record updated - ' + rst.restaurant_name + ' clicked through ' +
              aff.partner_name);
          },
          () => {
            console.log('Could not update access record');
          });

      // show a generic message - the partner specific message is sent by email
      this.cmsLocalService.dspSnackbar(aff.partner_name + this.t_data.Message +
        rst.restaurant_email + this.t_data.Contact, 'OK', 30);
    }
  }

}
