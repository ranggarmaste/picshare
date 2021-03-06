picshareApp.factory('Authentication', function($window, $http, User) {
  saveToken = function(token) {
    $window.localStorage.setItem('login-token', token);
  },

  getToken = function() {
    return $window.localStorage.getItem('login-token');
  },

  logout = function() {
    $window.localStorage.removeItem('login-token');
    $window.location.assign('/');
  },

  isLoggedIn = function() {
    var token = getToken();
    var user;

    if (token) {
      user = JSON.parse($window.atob(token.split('.')[1]));
      if (user.exp > Date.now() / 1000) {
        return true;
      } else {
        logout();
        return false;
      }
    } else {
      return false;
    }
  },

  getCurrentUser = function() {
    if (isLoggedIn()) {
      var token = getToken();
      var user = JSON.parse($window.atob(token.split('.')[1]));
      return user.username;
    }
    return undefined;
  },

  getCurrentEmail = function() {
    if (isLoggedIn()) {
      var token = getToken();
      var user = JSON.parse($window.atob(token.split('.')[1]));
      return user.email;
    }
    return undefined;
  },

  login = function(user) {
    return $http.post('/api/login', user).then(function(response) {
      console.log('Service');
      return saveToken(response.data.token);
    });
  }

  return {
    saveToken: saveToken,
    getToken: getToken,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,
    getCurrentEmail: getCurrentEmail
  }
});
