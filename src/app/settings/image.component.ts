import { Component, OnInit, Input, NgZone, Inject } from '@angular/core';
import { Member } from '../_models';
import { AnalyticsService, MemberService } from '../_services';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppConfig } from '../app.config';
import { ImageService } from '../_services/image.service';


@Component({
  selector: 'app-rc-profile-image',
  templateUrl: './image.component.html'
})

export class ImageComponent implements OnInit {

  @Input()
  responses: Array<any>;
  uploader: FileUploader;
  member: Member;
  dialog: any;
  inProgress = false;
  imgPreviewSrc = '';
  imgPrimed = false;

  imgURL: string;

  constructor(
    private imgService: ImageService,
    private memberService: MemberService,
    private ga: AnalyticsService,
    private config: AppConfig,
    private zone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.responses = [];
  }

  ngOnInit() {
    // Current avatar
    this.imgPreviewSrc = this.data.member.member_image_path;

    const uploaderOptions: FileUploaderOptions = {
      url: this.imgService.cldUploadPath,
      autoUpload: true,
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
      form.append('folder', 'avatars');
      form.append('file', fileItem);
      fileItem.withCredentials = false;

      const self = this;
      const inputValue = (<HTMLInputElement>document.getElementById('imgUpload')).files[0];
      this.toDataURL(inputValue, function (dataUrl) {
        // show the user the image they have selected
        self.imgPreviewSrc = dataUrl;
      });
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
      // console.log(JSON.parse(response).url);
      // console.log(status);

      if (status === 200) {

        this.imgPrimed = true;
        this.inProgress = false;
        this.imgURL = JSON.parse(response).url;

      } else {
        this.imgPrimed = false;
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

  toDataURL(url, callback) {
    const reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(url);
  }


  updateImage() {

    this.inProgress = true;
    // update db and local settings

    this.memberService.updateAvatar(this.data.member.member_id, this.imgURL)
        .subscribe({
          next: () => {
            this.data.member.member_image_path = this.imgPreviewSrc;
            this.inProgress = false;
            this.dialog.close({str: this.imgURL});

            // record event
            this.ga.sendEvent('Profile', 'Edit', 'Update Image');
          },
          error: error => {
            console.log(JSON.stringify(error));
            this.inProgress = false;
          }
        });
  }

  deleteImage() {

    this.memberService.deleteAvatar(this.data.member.member_id).subscribe({
      next: () => {
        this.data.member_image_path = null;
        this.dialog.close({str: 'delete'});
      },
      error: error => {
        console.log(error);
      }
    });
  }
}
