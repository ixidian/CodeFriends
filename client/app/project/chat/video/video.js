/*global angular:true */
(function () {
  'use strict';

  angular.module('codeFriends.video', ['ngSanitize'])
    .controller('VideoController', VideoController);

  VideoController.$inject = ['$scope', '$state', '$http', 'ngSocket', '$stateParams', 'AuthFactory', 'VideoFactory'];

  function VideoController($scope, $state, $http, ngSocket, $stateParams, AuthFactory, VideoFactory) {
    var roomID = $stateParams.projectName;

    $scope.$on('STARTVIDEO', function () {
      VideoFactory.joinRoom(roomID)
      VideoFactory.startLocalVideo();
      var localVideo = document.getElementById('localVideo');
      localVideo.className = 'localVideoActive';
    });

    VideoFactory.on('leftRoom', function (data) {
      console.log("HEY I GOT A MESSAGE!");
      VideoFactory.disconnect();
    });

    function showVolume(el, volume) {
      if (!el) return;
      if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
      } else if (volume > -20) {
        el.style.height = '100%';
      } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
      }
    }
    VideoFactory.on('channelMessage', function (peer, label, data) {
      if (data.type == 'volume') {
        showVolume(document.getElementById('volume_' + peer.id), data.volume);
      }
    });

    VideoFactory.on('videoAdded', function (video, peer) {
      var remotes = document.getElementById('remotes');
      if (remotes) {
        var d = document.createElement('div');
        d.className = 'videoContainer';
        d.id = 'container_' + VideoFactory.getDomId(peer);
        d.appendChild(video);
        var vol = document.createElement('div');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume_bar';
        video.style.boxShadow = '-3px -3px 4px #222';
        d.appendChild(vol);
        remotes.appendChild(d);
      }
    });
    VideoFactory.on('videoRemoved', function (video, peer) {
      var remotes = document.getElementById('remotes');
      var el = document.getElementById('container_' + VideoFactory.getDomId(peer));
      if (remotes && el) {
        remotes.removeChild(el);
      }
    });
    VideoFactory.on('volumeChange', function (volume, treshold) {
      showVolume(document.getElementById('localVolume'), volume);
    });
  }

})();