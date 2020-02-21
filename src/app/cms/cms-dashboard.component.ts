import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import {
  Restaurant,
  CMSDescription,
  Member
} from '../_models';
import {
  AuthenticationService,
  CMSService,
  HelpService,
  MemberService,
  RestaurantService,
  AnalyticsService
} from '../_services';
import { MatDialog } from '@angular/material';
import { CmsPreviewComponent } from './cms-preview.component';
import { Router } from '@angular/router';
import { RestaurantDetailComponent } from '../restaurants';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  PaymentComponent,
  MessageComponent
} from '../common';
import * as moment from 'moment';


@Component({
  selector: 'app-cms-dashboard',
  templateUrl: './cms-dashboard.component.html'
})
export class CmsDashboardComponent implements OnInit, AfterViewInit {

  dbRestaurant: Restaurant = new Restaurant();
  restaurant: Restaurant;
  descriptions: CMSDescription;
  last_updated: any;

  // We'll use this if there is no active default image
  dfImg: string;

  // State
  cmsChanged = false;
  productionUrl: string;
  isPreviewing = true;
  cmsHasSufficientData = false;
  publishDate: Date;
  d_publishDate: string;

  memberStatus = 50;
  memberType = 'Associate Member';
  memberIcon = 'people';
  memberJoinDate: Date;
  d_memberJoinDate: string;

  core_date: Date;
  core_by: string;
  core_status = 0;
  core_status_txt: string;
  d_core_date: string;

  desc_date: Date;
  desc_by: string;
  desc_status = 0;
  desc_status_text: string;
  d_desc_date: string;

  hours_date: Date;
  hours_by: string;
  hours_status = 0;
  hours_count = 0;
  hours_status_text: string;
  d_hours_date: string;

  img_date: any;
  img_src: string;
  img_by: string;
  img_count = 0;
  img_status = 0;
  img_status_text: string;
  d_img_date: string;

  mnu_date: Date;
  mnu_by: string;
  mnu_count = 0;
  mnu_dish_count = 0;
  mnu_status = 0;
  mnu_status_text: string;
  d_mnu_date: string;

  bkg_date: Date;
  bkg_by: string;
  bkg_status = 0;
  bkg_status_text: string;
  d_bkg_date: string;

  loc_date: Date;
  loc_by: string;
  loc_status = 0;
  loc_status_text: string;
  d_loc_date: string;

  offerCount = 0;
  offerInBox = 0;

  user: Member;
  lang;

  // This object is passed to the translate pipe in the html file
  // to allow handlebars style variable access.
  //
  locals = {
    en: { demoUrl: 'http://demo.restaurantcollective.uk/' },
    fr: { demoUrl: 'http://demo.restaurateurs-independants.fr/' }
  };


