import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageComponent } from "../common";
import { Router } from '@angular/router';
import { HeaderService } from '../common/header.service';
import { Member } from '../_models';
import { RestaurantService } from '../_services';
import { MatMenuTrigger } from '@angular/material/menu';



@Component({
  selector: "rc-hub",
  templateUrl: "./hub.component.html"
})

export class HubComponent implements AfterViewInit {

  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  member: Member;
  restaurants: Array<any>;
  apps = [
    {
      name: "Content Management",
      icon: "app-icon-cms",
      desc: "Manage your restaurant's web content and publish you Single Page Website (SPW) that will be used." ,
      status: "Last updated 28.02.2021",
      route: "cms"
    },
    {
      name: "Community Forum",
      icon: "app-icon-forum",
      desc: "Visit our online community of restaurant professionals.",
      status: "134 Members Online Now!",
      route: "fb"
    },
    {
      name: "Knowledge Base",
      icon: "app-icon-knowledge",
      desc: "Get help and information from the experts, with advice on all aspects of running a restaurant," +
        " including help using the Member's Hub.",
      status: "8 New articles published this week",
      route: "kb"
    },
    {
      name: "Deals Marketplace",
      icon: "app-icon-market",
      desc: "A wide range of offers and services available exclusive to Restaurant Collective Members",
      status: "Average savings £1750 p.a.",
      route: "market"
    },
    {
      name: "Membership Settings",
      icon: "app-icon-profile",
      desc: "Manage your Restaurant Collective membership account and user profile.",
      status: "Member since 28 Feb 2021",
      route: "profile"
    },
    {
      name: "Job & Staff Search",
      icon: "app-icon-jobs",
      desc: "Manage your Restaurant Collective membership account and user profile.",
      status: "22 new jobs published today",
      route: "jobs"
    }
  ]

  constructor(
    private header: HeaderService,
    private restaurantService: RestaurantService,
    private router: Router,
    public dialog: MatDialog) {

    this.header.updateHeaderTag('Member\'s Hub');
    this.member = JSON.parse(localStorage.getItem('rd_profile'));

  }

  ngAfterViewInit(): void {
    this.getRestaurants();
    this.dspMessages();
  }

  dspMessages() {
    const messages = [];
    let dialogRef = this.dialog.open(MessageComponent, {
      data: messages
    });
  }
  goTo (route: string): void {
    switch (route) {
      case 'cms': {
        if (this.restaurants.length > 1) {
          this.trigger.openMenu();
        } else {
          this.router.navigate(['/restaurants', this.restaurants[0].restaurant_id, 'cms', 'dashboard']).then()
        }
        break;
      }
      case 'profile': {
        this.router.navigate(['/profile']).then()
        break;
      }
      case 'kb': {
        break;
      }
      case 'fb': {
        break;
      }
      case 'jobs': {
        break;
      }
      case 'market': {
        break;
      }
    }
  }
  getRestaurants() {
    this.restaurantService.getMemberRestaurants(this.member.member_id)
      .subscribe(
        data => {
          this.restaurants = data['restaurants'];
          if (this.restaurants.length) {
            console.log(this.restaurants);
          }
        },
        error => {
          console.log(error);
        });
  }
}
