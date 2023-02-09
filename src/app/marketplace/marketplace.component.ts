import { Component, OnInit } from '@angular/core';
import { CMSService, RestaurantService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelComponent, HelpService, LoadService } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../_models';
import { AppConfig } from '../app.config';
import { HeaderService } from '../common/header.service';
import { MarketplaceService } from './marketplace.service';
import { insertAnimation } from '../shared/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-rc-marketplace',
  templateUrl: './marketplace.component.html',
  animations: [insertAnimation]
})

export class MarketplaceComponent implements OnInit {

  now: Date = new Date();
  expiry: Date = new Date('2022');

  restaurant: Restaurant;
  categories = [];
  deals: Array<any>;
  favourites: Array<string> = [];
  hasFavourites = true;
  filter: string;
  displayedDeals = [];
  sponsored = false;

  constructor(
    private snackbar: MatSnackBar,
    private headerService: HeaderService,
    public help: HelpService,
    private restaurantService: RestaurantService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private config: AppConfig,
    private cmsService: CMSService,
    private marketService: MarketplaceService,
    private loader: LoadService) {
      this.loader.open();
      this.translate.use(localStorage.getItem('rd_language'));
      this.headerService.updateSectionName(this.translate.instant('HUB.sectionMarket'));
  }

  ngOnInit() {
    console.log(this.config.brand);
    this.sponsored = this.config.brand.name === 'Restaurant Collective';
    this.getDeals();
    this.loader.close();
    this.hasFavourites = this.favourites.length > 0;
  }

  getDeals(): void {
    this.marketService.getDeals().subscribe( data => {
      console.log(data);
      this.deals = data.deals;
      this.displayedDeals = this.deals;
      this.setCategories();
    });
  }

  // Extract a list of deal categories
  // to use for filtering
  setCategories(): void {
    let i = this.deals.length;
    let c;
    while (i--) {
      c = this.deals[i].deal_category;
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
    // remove any other filters first
    this.clearAllFilters();
    this.displayedDeals = this.displayedDeals.filter(
      function(obj) {
        return this.indexOf(obj.deal_id) >= 0;
      },
      this.favourites
    );
    this.filter = 'favourites';
  }
  // Category filters
  filterByCategory(cat: string): void {
    this.displayedDeals = this.deals.filter(function(obj) {
      // normalise and compare
      return obj.deal_category.toLowerCase() === cat.toLowerCase();
    });
    this.filter = cat;
  }
  // Reset filters
  clearAllFilters(): void {
    this.displayedDeals = this.deals;
    this.filter = null;
  }

  // Send contact details to Affiliate
  // and confirm to Member
  notifyAffiliate(selectedDeal: any): void {

    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      restoreFocus: false,
      data: {
        title: this.translate.instant('MARKETPLACE.titleRequest'),
        deal: selectedDeal,
        body: this.translate.instant(
          'MARKETPLACE.msgRequest',
          {
            deal: selectedDeal.deal_name,
            affiliate: selectedDeal.affiliate_name
          }),
        cancel: this.translate.instant('MARKETPLACE.labelBtnCancel'),
        confirm: this.translate.instant('MARKETPLACE.labelBtnConfirm')
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Send affiliate email
        this.sendAffiliateRequestEmail(selectedDeal);
      } else {
        console.log('Cancelled');
      }
    });
  }

  // Send restaurant request to Affiliate
  sendAffiliateRequestEmail(deal) {
    const member = JSON.parse(localStorage.getItem('rd_profile'));
    this.cmsService.sendOfferRequestToAffiliateEmail({
      affiliate_offer: deal.deal_name,
      affiliate_email: deal.affiliate_email,
      affiliate_name: deal.affiliate_name,
      member_id: member.member_id,
      member_email: member.member_email,
      member_first_name: member.member_first_name,
      member_last_name: member.member_last_name
    }).subscribe({
      next: () => {
        console.log('Email sent to ' + deal.affiliate_name);
        this.sendAffiliateConfirmation(deal, member);
      },
      error: error => {
        console.log('Affiliate email failed', error);
      }
    });
  }

  // Send confirmation
  sendAffiliateConfirmation(deal: any, member: any) {
    this.cmsService.sendOfferConfirmation({
      affiliate_email: deal.affiliate_email,
      affiliate_name: deal.affiliate_name,
      affiliate_contact_message: this.translate.instant(
        'MARKETPLACE.msgEmailAffiiateRequest',
        { affiliate: deal.affiliate_name }),
      restaurant_name: null,
      restaurant_email: member.member_email,
      restaurant_number: member.member_id
    }).subscribe({
      next: () => {
        console.log('Offer confirmation from ' + deal.affiliate_name);
        this.snackbar.open(this.translate.instant('MARKETPLACE.msgRequestSent'), null, {duration: 3000});
      },
      error: error => {
        console.log('Could not send offer confirmation', error);
      }
    });
  }
}
