import { Component, Inject, OnInit } from '@angular/core';
import { CMSService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { TranslateService } from '@ngx-translate/core';
import { ImageService } from '../_services/image.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CloudinaryImage } from '@cloudinary/url-gen';

@Component({
  selector: 'app-rc-cms-image-dialog',
  templateUrl: './cms-image-dialog.component.html',
  providers: [CmsLocalService]
})
export class CmsImageDialogComponent implements OnInit {

  restaurant: any;
  image: any;
  cmsImages: any;
  cldImage: CloudinaryImage;
  cldPlugins: any[];

  constructor(
    private imgService: ImageService,
    private cms: CMSService,
    private translate: TranslateService,
    private cmsLocalService: CmsLocalService,
    public dialog: MatDialogRef<CmsImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.image = data.image;
    this.cmsImages = data.cmsImages;
    this.restaurant = data.restaurant;
    this.cldImage = this.imgService.getCldImage(data.clImgPath);
    this.cldPlugins = this.imgService.cldBasePlugins;
  }

  ngOnInit() {}

  toggleImageStatus(img): void {
    let msg;
    img.cms_element_active = !img.cms_element_active;
    img.cms_element_active
      ? msg = this.translate.instant('CMS.IMAGES.msgNowActive', { img: img.cms_element_id })
      : msg = this.translate.instant('CMS.IMAGES.msgNowOffline', { img: img.cms_element_id });

    this.cms.updateElement(img).subscribe({
      next: () => {
        this.cmsLocalService.dspSnackbar(msg, null, 3);
      },
      error: () => {
        this.cmsLocalService.dspSnackbar(this.translate.instant('CMA.IMAGES.msgUpdateFailed'), null, 3);
      }
    });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images')
        .subscribe({
          next: () => {
            console.log('error in updatelastupdatedfield for images');
          },
          error: (error) => console.log(error)
        });
  }


  setDefaultImage(img) {
    const imgs = this.cmsImages;
    const len = imgs.length;
    // reset current default
    for (let i = 0; i < len; i++) {
      if (imgs[i].cms_element_default) {
        imgs[i].cms_element_default = 0;
        this.cms.defaultElement(imgs[i].cms_element_id, false)
          .subscribe({
            next: data => console.log(data),
            error: error => console.log(error)
          });
        break;
      }
    }
    this.cms.defaultElement(img.cms_element_id, true)
        .subscribe({
          next: () => {
          img.cms_element_default = 1;
          this.cmsLocalService.dspSnackbar(
            this.translate.instant('CMS.IMAGES.msgDefaultUpdated'), null, 3);
          },
          error: error => {
            console.log(error);
          }
        });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images').subscribe(
      () => {
        console.log('error in updatelastupdatedfield for images');
      });
  }
}
