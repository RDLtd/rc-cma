import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelpService, RestaurantService } from '../_services';
import {CmsComponent, CmsLocalService} from '../cms';
import { MatDialog } from '@angular/material';
import { PaymentComponent } from '../payment/payment.component';
import { TranslateService } from 'ng2-translate';

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
        access_data => {
          console.log('Access record updated - Viewed Offers');
          this.cmsLocalService.setOfferCount(0);
        },
        error => {
          console.log('Could not update access record');
        });
  }

  getPartnerOffers(): void {

    this.restaurantService.getPartners()
      .subscribe(
        partners => {
          let len = partners.partners.length, p, i;
          for (i = 0; i < len; i++) {
            // only load partners for which there is an offer
            // down the road might want to only load one that is valid?
            p = partners.partners[i];
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
          access_data => {
            console.log('Access record updated - Viewed Marketing');
          },
          error => {
            console.log('Could not update access record');
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
      // send email to both affiliate and customer (is this the user or the restaurant!)
      console.log(this.restaurant.restaurant_email, this.affiliates[index].partner_email);
      // also record the access event for this restaurant
      this.restaurantService.recordAccess(Number(this.restaurant.restaurant_id),
        this.affiliates[index].partner_id, 'Clicked Through')
        .subscribe(
          access_data => {
            console.log('Access record updated - Clicked Through');
          },
          error => {
            console.log('Could not update access record');
          });
      //
      this.cmsLocalService.dpsSnackbar(this.affiliates[index].partner_name + this.t_data.Message, 'OK', 30);
    }
  }

}
