import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelComponent, HelpService, LoadService } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../_models';
import { AppConfig } from '../app.config';
import { HeaderService } from '../common/header.service';

export interface Affiliate {
  id: string;
  name: string;
  logo: string;
  about: string
}

export interface Deal {
  id: string;
  name: string;
  description: string;
  value: number,
  category: string;
  affiliate: Affiliate;
  createdDate: Date;
}

@Component({
  selector: 'rc-marketplace',
  templateUrl: './marketplace.component.html'
})

export class MarketplaceComponent implements OnInit {
  now: Date = new Date();
  mockDeals = [
    {
      id: "1",
      name: "SPW Custom Domain & Email",
      description: "For $25 per month, you get your Single Page Website can be served from a custom domain name" +
        " (i.e.www.your-restaurant.com) and this will include a personalised email address (e.g." +
        " your-name@your-restaurant.com).\n\nAll content updates you make here will be instantly updated on your" +
        " website.",
      value: 100,
      category: "TECHNOLOGY",
      affiliate: {
        id: "123",
        name: "Restaurant Developments",
        logo: "rdl-logo.svg",
        about: "RDL are application developers specialising in creating digital products for the restaurant sector.",
      },
      createdDate: this.now
    },
    {
      id: "2",
      name: "Italian Wine Discount",
      description: "10% off all italian wines during lockdown.",
      value: 100,
      category: "Wine",
      affiliate: {
        id: "222",
        name: "Majestic Commercial",
        logo: "majestic-offers-intro.png",
        about: "Majestic Wines are best wine suppliers in Croydon.",
      },
      createdDate: this.now
    }
  ];


  restaurant: Restaurant;
  affiliates: any ;
  categories = [];
  deals: Array<Deal>;
  favourites: Array<string> = [];
  hasFavourites: boolean = true;
  filter: string;
  displayedDeals = [];

  constructor(
    private headerService: HeaderService,
    public help: HelpService,
    private restaurantService: RestaurantService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private config: AppConfig,
    private loader: LoadService
  ) {
    this.loader.open();
    this.translate.use(localStorage.getItem('rd_language'));
    this.headerService.updateSectionName('market');
  }

  ngOnInit() {
    this.getDeals();
    this.getCategories();
    this.loader.close();
    this.hasFavourites = this.favourites.length > 0;
  }

  getDeals(): void {
    this.deals = this.mockDeals;
    this.displayedDeals = this.deals;
    // this.restaurantService.getPartners(this.config.brand.prefix.toUpperCase())
    //   .subscribe(res => console.log('Deals', res));
  }

  // Extract a list of deal categories
  // to use for filtering
  getCategories(): void {
    let i = this.deals.length;
    let c;
    while (i--) {
      c = this.deals[i].category;
      if (this.categories.indexOf(c) < 0) {
        this.categories.push(c);
      }
    }
    console.log('Cats', this.categories);
  }

  // Favourites
  isFavourite(id: string): boolean {
    return this.favourites.indexOf(id) >= 0;
  }

  // Add or remove favourite deals
  toggleIsFavourite(id: string): void {
    if (!this.isFavourite(id)) {
      this.favourites.push(id);
    } else {
      this.favourites.forEach((value, index) => {
        if (value === id) {
          this.favourites.splice(index, 1);
        }
      });
    }
  }
  isFiltered(str): boolean {
    return this.filter === str;
  }

  // Only display favourite deals
  filterByFavourites(): void {
    this.displayedDeals = this.displayedDeals.filter(
      function(e) {
        return this.indexOf(e.id) >= 0;
      },
      this.favourites
    );
    this.filter = 'favourites'
  }
  // Category filters
  filterByCategory(cat: string): void {
    this.displayedDeals = this.deals.filter(function(elem) {
      // normalise and compare
      return elem.category.toLowerCase() === cat.toLowerCase();
    });
    this.filter = cat;
  }
  // Reset
  clearAllFilters(): void {
    this.displayedDeals = this.deals;
    this.filter = null;
  }

  //
  notifyAffiliate(dealId: string): void {
    let selectedDeal = this.deals.find(d => {return d.id === dealId});
    console.log(selectedDeal);
    let dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: 'Exclusive Member Deal',
        deal: selectedDeal,
        msg: `## ${selectedDeal.name} \n\nIf you would like to take advantage of this exclusive Member offer, or would like to know a bit more about it, confirm your interest below.\n\nWe will then forward your contact details and Member ID (qualifying you for the offer) to **${selectedDeal.affiliate.name}** and they will contact you within 2 working days.`,
        no: 'Not now',
        yes: 'Send Request'
      }
    });
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
