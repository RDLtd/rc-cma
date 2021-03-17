import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageComponent, Message, LoadService, ConfirmCancelComponent } from "../common";
import { Router } from '@angular/router';
import { HeaderService } from '../common/header.service';
import { Member, Restaurant } from '../_models';
import { MemberService, RestaurantService } from '../_services';
import { MatMenuTrigger } from '@angular/material/menu';
import { RestaurantLookupComponent } from '../member';
import { TranslateService } from '@ngx-translate/core';
import { HubService } from './hub.service';
import { insertAnimation } from '../shared/animations';

@Component({
  selector: "rc-hub",
  templateUrl: "./hub.component.html",
  animations: [insertAnimation]
})


export class HubComponent implements AfterViewInit {
  // Access to the restaurant dropdown
  // for users with > 1 restaurant
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;

  member: Member;
  restaurants: Array<Restaurant>;
  messages: Array<Message>;
  restaurantCount = null;
  services: any;
  webContentDefaultRoute: [];

  // Mock up some messages
  // messages = [
  //   {
  //     severity: 1,
  //     message_subject_en: 'An Important Message',
  //     message_text_en: 'This a critical message and we want the member to acknowledge reading it.'
  //   },
  //   {
  //     severity: 0,
  //     message_subject_en: 'A Less Important Message',
  //     message_text_en: 'This message has less importance and is just for general information..'
  //   }
  // ];

  // Mock up some apps/services
  // mockFeatures = [
  //   {
  //     id:  "cms",
  //     name:         "Web Content",
  //     icon:         "app-icon-cms",
  //     description:  "Manage your restaurant's web content and publish you Single Page Website (SPW) that will be used." ,
  //     status:       "Last updated on 28.02.2021",
  //     route:        "/restaurant",
  //     ext:          false
  //   },
  //   {
  //     id:           "forum",
  //     name:         "Community Forum",
  //     icon:         "app-icon-forum",
  //     description:  "Visit our Facebook Community Group  of restaurant professionals and contribute.",
  //     status:       "134 Members Online Now!",
  //     route:        "https://www.facebook.com/restaurantcollective/",
  //     ext:          true
  //   },
  //   {
  //     id:           "knowledge",
  //     name:         "Knowledge Base",
  //     icon:         "app-icon-knowledge",
  //     description:  "Get help and information from the experts, with advice on all aspects of running a restaurant," +
  //                   " including help using the Member's Hub.",
  //     status:       "8 New articles published this week",
  //     route:        "https://restaurantcollective.org.uk/",
  //     ext:          true
  //   },
  //   {
  //     id:           "market",
  //     name:         "Deals Marketplace",
  //     icon:         "app-icon-market",
  //     description:  "A wide range of offers and services available exclusive to Restaurant Collective Members. New" +
  //                   " deals are being added every week, so check regularly..",
  //     status:       "Average savings £1750 p.a.",
  //     route:        "/marketplace",
  //     ext:          false
  //   },
  //   {
  //     id:           "settings",
  //     name:         "Membership Settings",
  //     icon:         "app-icon-profile",
  //     description:  "Manage your Restaurant Collective membership account and user profile.",
  //     status:       "Member since 28 Feb 2021",
  //     route:        "/profile",
  //     ext:          false
  //   },
  //   // {
  //   //   name: "Job & Staff Search",
  //   //   icon: "app-icon-jobs",
  //   //   desc: "Manage your Restaurant Collective membership account and user profile.",
  //   //   status: "22 new jobs published today",
  //   //   route: "job-search",
  //   //   ext: true
  //   // },
  //   {
  //     id: "survey",
  //     name: "Tell us what you need",
  //     icon: "app-icon-survey",
  //     description: "We want to provide the tools and" +
  //       " services that our members need the most. Help us to help you by taking 30 seconds to tell us what you want. ",
  //     status: "736 RESPONSES SO FAR",
  //     route: "https://restaurantcollective.org.uk/",
  //     ext: true
  //   }
  // ]

  constructor(
    private loader: LoadService,
    private header: HeaderService,
    private restaurantService: RestaurantService,
    private hubService: HubService,
    private memberService: MemberService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog) {

      this.loader.open();
      this.header.updateSectionName(this.translate.instant('HUB.sectionHub'));
      this.member = JSON.parse(localStorage.getItem('rd_profile'));

  }

  ngAfterViewInit(): void {
    this.getServices();
    this.getRestaurants();
    this.loader.close();
    // Delay a little so that it opens after everything else
    setTimeout(() => this.getMessages(), 500);

  }

  getServices(): void {
    this.hubService.getServices().subscribe(data => {
      console.log(data.services);
      this.services = data.services;
    });
  }

  async getMessages() {
    await this.memberService
      .messages(this.member.member_id, this.member.member_access_level, this.member.member_messages_seen)
      .toPromise()
      .then(m => {
        this.messages = m['messages'];
        this.dspMessages();
      });
  }

  dspMessages(): void {
    // console.log('AUTH', !this.member.member_authenticated);
    let data = {
      newMember: false,
      member: this.member,
      messages: this.messages
    }
    if (data.newMember || this.messages.length)  {
      let dialogMessages = this.dialog.open(MessageComponent, {
        disableClose: true,
        data: data
      });
      dialogMessages.afterClosed()
        .subscribe(addRestaurant => {
          if (addRestaurant) {
            this.openRestaurantLookup();
          }
        });
    }
  }

  openRestaurantLookup(): void {
    let dialogLookUp = this.dialog.open(RestaurantLookupComponent, {
      width: '480px',
      position: {'top': '10vh'},
      data: {
        associatedRestaurants: this.restaurants,
        member: this.member
      }
    });
    dialogLookUp.afterClosed();
  }

  // Navigation
  launchFeature (service: any) {
    console.log(service.service_id);
    if (service.service_disabled) {
      let dialogReg = this.dialog.open(ConfirmCancelComponent, {
        data: {
          title: 'Service unavailable',
          body: `Sorry but **${ service.service_name }** is not currently available. The launch date for this service is 17 April 2021, please try again then!`,
          confirm: 'OK',
          cancel: 'hide'
        }
      });
      return false;
    }
    switch (service.service_id) {
      case 1: {
        console.log(service.service_id);
        const i = this.restaurants.length;
        // No restaurants added yet
        if (i === 0) {
          this.openRestaurantLookup();
          // Multiple restaurants
        } else if (i > 1) {
          this.trigger.openMenu();
          // 1 restaurant
        } else {
          this.router.navigate(['/restaurants', this.restaurants[0].restaurant_id, 'cms', 'dashboard']).then()
        }
        break;
      }
      default: {
        if (service.service_external) {
          window.open(service.service_route, '_blank');
        } else {
          this.router.navigate([service.service_route]).then();
        }
        break;
      }
    }
  }

  getRestaurants() {
    this.restaurantService.getMemberRestaurants(this.member.member_id)
      .subscribe(
        data => {
          this.restaurants = data['restaurants'];
          // Set count as a string for the badge
          this.restaurantCount = this.restaurants.length.toString();
          // console.log(this.restaurants);
        },
        error => {
          console.log(error);
        });
  }
}
