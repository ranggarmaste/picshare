picshareApp.controller('ProfileController', function($scope, $window, $location, User, $q,
                                                    $http, Follow, Upload, Authentication) {
  var username = $location.path().substring(1);

  function checkIfFollowed() {
    if ($scope.user.followers.indexOf(Authentication.getCurrentUser()) == -1) {
      return false;
    }
    return true;
  }

  $scope.isCurrentUser = Authentication.getCurrentUser() == username;

  User.get({username: username}).$promise.then(function(user) {
    if (!user.username) {
      $location.path('error');
    } else {
      $scope.user = user;
      $scope.isFollowed = checkIfFollowed();
    }
  });

  $scope.setUrl = function(post) {
    var url =  'posts/' + post['_id'];
    $location.path(url);
  }

  $scope.upload = function(file, desc) {
      Upload.upload({
          url: '/api/posts',
          data: {file: file, user_id: $scope.user._id, desc: desc}
      }).then(function (resp) {
          if ($scope.user.auth) { //Has authorized twitter account
            $http.post('api/tweet', {
              postID: resp.data.postID,
              desc: desc,
              token: $scope.user.auth.twitter.token,
              secret: $scope.user.auth.twitter.secret
            }).then(function (resp) {
              $window.location.reload();
            });
          } else {
            $window.location.reload();
          }
      }, function (resp) {
          console.log('Error status: ' + resp.status);
      }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
  };

  $scope.follow = function() {
    if (!Authentication.getCurrentUser()) {
      $location.path('login');
    } else {
      Follow.save({
        username: Authentication.getCurrentUser(),
        followed: username
      }, { }).$promise.then(function(user) {
        console.log(user);
        $scope.user.following = user.following;
        $scope.user.followers = user.followers;
        $scope.isFollowed = checkIfFollowed();
        $scope.followers = undefined;
      });
    }
  }

  $scope.unfollow = function() {
    Follow.delete({
      username: Authentication.getCurrentUser(),
      followed: username
    }, { }).$promise.then(function(user) {
      console.log(user);
      $scope.user.following = user.following;
      $scope.user.followers = user.followers;
      $scope.isFollowed = checkIfFollowed();
      $scope.followers = undefined;
    });
  }

  $scope.getFollowers = function(user) {
    if (!$scope.followers) {
      var promises = [];
      var followers = [];
      for (let i = 0; i < user.followers.length; i++) {
        var promise = User.get({username: user.followers[i]})
        .$promise.then(function(user) {
          followers.push(user);
        });
        promises.push(promise);
      }
      $q.all(promises).then(function(results) {
        $scope.followers = followers;
      })
    }
  }

  $scope.getFollowing = function(user) {
    if (!$scope.following) {
      var promises = [];
      var following = [];
      for (let i = 0; i < user.following.length; i++) {
        var promise = User.get({username: user.following[i]})
        .$promise.then(function(user) {
          following.push(user);
        });
        promises.push(promise);
      }
      $q.all(promises).then(function(results) {
        $scope.following = following;
      })
    }
  }
});
