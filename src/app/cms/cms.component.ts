
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Member, Restaurant } from '../_models';
import { RestaurantService, CMSService, AnalyticsService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { MatDialog } from '@angular/material/dialog';
import { CmsPreviewComponent } from './cms-preview.component';
import { fadeAnimation } from '../shared/animations';
import { HeaderService } from '../common/header.service';
import { HelpService } from '../common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rc-cms',
  templateUrl: './cms.component.html',
  providers: [CmsLocalService],
  animations: [fadeAnimation] // register the animation
})
export class CmsComponent implements OnInit {

  restaurant: Restaurant;
  restaurants: Array<any>;
  member: Member;
  paramId: string;

  constructor(
    private header: HeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private ga: AnalyticsService,
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private dialog: MatDialog,
    public help: HelpService,
    private translate: TranslateService
  ) {
    this.header.updateSectionName(this.translate.instant('HUB.sectionCMS'));
  }

  ngOnInit() {

    this.route.params
      .pipe(
        switchMap((params: Params) => this.restaurantService.getById(this.paramId = params.id) ))
        .subscribe({
            next: data => {
              this.restaurant = data['restaurant'][0];
              this.cmsLocalService.setRestaurant(this.restaurant);
            },
            error: error => {
              console.log(error);
              this.router.navigate(['/hub']).then();
            }
          });

    this.member = JSON.parse(localStorage.getItem('rd_profile'));

    this.restaurantService.getMemberRestaurants(this.member.member_id)
      .subscribe( {
        next: data => {
          // console.log('CMS.ts get list of assc. restaurants using member_id', this.member.member_id);
          this.restaurants = data['restaurants'];
          // console.log('Length', this.restaurants.length);
        },
        error: error => {
          console.log(error);
        }
      });
  }

  getPreview() {

    this.dialog.open(CmsPreviewComponent, {
      panelClass: 'rc-preview-dialog-container',
      backdropClass: 'rc-preview-backdrop',
      data: {
        id: this.restaurant.restaurant_id,
        number: this.restaurant.restaurant_number,
        name: this.restaurant.restaurant_name
      }
    });
    // record event
    this.ga.sendEvent('CMS', 'SPW', 'Previewed');
  }

  onDeactivate() {
    console.log('onDeactivate');
    window.scrollTo(0, 0);
  }
}
