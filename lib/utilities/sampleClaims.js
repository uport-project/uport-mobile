// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
export const trafficAccidentClaim = {
  generalInfo: {
    accidentDate: '2018-06-12 16:20',
    address: {
      street: 'Main str. 123',
      city: 'Vilnius',
      country: 'LT',
    },
    injuriesEvenIfSlight: false,
  },
  materialDamage: {
    otherThanToVehiclesAAndB: false,
    objectsOtherThanVehicles: false,
  },
  witnesses: [
    {
      name: 'John Smith',
      phoneNumber: '+123242324',
      address: {
        street: 'Second str. 324-2',
        city: 'London',
        country: 'UK',
      }
    },
    {
      name: 'Jane Doe',
      phoneNumber: '+43523234',
      address: {
        street: 'Some av. 43-6',
        city: 'Dublin',
        country: 'IR',
      }
    },
  ],
  vehicleA: {
    policyHolder: {
      nameOrCompanyName: 'Karuzas',
      firstName: 'Simonas',
      personalCodeOrRegNr: '543589343',
      address: {
        postalCode: 'LT-34423',
        street: 'Some str. 554-2',
        city: 'Vilnius',
        country: 'LT',
      },
      phoneNumber: '+37098234423',
      email: 'simonas.karuzas@gmail.com',
    },
    vehicle: {
      make: 'Toyota',
      type: 'RAV4',
      registrationNr: 'ABC123',
      countryOfRegistration: 'LT',
      trailer: false,
    },
    insuranceCompany: {
      country: 'LT',
      name: 'Super Insurance',
      policyNr: '989483',
      greenCardNr: '545423',
      validFrom: '2017-01-01',
      validTo: '2022-01-01',
      agencyOrBroker: 'Your Local Insurance Agent',
      address: 'Real str. 82, Vilnius, Lithuania',
      phoneNumber: '+3704234235',
      email: 'agent@gmail.com',
      doesThePolicyCoverMaterialDamageToTheVehicle: false,
    },
    driver: {
      name: 'Doe',
      firstName: 'John',
      dateOfBirth: '1987-01-05',
      personalCode: '234423423',
      address: 'Third str 3-5, Vilnius',
      country: 'LT',
      phoneNumber: '+370983249234',
      email: 'john.doe@gmail.com',
      drivingLicenseNr: '2324234',
      category: [
        'A',
        'B'
      ],
      validFrom: '2010-01-01',
      validTo: '2022-01-01',
    },
    pointOfInitialImpactToVehicleA: 98,
    visibleDamageToVehicleA: [
      'Right front door',
      'Right rear wheel'
    ],
    additionalDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sit amet ante consequat, feugiat tellus at, fringilla mi. Phasellus egestas, metus sit amet suscipit scelerisque, arcu lorem mollis metus, dignissim gravida nunc velit quis lorem. Phasellus maximus, lorem lobortis cursus molestie, libero lorem venenatis metus, at congue lorem metus quis risus. Vivamus accumsan leo purus, vel mollis lectus mollis vel. Nunc orci nisi, fermentum a lorem non, sodales lobortis lorem. Nullam blandit varius felis in consequat. Vivamus tincidunt viverra mauris, id scelerisque urna tempor auctor. Etiam sed efficitur dolor. Suspendisse pulvinar enim id libero posuere cursus molestie quis purus. Duis at mauris eget augue interdum elementum eget in lacus.',
    circumstances: [
      'Parked',
      'Opening the door'
    ],
    liableForCausingDamage: false,
  },
  vehicleB: {
    policyHolder: {
      nameOrCompanyName: 'Doe',
      firstName: 'Jane',
      personalCodeOrRegNr: '4534534',
      address: {
        postalCode: 'LT-36663',
        street: 'Other str. 555-2',
        city: 'Vilnius',
        country: 'LT',
      },
      phoneNumber: '+37098234423',
      email: 'jane.doe@gmail.com',
    },
    vehicle: {
      make: 'WV',
      type: 'Golf',
      registrationNr: 'KUS934',
      countryOfRegistration: 'LT',
      trailer: false,
    },
    insuranceCompany: {
      country: 'LT',
      name: 'Super Insurance',
      policyNr: '234234234',
      greenCardNr: '543a4',
      validFrom: '2016-01-01',
      validTo: '2023-01-01',
      agencyOrBroker: 'Your Local Insurance Agent',
      address: 'Real str. 82, Vilnius, Lithuania',
      phoneNumber: '+3704234235',
      email: 'agent@gmail.com',
      doesThePolicyCoverMaterialDamageToTheVehicle: true,
    },
    driver: {
      name: 'Doe',
      firstName: 'John',
      dateOfBirth: '1987-01-05',
      personalCode: '234423423',
      address: 'Third str 3-5, Vilnius',
      country: 'LT',
      phoneNumber: '+370983249234',
      email: 'john.doe@gmail.com',
      drivingLicenseNr: '2324234',
      category: [
        'A',
        'B'
      ],
      validFrom: '2010-01-01',
      validTo: '2022-01-01',
    },
    pointOfInitialImpactToVehicleB: 98,
    visibleDamageToVehicleB: [
      'Left front door',
      'Left rear wheel'
    ],
    additionalDescription: 'Etiam sagittis sem elementum tempus tempor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Integer aliquam libero ac erat mollis, in malesuada urna vestibulum. Nulla fermentum urna ac malesuada tempus. Donec dignissim risus a hendrerit aliquam. Cras ultricies odio a felis maximus, ac sodales ligula lacinia. Cras ullamcorper mi vel arcu vulputate volutpat. Aliquam sagittis interdum enim, id varius libero lobortis in. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque sit amet urna lacinia, ullamcorper urna sit amet, ultrices orci. Aenean eu ex porttitor, tristique tellus nec, tempus purus. Curabitur non urna posuere, tempus turpis nec, ullamcorper nisl. In hendrerit purus et interdum finibus. Praesent feugiat, augue sed fringilla laoreet, quam eros commodo dui, non sodales mi quam ut eros.',
    circumstances: [
      'Entering parking garage',
    ],
    liableForCausingDamage: true,
  },
  sketchOfAccidentWhenImpactOccuredURL: 'https://i.imgur.com/iK0aJJg.jpg'   


}