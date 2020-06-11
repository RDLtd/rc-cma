import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelpService, RestaurantService, CMSService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-affiliates',
  templateUrl: './affiliates.component.html'
})

export class AffiliatesComponent implements OnInit, OnDestroy {

  restaurant: any;
  affiliates: any[] = [];

  // translation variables
  t_data: any;

  constructor(
    public help: HelpService,
    private cmsLocalService: CmsLocalService,
    private restaurantService: RestaurantService,
    private cmsService: CMSService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // Subscribe to observable
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (data.restaurant_id) {
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

    // select the correct partners by country
    let company_code = 'RC';
    if (localStorage.getItem('rd_company_name') === 'Restaurateurs Indépendants') {
      company_code = 'RI';
    }

    this.restaurantService.getPartners(company_code)
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
      const dialogRef = this.dialog.open(PaymentComponent, {
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
          error => {
            console.log('Could not update access record' + error);
          });
      //
    }
  }

  redeemOffer(index) {

    if (this.restaurant.restaurant_rc_member_status !== 'Full') {
      const dialogRef = this.dialog.open(PaymentComponent, {
        panelClass: 'rc-dialog-member',
        data: {
          restaurant: this.restaurant,
          dialog: this.dialog
        }
      });

    } else {

      console.log(this.restaurant.restaurant_email, this.affiliates[index].partner_email);



      // Send offer request to affiliate
      //   affiliate_email: string,
      //   affiliate_name: string,
      //   restaurant_name: string,
      //   restaurant_address: string,
      //   restaurant_telephone: string,
      //   restaurant_email: string,
      //   admin_fullname: string,
      //   restaurant_number: string,
      //   email_language: string
      this.cmsService.sendOfferRequestToAffiliateEmail(
          this.affiliates[index].partner_email,
          this.affiliates[index].partner_name,
          this.restaurant.restaurant_name,
          this.restaurant.restaurant_address_1 + ', ' + this.restaurant.restaurant_address_2 + ', '
            + this.restaurant.restaurant_address_3,
          this.restaurant.restaurant_telephone,
          this.restaurant.restaurant_email,
          localStorage.getItem('rd_username'),
          this.restaurant.restaurant_number,
          localStorage.getItem('rd_country'))
        .subscribe(
          () => {
            console.log('Email sent to ' + this.affiliates[index].partner_name + ' from ' +
              this.restaurant.restaurant_name);
          },
          error => {
            console.log('Could not send email to ' + this.affiliates[index].partner_name + ' from ' +
              this.restaurant.restaurant_name, error);
          });

      // and send the offer confirmation to the restaurant
      //   affiliate_name: string,
      //   affiliate_contact_message: string
      //   restaurant_name: string
      //   restaurant_email: string
      //   restaurant_number: string
      //   email_language: string
      this.cmsService.sendOfferConfirmation(
          this.affiliates[index].partner_name,
          this.affiliates[index].partner_contact_message,
          this.restaurant.restaurant_name,
          this.restaurant.restaurant_email,
          this.restaurant.restaurant_number,
          localStorage.getItem('rd_country'))
        .subscribe(
          () => {
            console.log('Offer confirmation from ' + this.affiliates[index].partner_name + ' sent to ' +
              this.restaurant.restaurant_name);
          },
          error => {
            console.log('Could not send offer confirmation from ' + this.affiliates[index].partner_name + ' to ' +
              this.restaurant.restaurant_name, error);
          });

      // finally record the access event for this restaurant
      this.restaurantService.recordAccess(Number(this.restaurant.restaurant_id),
        this.affiliates[index].partner_id, 'Clicked Through')
        .subscribe(
          () => {
            console.log('Access record updated - ' + this.restaurant.restaurant_name + ' clicked through ' +
              this.affiliates[index].partner_name);
          },
          error => {
            console.log('Could not update access record', error);
          });

      // show a generic message - the partner specific message is sent by email
      this.cmsLocalService.dspSnackbar(this.affiliates[index].partner_name + this.t_data.Message +
        this.restaurant.restaurant_email + this.t_data.Contact, 'OK', 30);
    }
  }

}
