import { Component, OnInit, ViewChild } from '@angular/core';
import { Restaurant, Member } from '../_models';
import {
  RestaurantService,
  MemberService,
  AuthenticationService,
  CMSService,
  FinancialService,
  HelpService, AnalyticsService
} from '../_services';
import { MatDialog } from '@angular/material';
// import { MessageComponent } from '../messages/message.component';
import { PasswordComponent } from './password.component';
import { ProfileDetailComponent } from './profile-detail.component';
import { ProfileImageComponent } from './profile-image.component';
import { RestaurantLookupComponent } from './restaurant-lookup.component';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ConfirmCancelComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ReferralsComponent } from './referrals.component';
import { ClipboardService } from 'ngx-clipboard';
import { AppConfig } from '../app.config';


@Component({
  selector: 'rc-profile-page',
  templateUrl: './profile-page.component.html'
})

export class ProfilePageComponent implements OnInit {

  @ViewChild('card', {static: true}) card;
  restaurants: Array<Restaurant>;
  restaurant: Restaurant;
  member: Member = new Member();
  isSubmitting = false;
  defaultImages: Array<any> = [];
  placeholderImage;
  isDemoMember = false;
  showLoader = false;
  referrer: any;
  joinUrl: string;
  showRestaurantFinder = true;

  // translation variables
  t_data: any;
  company_name;
  d_member_signedup: string;
  d_member_last_logged_in: string;

  constructor(
    private restaurantService: RestaurantService,
    private memberService: MemberService,
    private ga: AnalyticsService,
    private cms: CMSService,
    public financialService: FinancialService,
    public snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService,
    public help: HelpService,
    public authService: AuthenticationService,
    public appConfig: AppConfig,
    private _clipboardService: ClipboardService,
    public dialog: MatDialog) {

    // detect language changes... need to check for change in texts
    translate.onLangChange.subscribe(lang => {
      this.translate.get('Profile-Page').subscribe(data => {this.t_data = data; });
      // re-translate computed display dates
      moment.locale(localStorage.getItem('rd_country'));
      this.d_member_signedup = moment(this.member.member_signedup).format('DD MMMM YYYY');
      this.d_member_last_logged_in = moment(this.member.member_last_logged_in).format('DD MMMM YYYY');
    });

  }

  ngOnInit() {

    const profile = JSON.parse(localStorage.getItem('rd_profile'));
    this.company_name = localStorage.getItem('rd_company_name');
    this.getMember(profile.member_id);
    this.isDemoMember = (profile.member_id === 42);

    moment.locale(localStorage.getItem('rd_country'));

    this.translate.get('Profile-Page').subscribe(data => {
      this.t_data = data;
      this.placeholderImage = `https://via.placeholder.com/900x600?text=${this.t_data.AwaitingImage}`;
    });
  }

  openSnackBar(msg: string, act = '', dur = 5000) {
    this.snackBar.open(msg, act, {
      duration: dur
    });
  }

  getMember(id) {
    this.memberService.getById(id)
      .subscribe(
        data => {
          console.log('Data', data);
          this.member = data['member'][0];
          this.d_member_signedup = moment(this.member.member_signedup).format('DD MMMM YYYY');
          this.d_member_last_logged_in = moment(this.member.member_last_logged_in).format('DD MMMM YYYY');
          this.getAssociatedRestaurants(id);
          console.log('MEMBER:', this.member);
        },
        error => {
          console.log(error);
        });
  }

  getReferrerInfo() {
    this.memberService.getPromo(this.member.member_promo_code).subscribe(
      data => {
        console.log('REF', data);
        if (data['promos'].length > 0) {
          this.referrer['type'] = 'member';
          this.referrer['name'] = data['promos'][0].member_first_name + ' ' + data['promos'][0].member_last_name;
        } else {
          this.referrer['type'] = 'self';
        }
      },
      error => {
        console.log(JSON.stringify(error));
        this.referrer.type = 'self';
      });
  }

  getReferralLink(){
    // TODO: Check that this works for pipeline
    return `${this.appConfig.apiUrl}/join/${this.member.member_promo_code}`
  }

  getAssociatedRestaurants(id) {
    this.showLoader = true;
    this.restaurantService.getMemberRestaurants(id)
      .subscribe(
        data => {
          this.showLoader = false;
          this.restaurants = data['restaurants'];
          if(this.restaurants.length) {
            this.getDefaultImages();
          } else if(this.showRestaurantFinder) {
            this.showRestaurantFinder = false;
            this.addRestaurants();
          }
          // this.dspUnreadMessages();
          // console.log('Restaurants', this.restaurants);

        },
        error => {
          console.log(error);
        });
  }

