//App configurations
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

//functions and databases
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 1
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 1
  }
};

const users = {
  1: {
    id: 1,
    email: "a@a.com",
    password: "a"
  },
  2: {
    id: 2,
    email: "b@b.com",
    password: "b"
  }
};

//POST requests

app.post("/urls", (req, res) => {
  //using user_id so only registered and logged in users can create new tiny URLs.
  const shortURL = generateRandomString();
  const userId = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userId};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  // edit the url with short url in the address bar and newURL entered
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  const userId = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL: newURL, userID: userId};
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // delete the url based on the short url in the address bar
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // create a user after registration and saves their id as user_id in cookies
  //added edgecase support
  const email = req.body.email;
  const password =  req.body.password;
  const user = getUserByEmail(email,users);
  if (!email || !password) {
    return res.status(400).send("Both Email and Password need to be filled to register.");
  }
  if (user) {
    return res.status(403).send("An account is already associated with this email try the login page.");
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  //Sets cookie named user_id to your userid at login
  // also authenticates users
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users);

  if (!email || !password) {
    return res.status(403).send("Both Email and Password need to be filled to login.");
  }

  if (!user) {
    return res.status(403).send("There is no user with that email");
  }

  if (user.password !== password) {
    console.log(user[password]);
    return res.status(403).send('You have entered an incorrect password');
    
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//GET requests

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {//if they put in a shortURL that doesn't exist in our database
    res.send("It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!");
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
  const loggedIn = req.cookies.user_id;
  if (!loggedIn) {
    res.send("Login or Register to view your shortened URLs");
  }
  //users can only see their URLs
  const displayedURLS = urlsForUser(loggedIn, urlDatabase);

  const templateVars = {
    urls: displayedURLS,
    user:users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  //webpage to create new URL
  // if not logged in redirect to login page
  const loggedIn = req.cookies.user_id;
  if (!loggedIn) {
    res.redirect("/login");
  }
  const templateVars = {
    user:users[req.cookies.user_id]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user:users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // allows users to enter registration page
  //logged in redirects to /urls
  const loggedIn = req.cookies.user_id;
  if (loggedIn) {
    res.redirect("/urls");
  }
  const templateVars = {
    user:users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  // allows users to enter login page
  // if logged in redirects to /urls
  const loggedIn = req.cookies.user_id;
  if (loggedIn) {
    res.redirect("/urls");
  }
  const templateVars = {
    user:users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

