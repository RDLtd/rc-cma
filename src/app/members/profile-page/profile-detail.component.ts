import { Component, OnInit, ViewChild } from '@angular/core';
import { Member } from '../../_models';
import { MatSnackBar } from '@angular/material';
import { MemberService } from '../../_services';
import { TranslateService } from '@ngx-translate/core';;

@Component({
  selector: 'rc-profile-detail',
  templateUrl: './profile-detail.component.html'
})
export class ProfileDetailComponent implements OnInit {

  @ViewChild('formProfile', {static: true}) formProfile;
  member: Member;
  member_full_name: string;
  isSubmitting: boolean = false;
  dialog: any;

  // translation variables
  t_data: any;

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private memberService: MemberService
  ) { }

  ngOnInit() {
    // console.log(this.member);
    this.translate.get('Profile-Detail').subscribe(data => this.t_data = data);
    this.member_full_name = this.member.member_first_name + ' ' + this.member.member_last_name;
  }

  onProfileUpdate(f) {
    // console.log(f);
    const fullName = f.member_fullname.split(' ');
    this.member.member_first_name = fullName[0];
    this.member.member_last_name = fullName.slice(1).join(); // combine whatever's left

    console.log(this.member);

    this.memberService.update(this.member).
      subscribe(
        data => {
          this.dspSnackBar(this.t_data.ProfileUpdated);
          this.dialog.close();
        },
        error => {
          this.dspSnackBar(this.t_data.ErrorUpdating);
      });

    console.log(this.member);

  }

  toggleSection(section) {
    // console.log(section);
    section.classList.toggle('rc-card-section-content-open');
  }

  dspSnackBar(msg: string) {
    this.snackBar.open(msg, null, {
      duration: 5000
    });
  }



}
