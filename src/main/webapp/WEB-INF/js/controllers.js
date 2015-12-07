angular.module('starter.controllers', ['ionic-datepicker'])

  .controller('LoginCtrl', function ($scope, AuthenticationService, $state, $rootScope, $ionicPopup, UtilService, StorageService, $ionicHistory) {

    $scope.user = {username: '', password: null};

    $scope.signIn = function (user) {

      UtilService.showLoadingScreen('正在登录');

      if (user && user.username && user.password) {

        loginUser.username = user.username;

        AuthenticationService.getToken(user);

      } else {

        UtilService.closeLoadingScreen();

        UtilService.showAlert('请输入用户和密码！');

      }

      $rootScope.$on('login-event', function (event, data) {

        var response = data.response;

        if (response && response.code) {

          switch (response.code) {

            case "6":

              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();

              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true,
                historyRoot: true
              });

              $state.go('tab.chats');

              loginUser.token = response.token;

              var currentuser = {
                username: $scope.user.username,
                password: $scope.user.password,
                token: response.token
              };
              StorageService.setObject('currentuser', currentuser);

              user = response;
              break;
            default:

              UtilService.showAlert(response.message);
              break;
          }
        }

        UtilService.closeLoadingScreen();
      });

    };
  })

  .controller('DataTypesCtrl', function ($scope, DataService, $rootScope, UtilService, $window) {
    $scope.$on('$ionicView.enter', function (e) {
      DataService.getTypes();
    });

    $scope.types = [];

    $rootScope.$on('data-type-load-event', function (event, data) {

      if (data.types) {
        $scope.types = data.types;

        angular.forEach($scope.types, function (value, index) {

          value.icon = UtilService.getIconByIndex(index + 4);
          value.customColor = UtilService.getRandomColorName();
        });
      }
      UtilService.closeLoadingScreen();
    });

    $scope.itemHeight = $window.innerWidth / 3;
  })

  .controller('ReportTypesCtrl', function ($scope, ReportService, $rootScope, UtilService, $window) {

    $scope.$on('$ionicView.enter', function (e) {
      ReportService.getTypes();
    });

    $scope.types = [];

    $rootScope.$on('report-type-load-event', function (event, data) {

      if (data.types) {
        $scope.types = data.types;

        angular.forEach($scope.types, function (value, index) {

          value.icon = UtilService.getIconByIndex(index);
          value.customColor = UtilService.getRandomColorName();
        });

      }
      UtilService.closeLoadingScreen();
    });

    $scope.itemHeight = $window.innerWidth / 3;
  })

  .controller('ReportResultCtrl', function ($rootScope, $scope, $state, UtilService, ReportService, $ionicModal) {

    $scope.currentPageNumber = 1;
    $scope.message = {pullingText: '下拉加载下一页'};
    $scope.$on('$ionicView.enter', function (e) {

      ReportService.queryReport(ReportService.getLastSearchCondition(), $scope.currentPageNumber);

    });

    $scope.selectedReport = {};
    $scope.showReportDetail = function (report) {
      $scope.selectedReport = report;

      $scope.modal.show();
    };

    $scope.reports = [];
    $scope.top3Attributes = [];

    var top3AttributesFound = false;
    $rootScope.$on('search-report-load-event', function (event, data) {

      if (data.reports && data.reports.length > 0) {

        angular.forEach(data.reports, function (value, index) {
          $scope.reports.push(value);
        });

        if (!top3AttributesFound) {
          var singleReportKeys = Object.keys(data.reports[0]);
          top3AttributesFound = true;

          $scope.top3Attributes.push(singleReportKeys[0]);
          $scope.top3Attributes.push(singleReportKeys[1]);
          $scope.top3Attributes.push(singleReportKeys[2]);

        }

      } else {
        $scope.message.pullingText = '已没有更多数据';
      }

      UtilService.closeLoadingScreen();
    });

    $ionicModal.fromTemplateUrl('templates/modal/single-report-detail.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.closeAutoCompleteDialog = function () {
      $scope.modal.hide();

    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {

    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });
  })

  .controller('ReportSearchCtrl', function ($scope, ReportService, $rootScope, $stateParams, $ionicHistory, UtilService, $ionicModal, $ionicActionSheet, $state) {

    $scope.$on('$ionicView.enter', function (e) {

      var typeId = $stateParams.typeid;

      ReportService.loadReportSearchConditions(typeId);

    });

    $scope.conditions = [];
    $scope.options = [];
    $scope.allOptions = [];
    //$scope.detailOptions = [];
    $scope.menuOptions = [];

    $scope.optionTreeObject = [];

    $scope.collapse = true;

    $scope.toggleCollapse = function (item) {
      $scope.collapse = !$scope.collapse;

      showSecondLevelOptionsAndLoadOptions(item);

    };

    $scope.menuShown = true;
    $scope.toggleMenu = function () {
      $scope.menuShown = !$scope.menuShown;
    };

    $scope.customTemplate = 'item_default_renderer';

    $scope.toggleTemplate = function () {
      if ($scope.customTemplate == 'ion-item.tmpl.html') {
        $scope.customTemplate = 'item_default_renderer'
      } else {
        $scope.customTemplate = 'ion-item.tmpl.html'
      }
    };

    //showSecondLevelOptionsAndLoadOptions TODO
    $rootScope.$on('search-report-conditions-load-event', function (event, data) {

      if (data.conditions) {
        $scope.conditions = data.conditions;
      }
      UtilService.closeLoadingScreen();
    });

    $scope.currentOptionsType = '';
    $scope.currentSelectCondition = {};

    $rootScope.$on('search-report-options-load-event', function (event, data) {

      if (data.options) {
        angular.forEach(data.options, function (value, key) {

          if (key == 'leibie') {
            $scope.allOptions = value;


            var firstLevelOptions = [];
            angular.forEach(value, function (o, k) {

              if (o.bianma && o.bianma.length == 4) {

                o.name = o.mingcheng;
                o.checked = true;
                firstLevelOptions.push(o);
              }
            });

            buildTreeObjectForMenu(firstLevelOptions);

            $scope.optionTreeObject = firstLevelOptions;

            $scope.menuOptions = firstLevelOptions;


          } else {

            if (value && value.length == 0) {

              $scope.thereisNoMorePages = true;
              UtilService.showAlert('没有发现数据');

            } else {
              angular.forEach(value, function (o, k) {

                $scope.options.unshift(o);
              });
            }
          }

          $scope.currentOptionsType = key;

          $scope.$broadcast('scroll.refreshComplete');

        });
      } else {
        UtilService.showAlert('没有发现数据');
      }

      UtilService.closeLoadingScreen();
    });

    function buildTreeObjectForMenu(options) {

      angular.forEach(options, function (value, index) {

        var nextLevelOptionArray = findNextLevelOptions(value);

        if (nextLevelOptionArray.length > 0) {
          value.tree = nextLevelOptionArray;
          buildTreeObjectForMenu(nextLevelOptionArray);
        }

      });

    };

    function findNextLevelOptions(inputOption) {

      var secondLevelOptions = [];
      var firstLevelOptionLength = inputOption.bianma.length;
      angular.forEach($scope.allOptions, function (option, i) {

        if (option.bianma) {

          var secondLevelOptionLength = option.bianma.length;
          var gap = secondLevelOptionLength - firstLevelOptionLength;

          if (gap == 2 && option.bianma.indexOf(inputOption.bianma) > -1) {

            option.name = option.mingcheng;
            option.checked = true;

            secondLevelOptions.push(option);
          }
        }
      });

      return secondLevelOptions;
    };

    $scope.closeDetailDialog = function () {
      $scope.modal.hide();

    };
    $scope.showSecondLevelOptionsAndLoadOptions = function ($event) {

      var optionId = $event.target.id;

      //THERE is a <SPAN> under <ion-item>. when user clicks on the span, what we want is actually the ion-item. so we ask for its parent element.
      if (!optionId) {
        optionId = $event.target.parentElement.id;
      }

      //var text = $event.target.innerText;
      //if (text) {
      //    $scope.keywordCondition.name = text;
      //}

      if (optionId) {
        ReportService.loadFinalOptionResultWithCategory($scope.currentSelectCondition.id, optionId, '', 1, 'baobiaotiaojian');
      }
    };

    $scope.keywordCondition = {name: ''};

    $scope.currentPageIndex = 1;
    $scope.searchOptionsWithKeyword = function (wantNextPage) {

      if ($scope.thereisNoMorePages && wantNextPage) {

        UtilService.showAlert('没有更多的数据了');
        $scope.$broadcast('scroll.refreshComplete');

        return;
      }

      if (wantNextPage) {
        $scope.currentPageIndex++;
      } else {

        //without wantNextPage parameter means 'clicking search' button.
        clearUpLastQueryData();
      }

      ReportService.searchOptionsWithKeyword($scope.keywordCondition.name, $scope.currentSelectCondition.id, $scope.currentPageIndex, 'baobiaotiaojian');

    };

    function clearUpLastQueryData() {

      $scope.options = [];
      $scope.currentPageIndex = 1;
    }

    $rootScope.$on('search-option-detail-load-event', function (event, data) {

      var detailOptionsList = data.detailOptions;
      if (detailOptionsList) {

        $scope.options = detailOptionsList;
      }

      UtilService.closeLoadingScreen();

    });

    $scope.showSecondLevelOptionsOrCloseDialog = function (option) {

      $scope.currentSelectCondition.moren1 = option.mingcheng;
      $scope.modal.hide();

    };

    $scope.queryReport = function () {

      ReportService.setLastSearchCondition($scope.conditions);
      $state.go('report-search-result');
    };

    $scope.openAutoComplete = function (condition) {
      $scope.currentSelectCondition = condition;

      if (condition.id) {

        $scope.openModal(condition);
      }

    };

    $scope.goback = function () {
      $ionicHistory.goBack();
    };

    $scope.datepickerObject = {
      titleLabel: '选择日期',  //Optional
      todayLabel: '今天',  //Optional
      closeLabel: '关闭',  //Optional
      setLabel: '设置',  //Optional
      setButtonType: 'button-assertive',  //Optional
      todayButtonType: 'button-calm',  //Optional
      closeButtonType: 'button-calm',  //Optional
      inputDate: new Date(),  //Optional
      mondayFirst: true,  //Optional
      weekDaysList: weekDaysList, //Optional
      monthList: monthList, //Optional
      templateType: 'modal', //Optional
      showTodayButton: 'true', //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(2000, 8, 2), //Optional
      to: new Date(2020, 8, 25),  //Optional
      callback: function (val) {  //Mandatory
        datePickerCallback(val);
      },
      dateFormat: 'yyyy/MM/dd', //Optional
      closeOnSelect: true //Optional
    };

    $scope.currentSelectPositionType = 'moren1';
    $scope.openDateDialog = function (condition, type) {

      $scope.currentSelectCondition = condition;
      $scope.currentSelectPositionType = type;
    };

    function datePickerCallback(val) {

      if (typeof(val) === 'undefined') {
        console.log('Date not selected');
      } else {

        if ($scope.currentSelectPositionType === 'moren2') {
          $scope.currentSelectCondition.moren2 = val;
        } else {
          $scope.currentSelectCondition.moren1 = val;
        }
      }
    }

    $ionicModal.fromTemplateUrl('templates/modal/auto-complete-content.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });


    $scope.openModal = function (condition) {

      $scope.keywordCondition.name = '';
      ReportService.loadReportAutocompleteOptions(condition.id, 'baobiaotiaojian');

      $scope.modal.show();
    };

    $scope.closeAutoCompleteDialog = function () {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
      $scope.currentPageIndex = 1;
      $scope.options = [];

      $scope.thereisNoMorePages = false;

      $scope.menuShown = true;
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });
  })

  .controller('ChatsCtrl', function ($scope, Chats, $rootScope, UtilService, $state) {


    $scope.$on('$ionicView.enter', function (e) {

      Chats.loadAllMyChats();

    });

    $scope.chats = [];
    $rootScope.$on('all-my-chats-load-event', function (event, data) {

      if (data.chats) {
        $scope.chats = data.chats;

        angular.forEach($scope.chats, function (value, index) {

          value.face = UtilService.getRandomAvatar();
        });
      }

      UtilService.closeLoadingScreen();
    });

    $scope.showSingleChatList = function (chat) {

      $state.go('chatdetail', {chatId: chat.fsr, face: chat.face});
    }
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats, UtilService, $rootScope, $ionicHistory, $ionicModal, $ionicScrollDelegate) {

    $scope.chatId = $stateParams.chatId;

    $scope.currentUser = UtilService.getCurrentLoggedInUser().username;

    console.debug($scope.currentUser);

    $scope.face = $stateParams.face;

    $scope.messages = [];
    $scope.$on('$ionicView.enter', function (e) {
      Chats.loadMessagesFromChat($scope.chatId);

      UtilService.closeLoadingScreen();
    });

    $rootScope.$on('chat-list-load-event', function (event, data) {

      if (data.messages) {
        $scope.messages = data.messages;

        $ionicScrollDelegate.scrollBottom();
      }

      UtilService.closeLoadingScreen();
    });

    $scope.showProcessing = false;
    $scope.singleMessageDetail = {};
    $rootScope.$on('single-approve-message-load-event', function (event, data) {

      if (data.messages) {
        $scope.singleMessageDetail = data.messages;

        console.debug($scope.singleMessageDetail);
      }

      UtilService.closeLoadingScreen();
    });

    $rootScope.$on('approve-message-proccessed-event', function (event, data) {

      UtilService.closeLoadingScreen();

      var message = data.result ? data.result : '审批成功';

      UtilService.showAlert(message, function () {
        $scope.modal.hide();
      });

    });

    $scope.goback = function () {
      $ionicHistory.goBack();
    };

    $ionicModal.fromTemplateUrl('templates/modal/aprove-detail.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.currentMessage = {};
    $scope.openModal = function (message) {

      Chats.loadApproveMessageDetails(message);
      $scope.modal.show();

      $ionicScrollDelegate.$getByHandle('messageDetailContent').scrollTop(true);

      $scope.currentMessage = message;
      $scope.comment.content = '';
    };

    $scope.closeMessageDetailDialog = function () {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
      $scope.currentPageIndex = 1;
      $scope.options = [];

      $scope.thereisNoMorePages = false;

      $scope.menuShown = true;
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });

    $scope.comment = {
      content: ''
    };

    $scope.approve = function (flag) {

      Chats.approve($scope.currentMessage.id, flag, $scope.comment.content);
    };

    $scope.input = {
      message: ''
    };

    $scope.sendMessage = function () {

      $scope.showProcessing = true;

      Chats.sendMessage($scope.input.message, $scope.chatId);

    };

    $rootScope.$on('message-sent-event', function (event, data) {

      $scope.showProcessing = false;

      var lastMessage = angular.copy($scope.input.message);

      if (lastMessage) {
        var newMessage = {fsr: $scope.currentUser, neirong: lastMessage};
        $scope.messages.push(newMessage);
      }

      $ionicScrollDelegate.scrollBottom();

      $scope.input.message = '';

    });

  })


  .controller('CustomerCtrl', function ($scope, $state, CustomerService, StorageService, $ionicHistory, UtilService, $rootScope) {
    $scope.customers = [];

    $scope.tasks = [];
    $scope.$on('$ionicView.enter', function (e) {

      $scope.tasks = [];

      CustomerService.loadTasks(1, "");

    });

    $rootScope.$on('task-list-load-event', function (event, data) {

      if (data.tasks && data.tasks.length > 0) {

        angular.forEach(data.tasks, function (value, key) {
          $scope.tasks.unshift(value);
        });

      } else {
        UtilService.showAlert('没有更多数据');
      }

      $scope.$broadcast('scroll.refreshComplete');
      UtilService.closeLoadingScreen();
    });

    $scope.dateCustomer = function (customer) {
      //open date picker

    };

    $scope.callHim = function (customer) {
      window.open('tel:' + customer.phone);
    };

    $scope.inputValue = {
      keyword: ''
    };

    $scope.currentPageIndex = 1;
    $scope.searchCustomers = function (wantNextPage) {


      if (wantNextPage) {
        $scope.currentPageIndex++;
      } else {
        $scope.currentPageIndex = 1;
        $scope.tasks = [];
      }

      CustomerService.loadTasks($scope.currentPageIndex, $scope.inputValue.keyword);
    };

    $scope.logoffUser = function () {


      StorageService.setObject('currentuser', {});


      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();

      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true
      });

      $state.go('sign-in');
    };

    $scope.showCustomerDetail = function (task) {

      CustomerService.setLastCustomer(task);

    };

    $scope.createNewTask = function () {
      $state.go('customer-detail');
    }
  })

  .controller('CustomerDetailController', function ($scope, CustomerService, $stateParams, $ionicHistory, UtilService, $rootScope, $window,/* Upload, $cordovaCamera,*/ Camera) {

    $scope.takePicture = function() {

      /*
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 300,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function (imageData) {
        $scope.imgURI = "data:image/jpeg;base64," + imageData;

        console.debug(imageData);
      }, function (err) {
        // An error occured. Show a message to the user
      });
      */

      var options = {
        quality : 75,
        destinationType : 0,
        sourceType : 1,
        allowEdit : true,
        encodingType: 0,
        targetWidth: 300,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      Camera.getPicture(options).then(function(imageURI) {
        UtilService.showAlert(imageURI);
        $scope.imageURI =  'data:image/jpeg;base64,' + imageURI;
      }, function(err) {
        console.err(err);
      });

    };
    $scope.itemWidth = $window.innerWidth;

    $scope.mapSize = {
      width: $window.innerWidth,
      height: parseInt($window.innerHeight / 2)
    };

    $scope.customer = null;

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

    $scope.currentPosition = {
      lng: '',
      lat: '',
      accuracy: ''
    };

    $scope.geolocation;

    $scope.$on('$ionicView.loaded', function (e) {

      navigator.geolocation.getCurrentPosition(function (position) {
        console.debug(position);
      });
    });
    //加载地图，调用浏览器定位服务
    $scope.map;
    $scope.$on('$ionicView.enter', function (e) {

      $scope.currentTask = CustomerService.getLastCustomer();

      var AMapArea = document.getElementById('mapContainer');

      AMapArea.parentNode.style.height = $scope.mapSize.width;

      //加载地图，调用浏览器定位服务
      $scope.map = new AMap.Map('mapContainer', {
        resizeEnable: true,
        zoom: 17
      });
      //http://lbs.amap.com/api/javascript-api/reference/plugin/#m_AMap.Geolocation
      $scope.map.plugin('AMap.Geolocation', function () {

        $scope.geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 50000,
          maximumAge: 0,
          convert: true,
          showButton: true,
          buttonPosition: 'LB',
          buttonOffset: new AMap.Pixel(10, 20),
          showMarker: true,
          showCircle: true,
          panToLocation: true,
          zoomToAccuracy: true
        });

        $scope.map.addControl($scope.geolocation);
        AMap.event.addListener($scope.geolocation, 'complete', onComplete);//返回定位信息
        AMap.event.addListener($scope.geolocation, 'error', onError);      //返回定位出错信息

      });

      $scope.geolocation.getCurrentPosition();
    });

    //获取当前位置信息
    $scope.getCurrentPosition = function () {
      $scope.geolocation.getCurrentPosition();
    }
    ;

    //clearWatch(watchId:Number)
    $scope.watchPosition = function () {
      $scope.geolocation.watchPosition();
    };

    //解析定位结果
    function onComplete(data) {

      console.debug(data);
      if (data.accuracy) {
        $scope.position = {lng: data.position.getLng(), lat: data.position.getLat(), accuracy: data.accuracy};
      } else {
        console.debug("定位失败");
      }

    };

    //解析定位错误信息
    function onError(data) {

      console.debug(data);

    }

    $scope.additionalTaskInfo = {address: '', finished: true, comments: ''};

    $scope.submitTask = function (task) {

      /*
      Upload.base64DataUrl($scope.file).then(function (url) {

        var taskId = $scope.currentTask ? $scope.currentTask.id : -1;
        var finished = $scope.additionalTaskInfo.finished? 1 : 0;
        CustomerService.executeTask(url, taskId, $scope.currentPosition.lng, $scope.currentPosition.lat, $scope.additionalTaskInfo.address,
          $scope.currentTask.riqi, $scope.currentTask.kehu, $scope.additionalTaskInfo.comments,  finished);
      });
      */
    };
  });
