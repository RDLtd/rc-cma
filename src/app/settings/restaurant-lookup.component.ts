import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { Restaurant } from '../_models';
import { RestaurantService, CMSService, ErrorService } from '../_services';
import { VerificationComponent } from './verification.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmCancelComponent, HelpService } from '../common';
import { debounceTime, distinctUntilChanged, fromEvent, of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-rc-restaurant-lookup',
  templateUrl: './restaurant-lookup.component.html'
})

export class RestaurantLookupComponent implements AfterViewInit {

  @ViewChild('searchInput') searchInput: ElementRef;
  countryCode: string;
  restaurants: Restaurant[] = [];
  searchType = "name";
  isSearching = false;
  showSearchResults = false;
  noSearchResults = false;
  // for associations
  dspNewListingForm = false;
  verificationCodeRequired = true;
  contactEmailRequired = false;

  constructor(
    private   restaurantService: RestaurantService,
    private   cms: CMSService,
    public    dialog: MatDialog,
    public    help: HelpService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private   translate: TranslateService,
    private   snackBar: MatSnackBar,
    private error: ErrorService,
    public dialogRef: MatDialogRef<RestaurantLookupComponent>
  ) { }

  ngAfterViewInit() {
    this.countryCode = localStorage.getItem('rd_brand') === 'ri' ? 'FR' : 'UK';
    this.initSearch();
  }

