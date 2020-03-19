import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppConfig } from '../app.config';
import { CMSElement } from '../_models';
import { CMSService } from '../_services';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'rc-cms-file-upload',
  templateUrl: './cms-file-upload.component.html'
})
export class CmsFileUploadComponent implements OnInit {

  dialog: any;
  uploadLabel: string;
  inProgress: boolean = false;
  filePrimed: boolean = false;
  filePreview: any = '';
  fileUrl: string;
  uploader: FileUploader;
  responses: Array<any> = [];

  @ViewChild('imgUploadForm', { static: false }) imgForm: NgForm;
  @ViewChild('menuUploadForm', { static: false }) menuForm: NgForm;

  // translation variables
  t_data: any;
  t_data_type;

  imgClasses: Array<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private config: AppConfig,
    private zone: NgZone,
    private http: HttpClient,
    private translate: TranslateService,
    private cms: CMSService
  ) {

    // detect language changes... need to check for change in texts
    translate.onLangChange.subscribe(lang => {
      this.translate.get('CMS-File-Upload')
        .subscribe(data => this.setImageClasses(data));
    });
  }

  ngOnInit() {

    this.translate.get('CMS-File-Upload')
      .subscribe(data => this.setImageClasses(data));

    this.filePreview = '';

    const uploaderOptions: FileUploaderOptions = {

      url: `https://api.cloudinary.com/v1_1/${this.config.cloud_name}/upload`,
      autoUpload: false,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ]
    };

    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', this.config.upload_preset);
      form.append('folder', `restaurants/${this.data.restaurant.restaurant_number}`);
      form.append('file', fileItem);
      fileItem.withCredentials = false;

      // console.log('File item', fileItem );
      // console.log('Form built');

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
      console.log(JSON.parse(response));
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

  setImageClasses(data) {
    this.t_data = data;
    this.imgClasses = [
      { lbl: data.RestExt, value: 'exterior' },
      { lbl: data.RestInt, value: 'interior' },
      { lbl: data.HeadChef, value: 'chef' },
      { lbl: data.Dishes, value: 'dishes' },
      { lbl: data.Service, value: 'service' },
      { lbl: data.Cocktails, value: 'cocktails' },
      { lbl: data.Life, value: 'life' },
      { lbl: data.Team, value: 'team' }
      ];
    // Image upload
    if (this.data.type === 'image') {
      this.uploadLabel = `${this.t_data.Choose} ${this.t_data.Image} ${this.t_data.ToUpload}`;
      this.t_data_type = this.t_data.Image;
    } else {
    // Non-Image
      if (this.data.type === 'menu') {
        this.uploadLabel = `${this.t_data.Choose} ${this.t_data.Menu} ${this.t_data.ToUpload}`;
        this.t_data_type = this.t_data.Menu;
      } else {
        this.uploadLabel = `${this.t_data.Choose} ${this.t_data.Directions} ${this.t_data.ToUpload}`;
        this.t_data_type = this.t_data.Directions;
      }
    }
  }

  fileSelected() {
    this.uploadLabel = this.uploader.queue[this.uploader.queue.length - 1].file.name;
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

    if (this.data.type === 'image') {
      return this.imgForm.valid;
    } else if (this.data.type === 'menu') {
      return this.menuForm.valid;
    }
  }

  addElement() {

    const now = new Date().toLocaleString();
    let e = new CMSElement();

    e.cms_element_restaurant_id = this.data.restaurant.restaurant_id;


    if (this.data.type === 'image') {
      e.cms_element_title = this.imgForm.form.controls.imgClass.value || 'restaurant';
      e.cms_element_caption = null;
      e.cms_element_class = 'Image';
    } else if(this.data.type === 'menu'){
      e.cms_element_title = this.menuForm.form.controls.menuClass.value || 'Menu';
      e.cms_element_caption = this.menuForm.form.controls.menuCaption.value || '';
      e.cms_element_class = 'Menu';
    } else if (this.data.type === 'direction') {
      e.cms_element_title = 'Directions';
      e.cms_element_caption = null;
      e.cms_element_class = 'Directions';
    }

    // Cloudinary public-id
    let clArr = this.fileUrl.split('/');
    e['cms_element_image_ref'] = clArr.splice(clArr.length - 3).join('/');

    e.cms_element_image_path = this.fileUrl;

    e.cms_element_active = true;
    e.cms_element_default = false;
    e.cms_element_live_from = now;
    e.cms_element_live_to = '2100-06-30 00:00:00+00';
    e.cms_element_created_by = localStorage.getItem('rd_user');
    e.cms_element_approved_on = now;
    e.cms_element_approved_by = localStorage.getItem('rd_user');
    e.cms_element_original_filename = this.uploadLabel;

    // console.log(e);

    this.cms.createElement(e).subscribe(
      data => {
        e.cms_element_id = data['cms_element_id'];
        //console.log(e);
        this.data.tgtObject.push(e);
        if (this.data.type === 'image') {
          // if user wants to make it their default image
          if (this.imgForm.form.controls.imgDefault.value) {
            this.setDefaultImage(e);
          }
        }
      },
      error => {
        console.log(error.statusText);
        console.log(error);
      });
  }
  setDefaultImage(img) {
    let len = this.data.tgtObject.length;
    // find & reset current default
    for (let i = 0; i < len; i++) {
      let thisImg = this.data.tgtObject[i];
      if (thisImg.cms_element_default === true || thisImg.cms_element_default === 1) {
        thisImg.cms_element_default = false;
        this.cms.defaultElement(thisImg.cms_element_id, false)
          .subscribe(
          data => console.log(data),
          error => console.log(error)
          );
      }
    }

    this.cms.defaultElement(img.cms_element_id, true).subscribe(
      data => img.cms_element_default = true,
      error => console.log(error)
    );
  }

  toDataURL(url, callback) {
    const reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(url);
  }
}
