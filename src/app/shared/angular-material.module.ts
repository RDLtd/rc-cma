import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule ({
  exports: [
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatTabsModule,
    MatTooltipModule,
    MatTabsModule,
    MatCheckboxModule,
    MatCardModule,
    MatRadioModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ]
})

export class AngularMaterialModule {

}
