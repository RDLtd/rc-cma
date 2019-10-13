import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';;

@Component({
  selector: 'rc-confirm-cancel',
  templateUrl: './confirm-cancel.component.html'
})
export class ConfirmCancelComponent implements OnInit  {

  defaultTitle;
  defaultMsg;
  defaultCancel;
  defaultContinue;

  constructor(
      private translate: TranslateService,
      public confirmCancelDialog: MatDialogRef<ConfirmCancelComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log('Data', this.data);
    this.translate.get('ConfirmCancel.Title').subscribe(value => this.defaultTitle = value);
    this.translate.get('ConfirmCancel.Message').subscribe(value => this.defaultMsg = value);
    this.translate.get('ConfirmCancel.Cancel').subscribe(value => this.defaultCancel = value);
    this.translate.get('ConfirmCancel.Continue').subscribe(value => this.defaultContinue = value);
  }

}
