import { ElementRef, Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../_services/financial.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';;
import { BenchmarkComponent } from '../restaurants/benchmark.component';

@Component({
  selector: 'rc-benchmarkwizard',
  templateUrl: './benchmarkwizard.component.html'
})

export class BenchmarkWizardComponent implements OnInit {

  @ViewChild('benchmarkWizardView', {static: true}) benchmarkWizardView: NgForm;
  associatedRestaurants: any[] = [];
  financials: any[] = [];
  finance_index = 0;

  primary_text;
  radio_options = [];
  choice = 0;
  choice_made = false;

  constructor(public snackBar: MatSnackBar,
              private translate: TranslateService,
              public dialog: MatDialog,
              public element: ElementRef,
              public financialService: FinancialService) {

    // this._element = this.element.nativeElement;
  }

  ngOnInit() {
    // // first check to see if there are any associated restaurants
    // if (this.associatedRestaurants.length === 0) {
    //   // this.openSnackBar('You must have at least one associated restaurant!', '');
    //   this.primary_text = 'In order to do benchmarking, you must have at least one associated restaurant!';
    //   return;
    // }
    // // now check to see if any of the associated restaurants have financial data
    // let have_financial_data = false;
    // for (let i = 0; i < this.associatedRestaurants.length; i++) {
    //   this.financialService.getForRestaurant(this.associatedRestaurants[i].restaurant_id)
    //     .subscribe(
    //       data => {
    //         // console.log(JSON.stringify(data), data.financials.length);
    //         if (data.financials.length > 0) {
    //           have_financial_data = true;
    //           // set a field in the restaurant record for convenience
    //           this.associatedRestaurants[i].financial_data = true;
    //         } else {
    //           this.associatedRestaurants[i].financial_data = false;
    //         }
    //         // on the last pass check to see if we need to exit
    //         if (i === this.associatedRestaurants.length - 1) {
    //           if (!have_financial_data) {
    //             // this.openSnackBar('None of your associated restaurants have any financial data recorded!', '');
    //             this.primary_text = 'None of your associated restaurants have any financial data recorded!' +
    //               ' In order to compare your restaurant with others you must provide appropriate data.';
    //             return;
    //           }
    //           // once we get here we know at least one of the restaurants has financial data
    //           // let's count them - if there is only one then there is no selection to do...
    //           // let finance_count = 0;
    //           // for (let j = 0; j < this.associatedRestaurants.length; j++) {
    //           //   if (this.associatedRestaurants[j].financial_data) {
    //           //     finance_count = finance_count + 1;
    //           //     this.finance_index = j;
    //           //   }
    //           // }
    //           // if (finance_count === 1) {
    //           //   // this.openSnackBar('Only ' + this.associatedRestaurants[finance_index].restaurant_name +
    //           //   //   ' has financial data recorded - proceeding with benchmarking for this restaurant', '');
    //           //   this.primary_text = 'Only one of your restaurants (' +
    //           //     this.associatedRestaurants[this.finance_index].restaurant_name +
    //           //     ') has financial data recorded - you may now:';
    //           //   this.radio_options.push( {'description': 'Review the data for ' +
    //           //     this.associatedRestaurants[this.finance_index].restaurant_name, 'id': this.finance_index } );
    //           //   this.radio_options.push( {'description': 'Compare ' +
    //           //     this.associatedRestaurants[this.finance_index].restaurant_name +
    //           //     ' with other sets of restaurants', 'id': 400 + this.finance_index} );
    //           // } else {
    //           //   // this.openSnackBar('Will need to find a method for selecting which ' +
    //           //   //   'of the restaurants with financial data is going to be used...', '');
    //           //   let restaurant_list = '';
    //           //   for (let j = 0; j < this.associatedRestaurants.length; j++) {
    //           //     if (this.associatedRestaurants[j].financial_data) {
    //           //       restaurant_list = restaurant_list + this.associatedRestaurants[j].restaurant_name + ', ';
    //           //     }
    //           //   }
    //           //   restaurant_list = restaurant_list.slice(0, -2);
    //           //   this.primary_text = 'You have financial data recorded for ' + finance_count +
    //           //     ' restaurants (' + restaurant_list + '). You may now:';
    //           //   for (let j = 0; j < this.associatedRestaurants.length; j++) {
    //           //     if (this.associatedRestaurants[j].financial_data) {
    //           //       this.radio_options.push( {'description': 'Review the data for ' +
    //           //       this.associatedRestaurants[i].restaurant_name, 'id': j }  );
    //           //     }
    //           //   }
    //           //   this.radio_options.push( {'description': 'Review the grouped data for these '
    //           //     + finance_count +  ' restaurants', 'id': 200 } );
    //           //   for (let j = 0; j < this.associatedRestaurants.length; j++) {
    //           //     if (this.associatedRestaurants[j].financial_data) {
    //           //       this.radio_options.push( {'description': 'Compare ' +
    //           //       this.associatedRestaurants[j].restaurant_name +
    //           //       ' with other restaurants', 'id': 400 + j } );
    //           //     }
    //           //   }
    //           // }
    //         }
    //       });
    // }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  benchmark() {
    // this.financialService.getForRestaurant(this.associatedRestaurants[this.finance_index].restaurant_id)
    //   .subscribe(
    //     fdata => {
    //       const dialogRef = this.dialog.open(BenchmarkComponent);
    //       dialogRef.componentInstance.restaurant = this.associatedRestaurants[this.finance_index];
    //       dialogRef.componentInstance.financials = fdata.financials;
    //     });
  }

  onSelectionChange(id) {
    this.choice_made = true;
    this.choice = id;
    if (this.choice < 200) {
      this.finance_index = this.choice;
      console.log('Show data for single restaurant', this.associatedRestaurants[this.choice].restaurant_name);
    } else {
      if (this.choice === 200) {
        this.finance_index = 0;
        console.log('Show data for the group');
      } else {
        this.finance_index = this.choice - 400;
        console.log('Compare data for ', this.associatedRestaurants[this.choice - 400].restaurant_name);
      }
    }
  }
}
