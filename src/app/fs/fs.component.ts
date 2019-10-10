import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../_services';
import { FsLocalService } from './fs-local.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'rc-fs',
  templateUrl: './fs.component.html',
  providers: [FsLocalService]
})
export class FsComponent implements OnInit {

  member_id: any;
  isDemoMember = false;

  constructor(
    private restaurantService: RestaurantService,
    private fsLocalService: FsLocalService,
    public snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.member_id = JSON.parse(localStorage.getItem('rd_profile')).member_id;
    this.getAssociatedRestaurants(this.member_id);
    this.isDemoMember = (this.member_id === 42);
  }

  setGraphOptions(view) {

    switch (view) {

      case 'profit': {
        this.fsLocalService.setGraphOptions([
          {
            index: 0, label: 'Turnover', units: '(£ 000s)',
            dataSource1: 'financial_turnover', dataSource2: '',
            section: 'Profit and Loss'
          },
          {
            index: 1, label: 'Gross Profit', units: '(£ 000s)',
            dataSource1: 'financial_gross_profit', dataSource2: ''
          },
          {
            index: 2, label: 'Administration Costs', units: '(£ 000s)',
            dataSource1: 'financial_admin_costs', dataSource2: ''
          },
          {
            index: 3, label: 'Profit Before Tax', units: '(£ 000s)',
            dataSource1: 'financial_profit_before_tax', dataSource2: ''
          }
        ]);
        this.router.navigate(['fs', view]);
        break;
      }
      case 'balance': {
        this.fsLocalService.setGraphOptions([
          {
            index: 0, label: 'Exceptions', units: '(£ 000s)',
            dataSource1: 'financial_exceptions', dataSource2: '',
            section: 'Balance Sheet'
          },
          {
            index: 1, label: 'Net Assets', units: '(£ 000s)',
            dataSource1: 'financial_net_assets', dataSource2: ''
          },
          {
            index: 2, label: 'Capital Expenditure', units: '(£ 000s)',
            dataSource1: 'financial_capex', dataSource2: ''
          }
        ]);
        this.router.navigate(['fs', view]);
        break;
      }
      case 'staff': {
        this.fsLocalService.setGraphOptions([
          {
            index: 0, label: 'Staff Count', units: '',
            dataSource1: 'financial_staff_count', dataSource2: '',
            section: 'Staff and Covers'
          },
          {
            index: 1, label: 'Annual Wage Bill', units: '(£ 000s)',
            dataSource1: 'financial_annual_wage_bill', dataSource2: ''
          },
          {
            index: 2, label: 'Average Spend', units: '(£)',
            dataSource1: 'financial_average_spend', dataSource2: ''
          },
          {
            index: 3, label: 'Annual Covers', units: '',
            dataSource1: 'financial_annual_covers', dataSource2: ''
          }
        ]);
        this.router.navigate(['fs', view]);
        break;
      }
      case 'property': {
        this.fsLocalService.setGraphOptions([
          {
            index: 0, label: 'Seat Count', units: '',
            dataSource1: 'financial_seat_count', dataSource2: '',
            section: 'Property'
          },
          {
            index: 1, label: 'Property Size', units: '(m2)',
            dataSource1: 'financial_property_size', dataSource2: ''
          },
          {
            index: 2, label: 'Property Rent', units: '(£ 000s)',
            dataSource1: 'financial_property_rent', dataSource2: ''
          }
        ]);
        this.router.navigate(['fs', view]);
        break;
      }
      case 'turnover': {
        this.fsLocalService.setGraphOptions([
          {
            index: 0, label: 'GP as % Turnover', units: '(%)',
            dataSource1: 'financial_gross_profit', dataSource2: 'financial_turnover',
            section: 'Combinations'
          },
          {
            index: 1, label: 'PBT as % Turnover', units: '(%)',
            dataSource1: 'financial_profit_before_tax', dataSource2: 'financial_turnover'
          },
          {
            index: 2, label: 'Administrative Costs as % Turnover', units: '(%)',
            dataSource1: 'financial_admin_costs', dataSource2: 'financial_turnover'
          },
          {
            index: 3, label: 'Annual Wage Bill as % Turnover', units: '(%)',
            dataSource1: 'financial_annual_wage_bill', dataSource2: 'financial_turnover'
          }
        ]);
        this.router.navigate(['fs', view]);
        break;
      }
      case 'edit': {
        if (this.isDemoMember) {
          this.openSnackBar('You are logged in as the Demo Member - you cannot update your Data',
            '');
        } else {
          this.router.navigate(['fs', view]);
        }
        break;
      }
    }
  }

  getAssociatedRestaurants(id) {
    this.restaurantService.getMemberRestaurants(id)
      .subscribe(
        data => {
          console.log('Restaurants', data['restaurants']);
          this.fsLocalService.setRestaurants(data['restaurants']);
        },
        error => {
          console.log(error);
        });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

}
