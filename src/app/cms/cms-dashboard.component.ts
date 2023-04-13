import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import {
  Restaurant,
  CMSDescription,
  Member
} from '../_models';
import {
  CMSService,
  MemberService,
  RestaurantService,
  AnalyticsService
} from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { CmsPreviewComponent } from './cms-preview.component';
import { Router } from '@angular/router';
import { RestaurantDetailComponent } from './restaurant-detail.component';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  MessageComponent,
  HelpService
} from '../common';
import * as moment from 'moment';
import { CmsSpwLinksComponent } from './cms-spw-links.component';
import { AppConfig } from '../app.config';

import { ImageService } from '../_services/image.service';
import { CloudinaryImage } from '@cloudinary/url-gen';

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
  desc_date: Date;
  desc_by: string;
  desc_status = 0;
  desc_status_text: string;
  d_desc_date: string;

  hours_date: Date;
  // hours_by: string;
  hours_status = 0;
  hours_count = 0;
  hours_status_text: string;
  d_hours_date: string;

  img_date: any;
  img_count = 0;
  img_status = 0;
  img_status_text: string;
  d_img_date: string;

  mnu_date: Date;
  mnu_count = 0;
  mnu_dish_count = 0;
  mnu_status = 0;
  mnu_status_text: string;
  d_mnu_date: string;

  bkg_date: Date;
  // bkg_by: string;
  bkg_status = 0;
  bkg_status_text: string;
  d_bkg_date: string;

  loc_date: Date;
  // loc_by: string;
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

  cldPlugins: any[];
  cldImage: CloudinaryImage = null;

  publishedText: string;

  constructor(
    private imgService: ImageService,
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private ga: AnalyticsService,
    private dialog: MatDialog,
    public help: HelpService,
    private translate: TranslateService,
    private router: Router,
    private restaurantService: RestaurantService,
    private memberService: MemberService,
    public config: AppConfig

  ) {
    this.t_data = this.translate.instant('CMS-Dashboard');
    this.cldPlugins = this.imgService.cldBasePlugins;
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

    moment.locale(localStorage.getItem('rd_language'));

    this.cmsLocalService.getRestaurant()
      .subscribe({
        next: rest => {
          this.cldImage = null;
          if (rest.restaurant_id) {
            this.restaurant = rest;
            this.updatePublishText(moment(this.restaurant.restaurant_verified_on).format('LLLL'), this.restaurant.restaurant_verified_by);
            this.getLastUpdated();
          }
          // duplicate the loaded restaurant
          // so that we can use it to compare changes
          this.dbRestaurant = {...this.restaurant};
          // for (const key in this.restaurant) {
          //   if (this.restaurant.hasOwnProperty(key)) {
          //     this.dbRestaurant[key] = this.restaurant[key];
          //   }
          // }
        },
        error: error => console.log(error)
      });
  }

  readAndCheckStatus () {
    console.log('Read');
    if (!!this.restaurant) {
      this.checkSPW();
      this.checkOpeningTimes();
      this.checkDescriptions();
      this.checkImages();
    }
  }

  checkSPW() {
    this.cms.checkSPW(this.restaurant.restaurant_id)
      .subscribe({
        next: res => {
          // console.log(res);
          this.cmsHasSufficientData = res['data_status_ok'];
          this.cmsChanged = !(res['published_status_ok']);
          // Enough content?
          if (this.cmsHasSufficientData) {
            this.spwProdUrl = this.cms.getPublishedUrl(res['spw_url'], true);
            this.spwPreviewUrl = this.cms.getPublishedUrl(res['preview_spw_url']);
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
        error: error => {
          console.log('ERROR', error);
        }
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

  checkOpeningTimes(): void {
    this.hours_count = 0;
    // console.log('IN getHours FOR DASHBOARD COMPONENT ' + this.restaurant.restaurant_id);
    this.cms.getTimes(this.restaurant.restaurant_id)
      .subscribe({
        next: data => {
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
            this.hours_status_text = this.translate.instant(
              'CMS.DASHBOARD.summary.statusTimes',
              {num: this.hours_count});
            this.hours_status = 100;
          } else {
            this.hours_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
            this.hours_status = 0;
          }
          this.hours_date = new Date(this.last_updated.last_updated_hours);
          this.d_hours_date = this.setDateRes(this.hours_date);
        },
        error: error => {
          console.log('Error fetching times', error);
        }
      });
  }

  checkDescriptions(): void {
    // console.log('checkDescriptions');
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe({
        next: data => {
          this.descriptions = data['descriptions'][0];
          this.checkFeatures();
          this.checkBookingInfo();
          this.checkLocationInfo();
          this.checkHtmlMenuDishes();
        },
        error: error => {
          console.log(error);
        }
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
        this.desc_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
      } else if (this.desc_status >= 100) {
        this.desc_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusComplete');
      } else {
        this.desc_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusSomeData');
      }
      this.desc_by = this.descriptions.cms_description_created_by;
      // this.desc_date = new Date(this.descriptions.cms_description_last_updated);
      this.desc_date = new Date(this.last_updated.last_updated_descriptions);
      this.d_desc_date = this.setDateRes(this.desc_date);

    } else {
      this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
    }
  }

  checkImages() {

    this.cms.getElementClass(this.restaurant.restaurant_id, 'Image', 'N')
      .subscribe({
        next: data => {
          // reset counts
          this.img_status = 0;
          this.img_count = 0;
          let i = data['elements'].length, elem;
          while (i--) {
            elem = data['elements'][i];
            if (elem.cms_element_active) {
              this.img_count += 1;
            }
            // Store default image path for restaurant card
            if (elem.cms_element_default) {
              this.cldImage = this.imgService.getCldImage(this.cmsLocalService.getCloudinaryPublicId(elem.cms_element_image_path));
            }
          }

          // set status bar
          this.img_status = this.img_count * 25;

          // set status message
          if (this.img_count === 0) {
            this.img_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
          } else {
            this.img_status_text = this.translate.instant(
              'CMS.DASHBOARD.summary.statusImages',
              {count: this.img_count});
          }

          // if (data['elements'].length) {
          //   this.img_date = new Date(data['elements'][data['elements'].length - 1].cms_element_last_update);
          //   this.d_img_date = moment(this.img_date).format('dddd, DD MMMM YYYY');
          // }
          this.img_date = new Date(this.last_updated.last_updated_images);
          this.d_img_date = this.setDateRes(this.img_date);
        },
        error: error => console.log(error + ' R ' + this.restaurant.restaurant_id)
      });
  }

  checkHtmlMenuDishes() {
    // reset status
    this.mnu_status = 0;

    this.cms.getDishes(Number(this.restaurant.restaurant_id)).subscribe({
      next: data => {
        if (data['count'] > 0) {
          this.mnu_status += 33.5;
          this.mnu_dish_count = data['count'];
        }
        this.checkPdfMenus();
      },
      error: error => {
        console.log(error);
      }
    });
  }

  checkPdfMenus(): void {

    this.cms.getElementClass(this.restaurant.restaurant_id, 'Menu', 'N')
      .subscribe({
        next: menuData => {
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
            this.mnu_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
          } else {
            this.mnu_status_text = this.translate.instant(
              'CMS.DASHBOARD.summary.statusMenus',
              { pdf: this.mnu_count, dish: this.mnu_dish_count });
          }
        },
        error: error => {
          console.log(error);
        }
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
        this.bkg_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
      } else if (this.bkg_status >= 100) {
        this.bkg_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusComplete');
      } else {
        this.bkg_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusSomeData');
      }
    } else {
      this.bkg_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
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
      this.loc_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusNoData');
    } else if (this.loc_status >= 100) {
      this.loc_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusComplete');
    } else {
      this.loc_status_text = this.translate.instant('CMS.DASHBOARD.summary.statusSomeData');
    }
  }

  navTo(tgt) {
    // console.log('restaurants', this.restaurant.restaurant_id, 'cms', tgt);
    this.router.navigate(['cms', this.restaurant.restaurant_id, tgt]).then();
  }

  previewSPW() {
    if (this.cmsHasSufficientData) {
      this.dialog.open(CmsPreviewComponent, {
        panelClass: 'rc-preview-dialog-container',
        backdropClass: 'rc-preview-backdrop',
        data: {
          id: this.restaurant.restaurant_id,
          number: this.restaurant.restaurant_number,
          name: this.restaurant.restaurant_name
        }
      });
      // record event
      this.ga.sendEvent('CMS-Dashboard', 'SPW', 'Previewed');
    } else {
      this.help.dspHelp('cms-spw-nodata');
    }
  }

  publishSPW(): void {
    this.cms.publish(this.restaurant.restaurant_id, true)
        .then(res => {
          console.log('pub', res);
          if (res['status'] === 'OK') {
            // console.log('Publish success:', res);
            this.spwProdUrl = this.cms.getPublishedUrl(res['url'], true);
            //this.spwPreviewUrl = this.getSpwUrl();
            this.cmsChanged = false;
            this.d_publishDate = moment(new Date(res['published'])).format('LLL');

            this.verifyData();
            this.isPreviewing = false;
            // record event
            this.ga.sendEvent('CMS-Dashboard', 'SPW', 'Published');
            // reset data changed attribute
            this.cms.resetLastUpdatedField(Number(this.restaurant.restaurant_id))
              .subscribe({
                next: () => {
                },
                error: error => {
                  console.log('unable to reset data changed attribute', error);
                }
              });
          } else {
            console.log('Publish failed', res);
            this.isPreviewing = false;
          }
        })
        .catch((res) => console.log('Error', res));
  }

  dspSPWLinks(): void {
    this.dialog.open(CmsSpwLinksComponent,
      {
        data: {
          spwUrl: this.spwProdUrl,
          spwMenus: `${this.spwProdUrl}#menus`,
          restaurant: this.restaurant,
          curation: this.config.brand.email.curation
        }
      });
  }

  openRestaurantWebsite(url) {
      // Does it look like a web address?
    if (!url.indexOf('.')) {
      return false;
      // Is there any protocol?
    } else  if (url.indexOf('//') < 0) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  }

  openSocialLink(url) {

    if (url) {
      // if it's missing the protocol
      if (url.indexOf('//') === -1) {
        url = 'https://' + url;
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
      .subscribe({
        next: () => {
          this.cmsLocalService.dspSnackbar(
            this.translate.instant('CMS.DASHBOARD.spw.msgVerifiedAndPublished'),
            'OK', 5);

          this.restaurant.restaurant_verified_by = this.userName;
          this.restaurant.restaurant_verified_on = Date().toLocaleString();
          this.dbRestaurant.restaurant_verified_by = this.userName;
          this.dbRestaurant.restaurant_verified_on = Date().toLocaleString();
          this.updatePublishText(this.d_publishDate, this.userName);
        },
        error: error => console.log(error)
      });
  }
  updatePublishText(dateTime, user): void {
    console.log(`updatePublishText: ${dateTime}, ${user}`);
    this.publishedText = this.translate.instant('CMS.DASHBOARD.spw.msgVerified', { date: dateTime, name:
      user });
  }

  reqDirectoryDataChange(): void {

    const dialogRef = this.dialog.open(RestaurantDetailComponent, {
      width: '600px'
    });

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
          this.cmsLocalService.dspSnackbar(this.translate.instant('CMS.DASHBOARD.core.msgChangeRequest'),
            null, 1);

          // send information to the server so that emails can be generated
          this.cms.sendRestaurantChanges(this.user.member_first_name, this.user.member_last_name, this.user.member_email,
            this.restaurant.restaurant_name, changeArray)
            .subscribe({
              next: () => {
                // console.log('Emails generated by server');
                const msg = this.translate.instant('CMS.DASHBOARD.core.msgDataChange');
                this.cmsLocalService.dspSnackbar(msg, 'OK', 20, 'info');
                // record event
                this.ga.sendEvent('CMS-Dashboard', 'Core Data', 'Change Request');
              },
              error: error => console.log(error)
            });

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
      .subscribe({
        next: msgs => {
          // Guard clause
          if (msgs['count'] < 1) { return; }

          const dialogref = this.dialog.open(MessageComponent, {
            data: {
              user_id: this.user.member_id,
              messages: msgs['messages'],
            },
            // force user to explicitly close the dialog
            disableClose: true
          });

          dialogref.afterClosed().subscribe({
            next: msgSeen => {
              if (msgSeen) {
                console.log('Message Seen');
                // so set them all to seen...
                for (let i = 0; i < msgs['messages'].length; i++) {
                  // console.log('SEEN: ', this.user.member_id, msgs.messages[i].message_id);
                  this.memberService.messagesseen(Number(this.user.member_id), msgs['messages'][i].message_id)
                    .subscribe({
                      next: () => {
                        // console.log(result);
                      },
                      error: error => {
                        console.log(error);
                        console.log('Failed to update messages_seen for member ' + this.user.member_id);
                      }
                    });
                }
              } else {
                console.log('Message NOT Seen');
              }
            },
            error: () => console.log()
          });
        }
      });

  }

  getLastUpdated() {
    this.cms.getLastUpdatedRecord(Number(this.restaurant.restaurant_id))
      .subscribe({
        next: data => {
          if (data['count'] === 0) {
            // no record found, so this must be the first time - create one...
            this.cms.createLastUpdatedRecord(Number(this.restaurant.restaurant_id))
              .subscribe({
                next: () => {
                  // now read it back!
                  this.cms.getLastUpdatedRecord(Number(this.restaurant.restaurant_id))
                    .subscribe({
                      next: reread => {
                        // console.log('createlastupdatedrecord', reread);
                        this.last_updated = reread['lastupdated'][0];
                        this.readAndCheckStatus();
                      },
                      error: error => {
                        console.log('getlastupdatedrecord', error);
                      }
                    });
                },
                error: error => {
                  console.log('createlastupdatedrecord', error);
                }
              });
          } else {
            // console.log(data);
            this.last_updated = data['lastupdated'][0];
            this.readAndCheckStatus();
          }
        },
        error: error => {
          console.log('getlastupdatedrecord', error);
        }
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
