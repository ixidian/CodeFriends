/*global angular:true, moment:true */

(function () {
  'use strict';

  angular.module('codeFriends.chat', ['ngSanitize', 'luegg.directives'])
    .controller('ChatController', ChatController)
    .directive('ngEnter', ngEnter);

  ChatController.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$document', '$window', '$state', '$http', 'ngSocket', '$stateParams', 'AuthFactory', '$interval', 'SocketFactory'];

  function ChatController($scope, $rootScope, $location, $anchorScroll, $document, $window, $state, $http, ngSocket, $stateParams, AuthFactory, $interval, SocketFactory) {
    var roomID = $stateParams.projectName;
    $scope.username = AuthFactory.userName;
    $scope.roomID = roomID;
    $scope.messages = [];
    $scope.usersInRoom = [];
    $scope.emitStartVideo = emitStartVideo;
    SocketFactory.connect();

    function emitStartVideo() {
      $rootScope.$broadcast('STARTVIDEO');
      var icon = document.getElementById('videoButton');
      icon.className += ' active';
    }

    var updateTime = function () {
      for (var i = 0; i < $scope.messages.length; i = i + 1) {
        $scope.messages[i].timeAgo = moment($scope.messages[i].createdAt).fromNow();
      }
    };

    $interval(updateTime, 15000);

    SocketFactory.usersOnline(function (userObj) {
      $scope.usersInRoom = userObj.userConnections;
      var usersOnlineDiv = document.getElementById('gluedChatContent');
      if (usersOnlineDiv !== undefined && usersOnlineDiv !== null) {
        usersOnlineDiv.className = 'chatContent' + Object.keys($scope.usersInRoom).length;
      }
    }, roomID);

    SocketFactory.onMessageHistory(function (eachMessage) {
      $scope.messages.push(eachMessage);
    }, roomID);

    SocketFactory.onChat(function (chatMessage) {
      $scope.messages.push(chatMessage);
    }, roomID);

    SocketFactory.onRemoveVideo();

  }

  ngEnter.$inject = ['SocketFactory'];

  function ngEnter(SocketFactory) {

    return function ($scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          $scope.$apply(function () {
            var chatParams = {
              type: 'message',
              username: $scope.username,
              roomID: $scope.roomID,
              message: $scope.chatMessage,
              createdAt: Date.now()
            };
            SocketFactory.sendChat(chatParams);
            $scope.$eval(attrs.ngEnter);
          });
          $scope.chatMessage = '';
          event.preventDefault();
        }
      });
    };
  }

})();