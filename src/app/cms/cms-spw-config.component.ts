import { Component } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { HelpService } from '../common';

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
    public help: HelpService
  ) {
  }

  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

}
