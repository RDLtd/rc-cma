import { Component, OnInit } from '@angular/core';
import { CMSService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-cms-image-dialog',
  templateUrl: './cms-image-dialog.component.html',
  providers: [CmsLocalService]
})
export class CmsImageDialogComponent implements OnInit {

  restaurant: any;
  image: any;
  clImgPath: string;
  cmsImages: any;
  dialog: any;

  constructor(
    private cms: CMSService,
    private translate: TranslateService,
    private cmsLocalService: CmsLocalService) { }

  ngOnInit() {

  }

  toggleImageStatus(img): void {
    let msg;
    img.cms_element_active = !img.cms_element_active;
    img.cms_element_active ?
      msg = this.translate.instant('CMS.IMAGES.msgNowActive', { img: img.cms_element_id }):
      msg = this.translate.instant('CMS.IMAGES.msgNowOffline', { img: img.cms_element_id });

    this.cms.updateElement(img).subscribe(
      () => {
        this.cmsLocalService.dspSnackbar(msg, null, 3);

      },
      () => {
        this.cmsLocalService.dspSnackbar(this.translate.instant('CMA.IMAGES.msgUpdateFailed'), null, 3);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images').subscribe(
      () => {
        console.log('error in updatelastupdatedfield for images');
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
          data => console.log(data),
          error => console.log(error)
        );
        break;
      }
    }
    this.cms.defaultElement(img.cms_element_id, true).subscribe(
      () => {
        img.cms_element_default = 1;
        this.cmsLocalService.dspSnackbar(
          this.translate.instant('CMS.IMAGES.msgDefaultUpdated'), null, 3)
      },
      error => {
        console.log(error);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images').subscribe(
      () => {
        console.log('error in updatelastupdatedfield for images');
      });
  }
}
