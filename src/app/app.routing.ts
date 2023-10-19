import {
  Routes,
  RouterModule
} from '@angular/router';

import {
  SettingsComponent
} from './settings';

import {
  AuthGuard,
  CanDeactivateGuard
} from './_services';

import {
  CmsComponent,
  CmsImagesComponent,
  CmsMenusComponent,
  CmsHoursComponent,
  CmsFeaturesComponent,
  CmsLocationComponent,
  CmsReservationsComponent,
  CmsDashboardComponent
} from './cms';

import {
  SigninComponent
} from './signin/signin.component';

import { JoinComponent } from './join/join.component';
import { MembershipComponent } from './join/membership.component';
import {ProfileComponent} from './profile/profile.component';
import { CmsSpwConfigComponent } from './cms';
import { CmsEventsComponent } from './cms';

const APP_ROUTES: Routes = [
  { path: '', component: SigninComponent, title: 'Sign in' },

  { path: 'join/:code', component: JoinComponent, title: 'Join' },

  { path: 'join', component: JoinComponent, title: 'Join' },

  { path: 'membership-options', component: MembershipComponent },

  { path: 'login', component: SigninComponent, title: 'Sign in' },

  { path: 'signin', component: SigninComponent, title: 'Sign in' },

  { path: 'referral',
    component: SigninComponent },

  { path: 'settings',
    component: SettingsComponent,
    title: 'Settings',
    canActivate: [AuthGuard] },

  { path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  { path: 'cms/:id',
    component: CmsComponent,
    title: 'CMS',
    canActivate: [AuthGuard],
    children: [

      { path: 'dashboard',
        component: CmsDashboardComponent,
        title: 'CMS Dashboard',
        canActivate: [AuthGuard] },

      { path: 'images',
        component: CmsImagesComponent,
        title: 'Images',
        canActivate: [AuthGuard] },

      { path: 'opening-times',
        component: CmsHoursComponent,
        canActivate: [AuthGuard],
        title: 'Opening Times',
        canDeactivate: [CanDeactivateGuard] },

      { path: 'location',
        component: CmsLocationComponent,
        title: 'Location Map',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard] },

      { path: 'menus',
        component: CmsMenusComponent,
        title: 'Sample Menus',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
      },

      { path: 'reservations',
        component: CmsReservationsComponent,
        title: 'Reservations',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]},

      { path: 'features',
        component: CmsFeaturesComponent,
        title: 'Descriptions & Features',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard] },

      { path: 'events',
        component: CmsEventsComponent,
        title: 'Events',
        canActivate: [AuthGuard] },

      { path: 'settings',
        component: CmsSpwConfigComponent,
        title: 'Publish Settings',
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard] },

      { path: '**',
        redirectTo: 'dashboard', pathMatch: 'full' }
    ]},

  // redirect any missed routes
  {
    path: 'restaurants/:id/cms',
    redirectTo: 'cms/:id',
  },

  { path: '**', redirectTo: '/settings' }

];

export const routing = RouterModule.forRoot(APP_ROUTES);

// export const routing = RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'legacy' });
