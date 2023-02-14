import { environment } from '../../environments/environment';
import { Injectable, OnInit } from '@angular/core';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
// Cloudinary plugins
import { lazyload, placeholder, responsive } from '@cloudinary/ng';

@Injectable({
  providedIn: 'root'
})

export class ImageService implements OnInit {

  cld: Cloudinary;
  cldPlugins = [lazyload(), responsive(), placeholder({mode: 'predominant-color'})];
  cldUpload: string;

  constructor() {
    this.cld = new Cloudinary({
      cloud: {
        cloudName: environment.cloudinary_name,
        apiKey: environment.cloudinary_APIkey,
        apiSecret: environment.cloudinary_APISecret
      },
      url: {
        secure: true
      }
    });
    this.cldUpload = `https://api.cloudinary.com/v1_1/${environment.cloudinary_name}/upload`;
  }

  ngOnInit() {
  }

  getCldImage(id): CloudinaryImage {
    if(id.indexOf('http') > -1) {
      id = this.getCloudinaryPublicId(id);
    }
    return this.cld.image(id);
  }

  get cldBasePlugins(): any {
    return this.cldPlugins;
  }

  get cldUploadPath(): string {
    return this.cldUpload;
  }

  // Extract Cloudinary Public-Id from full url
  getCloudinaryPublicId(url) {
    const urlArr = url.split('/');
    return urlArr.slice(urlArr.length - 3).join('/');
  }
}
