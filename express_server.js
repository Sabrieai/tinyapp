const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.post("/urls", (req, res) => {
  // short url is the key and long url is the value and redirects
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  // edit the url with short url in the address bar and newURL entered
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
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
  const id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  //Sets cookie named Username to your Username at login
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {//if they put in a shortURL that doesn't exist in our database
    res.send("It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!");
  } else {
    res.redirect(longURL);
  }
});

app.get("/", (req, res) => {
  // what is seen when enters localhost:8080
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  // updated usrname to user
  const templateVars = {
    urls: urlDatabase,
    user:users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  //updated username to user
  const templateVars = {
    user:users[req.cookies.user_id]
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //updated username to user
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user:users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // allows users to enter registration page
  res.render("register");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
// generates a unique shortURL, 6 random numbers and letters
  return Math.random().toString(36).substring(2,7);
};
