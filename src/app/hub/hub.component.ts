import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageComponent } from "../common";
import { Router } from '@angular/router';
import { HeaderService } from '../common/header.service';
import { Member } from '../_models';
import { RestaurantService } from '../_services';
import { MatMenuTrigger } from '@angular/material/menu';
import { LoadService } from '../common/loader/load.service';
import { RestaurantLookupComponent } from '../member';

@Component({
  selector: "rc-hub",
  templateUrl: "./hub.component.html"
})

export class HubComponent implements AfterViewInit {

  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  member: Member;
  restaurants: Array<any>;
  // Mock up some messages
  messages = [
    {
      severity: 1,
      message_subject_en: 'An Important Message',
      message_text_en: 'This a critical message and we want the member to acknowledge reading it.'
    },
    {
      severity: 0,
      message_subject_en: 'A Less Important Message',
      message_text_en: 'This message has less importance and is just for general information..'
    }
  ];
  // Mock up some apps/services
  apps = [
    {
      name:   "Web Content",
      icon:   "app-icon-cms",
      desc:   "Manage your restaurant's web content and publish you Single Page Website (SPW) that will be used." ,
      status: "Last updated on 28.02.2021",
      route:  "content"
    },
    {
      name:   "Community Forum",
      icon:   "app-icon-forum",
      desc:   "Visit our Facebook Community Group  of restaurant professionals and contribute.",
      status: "134 Members Online Now!",
      route:  "forum"
    },
    {
      name:   "Knowledge Base",
      icon:   "app-icon-knowledge",
      desc:   "Get help and information from the experts, with advice on all aspects of running a restaurant," +
              " including help using the Member's Hub.",
      status: "8 New articles published this week",
      route:  "knowledge"
    },
    {
      name:   "Deals Marketplace",
      icon:   "app-icon-market",
      desc:   "A wide range of offers and services available exclusive to Restaurant Collective Members. New deals are" +
              " being added every week, so check regularly..",
      status: "Average savings £1750 p.a.",
      route:  "marketplace"
    },
    {
      name:   "Membership Settings",
      icon:   "app-icon-profile",
      desc:   "Manage your Restaurant Collective membership account and user profile.",
      status: "Member since 28 Feb 2021",
      route:  "membership"
    },
    // {
    //   name: "Job & Staff Search",
    //   icon: "app-icon-jobs",
    //   desc: "Manage your Restaurant Collective membership account and user profile.",
    //   status: "22 new jobs published today",
    //   route: "job-search"
    // },
    {
      name: "Tell us what you need",
      icon: "app-icon-survey",
      desc: "We want to provide the tools and" +
        " services that our members need the most. Help us to help you by taking 30 seconds to tell us what you want. ",
      status: "736 RESPONSES SO FAR",
      route: "survey"
    }
  ]

  constructor(
    private loader: LoadService,
    private header: HeaderService,
    private restaurantService: RestaurantService,
    private router: Router,
    public dialog: MatDialog) {
      this.loader.open();
      this.header.updateSectionName('Member\'s Hub');
      this.member = JSON.parse(localStorage.getItem('rd_profile'));
  }

  ngAfterViewInit(): void {
    this.getRestaurants();
    this.loader.close();
    this.dspMessages();
  }

  dspMessages() {
    let dialogMessages = this.dialog.open(MessageComponent, {
      disableClose: true,
      data: {
        newMember: true,
        member: this.member,
        messages: this.messages
      }
    });

    dialogMessages.afterClosed()
      .subscribe(isNewMember => {
        if (isNewMember) {
          this.openRestaurantLookup();
        }
      });
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
  }
  // Navigation
  goTo (route: string): void {
    switch (route) {
      case 'content': {
        const i = this.restaurants.length;
        // Multiple
        if (i > 1) {
          this.trigger.openMenu();
        // Single
        } else if (i === 1) {
          this.router.navigate(['/restaurants', this.restaurants[0].restaurant_id, 'cms', 'dashboard']).then()
        // Nothing associated yet
        } else {
          this.openRestaurantLookup();
        }
        break;
      }
      case 'membership': {
        this.router.navigate(['/profile']).then()
        break;
      }
      case 'knowledge': {
        break;
      }
      case 'forum': {
        window.open('https://www.facebook.com/restaurantcollective/', '_blank');
        break;
      }
      case 'jobs': {
        break;
      }
      case 'marketplace': {
        break;
      }
      case 'survey': {
        break;
      }
      default: {
        break;
      }
    }
  }
  getRestaurants() {
    this.restaurantService.getMemberRestaurants(this.member.member_id)
      .subscribe(
        data => {
          this.restaurants = data['restaurants'];
        },
        error => {
          console.log(error);
        });
  }
}
