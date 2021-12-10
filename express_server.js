//App configurations
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["Key1", "Key2"],

}));

const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");

//functions and databases
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const urlDatabase = {};

const usersDatabase = {};

//POST requests

app.post("/urls", (req, res) => {
  //using user_id so only registered and logged in users can create new tiny URLs.
  const shortURL = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userId};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  // edit the url with short url in the address bar and newURL entered
  // but only if you are logged as the correct user
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  const loggedIn = req.session.user_id;

  if (loggedIn === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = {longURL: newURL, userID: loggedIn};
    res.redirect("/urls");
  } else {
    res.status(403).send("You are nto authorized to edit this URL. Consider making your own 😃");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // delete the url based on the short url in the address bar
  // but only if you are logged as the correct user
  const shortURL = req.params.shortURL;
  const loggedIn = req.session.user_id;

  if (loggedIn === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // create a user after registration and saves their id as user_id in cookies
  //added edgecase support and hashed passwords instead of plain text
  const email = req.body.email;
  const password =  req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email,usersDatabase);

  if (!email || !password) {
    return res.status(400).send("Both Email and Password need to be filled to register.");
  }
  if (user) {
    return res.status(403).send("An account is already associated with this email try the login page.");
  }
  const id = generateRandomString();
  usersDatabase[id] = {
    id,
    email,
    password: hashedPassword
  };
  console.log(usersDatabase);
  req.session("user_id", id);
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  //Sets cookie named user_id to your userid at login
  // also authenticates users
  // added ability to chechashed password against typed password
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,usersDatabase);

  if (!email || !password) {
    return res.status(403).send("Both Email and Password need to be filled to login.");
  }

  if (!user) {
    return res.status(403).send("There is no user with that email");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    console.log(user[password]);
    return res.status(403).send('You have entered an incorrect password');
    
  }

  req.session('user_id', user.id);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//GET requests

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {//if they put in a shortURL that doesn't exist in our database
    res.status(404).send("It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!");
  } else {
    const longUrl = urlDatabase[shortURL].longURL;
    res.redirect(longUrl);
  }
});

app.get("/", (req, res) => {
  // what is seen when enters localhost:8080
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  //display URLs only if user is logged in
  //not logged in it should tell them  to login or register first.
  const loggedIn = req.session.user_id;
  if (!loggedIn) {
    res.status(403).send("Login or Register to view your shortened URLs");
  }
  //users can only see their URLs
  const displayedURLS = urlsForUser(loggedIn, urlDatabase);

  const templateVars = {
    urls: displayedURLS,
    user:usersDatabase[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  //webpage to create new URL
  // if not logged in redirect to login page
  const loggedIn = req.session.user_id;
  if (!loggedIn) {
    res.redirect("/login");
  }
  const templateVars = {
    user:usersDatabase[req.session.user_id]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user:usersDatabase[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // allows users to enter registration page
  //logged in redirects to /urls
  const loggedIn = req.session.user_id;
  if (loggedIn) {
    res.redirect("/urls");
  }
  const templateVars = {
    user:usersDatabase[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  // allows users to enter login page
  // if logged in redirects to /urls
  const loggedIn = req.session.user_id;
  if (loggedIn) {
    res.redirect("/urls");
  }
  const templateVars = {
    user:usersDatabase[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

