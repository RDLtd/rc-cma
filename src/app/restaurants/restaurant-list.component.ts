import { Component, OnInit, ViewChild } from '@angular/core';
import { RestaurantService, FinancialService, CMSService } from '../_services';
import { Restaurant } from '../_models';
import { TranslateService } from '@ngx-translate/core';;
import { MapDetailComponent } from './map-detail.component';
import { FinancialViewComponent } from './financial-view.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { NgForm } from '@angular/forms';
import { RestaurantDetailComponent } from './restaurant-detail.component';
import { AppConfig } from '../app.config';


@Component({
  selector: 'rc-restaurant-list',
  templateUrl: './restaurant-list.component.html'
})

export class RestaurantListComponent implements OnInit {

  title: string = 'Restaurants';
  t_map: string;   // use t_ prefix to denote JavaScript variables that are translations for the screen
  t_analysis: string;
  t_restaurants: string;
  t_overview: string;
  t_search: string;
  search_text: string;
  restaurants: Restaurant[] = [];
  sql_parameters: any = this.config.sql_defaults;
  selectedOption: string;
  @ViewChild('card') card;

  constructor(
    private restaurantService: RestaurantService,
    private financialService: FinancialService,
    private cmsService: CMSService,
    private translate: TranslateService,
    public snackBar: MatSnackBar,
    private config: AppConfig,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.translate.get('Restaurant-List.Map').subscribe(value => this.t_map = value);
    this.translate.get('Restaurant-List.Analysis').subscribe(value => this.t_analysis = value);
    this.translate.get('Restaurant-List.Restaurants').subscribe(value => this.t_restaurants = value);
    this.translate.get('Restaurant-List.Overview').subscribe(value => this.t_overview = value);
    this.translate.get('Restaurant-List.Search').subscribe(value => this.t_search = value);
    this.loadAllRestaurants();
  }

