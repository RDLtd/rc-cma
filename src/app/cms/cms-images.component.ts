import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../_models';
import { CmsLocalService } from './cms-local.service';
import { CMSService, HelpService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { CmsImageDialogComponent } from './cms-image-dialog.component';
import { CmsFileUploadComponent } from './cms-file-upload.component';
import { ConfirmCancelComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { LoadService } from '../common/loader/load.service';


@Component({
  selector: 'rc-cms-images',
  templateUrl: './cms-images.component.html'
})

export class CmsImagesComponent implements OnInit {

  restaurant: Restaurant;
  cmsImages: any;
  showLoader: boolean = false;

  // translation variables
  t_data: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private translate: TranslateService,
    private dialog: MatDialog,
    public help: HelpService,
    private loader: LoadService
  ) {}

  ngOnInit() {

    this.loader.open();

    this.translate.get('CMS-Images').subscribe(data => {
      this.t_data = data;
    });

    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            this.cmsImages = this.getImages();
          }
        },
        error => console.log(error));
  }

  // Catch child events and stop them bubbling up the DOM
  stopBubbling(e) {
    e.stopPropagation();
  }

  getImages() {
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Image', 'N')
      .subscribe(data => {
          this.cmsImages = data['elements'];
          this.loader.close();
        },
        error => {
          console.log(error);
          this.loader.close();
        });
  }

  updateLastUpdated(contentType) {
    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), contentType).subscribe(
      data => {},
      error => {
        console.log('error in updatelastupdatedfield for images', error);
      });
  }

  updateImageStatus(img): void {

    let msg: string;
    img.cms_element_active = !img.cms_element_active;
    img.cms_element_active ? msg = this.t_data.IsActive : msg = this.t_data.IsOffline;

    this.cms.updateElement(img).subscribe(
      data => {
        this.updateLastUpdated('images');
        this.cmsLocalService.dspSnackbar(
          `Image ${ img.cms_element_id } ${ msg }`,
          null,
          3);
      },
      error => {
        this.cmsLocalService.dspSnackbar(
          `${this.t_data.UpdateFailed}`,
          null,
          3);
        console.log(error);
      });
  }

  viewImage(img): void {
    let dialogRef = this.dialog.open(CmsImageDialogComponent);
    dialogRef.componentInstance.image = img;
    dialogRef.componentInstance.clImgPath = img.cms_element_image_ref;
    dialogRef.componentInstance.cmsImages = this.cmsImages;
    dialogRef.componentInstance.dialog = dialogRef;
    dialogRef.componentInstance.restaurant = this.restaurant;
  }

  addImage() {

    let dialogRef = this.dialog.open(CmsFileUploadComponent, {
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

    let dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        msg: this.t_data.DeleteImage + img.cms_element_id + this.t_data.Want,
        yes: this.t_data.YesDelete,
        no: this.t_data.NoCancel
      }
    });

    dialogRef.afterClosed().subscribe(res => {

      if (res.confirmed) {
        this.cms.deleteElement(img.cms_element_id)
          .subscribe(res => {
            // console.log(res);
              let arrLength = this.cmsImages.length, obj;
              for (let i = 0; i < arrLength; i++) {
                obj = this.cmsImages[i];
                if (obj.cms_element_id === img.cms_element_id)  {
                  this.cmsImages.splice(i, 1);
                }
              }

              this.updateLastUpdated('images');

              this.cmsLocalService.dspSnackbar(
                'Image ' + img.cms_element_id + this.t_data.Deleted,
                null,
                3);
              dialogRef.close();
          },
            error => {
            console.log(error);
            this.cmsLocalService.dspSnackbar(
              this.t_data.UpdateFailed,
              null,
              3);
            }
          );
      }
    },
      error => console.log(error));
  }

}
