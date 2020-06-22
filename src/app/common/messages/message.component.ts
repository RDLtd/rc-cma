import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rc-message',
  templateUrl: './message.component.html'
})

export class MessageComponent implements OnInit {

  brandName: string;

  constructor(
    private config: AppConfig,
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.brandName = this.config.brand.name;
    const len = this.data.messages.length;
    const lang = localStorage.getItem('rd_language');
    for (let i = 0; i < len; i++) {
      let dm = this.data.messages[i];
      dm.body = dm[`message_text_${lang}`];
      dm.heading = dm[`message_subject_${lang}`];
    }
  }

}
