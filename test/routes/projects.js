/* eslint-env mocha */
'use strict';
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
// let server = require('../../app.js');

let Ajv = require('ajv');
let projectListSchema = require('../../schema/projectList');
let projects = require('../../lib/projects');
chai.use(chaiHttp);
let mockJSON = require('./mockProjectJSON');
let rawJSON = mockJSON.rawJSON;

let credentialFixtureCases = [
  [
    // Valid ID Valid Name
    {'id': 1337, 'name': 'Hank'},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Valid ID Invalid Name
    {'id': 1337, 'name': 17},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Valid ID Missing Name
    {'id': 1337},
    {'id': 456},
    {'id': 673}
  ],
  [
    // Invalid ID Valid Name
    {'id': 'Jimbo', 'name': 'Hank'},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Invalid ID Valid Name
    {'id': 'Jimbo', 'name': 17},
    {'id': 456, 'name': 'John'},
    {'id': 673, 'name': 'Frank'}
  ],
  [
    // Invalid ID Missing Name
    {'id': 'Jimbo'},
    {'id': 456},
    {'id': 673}
  ],
  [
    // Missing ID Valid Name
    {'name': 'Hank'},
    {'name': 'John'},
    {'name': 'Frank'}
  ],
  [
    // Missing ID Invalid Name
    {'name': 17},
    {'name': 'John'},
    {'name': 'Frank'}
  ],
  [
    // Missing ID Missing Name
    {},
    {},
    {}
  ]
];
let ajv = new Ajv();
let validate = ajv.compile(projectListSchema);

describe('Schema Validation for project.js', function () {
  credentialFixtureCases.forEach(function (fixture) {
    let result = validate(fixture);
    if (result === true) {
      it('Should return true when the JSON schema object is VALID\n', function () {
        expect(result).to.be.true();
      });
    } else {
      it('JSON schema object should be INVALID with the credentials\n \tname: ' + fixture[0].name + ' and ID: ' + fixture[0].id + '\n', function () {
        // console.log('\tShould be invalid with name: ' + fixture[0].name + ' and ID: ' + fixture[0].id);
        expect(result).to.not.be.true();
      });
    }
  });
});

describe('Validation for parseProjectsList in lib/project.js', function () {
  // Array 0 is for checking against completely valid JSON
  // Array 1 is for checking against JSON with an invalid entry in the first set
  let filterJSON = [
    [
      {id: 234, name: 'Chatty'},
      {id: 345, name: 'IIBA BABOK'},
      {id: 456, name: 'Integrated System'}
    ],
    [
      {id: 345, name: 'IIBA BABOK'},
      {id: 456, name: 'Integrated System'}
    ]
  ];

  it('Should return a valid JSON with all three projects', function () {
    // When all projects have valid ids and names
    let parsed = projects.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[0]);
    expect(result).to.be.true();
  });

  it('Should return a valid JSON with two of three projects when name is null in the first project', function () {
    // When id is valid and name is invalid
    rawJSON[0].fields.name = null;
    let parsed = projects.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[1]);
    expect(result).to.be.true();
  });

  it('Should return a valid JSON with two of three projects when id is null in the first project', function () {
    // When id is invalid and name is valid
    rawJSON[0].id = null;
    rawJSON[0].fields.name = 'Chatty';
    let parsed = projects.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[1]);
    expect(result).to.be.true();
  });

  it('Should return a valid JSON with two of three projects when name and id are null in the first project', function () {
    // When id and name are invalid
    rawJSON[0].id = null;
    rawJSON[0].fields.name = null;
    let parsed = projects.parseProjectList(rawJSON);
    let result = validate(parsed);
    expect(parsed).to.deep.equal(filterJSON[1]);
    expect(result).to.be.true();
  });
  it('Should return an empty array of projects when passed a null', function () {
    // When projects are null
    let empty = [];
    let parsed = projects.parseProjectList(null);
    expect(parsed).to.deep.equal(empty);
  });
});
