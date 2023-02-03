import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-rc-message',
  templateUrl: './message.component.html'
})

export class MessageComponent implements OnInit {

  newMember: false;
  lang: string = localStorage.getItem('rd_language');

  constructor(
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    // console.log(this.data.messages);
    this.newMember = this.data.newMember;
    this.getMessages();
  }
  // Get system messages
  getMessages(): void {
    if (!this.newMember) {
      const len = this.data.messages.length;
      let dm;
      for (let i = 0; i < len; i++) {
        dm = this.data.messages[i];
        dm.body = dm[`message_text_${this.lang}`];
        dm.heading = dm[`message_subject_${this.lang}`];
      }
    }
  }

}
