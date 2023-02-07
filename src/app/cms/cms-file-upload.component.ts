import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppConfig } from '../app.config';
import { CMSElement } from '../_models';
import { CMSService } from '../_services';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { ImageService } from '../_services/image.service';

@Component({
  selector: 'app-rc-cms-file-upload',
  templateUrl: './cms-file-upload.component.html'
})
export class CmsFileUploadComponent implements OnInit {

  dialog: any;
  uploadLabel: string;
  uploadFileSize: number;
  uploadMessageTxt: string;
  uploadMessage: string;
  maxFileSizeMb = 10;
  inProgress = false;
  filePrimed = false;
  filePreview: any = '';
  fileUrl: string;
  uploader: FileUploader;
  responses: Array<any> = [];
  fileTypes: string;

  @ViewChild('imgUploadForm') imgForm: NgForm;
  @ViewChild('menuUploadForm') menuForm: NgForm;

  imgClasses: Array<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private config: AppConfig,
    private zone: NgZone,
    private http: HttpClient,
    private translate: TranslateService,
    private cms: CMSService,
    private imgService: ImageService
  ) {

  }

  ngOnInit() {
    this.uploadMessageTxt = this.translate.instant('CMS.UPLOAD.errorMaxExceeded');
    this.setImageClasses();

    this.filePreview = '';
    this.fileTypes = (this.data.type === 'image' ? '.jpg, .jpeg' : '.pdf');

    const uploaderOptions: FileUploaderOptions = {

      url: this.imgService.cldUploadPath,
      autoUpload: false,
      isHTML5: true,
      removeAfterUpload: true,
      maxFileSize: 10000000,
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ]
    };

    this.uploader = new FileUploader(uploaderOptions);

    // Clear any error messages
    this.uploader.onAfterAddingFile = (fileItem) => {
      this.uploadMessage = '';
    };
    // Check for a valid file selection
    this.uploader.onWhenAddingFileFailed = (fileItem) => {
      console.log('Exceeds max file size', fileItem.size.toFixed(2));
      this.uploadMessage = `${this.uploadMessageTxt} **Max: ${this.maxFileSizeMb} MB**`;
    };

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', this.config.upload_preset);
      form.append('folder', `restaurants/${this.data.restaurant.restaurant_number}`);
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return {fileItem, form};
    };

    const upsertResponse = fileItem => {

      this.zone.run(() => {
        const existingId = this.responses.reduce((prev, current, index) => {
          if (current.file.name === fileItem.file.name && !current.status) {
            return index;
          }
          return prev;
        }, -1);
        if (existingId > -1) {
          this.responses[existingId] = Object.assign(this.responses[existingId], fileItem);
        } else {
          this.responses.push(fileItem);
        }
      });
    };


    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
      upsertResponse(
        {
          file: item.file,
          status,
          data: JSON.parse(response)
        }
      );

      // console.log(JSON.parse(response).original_filename);
      // console.log(JSON.parse(response));
      // console.log(status);

      if (status === 200) {

        this.fileUrl = JSON.parse(response).url;
        // url comes back as the base http version, we need to update to be https
        this.fileUrl = this.fileUrl.replace('http', 'https');
        this.filePrimed = false;
        this.inProgress = false;
        this.addElement();
        this.dialog.close();

      } else {

        this.filePrimed = false;
        this.inProgress = false;
      }

    };

    this.uploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse(
        {
          file: fileItem.file,
          progress,
          data: {}
        }
      );
  }

  setImageClasses() {
    const imgs = this.translate.instant('CMS.UPLOAD.imgClass');
    this.imgClasses = [
      { lbl: imgs.exterior, value: 'exterior' },
      { lbl: imgs.interior, value: 'interior' },
      { lbl: imgs.chef, value: 'chef' },
      { lbl: imgs.dishes, value: 'dishes' },
      { lbl: imgs.service, value: 'service' },
      { lbl: imgs.cocktail, value: 'cocktails' },
      { lbl: imgs.life, value: 'life' },
      { lbl: imgs.team, value: 'team' }
      ];

    // Image upload
    if (this.data.type === 'image') {
      this.uploadLabel = this.translate.instant('CMS.UPLOAD.labelChooseImage');
    } else {

    // Non-Image
      if (this.data.type === 'menu') {
        this.uploadLabel = this.translate.instant('CMS.UPLOAD.labelChooseMenu');
      } else {
        this.uploadLabel = this.translate.instant('CMS.UPLOAD.labelChooseDirections');
      }
    }
  }

  fileSelected() {

    const f = this.uploader.queue[this.uploader.queue.length - 1];

    this.uploadLabel = f.file.name;
    this.uploadFileSize = f.file.size / 1000 / 1000;
    this.filePrimed = true;

    // Set image preview
    if (this.data.type === 'image') {
      const self = this;
      const imgFile = (<HTMLInputElement>document.getElementById('fileUpload')).files[0];
      this.toDataURL(imgFile, function (dataUrl) {
        // show the user the image they have selected
        // console.log('Data Url', dataUrl);
        self.filePreview = dataUrl;
      });
    }
  }

  upload() {
    this.inProgress = true;
    // get the last primed file
    this.uploader.queue[this.uploader.queue.length - 1].upload();
  }

  validForm(): boolean {
    // console.log(this.data.type);
    if (this.data.type === 'image') {
      return this.imgForm.valid;
    } else if (this.data.type === 'menu') {
      return this.menuForm.valid;
    } else {
      // It's directions
      return true;
    }
  }

  addElement() {

    const now = new Date().toLocaleString();
    const elem = new CMSElement();
    let isDefaultImage = false;

    elem.cms_element_restaurant_id = this.data.restaurant.restaurant_id;

    if (this.data.type === 'image') {
      elem.cms_element_title = this.imgForm.form.controls.imgClass.value || 'restaurant';
      elem.cms_element_caption = null;
      elem.cms_element_class = 'Image';
      // If it's the first image that's been uploaded
      // mark it as the default
      if (!this.data.tgtObject.length) { isDefaultImage = true; }
      // console.log('Default image?', isDefaultImage);
    } else if (this.data.type === 'menu') {
      elem.cms_element_title = this.menuForm.form.controls.menuClass.value || 'Menu';
      elem.cms_element_caption = this.menuForm.form.controls.menuCaption.value || '';
      elem.cms_element_class = 'Menu';
    } else if (this.data.type === 'direction') {
      elem.cms_element_title = 'Directions';
      elem.cms_element_caption = null;
      elem.cms_element_class = 'Directions';
    }

    // Add Cloudinary public-id to element
    const clArr = this.fileUrl.split('/');
    elem['cms_element_image_ref'] = clArr.slice(clArr.length - 3).join('/');
    elem['cldImage'] = this.imgService.getCldImage(elem['cms_element_image_ref']);

    elem.cms_element_image_path = this.fileUrl;
    elem.cms_element_active = true;
    elem.cms_element_default = isDefaultImage;
    elem.cms_element_live_from = now;
    elem.cms_element_live_to = '2100-06-30 00:00:00+00';
    elem.cms_element_created_by = localStorage.getItem('rd_username');
    elem.cms_element_approved_on = now;
    elem.cms_element_approved_by = localStorage.getItem('rd_username');
    elem.cms_element_original_filename = this.uploadLabel;

    console.log(elem);

    if (this.data.type === 'direction' && !!this.data.tgtObject) {
      console.log('elem', elem);
      console.log('obj', this.data.tgtObject.cms_element_id);
      elem['cms_element_id'] = this.data.tgtObject.cms_element_id;
      this.updateDirections(elem);
    } else {
      this.createElement(elem);
    }
  }

  createElement(elem): void {
    this.cms.createElement(elem).subscribe({
      next: data => {
        elem.cms_element_id = data['cms_element_id'];
        console.log('e', elem);
        // There is only 1 file for directions
        // not an array
        if (this.data.type === 'direction') {
          this.data.tgtObject = elem;
        } else {
          this.data.tgtObject.push(elem);
        }

        if (this.data.type === 'image') {
          // if user wants to make it their default image
          if (this.imgForm.form.controls.imgDefault.value) {
            this.setDefaultImage(elem);
          }
        }
      },
      error: error => {
        console.log(error.statusText);
        console.log(error);
      }
    });
  }

  updateDirections(elem): void {
    this.cms.updateElement(elem).subscribe({
      next: data => {
        elem.cms_element_id = data['cms_element_id'];
        this.data.tgtObject = elem;
      },
      error: error => {
        console.log(error);
      }
    });
  }

  setDefaultImage(img) {
    const len = this.data.tgtObject.length;
    let thisImg;
    // find & reset current default
    for (let i = 0; i < len; i++) {
      thisImg = this.data.tgtObject[i];
      if (thisImg.cms_element_default === true || thisImg.cms_element_default === 1) {
        thisImg.cms_element_default = false;
        this.cms.defaultElement(thisImg.cms_element_id, false)
          .subscribe({
            next: data => console.log(data),
            error: error => console.log(error)
          });
      }
    }

    this.cms.defaultElement(img.cms_element_id, true)
        .subscribe({
          next: () => img.cms_element_default = true,
          error: error => console.log(error)
        });
  }

  toDataURL(url, callback) {
    const reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(url);
  }
}
