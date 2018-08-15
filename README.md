# Organogram API

## Setup instructions

1. **Ensure you have Node & MongoDB installed**
    - Ensure you're using correct Node version - `$ nvm use`
    - If you don't have it, install Node - `$ nvm install`
    - Run MongoDB before you start runnig the API

2. **Ensure you have Node & MongoDB installed**
    - Ensure you're using correct Node version - `$ nvm use`
    - If you don't have it, install Node - `$ nvm install`
    - Run MongoDB before you start runnig the API

3. **Make `config.json` file to set required environment variables.**
* config.json Sample
```
{
  "test": {
    "PORT": 3000,
    "MONGODB_URI": "mongodb://localhost:27017/OrganogramAppTest"
  },
  "development": {
    "PORT": 3000,
    "MONGODB_URI": "mongodb://localhost:27017/OrganogramApp"
  }
}
```

4. **Install npm dependencies**
    - Run `$ npm install` to install npm dependencies.

---

## Running instructions

### Running the API in development mode

Run with `$ npm start`. `Started up at port 3000` message will show up and you can access API from localhost.

### Running tests

Run with `$ npm test`. If you want to run tests with nodemon, you can run it with `$ npm run test-watch`.

---

## API Documentation

### Companies
- **Add new company**
  - Method: `POST`
  - Endpoint: `/companies`
  - Request body: 
    - *name (String)
  - Response body (on success):
    - *name (String)
    - *collaborators (null)
  - Will return Error 400 if there's already a company with same name.

- **List all companies**
  - Method: `GET`
  - Endpoint: `/companies`
  - Response body (on success):
    - companies[]
      - *name (String)
      - collaborators[]
        - *name (String)
        - *email (String)
        - *companyName (String)
        - managerEmail (String)
        - *managed (null) 
  
- **Get a single company**
  - Method: `GET`
  - Endpoint: `/companies/:name`
  - Response body (on success):
    - company
      - name (String)
      - collaborators[]
        - *name (String)
        - *email (String)
        - *companyName (String)
        - managerEmail (String)
        - *managed (null)
  - Will return Error 404 if company not found


### Collaborators
- **Add new collaborator in a company**
  - Method: `POST`
  - Endpoint: `/collaborators/:companyName`
  - Request body: 
    - *name (String)
    - *email (String)
  - Response body (on success):
    - *name (String)
    - *email (String)
    - *companyName (String)
    - managerEmail (String)
    - *managed (null)
  - Will return Error 404 if company not found
  - Will return Error 400 if there's already a collaborator with same email.

- **List all collaborators in a company**
  - Method: `GET`
  - Endpoint: `/collaborators/:companyName`
  - Response body (on success):
    - collaborators[]
      - *name (String)
      - *email (String)
      - *companyName (String)
      - managerEmail (String)
      - *managed (null)
  - Will return Error 404 if company not found

- **Delete a collaborator in a company**
  - Method: `DELETE`
  - Endpoint: `/collaborators/:companyName/:email`
  - Response body (on success):
    - collaborator
      - *name (String)
      - *email (String)
      - *companyName (String)
      - managerEmail (String)
      - *managed (null)
  - Will return Error 404 if company or collaborator not found

- **Patch a collaborator in a company**
  - Method: `PATCH`
  - Endpoint: `/collaborators/:companyName/:email`
  - Request body:
    - name (String)
    - managerEmail (String)
  - Response body (on success):
    - collaborator
      - *name (String)
      - *email (String)
      - *companyName (String)
      - managerEmail (String)
      - *managed (null)
  - Will return Error 404 if company or collaborator not found
  - Set managerEmail field with other collaborator's email value to associate him as this user's manager.

- **List all pairs of a collaborator in a company**
  - Method: `GET`
  - Endpoint: `/collaborators/:companyName/:email/:pairs`
  - Response body (on success):
    - pairs[]
      - *name (String)
      - *email (String)
      - *companyName (String)
      - *managerEmail (String)
      - *managed (null)
  - Will return Error 404 if company or collaborator not found
  - Return other collaborators with same managerEmail. If managerEmail is not set, will return empty Array.

- **List all managed collaborators of a manager in a company**
  - Method: `GET`
  - Endpoint: `/collaborators/:companyName/:email/:managed`
  - Parameter: secondLevel (optional)
  - Response body (on success && secondLevel param not set):
    - managed[]
      - *name (String)
      - *email (String)
      - *companyName (String)
      - *managerEmail (String)
      - *managed (null)
  - Response body (on success && secondLevel param set):
    - managed[]
      - *name (String)
      - *email (String)
      - *companyName (String)
      - *managerEmail (String)
      - *managed[]
        - *name (String)
        - *email (String)
        - *companyName (String)
        - *managerEmail (String)
        - *managed (null)
  - Will return Error 404 if company or collaborator not found
  - Return all collaborators managed by a user. If secondLevel parameter is set, will return all collaborators managed by each collaborator managed by a user.