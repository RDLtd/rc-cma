import { Component } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { HelpService } from '../common';
import * as moment from "moment/moment";
import { AnalyticsService, CMSService } from "../_services";

@Component({
  selector: 'rc-cms-spw-config',
  templateUrl: './cms-spw-config.component.html',
  styles: [
  ]
})
export class CmsSpwConfigComponent {

  dataChanged = false;

  constructor(
    private cmsLocalService: CmsLocalService,
    public help: HelpService,
    private cms: CMSService,
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

    this.cms.publish(restaurant_id, production, membership_type)
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
}
