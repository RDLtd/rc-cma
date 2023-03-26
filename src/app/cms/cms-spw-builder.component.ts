import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'rc-cms-spw-builder',
  templateUrl: './cms-spw-builder.component.html',
  styles: [
  ]
})
export class CmsSpwBuilderComponent implements OnInit {

  buildVersion: string;
  buildStatus: string;
  statusMessages: string[];
  progressComplete = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private buildDialog: MatDialogRef<CmsSpwBuilderComponent>,
    private translate: TranslateService,) {
    this.statusMessages = this.translate.instant('CMS.SETTINGS.builder.statusMessages');
  }

  ngOnInit() {
    this.buildVersion = this.data.buildVersion;
    this.buildStatus = this.data.buildStatus;
    // loop through the status messages
    // and THEN check if our website has been built
    this.displayProgress().then(() => {
      // If the website is not built yet
      // close and repeat
      if (!this.data.buildReady) {
        this.buildDialog.close(false);
        return;
      }
      // For production, we just close the builder
      if (this.buildVersion === 'Production') {
        this.buildDialog.close(true);
        return;
      }
      // For previews, we give the user the option to open it
      // If we open it programmatically then we'll fall foul
      // of the pop-up blockers
      //this.buildStatus = `${this.buildVersion} build complete!`
      this.buildStatus = this.translate.instant(
        'CMS.SETTINGS.builder.statusMessageFinal',
        { version: this.buildVersion }
      );
      this.progressComplete = true;
    });
  }
  // open preview with added cache killer
  launchPreview(): void {
    window.open(`${this.data.apptiserPreviewUrl}?cache=${Date.now()}`, '_blank');
    this.buildDialog.close(this.data.buildReady);
  }
  // loop through progress messages with loop delay
  async displayProgress(): Promise<any> {
    for (let i = 0; i < this.statusMessages.length; i++) {
      this.buildStatus = this.statusMessages[i] + '...';
      await this.timeDelay(1500);
    }
  }
  // delay
  timeDelay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
