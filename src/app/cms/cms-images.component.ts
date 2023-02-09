import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../_models';
import { CmsLocalService } from './cms-local.service';
import { CMSService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { CmsImageDialogComponent } from './cms-image-dialog.component';
import { CmsFileUploadComponent } from './cms-file-upload.component';
import { ConfirmCancelComponent, HelpService, LoadService } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { insertAnimation } from '../shared/animations';
import { ImageService } from '../_services/image.service';



@Component({
  selector: 'app-rc-cms-images',
  templateUrl: './cms-images.component.html',
  animations: [insertAnimation]
})

export class CmsImagesComponent implements OnInit {

  restaurant: Restaurant;
  cmsImages: any;
  showLoader = false;

  cldPlugins: any[];

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private translate: TranslateService,
    private dialog: MatDialog,
    public help: HelpService,
    private loader: LoadService,
    private imgService: ImageService
  ) {
    this.cldPlugins = this.imgService.cldBasePlugins;
  }

  ngOnInit() {

    this.loader.open();

    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe({
        next: data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            this.cmsImages = this.getImages();
          }
        },
        error: error => console.log(error)
    });
  }

  // Catch child events and stop them bubbling up the DOM
  stopBubbling(e) {
    e.stopPropagation();
  }

  getImages(): any {
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Image', 'N')
      .subscribe({
        next: data => {
          this.cmsImages = data['elements'];
            this.cmsImages.forEach(element => element['cldImage'] = this.imgService.getCldImage(element.cms_element_image_ref));

          this.loader.close();
        },
        error: error => {
          console.log(error);
          this.loader.close();
        }
      });
  }

  updateLastUpdated(contentType) {
    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), contentType).subscribe({
      next: () => {},
      error: error => {
        console.log('error in updatelastupdatedfield for images', error);
      }
    });
  }

  updateImageStatus(img): void {

    let msg: string;
    img.cms_element_active = !img.cms_element_active;
    img.cms_element_active ?
      msg = this.translate.instant('CMS.IMAGES.msgNowActive', { img: img.cms_element_id }) :
      msg = this.translate.instant('CMS.IMAGES.msgNowOffline', { img: img.cms_element_id });

    this.cms.updateElement(img).subscribe({
      next: () => {
        this.updateLastUpdated('images');
        this.cmsLocalService.dspSnackbar(
          msg,
          null,
          3);
      },
      error: error => {
        this.cmsLocalService.dspSnackbar(
            `${this.translate.instant('CMS.IMAGES.msgUpdateFailed')}!`,
            null,
            3);
        console.log(error);
      }
    });
  }

  viewImage(img): void {
    this.dialog.open(CmsImageDialogComponent, {
      data: {
        image: img,
        clImgPath: img.cms_element_image_ref,
        cmsImages: this.cmsImages,
        restaurant: this.restaurant
      }
    });
  }

  addImage() {

    const dialogRef = this.dialog.open(CmsFileUploadComponent, {
      data: {
        type: 'image',
        tgtObject: this.cmsImages,
        restaurant: this.restaurant,
        ref: this.dialog
      }
    });

    // Todo: this is a bit premature as we have not yet
    //  successfully uploaded the image
    this.updateLastUpdated('images');

    dialogRef.componentInstance.dialog = dialogRef;
  }

  deleteImage(img) {

    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        body:
          this.translate.instant('CMS.IMAGES.msgConfirmDelete',
            { img: img.cms_element_id})
      }
    });

    dialogRef.afterClosed().subscribe({
      next: confirmed => {
        if (confirmed) {
          this.cms.deleteElement(img.cms_element_id)
              .subscribe({
                next: () => {
                  const arrLength = this.cmsImages.length;
                  let obj;
                  for (let i = 0; i < arrLength; i++) {
                    obj = this.cmsImages[i];
                    if (obj.cms_element_id === img.cms_element_id) {
                      this.cmsImages.splice(i, 1);
                    }
                  }

                  this.updateLastUpdated('images');

                  this.cmsLocalService.dspSnackbar(
                      this.translate.instant('CMS.IMAGES.msgDeleted', {img: img.cms_element_id}),
                      null,
                      3);
                  dialogRef.close();
                },
                error: error => {
                  console.log(error);
                  this.cmsLocalService.dspSnackbar(
                      this.translate.instant('CMS.IMAGES.msgUpdateFailed'),
                      null,
                      3);
                }
              });
        }
      },
      error: error => console.log(error)
    });
  }

}
