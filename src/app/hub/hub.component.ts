import { Component, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageComponent } from "../common";
import { Router } from '@angular/router';



@Component({
  selector: "rc-hub",
  templateUrl: "./hub.component.html"
})
export class HubComponent implements OnInit {

  apps = [
    {
      name: "Community Forum",
      icon: "app-icon-forum",
      desc: "Visit our online community of restaurant professionals.",
      status: "134 Members Online Now!",
      route: "fb"
    },
    {
      name: "Content Management",
      icon: "app-icon-cms",
      desc: "Manage your restaurant's web content and publish you Single Page Website (SPW) that will be used." ,
      status: "Last updated 28.02.2021",
      route: "cms"
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
      name: "Marketplace",
      icon: "app-icon-market",
      desc: "A wide range of offers and services available exclusive to Restaurant Collective Members",
      status: "Average savings £1750 p.a.",
      route: "market"
    },
    {
      name: "Member Account",
      icon: "app-icon-profile",
      desc: "Manage your Restaurant Collective membership account and user profile.",
      status: "Member since 28 Feb 2021",
      route: "profile"
    },
    {
      name: "Job Search",
      icon: "app-icon-jobs",
      desc: "Manage your Restaurant Collective membership account and user profile.",
      status: "22 new jobs published today",
      route: "jobs"
    }
  ]

  constructor(
    private router: Router,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    //this.dspMessages();
  }
  dspMessages() {
    let dialogRef = this.dialog.open(MessageComponent);
  }
  goTo (route: string): void {
    switch (route) {
      case 'cms': {
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
}
