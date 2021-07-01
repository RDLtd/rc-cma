import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MessageComponent, Message, LoadService, ConfirmCancelComponent } from "../common";
import { Router } from '@angular/router';
import { HeaderService } from '../common/header.service';
import { Member, Restaurant } from '../_models';
import { MemberService, RestaurantService } from '../_services';
import { MatMenuTrigger } from '@angular/material/menu';
import { RestaurantLookupComponent } from '../settings';
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
  services: any;
  webContentDefaultRoute: [];

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
      console.log('New member', !this.member.isAuthenticated);

  }

  ngAfterViewInit(): void {

    this.getServices();
    this.getRestaurants();
    this.loader.close();

    // Delay messages a little so that it opens after everything else
    setTimeout(() => this.getMessages(), 500);

  }

  getServices(): void {
    this.hubService.getServices().subscribe(data => {
      // console.log(data.services);
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

    let data = {
      newMember: !this.member.isAuthenticated,
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
          // Mark as seen
          this.updateMemberAuth();
        });
    }
  }

  updateMemberAuth(): void {
    this.member.isAuthenticated = true;
    this.hubService.updateMemberAuth(this.member)
      .subscribe(res => console.log('updateMemberAuth Success', res));
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

    dialogLookUp.afterClosed()
      .subscribe(() => {
        console.log('this.restaurants', this.restaurants);
      });
  }

  // Navigation
  launchFeature (service: any) {

    if (service.service_disabled) {
      let dialogReg = this.dialog.open(ConfirmCancelComponent, {
        data: {
          title: this.translate.instant('HUB.msgComingSoon'),
          body: service.service_disabled_message,
          confirm: 'OK',
          cancel: 'hide'
        }
      });
      return false;
    }
    console.log('Service', service.service_route);
    switch (service.service_route) {
      case 'cms': {
        const i = this.restaurants.length;
        // No restaurants added yet
        if (i === 0) {
          this.openRestaurantLookup();
          // Multiple restaurants
        } else if (i > 1) {
          this.trigger.openMenu();
          // 1 restaurant
        } else {
          this.router.navigate(['/cms', this.restaurants[0].restaurant_id]).then()
        }
        break;
      }
      default: {
        if (service.service_external) {
          window.open(service.service_route, '_blank');
        } else {
          this.router.navigate([`/${service.service_route}`]).then();
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
          // console.log(this.restaurants);
        },
        error => {
          console.log(error);
        });
  }
}
