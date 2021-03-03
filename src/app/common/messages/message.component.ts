import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfig } from '../../app.config';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-message',
  templateUrl: './message.component.html'
})

export class MessageComponent implements OnInit {

  brandName: string;
  newMember: false;
  lang: string = localStorage.getItem('rd_language');
  content: any;

  constructor(
    private translate: TranslateService,
    private config: AppConfig,
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    // console.log(this.data.messages);
    this.brandName = this.config.brand.name;
    this.newMember = this.data.newMember;
    this.getContent();
    this.getMessages();
  }

  getContent(): void {
    // Load content from i18n
    this.translate.get('Messages').subscribe( res => {
      console.log(res)
      this.content = res
    });
  }

  getMessages(): void {
    if (!this.newMember) {
      const len = this.data.messages.length;
      for (let i = 0; i < len; i++) {
        let dm = this.data.messages[i];
        dm.body = dm[`message_text_${this.lang}`];
        dm.heading = dm[`message_subject_${this.lang}`];
      }
    }
  }

}
