import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rc-cms-spw-links',
  templateUrl: './cms-spw-links.component.html'
})
export class CmsSpwLinksComponent implements OnInit {

  base64main: string;
  base64menu: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    // Delay creating QR Code downloads
    // until QR Code Component returns
    // No callback available
    setTimeout(() => {
      this.getQRCodes();
    }, 1000);
  }

  getQRCodes(): void {
    const elems = document.querySelectorAll('qrcode');
    this.base64main = elems[0].firstElementChild.firstElementChild.getAttribute('src');
    this.base64menu = elems[1].firstElementChild.firstElementChild.getAttribute('src');
  }
}

