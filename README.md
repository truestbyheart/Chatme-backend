# Overview
app is deployed on heroku
link: https://chatme-back.herokuapp.com/

No test are writen for the app.

# Setting it up locally
1. clone the repository
2. Run `npm install`
3. create the `.env` for app environment variable as per `.env.example` file
4. Run `nodemon` to start up the app in dev mode
5. If you wishto build run `npm run postinstall` and after complition run `npm start`

# endpoints

| route | description | body |
|-------|---------------------------------------------|------------|
| POST /auth/signup| receive the signup payload in form of Json and create a new account |  ```json { username: string, password: string, email: string}``` |
| POST /auth/login | receive login credential and validates | ```json { username: string, password: string }``` |

