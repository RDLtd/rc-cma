
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Restaurant } from '../_models';
import { RestaurantService, CMSService, HelpService, AnalyticsService } from '../_services';
import { CmsLocalService } from './cms-local.service';

import { MatDialog } from '@angular/material';
import { CmsPreviewComponent } from './cms-preview.component';
import { fadeAnimation } from '../animations';

@Component({
  selector: 'rc-cms',
  templateUrl: './cms.component.html',
  providers: [CmsLocalService],
  animations: [fadeAnimation] // register the animation
})
export class CmsComponent implements OnInit {

  restaurant: Restaurant;
  restaurants: Array<any>;
  member: any;
  offerCount: number = 0;
  offerInBox: number = 0;
  offerSubject: any;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private ga: AnalyticsService,
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private dialog: MatDialog,
    public help: HelpService
  ) {

  }

  ngOnInit() {

    // Observe offer count
    this.offerSubject = this.cmsLocalService.getOfferCount()
      .subscribe( count => {
        this.offerInBox = count;
      });

    this.route.params.pipe(
      switchMap((params: Params) => this.restaurantService.getById(params.id)))
        .subscribe( data => {
            // console.log('get Restaurant using url params', data.restaurant[0].restaurant_id);
            this.restaurant = data['restaurant'][0];
            this.cmsLocalService.setRestaurant(this.restaurant);

            // // we can now look to see what actions this member has performed to date
            // this.restaurantService.getOffers()
            //   .subscribe(
            //     res => {
            //       console.log('Offers ', res);
            //       this.offerCount = res.offers.length;
            //       if (this.offerCount > 0) {
            //         // now look to see how many offers to show in the offer 'inbox' for this restaurant
            //         this.restaurantService.getLatestAccess(Number(this.restaurant.restaurant_id), 'Viewed Offers')
            //           .subscribe(
            //             access => {
            //               console.log(access.latestaccess);
            //               if (access.latestaccess[0].max) {
            //                 // only show a count of the offers that are more recent than the latest view access time
            //                 this.offerInBox = 0;
            //                 let i, len = res.offers.length;
            //                 for (i = 0; i < len; i++) {
            //                   if (res.offers[i].offer_marketing_date > access.latestaccess[0].max) {
            //                     this.offerInBox += 1;
            //                   }
            //                 }
            //               } else {
            //                 // this restaurant has not seen any offers yet
            //                 this.offerInBox = this.offerCount;
            //               }
            //               // Broadcast changes
            //               this.cmsLocalService.setOfferCount(this.offerInBox);
            //             },
            //             error => {
            //               console.log('No access records found for restaurant');
            //               // this restaurant has not seen any offers yet
            //               this.offerInBox = this.offerCount;
            //               // Broadcast changes
            //               this.cmsLocalService.setOfferCount(this.offerInBox);
            //             });
            //       }
            //     },
            //     error => {
            //       console.log('No offer records found');
            //     });
          },
          error => console.log(error)
        );

    this.member = JSON.parse(localStorage.getItem('rd_profile'));

    this.restaurantService.getMemberRestaurants(this.member.member_id)
      .subscribe( data => {
          // console.log('CMS.ts get list of assc. restaurants using member_id', this.member.member_id);
          this.restaurants = data['restaurants'];
          // console.log('Length', this.restaurants.length);
        },
        error => console.log(error)
      );
  }

  getPreview() {

    const dialogRef = this.dialog.open(CmsPreviewComponent, {
      panelClass: 'preview-dialog-container',
      backdropClass: 'preview-backdrop',
      data: {
        id: this.restaurant.restaurant_id,
        number: this.restaurant.restaurant_number
      }

    });
    // record event
    this.ga.sendEvent('CMS', 'SPW', 'Previewed');
  }

  onDeactivate() {
    console.log('onDeactivate');
    // document.body.scrollTop = 0;
    // Alternatively, you can scroll to top by using this other call:
    window.scrollTo(0, 0)
  }
}
