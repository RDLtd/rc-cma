import { Component, ViewChild, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { RestaurantService, MemberService, AuthenticationService } from '../_services';
import { ConfirmCancelComponent } from '../confirm-cancel/confirm-cancel.component';

@Component({
  selector: 'rc-member-detail',
  templateUrl: './member-detail.component.html'
})

export class MemberDetailComponent implements OnInit {

  @ViewChild('memberForm', {static: true}) memberForm;
  member: any;
  allMembers: any;
  member_full_name: string;
  associated_restaurants: any[] = [];
  imgChanged: Boolean = false; // used to test for new avatar upload

  headers = [ {header: 'Authorization', value: 'MyToken'} ];

  constructor(
    private restaurantService: RestaurantService,
    public snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private memberService: MemberService,
    public dialog: MatDialog) {

  }

  ngOnInit() {

    // Is it an existing member
    if(this.member.member_id) {
      this.getRestaurants(this.member.member_id);
      this.member_full_name = `${this.member.member_first_name} ${this.member.member_last_name}`;
    } else {
      this.member_full_name = '';
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  doInvited() {
    if (this.member.member_invited_boolean) {
      this.member.member_invited = Date();
    } else {
      this.member.member_invited = '';
    }
  }

  // doSignedUp() {
  //   if (this.member.member_signedup_boolean) {
  //     this.member.member_signedup = Date();
  //   } else {
  //     this.member.member_signedup = '';
  //   }
  // }

  doAuthenticated() {
    if (this.member.member_authenticated_boolean) {
      this.member.member_authenticated = Date();
    } else {
      this.member.member_authenticated = '';
    }
  }

  getRestaurants(member_id) {
    this.restaurantService.getMemberRestaurants(member_id)
      .subscribe(
        data => {

          if (data['restaurants'].length > 0) {

            this.associated_restaurants = data['restaurants'];

            this.openSnackBar(
              `${data['restaurants'].length} restaurants found for ${this.member.member_first_name}' +
              ' ${this.member.member_last_name}`, '');


            //
            // this.member.member_invited_boolean = this.member.member_invited;
            // this.member.member_signedup_boolean = this.member.member_signedup;
            // this.member.member_authenticated_boolean = this.member.member_authenticated;

            // if (this.associated_restaurants.length > 0) {
            //   this.member.member_associated_list = this.associated_restaurants[0].restaurant_name;
            //   for (let j = 1; j < this.associated_restaurants.length; j++) {
            //     this.member.member_associated_list = this.member.member_associated_list +
            //       ', ' + this.associated_restaurants[j].restaurant_name;
            //   }
            // } else {
            //   this.member.member_associated_list = '';
            // }

          } else {
            this.member.member_associated_list = '';
          }
        },

        error => {
          this.openSnackBar('There was an error trying to access the restaurant database', '');
        });
  }

  toggleSection(section) {
    //console.log(section);
    section.classList.toggle('rc-card-section-content-open');
  }

  addNewMember() {
    const now = new Date().toLocaleString('en-US');
    let val = this.memberForm.value;
    let m = this.member;
    let n = val.member_fullname.split(' ');

    // Contacts
    m.member_first_name = n[0];
    m.member_last_name = n.slice(1).join();
    m.member_email = val.member_email;
    m.member_telephone = val.member_telephone;
    //m.member_address_1 = '';
    //m.member_address_2 = '';
    //m.member_address_3 = '';
    //m.member_post_code = '';

    // Profile
    m.member_restaurant_group = val.member_restaurant_group;
    m.member_job = val.member_job;
    m.member_profile = val.member_profile;
    m.member_image_path = val.member_image_path || 'assets/images/avatar/placeholder.jpg';

    // Settings
    m.member_preferred_language = 'en';
    m.member_password = '3456';
    m.member_contract_accepted = 'Y';
    //m.member_how_acquired = 'Search Engine';

    // Audit
    m.member_notes = val.member_notes;
    m.member_access_id = 'RDL';
    m.member_access_level = '3';
    m.member_membership_type = val.member_membership_type;
    m.member_role = val.member.member_role;
    m.member_invited = now;
    m.member_authenticated = now;
    m.member_active = 'Y';

    // Assigned automatically
    m.member_signedup = now;

  }



  deleteMember(id){

    let data = {
      msg: 'You are about to DELETE a member record, are you absolutely sure that you want to do that?',
      no: 'NO, CANCEL',
      yes: 'YES, DELETE!'
    }

    let dialogref = this.dialog.open(ConfirmCancelComponent, {data});

    dialogref.afterClosed().subscribe(result => {
      if (result.confirmed) {
        this.memberService.delete(id).subscribe(
          data => {
            this.allMembers.splice(this.allMembers.indexOf(id));
            this.dialog.closeAll();
            this.openSnackBar(`Member ${id} deleted!`, '')
            console.log(data);
          },
          error => {
            console.log(JSON.stringify(error));
          });
      }
    });
  }

  // Image upload
  // imageUploaded($event) {
  //   console.log($event);
  // }
  // imageRemoved($event) {
  //   console.log($event);
  // }
  // disableSendButton($event){
  //   console.log($event);
  // }
}
