import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../_services';
import { MatSnackBar } from '@angular/material';
import { RestaurantService } from '../_services';
import { TranslateService } from '@ngx-translate/core';;

@Component({
  selector: 'rc-restaurant-detail',
  templateUrl: './restaurant-detail.component.html'
})

export class RestaurantDetailComponent implements OnInit {

  @ViewChild('restForm', {static: true}) restForm: NgForm;
  editMode: Boolean;
  restaurant: any;
  member: any;
  cuisines: any;
  cuisine_modifiers:any;
  cancelSetting: Boolean = true;
  clear_mod_text;

  // this will be true if dialog called from cms for verification, false if from restaurant card
  fromCMS: Boolean;

  constructor(
    public snackBar: MatSnackBar,
    public financialService: FinancialService,
    private translate: TranslateService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {
    this.translate.get('Curation.ClearMod').subscribe(value => { this.clear_mod_text = value; });

    let my_country_code;
    if (this.restaurant.restaurant_number.substr(0, 2) === 'FR') {
      my_country_code = 'FR';
    } else {
      my_country_code = 'UK';
    }
    this.restaurantService.getCuisines(my_country_code, '').subscribe(
      data2 => {
        if (data2['count'] > 0) {
          this.cuisines = data2['cuisines'];
          if (this.restaurant.restaurant_cuisine_2 === '') {
            this.loadCuisineModifiers();
          }
        } else {
          console.log('No cuisine records found in database');
        }
      });
  }

  loadCuisineModifiers() {
    // get the index of the selected primary cuisine and then load the modifiers
    //
    // ToDo - fix this horrible code!
    for (let i = 0; i < this.cuisines.length; i++) {
      if (this.cuisines[i].cuisine_description === this.restaurant.restaurant_cuisine_1) {
        this.cuisine_modifiers = [];
        if (this.cuisines[i].cuisine_modifier_1) {
          this.cuisine_modifiers.push({'cuisine_description': this.cuisines[i].cuisine_modifier_1});
        }
        if (this.cuisines[i].cuisine_modifier_2) {
          this.cuisine_modifiers.push({'cuisine_description': this.cuisines[i].cuisine_modifier_2});
        }
        if (this.cuisines[i].cuisine_modifier_3) {
          this.cuisine_modifiers.push({'cuisine_description': this.cuisines[i].cuisine_modifier_3});
        }
        if (this.cuisines[i].cuisine_modifier_4) {
          this.cuisine_modifiers.push({'cuisine_description': this.cuisines[i].cuisine_modifier_4});
        }
        if (this.cuisines[i].cuisine_modifier_5) {
          this.cuisine_modifiers.push({'cuisine_description': this.cuisines[i].cuisine_modifier_5});
        }
        // add a clear function if there are some in the list
        if (this.cuisine_modifiers.length > 0) {
          this.cuisine_modifiers.push({'cuisine_description': this.clear_mod_text});
        }
      }
    }
  }

  changeCuisine () {
    this.restaurant.restaurant_cuisine_2 = '';
    this.loadCuisineModifiers();
  }

  checkModifier() {
    // deal special case of clear modifier
    if (this.restaurant.restaurant_cuisine_2 === this.clear_mod_text) {
      this.restaurant.restaurant_cuisine_2 = '';
    }
  }

  toggleEditMode($event) {

    console.log(this.restaurant);
    let toggle = $event.target;
    this.editMode = !this.editMode;
    // toggle.checked = this.editMode;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  setCancel(setting) {
    this.cancelSetting = setting;
  }

  getFinancials(restaurant_id) {
    this.financialService.getForRestaurant(restaurant_id)
      .subscribe(
        data => {
          // console.log(JSON.stringify(data), data['financials'].length);
          if (data['financials'].length > 0) {
            this.openSnackBar(data['financials'].length + ' financial records found for ' +
              this.restaurant.restaurant_name, '');
          } else {
            this.openSnackBar('No financial records found for ' +
              this.restaurant.restaurant_name, '');
          }
        },
        error => {
          this.openSnackBar('There was an error trying to access the financial database', '');
        });
  }
}
