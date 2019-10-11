import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NgForm } from '@angular/forms';
import { Member } from '../_models';
import { MemberService, AuthenticationService } from '../_services';
import { MemberDetailComponent } from './member-detail.component';


@Component({
  selector: 'rc-member-list',
  templateUrl: 'member-list.component.html'
})

export class MemberListComponent implements OnInit {

  members: Member[] = [];
  allMembers: any[] = [];
  cardFilter: string = 'all'
  @ViewChild('card', {static: true}) card;
  @ViewChild('memberForm', {static: true}) memberForm: NgForm;

  constructor(
    private memberService: MemberService,
    public dialog: MatDialog,
    private authService: AuthenticationService) {
  }

  ngOnInit() {

    this.loadAllMembers();
    // this.loadSomeMembers('RDL');
  }

  private loadAllMembers() {
    this.memberService.getAll().subscribe(data => {
      this.members = data['members'];
      // save a full copy so that we can simply use this array from which to filter (don't need to read the database again)
      this.allMembers = this.members.slice();
      // console.log(JSON.stringify(data));
    });
  }

  private loadSomeMembers(access_id) {
    this.memberService.getByAccessID(access_id).subscribe(data => {
      this.members = data['members'];
    });
  }

  rcToggleClass(card) {
    card.classList.toggle('rc-card-over');
  }

  addNewMember():void{
    let dialogRef = this.dialog.open(MemberDetailComponent);
    dialogRef.componentInstance.member = new Member();
  }

  openMemberCard($event, task, memberCard){

    switch (task) {

      case 'edit': {

        let dialogRef = this.dialog.open(MemberDetailComponent);
        dialogRef.componentInstance.member = this.members[memberCard.id];
        dialogRef.componentInstance.allMembers = this.members;
        // On close
        dialogRef.afterClosed().subscribe(result => {

          // Create a hook into the dialog form
          const frm: NgForm = dialogRef.componentInstance.memberForm;

          console.log(frm);

          if (frm.dirty) {

            this.doMemberUpdate(memberCard.id);

          }else{

            console.log('Nothing changed');

          }
        });
        break;
      }
      default: {
        $event.stopPropagation();
        break;
      }
    }
  }




  getStatusClass($member) {

    const m = $member;
    // console.log(m);

    if (m.member_signedup) {
      return 'rc-member';
    } else if (m.member_invited) {
      return 'rc-invited';
    } else {
      return 'rc-prospect';
    }
  }

  doMemberUpdate(id) {

    this.memberService.update(this.members[id])
      .subscribe(
        data => {
          console.log('Updated member');
        },
        error => {
          console.log('Failed to update member');
        });
  }

  filterBy(filter) {
    this.cardFilter = filter;
    this.members.length = 0;
    switch (filter) {
      case 'prospective': {
        for (let j = 0; j < this.allMembers.length; j++) {
          if (this.allMembers[j].member_invited === null) {
            this.members.push(this.allMembers[j]);
          }
        }
        break;
      }
      case 'invited': {
        for (let j = 0; j < this.allMembers.length; j++) {
          if (this.allMembers[j].member_signedup === null) {
            this.members.push(this.allMembers[j]);
          }
        }
        break;
      }
      case 'accepted': {
        for (let j = 0; j < this.allMembers.length; j++) {
          if (this.allMembers[j].member_authenticated === null) {
            this.members.push(this.allMembers[j]);
          }
        }
        break;
      }
      case 'verified': {
        for (let j = 0; j < this.allMembers.length; j++) {
          if (this.allMembers[j].member_authenticated !== null) {
            this.members.push(this.allMembers[j]);
          }
        }
        break;
      }
      case 'founder': {
        for (let j = 0; j < this.allMembers.length; j++) {
          if (this.allMembers[j].member_membership_type === 'Founder') {
            this.members.push(this.allMembers[j]);
          }
        }
        break;
      }
      case 'all': {
        for (let j = 0; j < this.allMembers.length; j++) {
          this.members.push(this.allMembers[j]);
        }
        break;
      }
      case 'administrator': {
        for (let j = 0; j < this.allMembers.length; j++) {
          if (this.allMembers[j].member_job === 'Administrator' || this.allMembers[j].member_job === 'Chairman') {
            this.members.push(this.allMembers[j]);
          }
        }
        break;
      }
    }

  }
}
