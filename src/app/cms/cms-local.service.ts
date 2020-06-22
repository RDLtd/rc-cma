import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Restaurant } from '../_models';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCancelComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';

@Injectable()

export class CmsLocalService {

  private restaurant: Restaurant = new Restaurant();
  private restaurantSubject: Subject<Restaurant> = new BehaviorSubject<Restaurant>(this.restaurant);

  // Observable offers
  private offerCount: number = 0;
  private offerSubject = new Subject<any>();

  dialogConfig: MatDialogConfig = new MatDialogConfig();

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private dialog: MatDialog
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
    this.restaurantSubject.next(this.restaurant);
  }

  getRestaurant(): Observable<Restaurant> {
    // console.log('cmsLocalService.getRestaurant()', this.subject);
    return this.restaurantSubject.asObservable();
  }

  dspSnackbar(msg: string, actn: string = '', d: number = 3, style: any = 'info'): void {
    this.snackBar.open(msg, actn, {
      duration: d * 1000,
      panelClass: [`rc-mat-snack-${style}`]
    });
  }

  confirmNavigation() {
    // load translations
    this.translate.get('ConfirmCancel').subscribe(t => {
      this.dialogConfig = {
        data: {
          title: t.Sure,
          msg: t.SaveContinue,
          no: t.Cancel,
          yes: t.ContinueCaps,
          showCheckbox: false
        }
      };
    });
    const dialogRef = this.dialog.open(ConfirmCancelComponent, this.dialogConfig );
    return dialogRef.afterClosed().pipe(map(result => {
      return result.confirmed;
    }));
  }

  // Extract Cloudinary Public-Id from full url
  getCloudinaryPublicId(url) {
    let urlArr = url.split('/');
    return urlArr.slice(urlArr.length - 3).join('/');
  }
}
