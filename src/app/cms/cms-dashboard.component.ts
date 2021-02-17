import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import {
  Restaurant,
  CMSDescription,
  Member
} from '../_models';
import {
  CMSService,
  HelpService,
  MemberService,
  RestaurantService,
  AnalyticsService
} from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { CmsPreviewComponent } from './cms-preview.component';
import { Router } from '@angular/router';
import { RestaurantDetailComponent } from '../restaurants/restaurant-detail.component';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  MessageComponent
} from '../common';
import * as moment from 'moment';
import { CmsSpwLinksComponent } from './cms-spw-links.component';
import { AppConfig } from '../app.config';

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
  spwProdUrl: string;
  spwPreviewUrl: string;
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
  //hours_by: string;
  hours_status = 0;
  hours_count = 0;
  hours_status_text: string;
  d_hours_date: string;

  img_date: any;
  img_src: string;
  //img_by: string;
  img_count = 0;
  img_status = 0;
  img_status_text: string;
  d_img_date: string;

  mnu_date: Date;
  //mnu_by: string;
  mnu_count = 0;
  mnu_dish_count = 0;
  mnu_status = 0;
  mnu_status_text: string;
  d_mnu_date: string;

  bkg_date: Date;
  //bkg_by: string;
  bkg_status = 0;
  bkg_status_text: string;
  d_bkg_date: string;

  loc_date: Date;
  //loc_by: string;
  loc_status = 0;
  loc_status_text: string;
  d_loc_date: string;

  offerCount = 0;
  offerInBox = 0;

  user: Member;
  userName: string;
  lang: string;

  // translation variables
  t_data: any;
  locals: any;

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
    private config: AppConfig
  ) {

    // This object is passed to the translate pipe in the html file
    // to allow handlebars style variable access.
    // Todo: Brands are now independent of language so
    //  this is not necessary anymore
    this.locals = {
      en: { demoUrl: this.config.brand.spwDemoUrl },
      fr: { demoUrl: this.config.brand.spwDemoUrl }
    };

    // detect language changes... need to check for change in texts
    translate.onLangChange.subscribe(() => {
      this.lang = localStorage.getItem('rd_language');
      this.translate.get('CMS-Dashboard').subscribe(data => {
        this.t_data = data;
        // Since the display texts are computed, we need to re-run these routines...
        this.readAndCheckStatus();
        // re-translate computed display dates
        moment.locale(localStorage.getItem('rd_language'));
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

    this.lang = localStorage.getItem('rd_language');
    this.user = JSON.parse(localStorage.getItem('rd_profile'));
    this.userName = localStorage.getItem('rd_username');

    this.translate.get('CMS-Dashboard').subscribe(data => {
      this.t_data = data;
      moment.locale(localStorage.getItem('rd_language'));
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
              console.log(rest);
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
    console.log('Read');
    if (!!this.restaurant) {
      this.setMemberStatus();
      this.checkSPW();
      this.checkOpeningTimes();
      this.checkDescriptions();
      this.checkImages();
      this.getOffers();
    }
  }

  setMemberStatus() {
    // If not FullMember then Ass by default
    if (!!this.restaurant) {
      if (this.restaurant.restaurant_rc_member_status === 'Full') {
        console.log('FULL');
        this.memberStatus = 100;
        this.memberType = this.t_data.FullMember;
        this.memberIcon = 'people';
      } else {
        this.memberStatus = 50;
        this.memberType = this.t_data.AssMember;
        this.memberIcon = 'people_outline';
      }
    } else {
      this.memberStatus = 50;
      this.memberType = this.t_data.AssMember;
      this.memberIcon = 'people_outline';
    }

    if (!!this.last_updated) {
      this.memberJoinDate = new Date(this.last_updated.last_updated_status);
    }
    this.d_memberJoinDate = this.setDateRes(this.memberJoinDate);
  }

  checkSPW() {
    this.cms.checkSPW(this.restaurant.restaurant_id)
      .subscribe(res => {
          console.log(res);
          this.cmsHasSufficientData = res['data_status_ok'];
          this.cmsChanged = !(res['published_status_ok']);
          // Enough content?
          if (this.cmsHasSufficientData) {
            this.spwProdUrl = res['spw_url'];
            this.spwPreviewUrl = res['preview_spw_url'];
            // Has anything changed?
            if (this.cmsChanged) {
              this.publishDate = new Date(res['spw_written']);
            }
          } else {
            // Need more content to preview/publish
            this.publishDate = null;
          }
          this.isPreviewing = false;
          this.d_publishDate = moment(this.publishDate).format('LLLL');
        },
        error => {
          console.log('ERROR', error);
        });
  }

  // checkPublishStatus() {
  //
  //   this.cms.previewSPW(this.restaurant.restaurant_id, this.restaurant.restaurant_number, true, true)
  //     .subscribe(res => {
  //       // Set up content info panel
  //       switch (res['status']) {
  //         // No preview available
  //         case 'INSUFFICIENT_DATA': {
  //           //this.cmsChanged = true;
  //           //this.cmsHasSufficientData = false;
  //           //this.publishDate = null;
  //           break;
  //         }
  //
  //         // Show preview
  //         case 'OUT_OF_DATE': {
  //           //this.cmsChanged = true;
  //           //this.cmsHasSufficientData = true;
  //           this.publishDate = new Date(res['published']);
  //           this.spwProdUrl = res['url'];
  //           this.spwPreviewUrl = this.getSpwUrl();
  //           break;
  //         }
  //
  //         // Show published version
  //         default: {
  //           //this.cmsHasSufficientData = true;
  //           //this.cmsChanged = false;
  //           this.publishDate = new Date(res['published']);
  //           this.spwProdUrl = res['url'];
  //           this.spwPreviewUrl = this.getSpwUrl();
  //         }
  //       }
  //       this.isPreviewing = false;
  //       this.d_publishDate = moment(this.publishDate).format('LLLL');
  //     },
  //     error => {
  //       console.log('ERROR', error);
  //       this.isPreviewing = false;
  //       this.cmsLocalService.dspSnackbar('!SPW Failed to build, please try again', null, 5);
  //     });
  // }

  // getSpwUrl(): string {
  //
  //   if (!!this.spwProdUrl) {
  //     console.log('PROD URL', this.spwProdUrl);
  //     // This is just in case of any legacy published S3 bucket urls
  //     // it shouldn't be necessary
  //     if (this.spwProdUrl.indexOf('amazonaws')) {
  //       // Extract the bucket name and folder name (2nd and 3rd to last elements)
  //       // from the returned url and construct a production SPW url
  //       let arr = this.spwProdUrl.split('/');
  //       return `https://${arr.splice(arr.length - 3, 2).join('/')}`;
  //     } else {
  //       return this.spwProdUrl;
  //     }
  //   } else {
  //     // Nothing been published yet
  //     return null;
  //   }
  // }

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
        this.hours_date = new Date(this.last_updated.last_updated_hours);
        this.d_hours_date = this.setDateRes(this.hours_date);
      },
      error => {
        console.log('Error fetching times', error);
      });
  }

  checkDescriptions(): void {
    //console.log('checkDescriptions');
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe(
        data => {
          this.descriptions = data['descriptions'][0];
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
          // reset counts
          this.img_status = 0;
          this.img_count = 0;
          let i = data['elements'].length, elem, imgsrc;
          while (i--) {
            elem = data['elements'][i];
            if (elem.cms_element_active) { this.img_count += 1; }
            // Store default image path for restaurant card
            if (elem.cms_element_default) {
              imgsrc = this.cmsLocalService.getCloudinaryPublicId(elem.cms_element_image_path);
            }
          }
          //console.log('Img', imgsrc);
          this.img_src = imgsrc || this.dfImg;

          // set status bar
          this.img_status = this.img_count * 25;

          // set status message
          if (this.img_count === 0) {
            this.img_status_text = this.t_data.NoData;
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
        // reset status
        this.mnu_count = 0;
        let i = menuData['count'];
        while (i--) {
          if (menuData['elements'][i].cms_element_active) {
            this.mnu_count += 1;
          }
        }
        // active menus
        if (this.mnu_count > 0) {
          this.mnu_status += 33.3;
        }
        if (this.descriptions) {
          if (this.descriptions.cms_description_menus_overview) {
            this.mnu_status += 33.3;
          }
        }
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

    this.restaurantService.getOffers()
      .subscribe(
        res => {
          this.offerCount = res['offers'].length;
          if (this.offerCount > 0) {
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

                  //console.log('Offers:', this.offerInBox);
                  this.cmsLocalService.setOfferCount(this.offerInBox);
                },
                () => {
                  console.log('No access records found for restaurant');
                  // this restaurant has not seen any offers yet
                  this.offerInBox = this.offerCount;
                  this.cmsLocalService.setOfferCount(this.offerInBox);
                });
          }
        },
        () => {
          console.log('No offer records found');
        });
  }

  navTo(tgt) {
    // console.log('restaurants', this.restaurant.restaurant_id, 'cms', tgt);
    this.router.navigate(['restaurants', this.restaurant.restaurant_id, 'cms', tgt]);
  }

  previewSPW() {
    if (this.cmsHasSufficientData) {
      this.dialog.open(CmsPreviewComponent, {
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
    // console.log('publishSPW()');
    this.isPreviewing = true;
    this.cms.previewSPW(this.restaurant.restaurant_id, this.restaurant.restaurant_number, true, false)
      .subscribe(res => {
        console.log('New publish res', res);
          if (res['status'] === 'OK') {
            // console.log('Publish success:', res);
            //this.spwProdUrl = res['url'];
            //this.spwPreviewUrl = this.getSpwUrl();
            this.cmsChanged = false;
            this.d_publishDate = moment(new Date(res['published'])).format('LLLL');
            // this.publishDate = new Date(res['published']);

            this.verifyData();
            this.isPreviewing = false;
            // record event
            this.ga.sendEvent('CMS-Dashboard', 'SPW', 'Published');
            // reset data changed attribute
            this.cms.resetLastUpdatedField(Number(this.restaurant.restaurant_id)).subscribe(
              () => {},
              error => {
                console.log('unable to reset data changed attribute', error);
              });
          } else {
            console.log('Publish failed', res);
            this.isPreviewing = false;
          }
        },
        error => {
          console.log('Publish error', error);
          this.isPreviewing = false;
        });
    // }
  }

  dspSPWLinks(): void {
    this.dialog.open(CmsSpwLinksComponent,
      {
        data: {
          spwUrl: this.spwProdUrl,
          spwMenus: `${this.spwPreviewUrl}#menus`,
          restaurant: this.restaurant
        }
      });
  }

  openRestaurantWebsite(url) {
      // Does it look like a web address?
    if (!url.indexOf('.')) {
      return false;
      // Is there any protocol?
    } else  if (url.indexOf('//') < 0) {
      url = 'http://' + url;
    }
    window.open(url, '_blank');
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

    this.restaurantService.verify(this.restaurant.restaurant_id, this.userName )
      .subscribe(() => {
        this.cmsLocalService.dspSnackbar(this.t_data.DataVnP, 'OK', 5);
        this.restaurant.restaurant_verified_by = this.userName;
        this.restaurant.restaurant_verified_on = Date().toLocaleString();
        this.dbRestaurant.restaurant_verified_by = this.userName;
        this.dbRestaurant.restaurant_verified_on = Date().toLocaleString();
      },
      error => console.log(error));
  }

  reqDirectoryDataChange(): void {

    const dialogRef = this.dialog.open(RestaurantDetailComponent);

    // Setup dialog vars
    dialogRef.componentInstance.restaurant = this.restaurant;
    dialogRef.componentInstance.editMode = true;
    dialogRef.componentInstance.fromCMS = true;
    dialogRef.componentInstance.cancelSetting = true; // this so we can detect clicks outside the box

    // Whenever the dialog is closed
    dialogRef.afterClosed().subscribe(() => {
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
          this.cms.sendRestaurantChanges(this.user, this.restaurant, changeArray)
            .subscribe(() => {
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

  dspUnreadMessages() {

    // console.log(this.user.member_id, this.user.member_access_level, this.user.member_messages_seen);
    this.memberService.messages(this.user.member_id, this.user.member_access_level, this.user.member_messages_seen)
      .subscribe(msgs => {
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
                this.memberService.messagesseen(Number(this.user.member_id), msgs['messages'][i].message_id).subscribe(
                  () => {
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
            () => {
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

    if (!!someDate) {
      const today = new Date();
      return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
    } else {
      return false;
    }

  }
}
