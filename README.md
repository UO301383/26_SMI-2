# Example REST API for the teamwork

This repository contains an Express application implementing a very simple REST API for a book store. It is used to illustrate the following key technologies:

 - REST API.
 - Express and its middlewares.
 - Testing with Mocha.
 

# Repository organization

The repository is organized in several directories:

 - `/app`: contains the code of the express application.
 
    - `app/routes`: contains the API endpoints exposed by the server.
    - `app/middlewares/validators`: contains the validators for the API endpoints.
    - `app/controllers`: contains the controllers for the API endpoints.
    - `app/models`: contains the data models (book).
   
 - `/test`: contains the code of the tests.


# Usage

You must follow these steps to start the application in a local machine:

 1. Install the dependencies:
  
    - `npm install`

 2. Run the application in the local machine with the desired configuration::
 
    - `npm start` to run the server in production mode.
    - `npm test` to run the tests.
  