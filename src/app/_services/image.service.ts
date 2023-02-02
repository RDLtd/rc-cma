import { Injectable, OnInit } from '@angular/core';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
// Import plugins
import { lazyload, placeholder, responsive } from '@cloudinary/ng';

import { environment as env } from '../../environments/environment';
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity';
import { FocusOn } from '@cloudinary/url-gen/qualifiers/focusOn';
import { scale } from '@cloudinary/url-gen/actions/resize';


@Injectable({
  providedIn: 'root'
})
export class ImageService implements OnInit {

  cld: Cloudinary;
  cldPlugins = [lazyload(), responsive(), placeholder({mode: 'predominant-color'})]

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
  }

  ngOnInit() {
  }

  getCldImage(id): CloudinaryImage {
    return this.cld.image(id);
  }
  getCldGalleryImage(id): CloudinaryImage {
    const img = this.cld.image(id);
    img.resize(scale().width(150).height(150));
    return img;
  }

  get cldBasePlugins(): any {
    return this.cldPlugins;
  }
}
