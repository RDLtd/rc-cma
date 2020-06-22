
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Member, Restaurant } from '../_models';
import { RestaurantService, CMSService, HelpService, AnalyticsService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { MatDialog } from '@angular/material/dialog';
import { CmsPreviewComponent } from './cms-preview.component';
import { fadeAnimation } from '../shared/animations';

@Component({
  selector: 'rc-cms',
  templateUrl: './cms.component.html',
  providers: [CmsLocalService],
  animations: [fadeAnimation] // register the animation
})
export class CmsComponent implements OnInit {

  restaurant: Restaurant;
  restaurants: Array<any>;
  member: Member;
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
            this.restaurant = data['restaurant'][0];
            this.cmsLocalService.setRestaurant(this.restaurant);
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
      panelClass: 'rc-preview-dialog-container',
      backdropClass: 'rc-preview-backdrop',
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
