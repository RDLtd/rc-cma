import { Injectable } from '@angular/core';
import { Member, Restaurant } from '../_models';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { ConfirmCancelComponent } from '../confirm-cancel/confirm-cancel.component';
import { TranslateService } from '@ngx-translate/core';;
import { AuthenticationService } from '../_services';

@Injectable()

export class CmsLocalService {

  private restaurant: Restaurant = new Restaurant();
  private subject: Subject<Restaurant> = new BehaviorSubject<Restaurant>(this.restaurant);

  // Observable offers
  private offerCount: number = 0;
  private offerSubject = new Subject<any>();

  dialogConfig: MatDialogConfig = new MatDialogConfig();

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private dialog: MatDialog,
    private authService: AuthenticationService
  ) { }

  // Update & send
  setOfferCount(count: number): void {
    this.offerCount = count;
    this.offerSubject.next(this.offerCount);
  }
  // Subscribe & get initial value
  getOfferCount(): Observable<number> {
    return this.offerSubject.asObservable();
  }

  setRestaurant(restaurant: Restaurant): void {
    // console.log('cmsLocalService.setRestaurant()', restaurant);
    this.restaurant = restaurant;
    this.subject.next(this.restaurant);
  }

  getRestaurant(): Observable<Restaurant> {
    // console.log('cmsLocalService.getRestaurant()', this.subject);
    return this.subject.asObservable();
  }

  dpsSnackbar(msg: string, actn: string = '', dur: number = 3): void {
    this.snackBar.open(msg, actn, {
      duration: dur * 1000
    });
  }

  confirmNavigation() {
    // load translations
    this.translate.get('CMS').subscribe(t => {
      this.dialogConfig = {
        data: {
          title: t.Sure,
          msg: t.SaveContinue,
          no: t.GoBack,
          yes: t.ContinueCaps,
          showCheckbox: false
        }
      };
    });
    const dialogRef = this.dialog.open(ConfirmCancelComponent, this.dialogConfig );
    return dialogRef.afterClosed().map(result => {
      return result.confirmed;
    });
  }
}
