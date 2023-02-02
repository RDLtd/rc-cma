import { Injectable, OnInit } from '@angular/core';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
// Import plugins
import { lazyload, placeholder, responsive } from '@cloudinary/ng';

import { environment as env } from '../../environments/environment';


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
        cloudName: env.cloudinary_name,
        apiKey: env.cloudinary_APIkey,
        apiSecret: env.cloudinary_APISecret
      },
      url: {
        secure: true
      }
    });
    this.cldUpload = `https://api.cloudinary.com/v1_1/${env.cloudinary_name}/upload`;
  }

  ngOnInit() {
  }

  getCldImage(id): CloudinaryImage {
    // console.log(id);
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
