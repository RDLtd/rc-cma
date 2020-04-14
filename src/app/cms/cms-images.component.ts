import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Restaurant } from '../_models';
import { CmsLocalService } from './cms-local.service';
import { CMSService, HelpService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { CmsImageDialogComponent } from './cms-image-dialog.component';
import { CmsFileUploadComponent } from './cms-file-upload.component';
import { ConfirmCancelComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';
import {
  CdkDrag,
  CdkDragDrop, CdkDropList, CdkDropListGroup,
  moveItemInArray
} from "@angular/cdk/drag-drop";

@Component({
  selector: 'rc-cms-images',
  templateUrl: './cms-images.component.html'
})

export class CmsImagesComponent implements OnInit, AfterViewInit {

  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;

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
    public help: HelpService
  ) {
    this.target = null;
    this.source = null;
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;
    phElement.style.display = 'none';
    phElement.parentNode.removeChild(phElement);
  }

  ngOnInit() {

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
    this.showLoader = true;
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Image', 'N')
      .subscribe(data => {
          this.cmsImages = data['elements'];
          console.log('Images', data['elements']);
          this.showLoader = false;
        },
        error => console.log(error));
  }

  updateImageStatus(img): void {

    let msg: string;
    img.cms_element_active = !img.cms_element_active;
    img.cms_element_active ? msg = this.t_data.IsActive : msg = this.t_data.IsOffline;

    this.cms.updateElement(img).subscribe(
      data => {
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

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for images', error);
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

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for images', error);
      });

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

              this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'images').subscribe(
                error => {
                  console.log('error in updatelastupdatedfield for images', error);
                });

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

  // Drag and drop
  drop() {
    if (!this.target) { return; }

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentNode;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex != this.targetIndex) {
      moveItemInArray(this.cmsImages, this.sourceIndex, this.targetIndex);
      // Todo: save new order of images
    }
  }

  enter = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder) { return true; }
    let phElement = this.placeholder.element.nativeElement;
    let dropElement = drop.element.nativeElement;
    let dragIndex = __indexOf(dropElement.parentNode.children, drag.dropContainer.element.nativeElement);
    let dropIndex = __indexOf(dropElement.parentNode.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      let sourceElement = this.source.element.nativeElement;
      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';
      sourceElement.parentNode.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentNode.insertBefore(phElement, (dragIndex < dropIndex)
      ? dropElement.nextSibling : dropElement);

    this.source.start();
    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);

    return false;
  }

}
function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
};