  removeAssociation(index) {

    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoAssociated);
    } else {

      console.log('restaurants', this.restaurants);
      console.log('Index', index)
      const rest = this.restaurants[index];
      console.log('rest', rest);

      const dialogRef = this.dialog.open(ConfirmCancelComponent, {
        data: {
          msg: this.t_data.AboutRemove + rest.restaurant_name + this.t_data.ListAssociated,
          yes: this.t_data.Remove,
          no: this.t_data.Cancel
        }
      });

      dialogRef.afterClosed().subscribe(res => {

        if (res.confirmed) {

          this.restaurantService.removeAssociation(rest['association_id'])
            .subscribe(
              data => {
                // console.log(data);
                this.restaurants.splice(index, 1);
                this.defaultImages.splice(index, 1);
                this.openSnackBar(rest.restaurant_name + this.t_data.Removed, 'OK');
                // record event
                this.ga.sendEvent('Profile', 'Edit', 'Remove Association');
              },
              error => {
                console.log(error);
              });
        }
      });
    }
  }

  getDefaultImages() {
    for (let i = 0; i < this.restaurants.length; i++) {
      this.cms.getElementClass(this.restaurants[i].restaurant_id, 'Image', 'Y')
        .subscribe(
        data => {
          if (data['count'] > 0) {
            this.defaultImages[i] = data['elements'][0].cms_element_image_path;
          } else {
            this.defaultImages.push(null);
          }
        },
        error => {
          console.log(error);
        });
    }
  }

  updateProfile() {
    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoProfile, '');
    } else {
      const dialogRef = this.dialog.open(ProfileDetailComponent);
      dialogRef.componentInstance.member = this.member;
      dialogRef.componentInstance.dialog = dialogRef;
    }
  }

  updatePassword () {
    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoPassword, '');
    } else {
      const dialogRef = this.dialog.open(PasswordComponent);
      dialogRef.componentInstance.member = this.member;
      dialogRef.componentInstance.dialog = dialogRef;
    }
  }

  updateImage() {
    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoImage, '');
    } else {
      const dialogRef = this.dialog.open(ProfileImageComponent);
      dialogRef.componentInstance.member = this.member;
      dialogRef.componentInstance.dialog = dialogRef;
    }
  }

  dspReferrals() {

    const dialogRef = this.dialog.open(ReferralsComponent, {
      data: {
        member: this.member,
        joinUrl: this.getReferralLink()
      }
    });

    dialogRef.afterClosed().subscribe( tgt => {

      console.log('tgt:', tgt);

      switch (tgt) {
        case 'code': {
          this._clipboardService.copyFromContent(this.member.member_promo_code);
          this.openSnackBar(
            'Copied! Now paste the code into and email SMS or social network app and send it!',
            'OK',
            10000
          );
          break;
        }
        case 'link': {
          this._clipboardService.copyFromContent(this.getReferralLink());
          this.openSnackBar(
            'Copied! Now paste the link into and email SMS or social network app and send it!',
            'OK',
            10000
          );
          break;
        }
        default: {
          break;
        }
      }

    });
  }



  // rcToggleClass(card) {
  //   card.classList.toggle('rc-card-over');
  // }

  // dspUnreadMessages() {
  //   this.memberService.messages(this.member.member_access_level, this.member.member_messages_seen)
  //     .subscribe(msgs => {
  //       // console.log(msgs);
  //       const data = {
  //         member_id: this.member.member_id,
  //         messages: msgs.messages
  //       };
  //       if (msgs.messages.length) {
  //         const dialogref = this.dialog.open(MessageComponent, {data});
  //       }
  //     });
  // }

  addRestaurants() {

    if (this.isDemoMember) {
      this.openSnackBar(this.t_data.DemoAdd, '');
    } else {

      const dialogRef = this.dialog.open(RestaurantLookupComponent, {
        width: '480px',
        position: {'top': '10vh'},
        data: {
          associatedRestaurants: this.restaurants,
          member_id: this.member.member_id
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        //console.log('AC', result);
        this.showRestaurantFinder = false;
        this.getAssociatedRestaurants(this.member.member_id);
        //this.getDefaultImages();
      });
    }
  }

  // benchmarking() {
  //   // set up the benchmarking options for this member
  //   // first check to see if there are any associated restaurants
  //   if (this.restaurants.length === 0) {
  //     // this.openSnackBar('You must have at least one associated restaurant!', '');
  //     const dialogRef = this.dialog.open(BenchmarkWizardComponent);
  //     dialogRef.componentInstance.associatedRestaurants = this.restaurants;
  //     dialogRef.componentInstance.primary_text = this.t_data.BenchmarkingAssociated;
  //     return;
  //   }
  //   // now check to see if any of the associated restaurants have financial data
  //   let have_financial_data = false;
  //   for (let i = 0; i < this.restaurants.length; i++) {
  //     this.financialService.getForRestaurant(this.restaurants[i].restaurant_id)
  //       .subscribe(
  //         data => {
  //           // console.log(JSON.stringify(data), data.financials.length);
  //           if (data['financials'].length > 0) {
  //             have_financial_data = true;
  //             // set a field in the restaurant record for convenience
  //             this.restaurants[i].financial_data = true;
  //           } else {
  //             this.restaurants[i].financial_data = false;
  //           }
  //           // on the last pass check to see if we need to exit
  //           if (i === this.restaurants.length - 1) {
  //             if (!have_financial_data) {
  //               const dialogRef = this.dialog.open(BenchmarkWizardComponent);
  //               dialogRef.componentInstance.associatedRestaurants = this.restaurants;
  //               dialogRef.componentInstance.primary_text = this.t_data.NoFinancial + this.t_data.Compare;
  //               return;
  //             }
  //             // have some data so we can move directly to benchmarking
  //             this.router.navigate(['/fs/profit']);
  //           }
  //         });
  //   }
  // }
  //
  // reviewFinancial(index) {
  //   console.log(index);
  // }
}
