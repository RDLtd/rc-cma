import { Component, Inject, OnInit } from '@angular/core';
import { Member } from '../_models';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rc-contacts',
  templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit {

  member: Member;
  isSubmitting = false;
  jobRoles: any;
  patternMobile = '^([+\\d]\\d*)?\\d$';

  constructor(
    public contactsDialog: MatDialogRef<ContactsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.jobRoles = this.translate.instant('JOIN.jobRoles');
    this.member = this.data.member;
  }
}
