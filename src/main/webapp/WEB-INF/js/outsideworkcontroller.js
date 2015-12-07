angular.module('starter.outsideworkcontroller', [])

  .controller('OutSideWorkCtrl', function ( $window, $scope, $state, CustomerService, StorageService, $ionicHistory, UtilService, $rootScope) {

    $scope.mapSize = {
      width: $window.innerWidth,
      height: parseInt($window.innerHeight / 2)
    };

    $scope.currentPosition = {
      lng: null,
      lat: null,
      accuracy: null
    };

    $scope.positionFetched = false;

    $scope.$on('$ionicView.enter', function (e) {

      var map = new BMap.Map("allmap");
      var point = new BMap.Point(116.331398,39.897445);
      map.centerAndZoom(point,18);

      var geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
          var mk = new BMap.Marker(r.point);
          map.addOverlay(mk);
          map.panTo(r.point);

          $scope.currentPosition.lng = r.point.lng;
          $scope.currentPosition.lat = r.point.lat;
          console.debug($scope.currentPosition);
          console.debug(r);
          $scope.positionFetched = true;
        }
        else {
          UtilService.showAlert("获取位置信息失败");
        }

      },{enableHighAccuracy: false});

      var AMapArea = document.getElementById('allmap');

      AMapArea.style.height = $scope.mapSize.width;

    });

    $scope.workItems = [
      {name: '考勤签到', icon: 'ion-log-in', id: 'signin', customColor: 'balanced'},
      {name: '考勤签退', icon: 'ion-log-out', id: 'signout', customColor: 'balanced'},
      {name: '工作制定', icon: 'ion-ios-compose-outline', id: 'taskPlan', customColor: 'balanced'},
      {name: '工作执行', icon: 'ion-ios-color-wand', id: 'executePlan', customColor: 'balanced'},
      {name: '临时工作', icon: 'ion-ios-paper-outline', id: 'tempWork', customColor: 'balanced'},
      {name: '新增客户', icon: 'ion-ios-personadd-outline', id: 'newCustomer', customColor: 'balanced'}
    ];

    $scope.itemHeight = $window.innerWidth / 3;

    $scope.userClickSingleButton = function (work) {

      switch (work.id) {
        case 'signin' :

          if ($scope.positionFetched) {
            CustomerService.userWorkSign($scope.currentPosition, '1');
          } else {
            UtilService.showAlert('签到失败，请稍后重试');
          }

          break;
        case 'signout' :

          if ($scope.positionFetched) {
            CustomerService.userWorkSign($scope.currentPosition, '0');
          } else {
            UtilService.showAlert('签退失败，请稍后重试');
          }

          break;
        case 'taskPlan' :

          break;
        case 'signin' :

          break;
        case 'executePlan' :

          break;
        case 'tempWork' :

          break;
        case 'newCustomer' :

          break;
        default :
          break;

      }

    };

    function userSign() {

    }
  });
