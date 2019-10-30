import {
  Routes,
  RouterModule
} from '@angular/router';

import {
  ProfilePageComponent
} from './users';

import {
  AuthGuard,
  CanDeactivateGuard
} from './_services';

import {
  CmsComponent,
  CmsDirectoryComponent,
  CmsImagesComponent,
  CmsMenusComponent,
  CmsHoursComponent,
  CmsFeaturesComponent,
  CmsLocationComponent,
  CmsPreviewComponent,
  CmsReservationsComponent,
  CmsDashboardComponent
} from './cms';

import {
  StaffComponent,
  PropertyComponent,
  TurnoverComponent,
  FsInputComponent,
  FsComponent,
  ProfitComponent,
  BalanceComponent,
  ReviewComponent
} from './fs';

import {
  SigninComponent
} from './signin/signin.component';

import {
  AffiliatesComponent
} from './cms';
import { JoinComponent } from './join/join.component';

const APP_ROUTES: Routes = [
  { path: '', component: SigninComponent },
  { path: 'join/:ref', component: JoinComponent },
  { path: 'login', component: SigninComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'referral', component: SigninComponent },
  { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard]},
  { path: 'restaurants/:id/cms', component: CmsComponent,  canActivate: [AuthGuard], children: [

    { path: 'dashboard',
      component: CmsDashboardComponent,
      canActivate: [AuthGuard] },

    { path: 'directory',
      component: CmsDirectoryComponent,
      canActivate: [AuthGuard] }, { path: 'images',
      component: CmsImagesComponent,
      canActivate: [AuthGuard] },

    { path: 'opening-times',
      component: CmsHoursComponent,
      canActivate: [AuthGuard],
      canDeactivate: [CanDeactivateGuard] },

    { path: 'location',
      component: CmsLocationComponent,
      canActivate: [AuthGuard],
      canDeactivate: [CanDeactivateGuard] },

    { path: 'menus',
      component: CmsMenusComponent,
      canActivate: [AuthGuard] },

    { path: 'reservations',
      component: CmsReservationsComponent,
      canActivate: [AuthGuard],
      canDeactivate: [CanDeactivateGuard]},

    { path: 'features',
      component: CmsFeaturesComponent,
      canActivate: [AuthGuard],
      canDeactivate: [CanDeactivateGuard] },

    { path: 'preview',
      component: CmsPreviewComponent,
      canActivate: [AuthGuard] },

    { path: 'affiliates',
      component: AffiliatesComponent,
      canActivate: [AuthGuard] },

    { path: '**', component: CmsDirectoryComponent, canActivate: [AuthGuard] }
  ]},

  { path: 'fs', component: FsComponent, canActivate: [AuthGuard], children: [
    { path: 'profit', component: ProfitComponent, canActivate: [AuthGuard] },
    { path: 'balance', component: BalanceComponent, canActivate: [AuthGuard] },
    { path: 'staff', component: StaffComponent, canActivate: [AuthGuard] },
    { path: 'property', component: PropertyComponent, canActivate: [AuthGuard] },
    { path: 'turnover', component: TurnoverComponent, canActivate: [AuthGuard] },
    { path: 'edit', component: FsInputComponent, canActivate: [AuthGuard] },
    { path: '**', component: ReviewComponent, canActivate: [AuthGuard] }
  ]},

  { path: '**', redirectTo: '/profile' }

];


export const routing = RouterModule.forRoot(APP_ROUTES);
