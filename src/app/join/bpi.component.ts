import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-rc-bpi',
  templateUrl: './bpi.component.html'
})
export class BpiComponent implements OnInit {
  formMember: FormGroup;
  bpiBusinessSectorsOptions = [
    'Agriculture',
    'Artisanat',
    'Automobile, machines, équipements',
    'Bâtiment',
    'Commerce',
    'Information et communication',
    'Associations',
    'Education, formation, recherche',
    'Energie, environnement',
    'Etudes, conseil et ingénierie',
    'Finance, assurance',
    'Industrie',
    'Arts, spectacles et activités récréatives',
    'Santé, Sanitaire et Social',
    'Télécoms, internet, informatique',
    'Tourisme, hébergement, restauration',
    'Transport et logistique',
    'Services'
  ];
  bpiTotalEmployeesOptions = [
    '0 salariés',
    '1 à 4 salariés',
    '5 à 9 salariés',
    '10 à 49 salariés',
    '50 à 250 salariés',
    '> 250 salariés'
  ];
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
   this.initForm();
  }
  initForm(): void {
    this.formMember = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', Validators.required],
      telephone: ['', Validators.required],
      acceptRcTerms: [false, Validators.requiredTrue],
      bpiCompanyName: ['', Validators.required],
      bpiAddressStreet:  ['', Validators.required],
      bpiAddressCity:  ['', Validators.required],
      bpiAddressRegion:  ['', Validators.required],
      bpiAddressDepartment:  ['', Validators.required],
      bpiAddressPostCode:  ['', Validators.required],
      bpiSiren:  ['', Validators.required],
      bpiSiret:  ['', Validators.required],
      bpiDirectorFirstName:  ['', Validators.required],
      bpiDirectorLastName:  ['', Validators.required],
      bpiDirectorEmail:  ['', Validators.required],
      bpiTotalEmployees: ['', Validators.required],
      bpiBusinessSector: ['', Validators.required]
    });
  }

}