  private loadAllRestaurants() {

    this.sql_parameters = {
      where_field: 'restaurant_name',
      where_string: '',
      where_any_position: 'Y',
      sort_field: 'restaurant_name',
      sort_direction: 'ASC',
      limit_number: 24,
      limit_index: '0'
    };

    this.restaurantService.getSubset(this.sql_parameters)
      .subscribe(
        data => {
          this.restaurants = data['restaurants'];
        },
        error => {
          this.openSnackBar('There was an error trying to access the restaurant database', '');
        });

  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  getListStyle(status){
    switch (status) {
      case 'In Curation': {
        return 'blue';
      }
      case 'Flagged': {
        return 'red';
      }
      case 'Rejected': {
        return 'purple';
      }
      default: {
        return 'black';
      }
    }
  }

  getSubset(event) {

    // this is initialised to the defaults, so once we have decided what to do here
    // we can leave out the things that have not changed...

    this.sql_parameters = {
      where_field: 'restaurant_name',
      where_string: event.target.value,
      where_any_position: 'Y',
      sort_field: 'restaurant_name',
      sort_direction: 'ASC',
      limit_number: 24,
      // limit_number: event.target.value.length === 0? '9999' : '24',
      limit_index: '0'
    };

    console.log(this.sql_parameters.where_string);

    this.restaurantService.getSubset(this.sql_parameters)
      .subscribe(
        data => {
          // console.log(JSON.stringify(data), data.restaurants.length);
          // TODO now need to decide what to do with the data...

          this.restaurants = data['restaurants'];

          if (this.restaurants.length > 0) {
            this.openSnackBar(this.restaurants.length + ' restaurants found - first is ' + this.restaurants[0].restaurant_name, '');
          } else {
            this.openSnackBar('No restaurants found', '');
          }
        },
        error => {
          this.openSnackBar('There was an error trying to access the restaurant database', '');
        });
  }

  // public openRestaurantCard($event, $mode, $card) {
  //
  //  // let tgt = $event.target || $event.srcElement || $event.currentTarget;
  //   const mode = $mode;
  //   const card = $card; // local template variable
  //   console.log('id',card.id);
  //   console.log('Mode: ' + mode);
  //
  //   if (mode === 'edit') {
  //
  //     this.viewCard(card.id, true);
  //     $event.stopPropagation();
  //     $event.preventDefault();
  //
  //   } else if (mode === 'view') {
  //
  //     this.viewCard(card.id, false);
  //     $event.stopPropagation();
  //     $event.preventDefault();
  //
  //   } else if (mode === 'map') {
  //
  //     this.viewMap(card.id);
  //     $event.stopPropagation();
  //     $event.preventDefault();
  //
  //   } else if (mode === 'cms') {
  //
  //     this.viewCMSView(card.id, true);
  //     $event.stopPropagation();
  //     $event.preventDefault();
  //
  //   } else if (mode === 'finance') {
  //
  //     // this.viewFinancialCard(card.id, true);
  //     this.viewFinancialView(card.id, true);
  //     $event.stopPropagation();
  //     $event.preventDefault();
  //
  //   } else {
  //     // let the native event handler do it's thing
  //     $event.stopPropagation();
  //   }
  // }

  public rcToggleClass(card) {
    card.classList.toggle('rc-card-over');
  }

  viewCard(id, editMode) {

    const selectedRestaurant = this.restaurants[id];

    console.log('R', id);

    const dialogRef = this.dialog.open(RestaurantDetailComponent);

    // Setup dialog vars
    dialogRef.componentInstance.restaurant = selectedRestaurant;
    dialogRef.componentInstance.editMode = editMode;
    dialogRef.componentInstance.fromCMS = false;

    // Whenever the dialog is closed
    dialogRef.afterClosed().subscribe(result => {

      // Create a hook into the dialog form
      const f: NgForm = dialogRef.componentInstance.restForm;

      if (f.dirty) {
        if (f.valid) {
          this.doRestaurantUpdate(selectedRestaurant);
        } else {
          console.log('Form invalid, return message');
        }
      } else {
        console.log('As you were, nothing changed');
      }
    });
  }

  viewMap(id) {
    const dialogRef = this.dialog.open(MapDetailComponent);
    dialogRef.componentInstance.restaurant = this.restaurants[id];
    dialogRef.afterClosed().subscribe(result => {
      this.selectedOption = result;
    });
  }

  // TODO: Fix update restaurant detail
  doRestaurantUpdate(restaurant) {
    console.log(restaurant);
    this.restaurantService.update(restaurant)
      .subscribe(
        data => {
          console.log('Updated restaurant');
        },
        error => {
          console.log('Failed to update restaurant');
        });
  }


  // viewCMSView(id, editMode) {
  //   const selectedRestaurant = this.restaurants[id];
  //   const dialogRef = this.dialog.open(CMSViewComponent);
  //   // Setup dialog vars
  //   dialogRef.componentInstance.restaurant = selectedRestaurant;
  //   dialogRef.componentInstance.editMode = editMode;
  //   // Whenever the dialog is closed
  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }

  viewFinancialView(id, editMode) {

    const selectedRestaurant = this.restaurants[id];
    const dialogRef = this.dialog.open(FinancialViewComponent);

    // Setup dialog vars
    dialogRef.componentInstance.restaurant = selectedRestaurant;
    dialogRef.componentInstance.editMode = editMode;

    // Whenever the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      //
      // // Create a hook into the dialog form
      // const f: NgForm = dialogRef.componentInstance.financialForm;
      //
      // if (f.dirty) {
      //   if (f.valid) {
      //     this.doFinanceUpdate(selectedRestaurant);
      //   } else {
      //     console.log('Form invalid, return message');
      //   }
      // } else {
      //   console.log('As you were, nothing changed');
      // }
    });
  }

  doFinanceUpdate(restaurant) {
    // this.financialService.update(restaurant)
    //   .subscribe(
    //     data => {
    //       console.log('Updated financial details');
    //     },
    //     error => {
    //       console.log('Failed to update financial details');
    //     });
  }

}
