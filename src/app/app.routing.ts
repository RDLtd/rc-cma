import {
  Routes,
  RouterModule
} from '@angular/router';

import {
  ProfilePageComponent
} from './member';

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
  CmsPreviewComponent,
  CmsReservationsComponent,
  CmsDashboardComponent
} from './cms';

import {
  SigninComponent
} from './signin/signin.component';

import { MarketplaceComponent } from './marketplace/marketplace.component';
import { JoinComponent } from './join/join.component';
import { MembershipComponent } from './join/membership.component';
import { HubComponent } from './hub/hub.component';

const APP_ROUTES: Routes = [
  { path: '', component: SigninComponent },
  { path: 'join/:code', component: JoinComponent },
  { path: 'join', component: JoinComponent },
  { path: 'membership-options', component: MembershipComponent },
  { path: 'login', component: SigninComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'hub',
    component: HubComponent,
    canActivate: [AuthGuard]
  },
  { path: 'marketplace',
    component: MarketplaceComponent,
    canActivate: [AuthGuard]
  },
  { path: 'referral', component: SigninComponent },
  { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard]},
  { path: 'restaurants/:id/cms', component: CmsComponent,  canActivate: [AuthGuard], children: [

    { path: 'dashboard',
      component: CmsDashboardComponent,
      canActivate: [AuthGuard] },

    { path: 'images',
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
      canActivate: [AuthGuard],
      canDeactivate: [CanDeactivateGuard]
    },

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
      component: MarketplaceComponent,
      canActivate: [AuthGuard] },

    { path: '**', component: CmsDashboardComponent, canActivate: [AuthGuard] }
  ]},

  { path: '**', redirectTo: '/profile' }

];

export const routing = RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'legacy' });