  // translation variables
  t_data: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private ga: AnalyticsService,
    private dialog: MatDialog,
    public help: HelpService,
    private translate: TranslateService,
    private router: Router,
    private restaurantService: RestaurantService,
    private memberService: MemberService,
    private authService: AuthenticationService
  ) {
    // detect language changes... need to check for change in texts
    translate.onLangChange.subscribe(lang => {

      this.lang = localStorage.getItem('rd_country');

      this.translate.get('CMS-Dashboard').subscribe(data => {
        this.t_data = data;
        // Since the display texts are computed, we need to re-run these routines...
        this.readAndCheckStatus();

        // re-translate computed display dates
        moment.locale(localStorage.getItem('rd_country'));
        this.d_memberJoinDate = this.setDateRes(this.memberJoinDate);
        this.d_publishDate = moment(this.publishDate).format('LLLL');
        this.d_core_date = this.setDateRes(this.core_date);
        this.d_hours_date = this.setDateRes(this.hours_date);
        this.d_desc_date = this.setDateRes(this.desc_date);
        this.d_img_date = this.setDateRes(this.img_date);
        this.d_mnu_date = this.setDateRes(this.mnu_date);
        this.d_bkg_date = this.setDateRes(this.bkg_date);
        this.d_loc_date = this.setDateRes(this.loc_date);
      });
    });
  }

  setDateRes(theDate) {
    if (this.isToday(theDate)) {
      return moment(theDate).format('HH:mm');
    } else {
      return moment(theDate).format('dddd, DD MMMM YYYY');
    }
  }

  ngAfterViewInit(): void {
    this.dspUnreadMessages();
  }

  ngOnInit() {

    this.lang = localStorage.getItem('rd_country');

    this.user = this.authService.getLoggedInUser();
    // ToDo The above does not work for refresh of deep link to dashboard - there is no member data

    this.translate.get('CMS-Dashboard').subscribe(data => {
      this.t_data = data;
      // console.log(this.t_data.Open, this.hours_status_text);

      moment.locale(localStorage.getItem('rd_country'));

      this.dfImg = 'https://via.placeholder.com/350x200?text=' + this.t_data.AwaitingImage;

      // Observe offer count
      this.cmsLocalService.getOfferCount()
        .subscribe( count => {
          this.offerInBox = count;
        });

      this.cmsLocalService.getRestaurant()
        .subscribe(rest => {
            if (rest.restaurant_id) {
              this.restaurant = rest;
              // moved to getLastUpdated
              // this.setMemberStatus();
              // this.checkPublishStatus();
              // this.checkOpeningTimes();
              // this.checkDescriptions();
              // this.checkImages();
              // this.getOffers();
              this.getLastUpdated();
            }
            // duplicate the loaded restaurant
            // so that we can use it to compare changes
            for (const key in this.restaurant) {
              if (this.restaurant.hasOwnProperty(key)) {
                this.dbRestaurant[key] = this.restaurant[key];
              }
            }
          },
          error => console.log(error));
    });
  }

  readAndCheckStatus () {
    this.setMemberStatus();
    this.checkPublishStatus();
    this.checkOpeningTimes();
    this.checkDescriptions();
    this.checkImages();
    this.getOffers();
  }


  setMemberStatus() {
    // console.log(this.restaurant);
    // NB this assumes that is the member is not full then they are an associate - need to be to get here!
    // console.log('set', this.restaurant.restaurant_rc_member_status);
    if (this.restaurant.restaurant_rc_member_status === 'Full') {
      this.memberStatus = 100;
      this.memberType = this.t_data.FullMember;
      this.memberIcon = 'people';
      // this.memberJoinDate = new Date(this.restaurant.restaurant_full_member_on);
    } else {
      // this.memberJoinDate = date;
      this.memberStatus = 50;
      this.memberType = this.t_data.AssMember;
      this.memberIcon = 'people_outline';
      // this.memberJoinDate = new Date(this.restaurant.restaurant_associated_on);
    }
    // this.d_memberJoinDate = moment(this.memberJoinDate).format('dddd, DD MMMM YYYY');
    this.memberJoinDate = new Date(this.last_updated.last_updated_status);
    this.d_memberJoinDate = this.setDateRes(this.memberJoinDate);
  }

  checkPublishStatus() {

    // console.log('checkPublishStatus', this.restaurant.restaurant_id, this.restaurant.restaurant_number);
    this.cms.previewSPW(this.restaurant.restaurant_id, this.restaurant.restaurant_number, true, true)
      .subscribe(res => {

        // console.log('Check CMS status', res);

        // Set up content info panel
        switch (res['status']) {
          // No preview available
          case 'INSUFFICIENT_DATA': {
            this.cmsChanged = true;
            this.cmsHasSufficientData = false;
            this.publishDate = null;
            break;
          }
          // Show preview
          case 'OUT_OF_DATE': {
            this.cmsChanged = true;
            this.cmsHasSufficientData = true;
            this.publishDate = new Date(res['published']);
            this.productionUrl = res['url'];
            break;
          }
          // Show published version
          default: {
            this.cmsHasSufficientData = true;
            this.cmsChanged = false;
            this.publishDate = new Date(res['published']);
            this.productionUrl = res['url'];
          }
        }
        this.isPreviewing = false;
        this.d_publishDate = moment(this.publishDate).format('LLLL');
      },
      error => console.log('ERROR', error));
  }

  // Core data card
  setCoreStatus(): void {
    // Inserting an extra translate call to catch router calls via the black bar menu
    this.translate.get('CMS-Dashboard').subscribe(data => this.t_data = data);
    this.core_status = 0;
    this.core_date = new Date(this.restaurant.restaurant_last_updated);
    this.core_by = this.restaurant.restaurant_verified_by;
    this.core_status = 100;
    this.core_status_txt = this.t_data.VerifiedBy + this.core_by;
    this.d_core_date = this.setDateRes(this.core_date);
  }

  checkOpeningTimes(): void {
    this.hours_count = 0;
    // console.log('IN getHours FOR DASHBOARD COMPONENT ' + this.restaurant.restaurant_id);
    this.cms.getTimes(this.restaurant.restaurant_id)
      .subscribe(data => {
        // console.log('DATA', data);
        this.hours_count = 0;
        let i = data['times'].length;
        while (i--) {
          if (!data['times'][i].closed) {
            this.hours_count += 1;
          }
        }
        // set status to either 100 or 0
        if (this.hours_count) {
          this.hours_status_text = this.t_data.Open + this.hours_count + this.t_data.Days;
          this.hours_status = 100;
        } else {
          this.hours_status_text = this.t_data.NoData;
          this.hours_status = 0;
        }

        // if (data['times'].length) {
        //   this.hours_date = new Date(data['times'][0].cms_time_last_update);
        //   this.d_hours_date = moment(this.hours_date).format('dddd, DD MMMM YYYY');
        // }
        this.hours_date = new Date(this.last_updated.last_updated_hours);
        this.d_hours_date = this.setDateRes(this.hours_date);

      },
      error => {
        console.log('Error fetching times', error);
      });

  }

  checkDescriptions(): void {
    console.log('checkDescriptions');
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe(
        data => {
          this.descriptions = data['descriptions'][0];
          // console.log('Descriptions loaded:', data);
          this.setCoreStatus();
          this.checkFeatures();
          this.checkBookingInfo();
          this.checkLocationInfo();
          this.checkHtmlMenuDishes();
        },
        error => {
          console.log(error);
        });
  }

  checkFeatures() {
    // reset status
    this.desc_status = 0;
    console.log('Trace', this.descriptions);
    if (this.descriptions) {
      if (this.descriptions.cms_description_strap_line) {
        this.desc_status += 25;
      }
      if (this.descriptions.cms_description_one_sentence) {
        this.desc_status += 25;
      }
      if (this.descriptions.cms_description_one_paragraph) {
        this.desc_status += 25;
      }
      if (this.descriptions.cms_description_long) {
        this.desc_status += 25;
      }
      // Set status message
      if (this.desc_status === 0) {
        this.desc_status_text = this.t_data.NoData;
      } else if (this.desc_status >= 100) {
        this.desc_status_text = this.t_data.Complete;
      } else {
        this.desc_status_text = this.t_data.MissingSome;
      }
      this.desc_by = this.descriptions.cms_description_created_by;
      // this.desc_date = new Date(this.descriptions.cms_description_last_updated);
      this.desc_date = new Date(this.last_updated.last_updated_descriptions);
      this.d_desc_date = this.setDateRes(this.desc_date);

    } else {
      this.desc_status_text = this.t_data.NoData;
    }
  }

  checkImages() {

    this.cms.getElementClass(this.restaurant.restaurant_id, 'Image', 'N')
      .subscribe(data => {
          // console.log('Imgs', data.elements);
          // reset counts
          this.img_status = 0;
          this.img_count = 0;
          let i = data['elements'].length, elem, imgsrc;
          while (i--) {
            elem = data['elements'][i];
            if (elem.cms_element_active) { this.img_count += 1; }
            // Store default image path for restaurant card
            if (elem.cms_element_default) {
              imgsrc = elem.cms_element_image_path;
            }
          }
          this.img_src = imgsrc || this.dfImg;

          // set status bar
          this.img_status = this.img_count * 25;

          // set status message
          if (this.img_status === 0) {
            this.img_status_text = this.t_data.Nodata;
          } else {
            this.img_status_text = this.img_count + this.t_data.ActiveImages;
          }

          // if (data['elements'].length) {
          //   this.img_date = new Date(data['elements'][data['elements'].length - 1].cms_element_last_update);
          //   this.d_img_date = moment(this.img_date).format('dddd, DD MMMM YYYY');
          // }
          this.img_date = new Date(this.last_updated.last_updated_images);
          this.d_img_date = this.setDateRes(this.img_date);
        },
        error => console.log(error + ' R ' + this.restaurant.restaurant_id));
  }

  checkHtmlMenuDishes() {
    // reset status
    this.mnu_status = 0;

    this.cms.getDishes(Number(this.restaurant.restaurant_id)).subscribe(
      data => {
        console.log('Dishes', data);
        if (data['count'] > 0) {
          this.mnu_status += 33.5;
          this.mnu_dish_count = data['count'];
        }
        this.checkPdfMenus();
      },
      error => {
        console.log(error);
      });
  }

  checkPdfMenus(): void {

    this.cms.getElementClass(this.restaurant.restaurant_id, 'Menu', 'N')
      .subscribe(
      menuData => {
        //console.log('pdfs', menuData);
        // reset status
        this.mnu_count = 0;
        let i = menuData['count'];

        while (i--) {
          if (menuData['elements'][i].cms_element_active) {
            this.mnu_count += 1;
          }
        }
        console.log('Mnu', this.mnu_count);
        // active menus
        if (this.mnu_count > 0) {
          this.mnu_status += 33.3;
        }
        console.log('desc', this.descriptions);
        if (this.descriptions) {
          if (this.descriptions.cms_description_menus_overview) {
            this.mnu_status += 33.3;
          }
        }

        // if (menuData['elements'].length) {
        //   this.mnu_date = new Date(menuData['elements'][menuData['count'] - 1].cms_element_last_update);
        //   this.d_mnu_date = moment(this.mnu_date).format('dddd, DD MMMM YYYY');
        // }
        this.mnu_date = new Date(this.last_updated.last_updated_menus);
        this.d_mnu_date = this.setDateRes(this.mnu_date);

        // set status text
        if (this.mnu_status === 0) {
          this.mnu_status_text = this.t_data.NoData;
        } else {
          this.mnu_status_text = this.mnu_count + this.t_data.ActivePDFs + ' / ' + this.mnu_dish_count + this.t_data.SampleDishes;
        }
      },
      error => {
        console.log(error);
      });
  }

  checkBookingInfo() {
    // reset status
    this.bkg_status = 0;

    if (this.descriptions) {
      if (this.descriptions.cms_description_reservation_info) {
        this.bkg_status += 25;
      }
      if (this.descriptions.cms_description_private) {
        this.bkg_status += 25;
      }
      if (this.descriptions.cms_description_group) {
        this.bkg_status += 25;
      }
      if (
        this.descriptions.cms_description_booking_provider &&
        this.descriptions.cms_description_booking_provider !== 'none') {
        this.bkg_status += 25;
      }

      // this.bkg_date = this.desc_date;
      this.bkg_date = new Date(this.last_updated.last_updated_booking);
      this.d_bkg_date = this.setDateRes(this.bkg_date);

      // set status text
      if (this.bkg_status === 0) {
        this.bkg_status_text = this.t_data.NoData;
      } else if (this.bkg_status >= 100) {
        this.bkg_status_text = this.t_data.Complete;
      } else {
        this.bkg_status_text = this.t_data.MissingSome;
      }
    } else {
      this.bkg_status_text = this.t_data.NoData;
    }
  }

  checkLocationInfo() {
    // reset status
    this.loc_status = 0;

    if (this.restaurant.restaurant_lat && this.restaurant.restaurant_lng) { this.loc_status += 50; }
    if (this.descriptions) {
      if (this.descriptions.cms_description_car_parking !== 'undefined') {
        this.loc_status += 25;
      }
      if (this.descriptions.cms_description_public_transport !== 'undefined') {
        this.loc_status += 25;
      }
    }
    // this.loc_date = this.core_date;
    this.loc_date = new Date(this.last_updated.last_updated_location);
    this.d_loc_date = this.setDateRes(this.loc_date);

    // set status text
    if (this.loc_status === 0) {
      this.loc_status_text = this.t_data.NoData;
    } else if (this.loc_status >= 100) {
      this.loc_status_text = this.t_data.Complete;
    } else {
      this.loc_status_text = this.t_data.MissingSome;
    }
  }

  getOffers() {

    // select the correct partners by country
    let company_code = 'RC';
    if (localStorage.getItem('rd_company_name') === 'Restaurateurs Indépendants') {
      company_code = 'RI';
    }

    this.restaurantService.getOffers(company_code)
      .subscribe(
        res => {
          // console.log('Offers ', res);

          this.offerCount = res['offers'].length;

          if (this.offerCount > 0) {

            // console.log('id', this.restaurant.restaurant_id);

            // now look to see how many offers to show in the offer 'inbox' for this restaurant
            this.restaurantService.getLatestAccess(Number(this.restaurant.restaurant_id), 'Viewed Offers')
              .subscribe(
                data => {

                  if (data['latestaccess'][0].max) {
                    // Only count offers that are more
                    // recent than the latest view access time

                    this.offerInBox = 0;

                    for (let i = 0; i < this.offerCount; i++) {
                      if (res['offers'][i].offer_marketing_date > data['latestaccess'][0].max) {
                        this.offerInBox += 1;
                      }
                    }
                  } else {
                    // this restaurant has not seen any offers yet
                    this.offerInBox = this.offerCount;
                  }

                  console.log('Offers:', this.offerInBox);
                  this.cmsLocalService.setOfferCount(this.offerInBox);
                },
                error => {
                  console.log('No access records found for restaurant');
                  // this restaurant has not seen any offers yet
                  this.offerInBox = this.offerCount;
                  this.cmsLocalService.setOfferCount(this.offerInBox);
                });
          }
        },
        error => {
          console.log('No offer records found');
        });
  }

  navTo(tgt) {
    // console.log('restaurants', this.restaurant.restaurant_id, 'cms', tgt);
    this.router.navigate(['restaurants', this.restaurant.restaurant_id, 'cms', tgt]);
  }

  getPreview() {

    if (this.cmsHasSufficientData) {
      const dialogRef = this.dialog.open(CmsPreviewComponent, {
        panelClass: 'rc-preview-dialog-container',
        backdropClass: 'rc-preview-backdrop',
        data: {
          id: this.restaurant.restaurant_id,
          number: this.restaurant.restaurant_number
        }
      });
      // record event
      this.ga.sendEvent('CMS-Dashboard', 'SPW', 'Previewed');
    } else {
      this.help.dspHelp('cms-spw-nodata');
    }
  }

  publishSPW(): void {
    // members can only publish their SPW if they are FULL members, not just associates
    // For now assume that there are only two states. Or at least that Associate means you cannot do it,
    // This means we could have other more elevated stets (e.g. Premium) that still allow publish
    // In theory we should never get here if there is no status defined, but just in case...
    //
    // Updated 15/10/19 to make the assumption that no status = associate. Seems we can get here for test restaurants...
    if (this.restaurant.restaurant_rc_member_status !== 'Full') {
      this.help.dspHelp('cms-dashboard-associate');
    } else {
      this.isPreviewing = true;
      this.cms.previewSPW(this.restaurant.restaurant_id, this.restaurant.restaurant_number, true, false)
        .subscribe(res => {
            if (res['status'] === 'OK') {
              // console.log('Publish success:', res);
              this.productionUrl = res['url'];
              this.cmsChanged = false;
              this.publishDate = new Date(res['published']);
              this.verifyData();
              this.isPreviewing = false;
              // record event
              this.ga.sendEvent('CMS-Dashboard', 'SPW', 'Published');
            } else {
              console.log('Publish failed', res);
              this.isPreviewing = false;
            }
          },
          error => {
            console.log('Publish error', error);
            this.isPreviewing = false;
          });
    }

  }

  openSocialLink(url) {
    if (url) {
      // if it's missing the protocol
      if (url.indexOf('//') === -1) {
        url = 'http://' + url;
      }
      window.open(url, '_blank');
    } else {
      // console.log('Social Network Not defined');
      this.help.dspHelp('cms-social');
      return false;
    }
  }

  verifyData(): void {

    const currentMember = JSON.parse(localStorage.getItem('rd_profile'));
    this.restaurantService.verify(this.restaurant.restaurant_id,
      currentMember.member_first_name + ' ' + currentMember.member_last_name )
      .subscribe(data => {
        // console.log(data);
        this.cmsLocalService.dspSnackbar(this.t_data.DataVnP, 'OK', 5);
        this.restaurant.restaurant_verified_by = currentMember.member_first_name +
          ' ' + currentMember.member_last_name;
        this.restaurant.restaurant_verified_on = Date().toLocaleString();
        this.dbRestaurant.restaurant_verified_by = currentMember.member_first_name +
          ' ' + currentMember.member_last_name;
        this.dbRestaurant.restaurant_verified_on = Date().toLocaleString();
      },
      error => console.log(error));
  }

  reqDirectoryDataChange(): void {

    const currentMember = JSON.parse(localStorage.getItem('rd_profile'));
    // console.log(`Request change for ${this.restaurant.restaurant_name} by ${currentMember.member_first_name}
    // ${currentMember.member_last_name}`);

    const dialogRef = this.dialog.open(RestaurantDetailComponent);

    // Setup dialog vars
    dialogRef.componentInstance.restaurant = this.restaurant;
    dialogRef.componentInstance.editMode = true;
    dialogRef.componentInstance.fromCMS = true;
    dialogRef.componentInstance.cancelSetting = true; // this so we can detect clicks outside the box

    // Whenever the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      // Create a hook into the dialog form
      const f: NgForm = dialogRef.componentInstance.restForm;

      const cancelSetting = dialogRef.componentInstance.cancelSetting;
      if (f.dirty && !cancelSetting) {
        if (f.valid) {
          // console.log('Form OK, now compose an email to RDL requesting change');
          // iterate through the fields and detect which have changed...
          const changeArray = [];

          for (const key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              if (this.restaurant[key] !== this.dbRestaurant[key]) {
                changeArray.push({
                  key: key.replace('restaurant_', ''),
                  was: this.dbRestaurant[key], now: this.restaurant[key]
                });
              }
            }
          }
          // console.log(changeArray.length + ' changes detected');
          this.cmsLocalService.dspSnackbar(this.t_data.ChangeSent, null, 1);

          // send information to the server so that emails can be generated
          this.cms.sendRestaurantChanges(currentMember, this.restaurant, changeArray)
            .subscribe(data => {
                // console.log('Emails generated by server');
                const msg = this.t_data.DataChange;
                this.cmsLocalService.dspSnackbar(msg, 'OK', 20, 'info');
                // record event
                this.ga.sendEvent('CMS-Dashboard', 'Core Data', 'Change Request');
              },
              error => console.log(error));

          // now need to revert the data since this was ONLY A REQUEST
          for (const key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              this.restaurant[key] = this.dbRestaurant[key];
            }
          }
        } else {
          // console.log('Form invalid, return message');
          // now need to revert the data since this was ONLY A REQUEST
          for (const key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              this.restaurant[key] = this.dbRestaurant[key];
            }
          }
        }

      } else {
        // console.log('As you were, nothing changed');
        // now need to revert the data since this was ONLY A REQUEST
        for (const key in this.restaurant) {
          if (this.restaurant.hasOwnProperty(key)) {
            this.restaurant[key] = this.dbRestaurant[key];
          }
        }
      }
    });
  }

  copied(): void {
    this.cmsLocalService.dspSnackbar(this.t_data.LinkCopied, 'OK', 5);
    // record event
    this.ga.sendEvent(
      'CMS-Dashboard',
      'SPW',
      'Link Copied'
    );
  }

  viewMemberStatus() {
    const dialogRef = this.dialog.open(PaymentComponent, {
      panelClass: 'rc-dialog-member',
      data: {
        restaurant: this.restaurant,
        dialog: this.dialog
      }
    });

    // record event
    this.ga.sendEvent(
      'CMS-Dashboard',
      'Membership Status',
      'Opened'
    );

    // Update dashboard
    dialogRef.afterClosed().subscribe(result => {
      this.setMemberStatus();
    });
  }

  dspUnreadMessages() {

    let company_code = 'rc';
    if (localStorage.getItem('rd_company_name') === 'Restaurateurs Indépendants') {
      company_code = 'ri';
    }
    // console.log(this.user.member_id, this.user.member_access_level, this.user.member_messages_seen);
    this.memberService.messages(company_code, this.user.member_id, this.user.member_access_level, this.user.member_messages_seen)
      .subscribe(msgs => {

        console.log('MSGS:', msgs);
        if (msgs['count'] > 0) {
          const dialogref = this.dialog.open(MessageComponent, {
            data: {
              user_id: this.user.member_id,
              messages: msgs['messages'],
            },
            // force user to explicitly close the dialog
            disableClose: true
          });

          dialogref.afterClosed().subscribe(msgSeen => {
            if (msgSeen) {
              console.log('Message Seen');
              // so set them all to seen...
              for (let i = 0; i < msgs['messages'].length; i++) {
                // console.log('SEEN: ', this.user.member_id, msgs.messages[i].message_id);
                this.memberService.messagesseen(Number(this.user.member_id), msgs['messages[i]'].message_id).subscribe(
                  result => {
                    // console.log(result);
                  },
                  error => {
                    console.log(error);
                    console.log('Failed to update messages_seen for member ' + this.user.member_id);
                  });
              }
            } else {
              console.log('Message NOT Seen');
            }
          });

        } else {
          console.log('No messages');
        }
      });

  }

  getLastUpdated() {
    this.cms.getLastUpdatedRecord(Number(this.restaurant.restaurant_id)).subscribe(
      data => {
        if (data['count'] === 0) {
          // no record found, so this must be the first time - create one...
          this.cms.createLastUpdatedRecord(Number(this.restaurant.restaurant_id)).subscribe(
            created => {
              // now read it back!
              this.cms.getLastUpdatedRecord(Number(this.restaurant.restaurant_id)).subscribe(
                reread => {
                  // console.log('createlastupdatedrecord', reread);
                  this.last_updated = reread['lastupdated'][0];
                  this.readAndCheckStatus();
                },
                error => {
                  console.log('getlastupdatedrecord', error);
                });
            },
            error => {
              console.log('createlastupdatedrecord', error);
            });
        } else {
          // console.log(data);
          this.last_updated = data['lastupdated'][0];
          this.readAndCheckStatus();
        }
      },
      error => {
        console.log('getlastupdatedrecord', error);
      });
  }

  isToday (someDate) {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  }
}
