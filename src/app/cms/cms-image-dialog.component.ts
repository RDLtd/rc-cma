import { Component, OnInit } from '@angular/core';
import { CMSService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'rc-cms-image-dialog',
  templateUrl: './cms-image-dialog.component.html',
  providers: [CmsLocalService]
})
export class CmsImageDialogComponent implements OnInit {

  restaurant: any;
  image: any;
  cmsImages: any;
  dialog: any;
  showLoader: boolean = false;

  // translation variables
  t_data: any;
  // t_is_active: string;
  // t_is_offline: string;
  // t_update_failed: string;
  // t_default_updated: string;

  constructor(
    private cms: CMSService,
    private translate: TranslateService,
    private cmsLocalService: CmsLocalService) {

  }

  ngOnInit() {
    this.translate.get('CMS-Image-Dialog').subscribe(data => {
      this.t_data = data;
    });
  }

  toggleImageStatus(img): void {

    let msg;
    img.cms_element_active = !img.cms_element_active;
    img.cms_element_active ? msg = this.t_data.IsActive : msg = this.t_data.IsOffline;

    this.cms.updateElement(img).subscribe(
      data => {
        this.cmsLocalService.dpsSnackbar(`Image ${ img.cms_element_id } ${ msg }`, null, 3);

      },
      error => {
        this.cmsLocalService.dpsSnackbar(this.t_data.UpdateFailed, null, 3);
        console.log(error);
      });
  }


  setDefaultImage(img) {
    let imgs = this.cmsImages;
    let len = imgs.length;
    // reset current default
    for (let i = 0; i < len; i++) {

      if (imgs[i].cms_element_default) {

        imgs[i].cms_element_default = 0;

        this.cms.defaultElement(imgs[i].cms_element_id, false).subscribe(
          data => {
            console.log(data);
          },
          error => {
            console.log(error);
          });

        break;
      }
    }

    this.cms.defaultElement(img.cms_element_id, true).subscribe(
      data => {
        img.cms_element_default = 1;
        this.cmsLocalService.dpsSnackbar(this.t_data.DefaultUpdated, null, 3)
      },
      error => {
        console.log(JSON.stringify(error));
      });
  }
}
