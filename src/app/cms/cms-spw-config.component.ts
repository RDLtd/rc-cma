import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { HelpService } from '../common';
import { AnalyticsService, CMSService } from "../_services";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restaurant } from '../_models';

@Component({
  selector: 'rc-cms-spw-config',
  templateUrl: './cms-spw-config.component.html',
  styles: [
  ]
})
export class CmsSpwConfigComponent implements OnInit {

  dataChanged = false;
  restaurant: Restaurant;
  member: any;

  theme_id: number;
  website_options: {};

  isChecked = true;
  formGroup = this._formBuilder.group({
    showImageGallery: [true],
    showHtmlMenu: [true, Validators.requiredTrue],
    showDownloadMenus: [true],
    showReservations: [true],
    showBookingWidget: [true],
    showGroupBookings: [false],
    showPrivateDining: [false],
    showContacts: [true],
    showLinks: [true],
    showParking: [true],
    showMap: [true],
    showTransport: [true],
  });

  constructor(
    private cmsLocalService: CmsLocalService,
    public help: HelpService,
    private cms: CMSService,
    private _formBuilder: FormBuilder,
    private ga: AnalyticsService,
  ) {

  }

  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  ngOnInit() {
    this.cmsLocalService.getRestaurant()
      .subscribe((data) => {
        this.restaurant = data;
        console.log(this.restaurant.restaurant_name);
        // get the website config data for this restaurant
        this.cms.getWebConfig(Number(this.restaurant.restaurant_id))
          .subscribe({
            next: data => {
              // map data to local
              this.theme_id = data['website_config'].website_config_theme_id;
              this.website_options = data['website_config'].website_config_options;
              console.log(this.theme_id, this.website_options);
            },
            error: error => {
              console.log('getWebConfig', error);
            }
          });
      });
  }

  publishWebsite(production: boolean): void {
    if (production) {
      console.log('will publish website');
    } else {
      console.log('will preview website');
    }
    // apptiser update ks 090323 - added member type (for apptiser).
    // Note that association check is done at the back end, which check for ANY member having this restaurant associated

    // for testing only!
    const restaurant_id = '92596';
    const membership_type = 'standard';

    this.cms.publish(this.restaurant.restaurant_id, production, membership_type)
      .then(res => {
        if (res['status'] === 'OK') {
          console.log('Website success:', res);
          // this.spwProdUrl = res['url'];
          // this.spwPreviewUrl = this.getSpwUrl();
          // this.cmsChanged = false;
          // this.d_publishDate = moment(new Date(res['published'])).format('LLLL');
          // // this.publishDate = new Date(res['published']);
          //
          // this.verifyData();
          // this.isPreviewing = false;
          // // record event
          // this.ga.sendEvent('CMS-Dashboard', 'SPW', 'Published');
          // // reset data changed attribute
          // this.cms.resetLastUpdatedField(Number(restaurant_id))
          //   .subscribe({
          //     next: () => {
          //     },
          //     error: error => {
          //       console.log('unable to reset data changed attribute', error);
          //     }
          //   });
        } else {
          console.log('Publish failed', res);
        }
      })
      .catch((res) => console.log('Publish Endpoint Error', res));
  }

  // Web config
  alertFormValues(formGroup: FormGroup) {
    alert(JSON.stringify(formGroup.value, null, 2));
  }

}
