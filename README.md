# ReDI Connect
ReDI Connect is a tool to connect mentors and mentees. It is built for ReDI School and its community of teachers, students and volunteers.

## Features
* sign-up for mentors/mentees
* profiles that contain misc. personalia, and checkboxes for what areas of support mentors can offer and mentees are looking for
* form for mentees to submit an application to mentors for mentorship
* mentorship session logging
* problem reporting
* administration panel

## Milestones
* improve overall design, UX and code quality (current state is result of rushed work and has technical debt)
* consider supplementing the front-end web application by a native/hybrid/cross-platform Android / iOS mobile application

## Components
* database: MongoDB
* redi-connect-backend: Loopback/Express.js-based REST server
* redi-connect-front: frontend coded in React
* redi-connect-admin: simple administration panel (based on react-admin)

All can be run locally in development mode using below instructions. The production version is hosted on AWS - consult @ericbolikowski for details.

## Contribution guide
Contribution guide will be elaborated. For now, please:
* Please follow the [gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) model for branching (minus release branches). TL;DR: create `feat/xxx` branches off `develop` and file a PR once the feature is ready. Merge of `develop` into `master` done by maintainers only, once `develop` is release-ready. Use `hotfix` branches off `master`.
* Please follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4) when writing your commit messages. This is required for merge commits to `develop` and `master`, and encouraged for all other commits. TL;DR: use this syntax for commit summary: `<type<[(<scope<)]: <description>`, where `type = fix|feat|chore|docs|style|refactor|perf|test|`, `scope=backend|front|admin` (sub-scope optional).

## Getting started

### Installation
1. Ensure following is installed and active:
   - mongod
   - node v10
2. Optionally, to easily browse the MongoDB database, install *Studio 3T*
3. Install dependencies: run `yarn` in `redi-connect-front` folder, run `npm install` in `redi-connect-backend` folder
4. Optionally, create a folder named `mongodb-data` for MongoDB's data files

### Run
1. For a clean development session, clear the old database (via Studio 3T, any other GUI, or simply deleting and re-creating the MongoDB data folder)
2. Open the monogdb data folder (e.g. `cd mongodb-data`) and start the mongodb daemon: `mongod --dbpath .`
3. To seed the database with anonymous data, run `./seed-random-data.sh` in `redi-connect-backend`
4. Run `yarn start` in `redi-connect-front`
5. Run `./start-dev.sh` in `redi-connect-backend` 
6. Run `./yarn start` in `redi-connect-admin`
