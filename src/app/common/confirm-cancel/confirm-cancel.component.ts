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
    this.translate.get('CONFIRM')
      .subscribe(trans => {
        this.txtTitle = this.data.title || trans.Title;
        this.txtBody = this.data.msg || trans.Message;
        this.txtBtnCancel = this.data.no || trans.Cancel;
        this.txtBtnConfirm = this.data.yes || trans.Continue;
        this.txtDontShow = this.data.dontshow || trans.DontShow;
      });
  }

}
