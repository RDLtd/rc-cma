import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CMSService, HelpService } from '../_services';

@Component({
  selector: 'rc-cms-preview',
  templateUrl: './cms-preview.component.html'
})
export class CmsPreviewComponent implements OnInit {

  spwUrl: string = '';
  urlLoaded: boolean = false;

  constructor(
    private cms: CMSService,
    public dialog: MatDialogRef<CmsPreviewComponent>,
    public help: HelpService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


    ngOnInit() {

      this.cms.previewSPW(this.data.id, this.data.number, false, false)
        .subscribe(res => {

          console.log('PREVIEW:', res);
          if (res['status'] == 'OK') {

            let ts = new Date().getTime();
            this.spwUrl = `${res['url']}?ts=${ts}`;
            this.urlLoaded = true;

          } else {

            console.log('Status not OK', res);
            this.dialog.close();
            this.help.dspHelp('cms-spw-nodata');

          }
        },
        error => console.log('ERROR', error));
    }

}
