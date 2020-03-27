import { Component, OnInit } from '@angular/core';
import { Restaurant, CMSDish, CMSSection } from '../_models';
import { CmsLocalService } from './cms-local.service';
import { CMSService, HelpService } from '../_services';
import { CmsFileUploadComponent } from './cms-file-upload.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmCancelComponent } from '../common';
import { CmsMenuDishComponent } from './cms-menu-dish.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-cms-menus',
  templateUrl: './cms-menus.component.html'
})
export class CmsMenusComponent implements OnInit {

  user = localStorage.getItem('rd_user');
  restaurant: Restaurant;
  menus: any;
  descriptions: any;
  menuOverviewLength: number = 500;
  currencySymbol: string;
  showLoader: boolean = false;
  dataChanged: boolean = false;
  htmlMenu: any = {};

  // translation obj
  t_data: any;
  index: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public help: HelpService
  ) {
    // detect language changes... need to check for change in texts
    translate.onLangChange.subscribe(lang => {
      console.log(`Language switched to ${lang}`);
      this.translate.get('CMS-Menus').subscribe(data => {this.t_data = data; });
    });
  }

  ngOnInit() {
    this.translate.get('CMS-Menus').subscribe(data => {
      this.t_data = data;
      // console.log(this.t_data);
    });

    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if(data.restaurant_id) {
            this.restaurant = data;
            const id = Number(this.restaurant.restaurant_id);
            this.getCmsData(id);
            this.getPdfMenus();
            this.getHtmlMenuSections(id);
            this.getHtmlMenuDishes(id);

            // determine currency symbol by inferring from the restaurant location
            if (this.restaurant.restaurant_number.substr(0, 2) === 'FR') {
              this.currencySymbol = '€';
            } else {
              this.currencySymbol = '£';
            }
          }
        },
        error => console.log(error)
      );
  }

  getCmsData(id) {
    this.cms.getDescriptions(id)
      .subscribe(
        data => {
          this.descriptions = data['descriptions'][0];
        },
        error => {
          console.log(error);
        });
  }

  updateDescription(desc): void {

    this.descriptions[desc.name] = desc.value;

    // call API
    this.cms.updateDescription(this.descriptions)
      .subscribe(
      data => {
        console.log('RES', data);
        this.dataChanged = false;
        this.cmsLocalService.dspSnackbar(this.restaurant.restaurant_name + this.t_data.OverviewUpdate, null, 5);
      },
      error => {
        console.log('Error', error);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for menus', error);
      });
  }

  // // Utils
  // rcToggleClass(card) {
  //   card.classList.toggle('rc-card-over');
  // }

  // Stop checkbox events from bubbling up the DOM
  stopBubbling(e) {
    e.stopPropagation();
  }

  // Load menu sections
  getHtmlMenuSections(id) {
    this.cms.getSections(Number(id))
      .subscribe(data => {
        // console.log('Sections Data:', data);

        if (data['count'] > 0) {
          let ds = data['sectionrecord'][0];
          this.htmlMenu.section_id = ds.cms_section_id;
          this.htmlMenu.sections = [
              { id: 1, label: ds.cms_section_desc_1 },
              { id: 2, label: ds.cms_section_desc_2 },
              { id: 3, label: ds.cms_section_desc_3 }
            ];

        } else {
          // console.log('No section records found in database for restaurant, applying defaults' + this.restaurant.restaurant_id);

          this.htmlMenu.section_id = 0;

          this.htmlMenu.sections = [
            { id: 1, label: this.t_data.MealDefaultSection1 },
            { id: 2, label: this.t_data.MealDefaultSection2 },
            { id: 3, label: this.t_data.MealDefaultSection3 }
          ];

          // at this point we can assume that there is no section record, so create one now so
          // that the App just has to use update
          let cmssection = new CMSSection;
          cmssection.cms_section_restaurant_id = Number(this.restaurant.restaurant_id);
          cmssection.cms_section_desc_1 = this.t_data.MealDefaultSection1;
          cmssection.cms_section_desc_2 = this.t_data.MealDefaultSection2;
          cmssection.cms_section_desc_3 = this.t_data.MealDefaultSection3;
          cmssection.cms_section_created_by = this.user;
          this.cms.createSection(cmssection).subscribe(
            data => {
              console.log('create cms section', data);
              this.htmlMenu.section_id = data['cms_section_id'];
              // console.log('section data updated in database');
            },
            error => {
              console.log(JSON.stringify(error));
            });

          this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
            error => {
              console.log('error in updatelastupdatedfield for menus', error);
            });
        }
        // console.log('Html Sections:', this.htmlMenu.sections);
      },
      error => console.log(error));
  }

  // Edit section name
  updateSectionName() {

    let sect = new CMSSection();

    sect.cms_section_restaurant_id = Number(this.restaurant.restaurant_id);
    sect.cms_section_id = this.htmlMenu.section_id;
    sect.cms_section_desc_1 = this.htmlMenu.sections[0].label.toUpperCase();
    sect.cms_section_desc_2 = this.htmlMenu.sections[1].label.toUpperCase();
    sect.cms_section_desc_3 = this.htmlMenu.sections[2].label.toUpperCase();

    console.log('Trans:', this.t_data);

    this.cms.updateSection(sect).subscribe(
      data => {
        console.log('cms.updateSection', data);
        this.cmsLocalService.dspSnackbar(this.t_data.SectionUpdate, null, 3);
        this.dataChanged = false;
      },
      error => {
        console.log(JSON.stringify(error));
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for menus', error);
      });
  }

  // load menu dishes
  getHtmlMenuDishes(id) {

    this.cms.getDishes(id).subscribe(
      data => {
        // console.log('Dishes', data);
        if (data['count']) {
          this.htmlMenu.dishes = data['dishes'];
          // console.log('Loaded Dishes', this.htmlMenu.dishes);
          this.setDishReference();
        } else {
          // console.log('No dish records found');
        }
      },
      error => {
        console.log(error);
      });
  }

  // flag changes
  setChanged(): void {
    console.log('DATA CHANGE');
    if (!this.dataChanged) {
      this.dataChanged = true;
    }
  }

  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }


  // store a reference to the array position
  setDishReference() {
    // console.log('SetDishReference:', this.htmlMenu.dishes[0])
    let d = this.htmlMenu.dishes, l = d.length;
    for (let i = 0; i < l; i++) {
      d[i].cms_dish_idx = i;
      // console.log(this.htmlMenu.dishes[i].cms_dish_name, this.htmlMenu.dishes[i].cms_dish_id);
    }
    // console.log('Set idx', this.htmlMenu.dishes);
  }

  // Return an array of dishes grouped by section
  getDishesBySection(id) {
    if (this.htmlMenu.dishes) {
      return this.htmlMenu.dishes.filter(dish => dish.cms_dish_section_id === id);
    }

  }

  createNewDish(src) {
    const newDish = new CMSDish();
    newDish.cms_dish_restaurant_id = Number(this.restaurant.restaurant_id);
    newDish.cms_dish_id = src.controls.cms_dish_id.value;
    newDish.cms_dish_section_id = src.controls.cms_dish_section_id.value;
    newDish.cms_dish_name = src.controls.cms_dish_name.value;
    newDish.cms_dish_desc = src.controls.cms_dish_desc.value;
    newDish.cms_dish_price = src.controls.cms_dish_price.value;
    newDish.cms_dish_vegetarian = Number(src.controls.cms_dish_vegetarian.value);
    newDish.cms_dish_vegan = Number(src.controls.cms_dish_vegan.value);
    newDish.cms_dish_glutenfree = Number(src.controls.cms_dish_glutenfree.value);
    newDish.cms_dish_created_by = this.user;
    return newDish;
  }

  editDish(dish) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // console.log('Edit', dish);
    dialogConfig.data = {
      mode: 'edit',
      currencySymbol: this.currencySymbol,
      dish: this.htmlMenu.dishes[dish.cms_dish_idx],
      idx: dish.cms_dish_idx,
      sections: this.htmlMenu.sections
    };

    let dialogRef = this.dialog.open(CmsMenuDishComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(formDish => {

      // If something has changes,
      // overwrite the dish in the original array
      if (formDish.dirty) {

        // console.log('Form Values:', formDish.value);
        const newDish = this.createNewDish(formDish);

        this.cms.updateDish(newDish).subscribe(
          data => {
            // console.log('cms.updateDish', data);
            this.htmlMenu.dishes[dish.cms_dish_idx] = newDish;
            // replace idx reference in case user edits again before page reload
            this.htmlMenu.dishes[dish.cms_dish_idx].cms_dish_idx = dish.cms_dish_idx;
            this.cmsLocalService.dspSnackbar(newDish.cms_dish_name + this.t_data.Updated, null, 3);
          },
          error => { console.log(error);
          });

        this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
          error => {
            console.log('error in updatelastupdatedfield for menus', error);
          });
      }
    });
  }

  addDish() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;

    dialogConfig.data = {
      mode: 'add',
      currencySymbol: this.currencySymbol,
      dish: {
        cms_dish_id: this.htmlMenu.dishes.length,
        cms_dish_section_id: null,
        cms_dish_name: '',
        cms_dish_desc: '',
        cms_dish_price: '',
        cms_dish_vegetarian: 0,
        cms_dish_vegan: 0,
        cms_dish_glutenfree: 0
      },
      sections: this.htmlMenu.sections
    };

    let dialogRef = this.dialog.open(CmsMenuDishComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(formDish => {

      console.log('formDish values:', formDish.value);

      if (formDish.dirty && formDish.valid) {

        const newDish = this.createNewDish(formDish);

        this.cms.createDish(newDish).subscribe(
          res => {
            //console.log('Dish Added:', res);
            // Reload dishes
            this.getHtmlMenuDishes(this.restaurant.restaurant_id);
            this.cmsLocalService.dspSnackbar(newDish.cms_dish_name + this.t_data.Added, null, 3);
          },
          error => {
            console.log(error);
          });

        this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
          error => {
            console.log('error in updatelastupdatedfield for menus', error);
          });
      }
    });
  }

  deleteDish(dish) {
    console.log(dish);
    let dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        msg: this.t_data.Remove + this.htmlMenu.dishes[dish.cms_dish_idx].cms_dish_name + this.t_data.FromMenu,
        yes: this.t_data.Yes,
        no: this.t_data.No
      }
    });

    dialogRef.afterClosed().subscribe(action => {
      if (action.confirmed) {

        // save to use in success message
        const deletedDishName = this.htmlMenu.dishes[dish.cms_dish_idx].cms_dish_name;

        this.cms.deleteDish(dish.cms_dish_id).subscribe(
          data => {
            console.log('cms.deleteDish', data);
            this.cmsLocalService.dspSnackbar(`${deletedDishName} ${this.t_data.Removed}`, null, 3);
          },
          error => {
            console.log(error);
          });

        this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
          error => {
            console.log('error in updatelastupdatedfield for menus', error);
          });

        this.htmlMenu.dishes.splice(dish.cms_dish_idx, 1);
        // Reset dish array references now something's been removed
        this.setDishReference();
      }
    });
  }


  // Downloadable menus
  // ---------------------------------

  getPdfMenus(): void {
    this.showLoader = true;
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Menu', 'N').subscribe(
      data => {
        this.showLoader = false;
        this.menus = data['elements'];
      },
      error => {
        console.log(error);
      });
  }

  viewPdfMenu(menu) {
    window.open(menu.cms_element_image_path, '_blank');
  }

  togglePdfMenuStatus(menu) {
    let msg: string;
    menu.cms_element_active = !menu.cms_element_active;
    menu.cms_element_active ? msg = this.t_data.IsActive : msg = this.t_data.IsOffline;

    this.cms.updateElement(menu).subscribe(
      data => {
        console.log('cms.updateElement(menu)', data);
        this.cmsLocalService.dspSnackbar(`${ menu.cms_element_title } ${ msg }`, null, 3);
      },
      error => {
        this.cmsLocalService.dspSnackbar(this.t_data.UpdateFailed, null, 3);
        console.log(error);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for menus', error);
      });
  }

  // Upload pdf
  addPdfMenu() {
    let dialogRef = this.dialog.open(CmsFileUploadComponent, {
      data: {
        type: 'menu',
        tgtObject: this.menus,
        restaurant: this.restaurant
      }
    });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for menus', error);
      });
    dialogRef.componentInstance.dialog = dialogRef;
  }

  deletePdfMenu(menu): void {
    let dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        msg: this.t_data.DeleteMenu + menu.cms_element_title + this.t_data.Want,
        yes: this.t_data.YesDelete,
        no: this.t_data.NoCancel
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res.confirmed) {
        this.cms.deleteElement(menu.cms_element_id)
          .subscribe(res => {
              console.log(res);
              let arrLength = this.menus.length, obj;
              for (let i = 0; i < arrLength; i++) {
                obj = this.menus[i];
                if (obj.cms_element_id === menu.cms_element_id) {
                  this.menus.splice(i, 1);
                }
              }
              this.cmsLocalService.dspSnackbar(menu.cms_element_title + this.t_data.Deleted, null, 3);
              dialogRef.close();
            },
            error => {
              console.log(error);
              this.cmsLocalService.dspSnackbar(this.t_data.UpdateFailed, null, 3);
            }
          );

        this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'menus').subscribe(
          error => {
            console.log('error in updatelastupdatedfield for menus', error);
          });
      }
    });
  }
}
