﻿import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';

declare const require: any;

@Injectable()
export class AppConfig {

  public readonly build = {
    version: require('../../package.json').version,
    name: require('../../package.json').name
  };

  // App location
  appUrl = window.location.origin;

  // This is Angular equivalent! See the 'environments' folder
  // Build process should automatically detect the correct variables
  public readonly apiUrl = environment.API_URL;
  public readonly mozId = environment.MOZ_ID;

  public readonly sql_defaults = {
    where_field: 'restaurant_name',
    where_string: '',
    where_any_position: 'N',
    sort_field: 'restaurant_id',
    sort_direction: 'ASC',
    limit_number: '30',
    limit_index: '0'
  };

  public readonly userAPICode = 'RDL-dev';
  public readonly upload_preset = 'nozxac7z';
  public readonly session_timeout = 60; // minutes
  public readonly session_countdown = 5; // minutes to check activity before timeout
  public readonly useAirBrake = false;

  // Root domains
  // apptiser update ks 090323 - added two new domains
  tld = {
    rc: 'restaurantcollective.org.uk',
    ri: 'restaurateursindependants.fr',
    app: 'apptiser.io',
    rdl: 'rdl.network'
  };

  private brands = {
    rc: {
      name: 'RDL',
      prefix: 'rc',
      logo: 'rc-logo',
      url: `https://${this.tld.rc}`,
      joinUrl: `https://app.${this.tld.rc}/join`,
      spwDemoUrl: `https://example-restaurant.com/`,
      email: {
        support: `support@${this.tld.rc}`,
        curation: `curation@${this.tld.rc}`,
        tech: 'tech@restaurantdevelopments.ltd'
      },
      products: {
        success_url: `${this.appUrl}/signin`,
        cancel_url: `${this.appUrl}/membership-options`,
      },
      currency: {
        symbol: '£',
        code: 'GBP'
      },
      downloads: {
        terms: `https://${this.tld.rc}/terms-conditions/`,
        privacy: `https://${this.tld.rc}/privacy-policy/`
      },
      template: {
        default: ""
      }
    },
    ri: {
      name: 'Restaurateurs Indépendants',
      prefix: 'ri',
      logo: 'ri-logo',
      url: `https://${this.tld.ri}`,
      joinUrl: `https://app.${this.tld.ri}/join`,
      spwDemoUrl: `https://example-restaurant.com/`,
      email: {
        support: `support@${this.tld.ri}`,
        curation: `curation@${this.tld.ri}`,
        tech: 'tech@restaurantdevelopments.ltd'
      },
      products: {
        success_url: `${this.appUrl}/signin`,
        cancel_url: `${this.appUrl}/membership-options`,
      },
      currency: {
        symbol: '€',
        code: 'EUR'
      },
      downloads: {
        terms: `https://${this.tld.ri}/terms-conditions/`,
        privacy: `https://${this.tld.ri}/privacy-policy/`
      },
      template: {
        default: "rdl-managed.html"
      }
    },
    app: {
      name: 'apptiser',
      prefix: 'app',
      logo: 'app-logo',
      url: `https://${this.tld.app}`,
      joinUrl: `https://app.${this.tld.app}/join`,
      spwDemoUrl: `https://example-restaurant.com/`,
      email: {
        support: `support@${this.tld.app}`,
        curation: `curation@${this.tld.app}`,
        tech: 'tech@restaurantdevelopments.ltd'
      },
      products: {
        success_url: `${this.appUrl}/signin`,
        cancel_url: `${this.appUrl}/membership-options`,
      },
      currency: {
        symbol: '£',
        code: 'GBP'
      },
      downloads: {
        terms: `https://assets.apptiser.io/docs/apptiser-terms.pdf`,
        privacy: `https://assets.apptiser.io/docs/apptiser-privacy-policy.pdf`
      },
      template: {
        default: "apptiser-curated-2.1.2.html",
        curated: "apptiser-curated-2.1.2.html",
        network: "apptiser-standard-2.1.2.html",
        standard: "apptiser-standard-2.1.2.html",
        premium: null
      }
    },
    rdl: {
      name: 'Restaurant Developments',
      prefix: 'rdl',
      logo: 'rdl-logo',
      url: `https://${this.tld.rdl}`,
      joinUrl: `https://app.${this.tld.rdl}/join`,
      spwDemoUrl: `https://example-restaurant.com/`,
      email: {
        support: `support@${this.tld.rdl}`,
        curation: `curation@${this.tld.rdl}`,
        tech: 'tech@restaurantdevelopments.ltd'
      },
      products: {
        success_url: `${this.appUrl}/signin`,
        cancel_url: `${this.appUrl}/membership-options`,
      },
      currency: {
        symbol: '£',
        code: 'GBP'
      },
      downloads: {
        terms: `https://${this.tld.rdl}/terms-conditions/`,
        privacy: `https://${this.tld.rdl}/privacy-policy/`
      },
      template: {
        default: "rdl-managed.html"
      }
    }
  };
  public readonly brand = this.brands[localStorage.getItem('rd_brand')];
}
