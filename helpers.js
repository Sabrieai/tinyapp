////////////////////////////////////////////
//Where all our helper function are stored//
////////////////////////////////////////////

//function to be used in conditionals to see if user exists based on email
const getUserByEmail = (email, database) => {
  for (const userObj in database) {
    const user = database[userObj];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const generateRandomString = function() {
  // generates a unique shortURL, 6 random numbers and letters
  return Math.random().toString(36).substring(2,7);
};

const urlsForUser = (userID, database) => {
  let userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === userID) {
      userUrls[shortURL] = database[shortURL];
    }
  }

  return userUrls;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};