import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rc-message',
  templateUrl: './message.component.html'
})

export class MessageComponent implements OnInit {

  brandName: string;
  newMember: false;

  constructor(
    private config: AppConfig,
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    // console.log(this.data.messages);
    this.brandName = this.config.brand.name;
    this.newMember = this.data.newMember;
    const len = this.data.messages.length;
    const lang = 'en';
    for (let i = 0; i < len; i++) {
      let dm = this.data.messages[i];
      dm.body = dm[`message_text_${lang}`];
      dm.heading = dm[`message_subject_${lang}`];
    }
  }

}
