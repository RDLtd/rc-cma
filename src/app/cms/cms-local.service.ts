import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Restaurant } from '../_models';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCancelComponent } from '../common';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()

export class CmsLocalService {

  private restaurant: Restaurant = new Restaurant();
  private restaurantSubject: Subject<Restaurant> = new BehaviorSubject<Restaurant>(this.restaurant);

  // Observable offers
  private offerCount = 0;
  private offerSubject = new Subject<any>();

  dialogConfig: MatDialogConfig = new MatDialogConfig();

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
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
      panelClass: [`rc-mat-snack-${style}`],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  // Config data options can be overridden
  confirmNavigation(options = {}) {
    // Override with options parameter
    this.dialogConfig = {
      autoFocus: false,
      data: options
    };
    // console.log(this.dialogConfig.data);
    const dialogRef = this.dialog.open(ConfirmCancelComponent, this.dialogConfig );
    return dialogRef.afterClosed().pipe(map(result => {
      return result;
    }));
  }

  // Extract Cloudinary Public-Id from full url
  getCloudinaryPublicId(url) {
    const urlArr = url.split('/');
    return urlArr.slice(urlArr.length - 3).join('/');
  }
}
