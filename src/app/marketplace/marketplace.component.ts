import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { HelpService, LoadService } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../_models';
import { AppConfig } from '../app.config';
import { HeaderService } from '../common/header.service';


// export interface AffiliateOffer {
//   id: string;
//   affiliate: string;
//   name: string;
//   description: string;
// }


@Component({
  selector: 'rc-marketplace',
  templateUrl: './marketplace.component.html'
})

export class MarketplaceComponent implements OnInit {

  restaurant: Restaurant;
  affiliates: [any];

  constructor(
    private headerService: HeaderService,
    public help: HelpService,
    private restaurantService: RestaurantService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private config: AppConfig,
    private loader: LoadService
  ) {
    //this.loader.open();
    this.translate.use(localStorage.getItem('rd_language'));
    this.headerService.updateSectionName('market');
  }

  ngOnInit() {

  }

  // getPartnerOffers(): void {
  //
  //   this.restaurantService.getPartners(this.config.brand.prefix.toUpperCase())
  //     .subscribe(
  //       partners => {
  //         let len = partners['partners'].length, p, i;
  //         for (i = 0; i < len; i++) {
  //           // only load partners for which there is an offer
  //           // down the road might want to only load one that is valid?
  //           p = partners['partners'][i];
  //           if (p.offer_partner_id) {
  //             this.affiliates.push(p);
  //           }
  //         }
  //       },
  //       err => {
  //         console.log('No partner records found : ', err);
  //       });
  // }
  //
  // redeemOffer(index) {
  //
  //     const aff = this.affiliates[index];
  //     const rst = this.restaurant;
  //     // // Send
  //     // this.sendAffiliateRequestEmail(aff, rst);
  //     // // Confirm
  //     // this.sendAffiliateConfirmation(aff, rst);
  //     // // Record
  //     // this.recordAccessEvent(aff, rst);
  //
  //
  //
  // }

  // // Send restaurant request to Affiliate
  // sendAffiliateRequestEmail(aff, rst){
  //   this.cmsService.sendOfferRequestToAffiliateEmail({
  //     affiliate_email: aff.partner_email,
  //     affiliate_name: aff.partner_name,
  //     restaurant_name:  rst.restaurant_name,
  //     restaurant_address: rst.restaurant_address_1 + ', ' + rst.restaurant_address_2 + ', '
  //       + rst.restaurant_address_3,
  //     restaurant_telephone: rst.restaurant_telephone,
  //     restaurant_email: rst.restaurant_email,
  //     admin_fullname: localStorage.getItem('rd_username'),
  //     restaurant_number: rst.restaurant_number,
  //     email_language: localStorage.getItem('rd_language')
  //   }).subscribe(
  //     () => {
  //       console.log('Email sent to ' + aff.partner_name + ' from ' +
  //         rst.restaurant_name);
  //     },
  //     error => {
  //       console.log('Could not send email to ' + aff.partner_name + ' from ' +
  //         rst.restaurant_name, error);
  //     });
  // }
  // // Send confirmation
  // sendAffiliateConfirmation(aff: any, rst: Restaurant) {
  //   this.cmsService.sendOfferConfirmation({
  //     affiliate_name: aff.partner_name,
  //     affiliate_contact_message: aff.partner_contact_message,
  //     restaurant_name: rst.restaurant_name,
  //     restaurant_email: rst.restaurant_email,
  //     restaurant_number: rst.restaurant_number,
  //     email_language: localStorage.getItem('rd_language')
  //   }).subscribe(
  //     () => {
  //       console.log('Offer confirmation from ' + aff.partner_name + ' sent to ' +
  //         rst.restaurant_name);
  //     },
  //     error => {
  //       console.log('Could not send offer confirmation from ' + aff.partner_name + ' to ' +
  //         rst.restaurant_name, error);
  //     });
  // }
  //
  // // Record the access event for this restaurant
  // recordAccessEvent(aff: any, rst: Restaurant) {
  //   this.restaurantService.recordAccess(Number(rst.restaurant_id),
  //     aff.partner_id, 'Clicked Through')
  //     .subscribe(
  //       () => {
  //         console.log('Access record updated - ' + rst.restaurant_name + ' clicked through ' +
  //           aff.partner_name);
  //       },
  //       () => {
  //         console.log('Could not update access record');
  //       });
  // }
}
