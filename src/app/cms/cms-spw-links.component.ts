import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'rc-cms-spw-links',
  templateUrl: './cms-spw-links.component.html',
  styles: []
})
export class CmsSpwLinksComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
