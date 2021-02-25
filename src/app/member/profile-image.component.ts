import { Component, OnInit, Input, NgZone, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Member } from '../_models';
import { AnalyticsService, MemberService } from '../_services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'rc-profile-image',
  templateUrl: './profile-image.component.html'
})

export class ProfileImageComponent implements OnInit {

  @Input()
  responses: Array<any>;
  uploader: FileUploader;
  member: Member;
  dialog: any;
  inProgress: boolean = false;
  imgPreviewSrc: string = '';
  imgPrimed: boolean = false;

  imgURL: string;
  placeholderImage: string = 'https://res.cloudinary.com/rdl/image/upload/v1501827164/avatars/placeholder-male.jpg';



  // translation variables
  t_data: any;

  constructor(
    private memberService: MemberService,
    private ga: AnalyticsService,
    private config: AppConfig,
    private zone: NgZone,
    private http: HttpClient,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.responses = [];
  }

  ngOnInit() {
    // Current avatar
    this.imgPreviewSrc = this.data.member.member_image_path;

    this.translate.get('Profile-Image').subscribe(data => this.t_data = data);

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${this.config.cloud_name}/upload`,
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

      let self = this;
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
    // update db and local member

    this.memberService.updateAvatar(this.data.member.member_id, this.imgURL).subscribe(
      () => {
        this.data.member.member_image_path = this.imgPreviewSrc;
        this.dspSnackBar(this.t_data.ImageUpdated);
        this.inProgress = false;
        this.dialog.close(this.imgURL);
        // record event
        this.ga.sendEvent('Profile', 'Edit', 'Update Image');
      },
      error => {
        console.log(JSON.stringify(error));
        this.inProgress = false;
      });
  }

  deleteImage() {

    this.memberService.deleteAvatar(this.data.member.member_id).subscribe(
      () => {
        this.data.member_image_path = this.placeholderImage;
        this.dialog.close(null);
        this.dspSnackBar(this.t_data.ImageDeleted);
      },
      error => {
        console.log(error);
      });
  }

  dspSnackBar(msg: string) {
    this.snackBar.open(msg, null, {
      duration: 5000
    });
  }
}
