import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CMSService } from '../_services';
import { HelpService } from '../common';

@Component({
  selector: 'app-rc-cms-preview',
  templateUrl: './cms-preview.component.html'
})
export class CmsPreviewComponent implements OnInit {

  spwUrl = '';
  urlLoaded = false;

  constructor(
    private cms: CMSService,
    public dialog: MatDialogRef<CmsPreviewComponent>,
    public help: HelpService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


    ngOnInit() {

      this.cms.publish(this.data.id, false)
        .then(res => {
          console.log('PREVIEW:', res);
          if (res['status'] === 'OK') {

            const ts = new Date().getTime();
            this.spwUrl = `${res['url']}?ts=${ts}`;
            this.urlLoaded = true;

          } else {

            console.log('Status not OK', res);
            this.dialog.close();
            this.help.dspHelp('cms-spw-nodata');

          }
        })
          .catch(error => console.log('ERROR', error));
    }

}
