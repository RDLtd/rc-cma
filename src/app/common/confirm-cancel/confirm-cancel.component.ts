import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-confirm-cancel',
  templateUrl: './confirm-cancel.component.html'
})
export class ConfirmCancelComponent implements OnInit  {

  txtTitle: string;
  txtBody: string;
  txtBtnCancel: string;
  txtBtnConfirm: string;
  txtDontShow: string;

  constructor(
      private translate: TranslateService,
      public confirmCancelDialog: MatDialogRef<ConfirmCancelComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.translate.get('ConfirmCancel')
      .subscribe(defaults => {
        this.txtTitle = this.data.title || defaults.Title;
        this.txtBody = this.data.msg || defaults.Message;
        this.txtBtnCancel = this.data.no || defaults.Cancel;
        this.txtBtnConfirm = this.data.yes || defaults.Continue;
        this.txtDontShow = this.data.dontshow || defaults.DontShow;
      });
  }

}