  /**
   * Initialise search on our input field and listen for key events
   */
  initSearch() {
    console.log(this.searchInput);
    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.target.value),
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),
      switchMap((term) => term ? this.restaurantService.getRestaurantSubset(term, this.searchType, this.countryCode) : of<any>(this.restaurants)),
      tap(() => {
        this.isSearching = false;
        this.showSearchResults = true;
      })
    ).subscribe({
      next: (data) => {
        if (!data) { return }
        this.isSearching = false;
        this.restaurants = data.restaurants;
        this.noSearchResults = !!this.restaurants && this.restaurants.length < 1;
      },
      error: err => console.log(err)
    });
  }

  focusSearchInput(): void {
    this.searchInput.nativeElement.select();
  }
  resetSearchInput(): void {
    this.searchInput.nativeElement.value = '';
    this.restaurants = [];
    this.dspNewListingForm = false;
    this.noSearchResults = false;
  }
  associateRestaurant(selected) {

    // TODO so here is the problem, via the join form we don't have this data set
    // console.log(this.data.associatedRestaurants);

    // Make sure it's not already been associated
    // by comparing to current associations

    const totalAssociatedRestaurants = this.data.associatedRestaurants.length;
    for (let i = 0; i < totalAssociatedRestaurants; i++) {
      const associatedRestaurant = this.data.associatedRestaurants[i];
      if (associatedRestaurant.restaurant_name === selected.restaurant_name &&
        associatedRestaurant.restaurant_address_1 === selected.restaurant_address_1) {
        // console.log('Restaurant already associated for this user');
        this.dspSnackBar(
          this.translate.instant('LOOKUP.msgAlreadyAdded', { name: selected.restaurant_name})
        );
        return;
      }
    }

    // Update 12/12/19 allow anyone with auth level >=4 to associate whatever
    if (Number(localStorage.getItem('rd_access_level')) >= 4) {
      this.addAssociation(selected);
    } else {

      // Has it already been verified by owner?
      // i.e. is there already an admin user

      //
      // ks 200723 not sure this is the correct strategy. Plus also not sure that we ever set data_status!
      //
      // Here we need to look in ALL associations for this venue - if it is already associated
      // then we need to inhibit...
      //
      // BUT, if it has been only associated by level 4 users, then we should be able to proceed!
      //
      if (selected.restaurant_data_status === 'Verified By Owner') {
        this.dspSnackBar(
          this.translate.instant('LOOKUP.msgAlreadyVerified', { name: selected.restaurant_name })
        );
        return;
      }

      // Do we need to check the verification code?
      this.verificationCodeRequired = sessionStorage.getItem('referrer_type') !== 'member';

      // Is there a contact email for the selected restaurant?
      this.contactEmailRequired = !this.isValidEmail(selected.restaurant_email.trim());

      // Verification
      if (this.verificationCodeRequired || this.contactEmailRequired) {
        const dialogref = this.dialog.open(VerificationComponent, {
          data: {
            restaurant: selected,
            member: this.data.member,
            verificationCodeRequired: this.verificationCodeRequired,
            contactEmailRequired: this.contactEmailRequired
          }
        });

        dialogref.afterClosed().subscribe(association => {
          if (association) {
            if (association.verified) {
              this.addAssociation(selected);
            } else {
              console.log('Invalid code or cancelled operation');
            }
          }
        });
      } else {
        this.addAssociation(selected);
      }
    }
  }

  isValidEmail(emailAddress): boolean {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(emailAddress);
  }

  addAssociation(newRestaurant) {

    console.log('New Restaurant:', newRestaurant);

    const curationComplete = (newRestaurant.restaurant_data_status === 'Curation Complete');
    this.restaurantService.addAssociation(this.data.member.member_id, newRestaurant.restaurant_id)
        .subscribe({
          next: () => {
            // Verify email contact details
            if (!newRestaurant.restaurant_email.trim().length) {
              console.log(`No Email: ${newRestaurant.restaurant_email}`);
            }
            this.data.associatedRestaurants.push(newRestaurant);

            // TODO: Is this still required?
            // If the new restaurant is not already a member
            // if (newRestaurant.restaurant_rc_member_status !== 'Full'
            //   && newRestaurant.restaurant_rc_member_status !== 'Associate') {
            //   this.restaurantService.updateMemberStatus(newRestaurant.restaurant_id, 'Associate').subscribe(
            //     () => {
            //       console.log('Member status updated to Associate');
            //     },
            //     error => {
            //       console.log('Member status update failed (' + error + ')');
            //     });
            // }
          },
          error: error => {
            console.log(error);
            this.error.handleError('unableToAddAssociation', 'Failed to add association in restaurant-lookup! ' + error);
          }
        });

    if (curationComplete) {

      this.dialog.closeAll();
      this.dspSnackBar(this.translate.instant('LOOKUP.msgRestaurantAdded', { name: newRestaurant.restaurant_name }));

    } else {
      const confirmDialog = this.dialog.open(ConfirmCancelComponent, {
        data: {
          title: this.translate.instant('LOOKUP.titlePleaseNote'),
          body: this.translate.instant(
            'LOOKUP.msgNotCurated',
            { name: newRestaurant.restaurant_name }),
          confirm: 'OK',
          cancel: 'hide'
        }
      });
      confirmDialog.afterClosed().subscribe(ok => {
        if (ok) {
          // Custom email now set up
          // Notify curation team
          const req = [
            ` Name: ${localStorage.getItem('rd_username')}`,
            ` Email: ${this.data.member.member_email}`,
            ` ***`,
            ` Restaurant: ${newRestaurant.restaurant_name}`,
            ` Restaurant #: ${newRestaurant.restaurant_number}`,
            ` Address 1: ${newRestaurant.restaurant_address_1}`,
            ` Postcode: ${newRestaurant.restaurant_post_code}`,
            `***`,
            `This restaurant requires immediate curation. Please notify the Member when it has been completed. Thank you`
          ];

          console.log(req);

          this.cms.sendRestaurantValidation(this.data.member, newRestaurant, req)
            .subscribe({
              next: () => {
                console.log('Flagged for immediate curation');
              },
              error: error => {
                console.log(error);
                this.error.handleError('', 'Failed to send curation request! ' + req + ', ' + error);
              }
            });
          this.dialog.closeAll();
        }
      });
    }
  }

  showRequestForm(searchInput) {
    // reset search field
    searchInput.value = '';
    // reset results list
    this.restaurants = [];
    this.dspNewListingForm = true;
  }

  sendNewRequest(f) {
    console.log(f.newRestaurantName);
    // API call to add listing
    this.dialogRef.close(f);
    this.dspSnackBar(this.translate.instant('LOOKUP.msgRequestSent'));
  }

  dspSnackBar(msg: string, action = null, d = 3, style = 'info') {
    this.snackBar.open(msg, action, {
      duration: d * 1000,
      panelClass: [`rc-mat-snack-${style}`]
    });
  }

}

