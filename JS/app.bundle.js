var app = angular.module('ZuPortal.Desktop', [
    'ui.router',
    'ZuPortal.Routing',
    'ngCookies',
    'ngSanitize',
    'ngStorage',
    'blockUI',
    'angularModalService',
    'ui',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'ui.bootstrap.accordion',
    'ui.bootstrap.tooltip',
    'ui.bootstrap.popover',
    'ui.grid.autoResize',
    'ui.grid',
    'ui.grid.pinning',
    'ui.grid.selection',
    'ui.grid.exporter',
    'ui.grid.pagination',
    'ui.grid.resizeColumns',
    'ui.grid.edit',
    'ui.grid.cellNav',
    'chart.js',
    'mega-menu',
    'ngImgCrop',
    'ngFitText',
    'txx.diacritics',
    'ZuPortal.Templates',
    'ZuPortal.Rob.Templates',
    'ZuPortal.Josh.Templates',
    'ZuPortal.Rob.Apps',
    'ZuPortal.Josh.Apps']);

angular.element(document).ready(function () {

    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');
    var API_URL = ['http://', document.location.hostname, ':6174'].join('');

    $http.get(API_URL + '/requests/site_states.aspx').then(function (response) {
        app.config(function ($stateProvider, $urlRouterProvider) {
            response.data.forEach(function (state, index) {
                var params = {};

                if (state.params) {
                    state.params.split(',').forEach(function (param, index) {
                        params[param] = null;
                    });
                };

                $stateProvider.state(state.stateName, {
                    url: state.url,
                    data: { pageTitle: state.pageTitle },
                    templateUrl: state.templateUrl,
                    controller: state.controller,
                    restricted: state.restricted == 1,
                    required: state.restricted == 1 ? state.required.split('|') : [],
                    params: params,
                    auth: state.auth == 1
                });
            });
        });
        angular.bootstrap(document, ['ZuPortal.Desktop']);
    });

});

app.config(function ($sceDelegateProvider, $compileProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
     'self',
     'http://zuportal.corp.zulily.com:6174/**',
     'http://zuportal.corp.zulily.com/**',
     'http://rno-internal.rno.corp.zulily.com/**',
     'http://cbs-internal.corp.zulily.com/**'
    ]);
})

.service('PageTitleService', function () {

    var PageTitleService = this;

    this.title = null;

    this.onStateChange = function ($event, toState) {


        if (toState.data && toState.data.pageTitle) {
            PageTitleService.title = 'ZuPortal | ' + toState.data.pageTitle;
        }
        else {
            PageTitleService.title = 'ZuPortal';
        }

    };


})

.run(function ($rootScope, $localStorage, $sessionStorage, $state, PageTitleService, $cookies, $location) {

    $rootScope.isCapable = function (permCheck) {
        var matches = false;

        permCheck.forEach(function (check, i) {
            $localStorage.user.capabilities.forEach(function (balance, i) {
                if (check == balance) {
                    matches = true;
                };
            });
        });

        return matches;
    };

    var removeLocation = function () {
        $localStorage.locationId = null;
    };

    var removeUser = function () {
        $cookies.remove('IsAuthenticated');
        $cookies.remove('IsAuthenticated', { path: '/' });
        $localStorage.user = null;
    };

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        $rootScope.scannerEnabled = false;

        if (!$localStorage.locationId && toState.name != 'siteSelect') {
            event.preventDefault();
            removeLocation();
            removeUser();
            $state.go('siteSelect');
            return;
        } else if (!$localStorage.locationId && toState.name == 'siteSelect') {
            removeLocation();
            removeUser();
            return;
        } else if (!$cookies.get('IsAuthenticated') && toState.name != 'app.login') {
            removeUser();
            if (toState.auth) {
                event.preventDefault();
                $state.go('app.login', { backTo: toState.name });
                return;
            } else {
                return;
            }
        } else if (!$cookies.get('IsAuthenticated') && toState.name == 'app.login') {
            removeUser();
            return;
        };

        if ($localStorage.user != null) {
            var expireDate = new Date();
            expireDate.setMinutes(expireDate.getMinutes() + 30);
            $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
        };

        if (toState.restricted && !$rootScope.isCapable(toState.required)) {
            event.preventDefault();
            $state.go('app.unauthorized', { site: toState.data.pageTitle });
        };

        if (fromState.name == 'app.fcPerfReview') {
            var answer = confirm("Are you sure you want to leave this page?")
            if (!answer) {
                event.preventDefault();
            };
        };

    });

    // inject service and provide on rootScope
    $rootScope.PageTitleService = PageTitleService;

    // set up state change listener
    $rootScope.$on('$stateChangeSuccess', PageTitleService.onStateChange);

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $state.current = toState;
    });
})

.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q, $cookies, $sessionStorage, $injector, $localStorage, $rootScope) {
        return {
            'request': function (config, event) {

                var $state = $injector.get('$state');

                if (!$cookies.get('IsAuthenticated') && $state.current.auth) {
                    $state.go('logoff', { backTo: $state.current.name });
                } else if (!$cookies.get('IsAuthenticated') && !$state.current.auth) {

                } else if ($cookies.get('IsAuthenticated') == null && $localStorage.user != null) {
                    if ($localStorage.locationId != 7) {
                        var expireDate = new Date();
                        expireDate.setMinutes(expireDate.getMinutes() + 30);
                        $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                        $localStorage.portalExpireTime = expireDate;
                    } else {
                        var expireDate = new Date();
                        expireDate.setMinutes(expireDate.getMinutes() + 30);
                        $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                        $cookies.put('portalUsername', $localStorage.windowsUsername, { path: '/', expires: expireDate });
                        $localStorage.portalExpireTime = expireDate;
                    }

                } else if ($cookies.get('IsAuthenticated') != null && $localStorage.user == null) {
                    $state.go('logoff', { backTo: $state.current.name });
                } else if ($cookies.get('IsAuthenticated') != null) {
                    var expireDate = new Date();
                    expireDate.setMinutes(expireDate.getMinutes() + 30);
                    $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                    $localStorage.portalExpireTime = expireDate;
                };
                return config;
            }
        };
    });
})

//#region ZuPortal_CONFIG
.constant('ZuPortal_CONFIG', {
    fcLocation: null,
    locationsId: {
        1: "RNO2",
        2: "CMH",
        3: "ABE",
        4: "RNO2_ZBR",
        5: "CMH_ZBR",
        6: "ABE_ZBR",
        7: "CS",
        8: "CMH_IT"
    },
    locationsName: {
        RNO2: "1",
        CMH: "2",
        ABE: "3",
        RNO2_ZBR: "4",
        CMH_ZBR: "5",
        ABE_ZBR: "6",
        CS: "7",
        CMH_IT: "8"
    },
    locationNames: [
        {
            displayName: 'NV Core',
            realName: 'RNO2'
        },
        {
            displayName: 'OH Core',
            realName: 'CMH'
        },
        {
            displayName: 'PA Core',
            realName: 'ABE'
        },
        {
            displayName: 'NV Zebra',
            realName: 'RNO2_ZBR'
        },
        {
            displayName: 'OH Zebra',
            realName: 'CMH_ZBR'
        },
        {
            displayName: 'PA Zebra',
            realName: 'ABE_ZBR'
        },
        {
            displayName: 'CS',
            realName: 'CS'
        },
        {
            displayName: 'OH IT',
            realName: 'CMH_IT'
        }
    ],
    locationsTZ: {
        1: 0,
        2: 3,
        3: 0.125,
        4: 0,
        5: 0.125,
        6: 0.125
    },
    weekDays: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],
    workDays: {
        1: {
            A: ["Sunday", "Monday", "Tuesday", "Wednesday"],
            B: ["Wednesday", "Thursday", "Friday", "Saturday"],
            C: ["Monday", "Tuesday", "Thursday", "Friday"],
            D: ["Monday", "Tuesday", "Wednesday", "Thursday"],
            F: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            G: ["Tuesday", "Wednesday", "Thursday", "Friday"]
        },
        2: {
            A: ["Sunday", "Monday", "Tuesday", "Wednesday"],
            B: ["Wednesday", "Thursday", "Friday", "Saturday"],
            C: ["Monday", "Tuesday", "Thursday", "Friday"],
            D: ["Monday", "Tuesday", "Wednesday", "Thursday"],
            E: ["Thursday", "Friday", "Saturday", "Sunday"],
            F: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            G: ["Tuesday", "Wednesday", "Thursday", "Friday"]
        },
        3: {
            A: ["Sunday", "Monday", "Tuesday", "Wednesday"],
            B: ["Wednesday", "Thursday", "Friday", "Saturday"],
            C: ["Monday", "Tuesday", "Thursday", "Friday"],
            D: ["Monday", "Tuesday", "Wednesday", "Thursday"],
            E: ["Thursday", "Friday", "Saturday", "Sunday"],
            F: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            G: ["Tuesday", "Wednesday", "Thursday", "Friday"]
        }
    },
    offDays: {
        1: {
            A: ["Thursday", "Friday", "Saturday"],
            B: ["Sunday", "Monday", "Tuesday"],
            C: ["Wednesday", "Saturday", "Sunday"],
            D: ["Friday", "Saturday", "Sunday"],
            F: ["Saturday", "Sunday"],
            G: ["Saturday", "Sunday", "Monday"]
        },
        2: {
            A: ["Thursday", "Friday", "Saturday"],
            B: ["Sunday", "Monday", "Tuesday"],
            C: ["Wednesday", "Saturday", "Sunday"],
            D: ["Friday", "Saturday", "Sunday"],
            E: ["Monday", "Tuesday", "Wednesday"],
            F: ["Saturday", "Sunday"],
            G: ["Saturday", "Sunday", "Monday"]
        },
        3: {
            A: ["Thursday", "Friday", "Saturday"],
            B: ["Sunday", "Monday", "Tuesday"],
            C: ["Wednesday", "Saturday", "Sunday"],
            D: ["Friday", "Saturday", "Sunday"],
            E: ["Monday", "Tuesday", "Wednesday"],
            F: ["Saturday", "Sunday"],
            G: ["Saturday", "Sunday", "Monday"]
        }
    },
    sortOptions: [
        {
            sortLetter: "A",
            sortName: "FedEx",
            shipperName: "FedExEMT"
        }, {
            sortLetter: "B",
            sortName: "UPS Innovation",
            shipperName: "UPS Mail Innovations"
        }, {
            sortLetter: "C",
            sortName: "UPS Ground",
            shipperName: "UPSEMT"
        }, {
            sortLetter: "D",
            sortName: "USPS Priority",
            shipperName: "USPS EMT"
        }, {
            sortLetter: "M",
            sortName: "OnTrac",
            shipperName: "OnTrac EMT"
        }, {
            sortLetter: "S",
            sortName: "Lasership",
            shipperName: "LaserShip EMT"
        }, {
            sortLetter: "T",
            sortName: "Borderlinx",
            shipperName: "Borderlinx"
        }, {
            sortLetter: "X",
            sortName: "Purolator",
            shipperName: "Purolator"
        }, {
            sortLetter: "Y",
            sortName: "PurePost",
            shipperName: "PuroPost EMT"
        }, {
            sortLetter: "Z",
            sortName: "DHL",
            shipperName: "DHL GlobalMail"
        },
     {
         sortLetter: "Q",
         sortName: "Supplies",
         shipperName: "Supplies"
     }
    ],
    boolean: {
        yes: 1,
        no: 0,
        Yes: 1,
        No: 0,
        YES: 1,
        NO: 0
    },
    OBDockStatus: {
        1: 'activeTrailers',
        2: 'stoppedTrailers',
        3: 'manifestedTrailers'
    },
    OBDockTDRStatus: [
        'No',
        'Yes'
    ],
    OBDockButtons: {
        depart: '<img id="departTrailerButton" class="dialogButton" title="Depart Trailer" src="/Content/images/depart.png" style="cursor: pointer" value=\'JSON\'/>',
        edit: '<img id="editTrailerButton" class="dialogButton" title="Edit Trailer" src="/Content/images/edit.png" style="cursor: pointer" value=\'JSON\'/>',
        manifest: '<img id="manifestTrailerButton" class="dialogButton" title="Manifest Trailer" src="/Content/images/clipboard.png" style="cursor: pointer" value=\'JSON\'/>',
        play: '<img id="playTrailerButton" class="playButton" title="Play Trailer" src="/Content/images/play.png" style="cursor: pointer" value=\'JSON\'/>',
        remove: '<img id="removeTrailerButton" class="dialogButton" title="Remove Trailer" src="/Content/images/redx.png" style="cursor: pointer" value=\'JSON\'/>',
        stop: '<img id="stopTrailerButton" class="stopButton" title="Stop Trailer" src="/Content/images/stop.png" style="cursor: pointer" value=\'JSON\'/>'
    },
    ZuDash_URLS: {
        APIURL: "http://zuportal.corp.zulily.com:6174/",
        OB_Dock_ManifestURL: {
            1: "http://rno-internal.rno.corp.zulily.com/fulfillment/shipping/outbound_manif_closure.aspx",
            2: "http://cbs-internal.corp.zulily.com/fulfillment/shipping/outbound_manif_closure.aspx"
        }
    },
    ZuDash_API_Options: {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
})
//#endregion

.constant('SCAN_LOG_PREFIX', 'SCAN')

.constant('SCANNER_KEY_CODES', [36, 8364, 13])

.constant('SCAN_EVENT', 'scan-event')

.controller('MainPage', function ($scope, $rootScope, $localStorage, $sessionStorage, $cookies, $state, $http, blockUI, ZuPortal_CONFIG, $httpParamSerializer, $interval) {
    blockUI.start();

    $scope._ = _;

    $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/navigation_categories.aspx', $httpParamSerializer({
        locationId: $localStorage.locationId,
    }), ZuPortal_CONFIG.ZuDash_API_Options)
        .then(function (res) {
            blockUI.stop();
            $scope.navigationCategories = res.data;
            $localStorage.nav = res.data;
        }, function () {
            blockUI.stop();
            if (angular.isArray($localStorage.nav)) {
                $scope.navigationCategories = $localStorage.nav;
            };
        });

    $scope.isInArray = function (value, array) {
        return array.indexOf(value) > -1;
    };

    var employeeInfoUrls = {
        1: 'http://rno-ui.rno.corp.zulily.com:9050/user/#/userDetail/',
        2: 'http://cbs-ui.corp.zulily.com:9050/user/#/userDetail/',
        3: 'http://abe-ui.abe.corp.zulily.com:9050/user/#/userDetail/',
        4: 'http://zbrrno-ui.rno.corp.zulily.com:9050/user/#/userDetail/',
        5: 'http://zbrcbs-ui.zebra.corp.zulily.com:9050/user/#/userDetail/',
        6: 'http://zbrabe-ui.abe.corp.zulily.com/:9050/user/#/userDetail/'
    }

    $scope.$local = $localStorage;

    $scope.$root = $rootScope;

    $scope.selectedSite = ZuPortal_CONFIG.locationsId[$localStorage.locationId];

    $rootScope.editUserLink = null;

    $rootScope.picLink = null;

    if ($localStorage.user != null) {
        $rootScope.editUserLink = employeeInfoUrls[$localStorage.locationId] + $localStorage.user.id;
        $rootScope.picLink = 'http://zuportal.corp.zulily.com/images/' + $localStorage.locationId + '/' + $localStorage.user.loginName + '.jpg';
    };

    var timer = $interval(function () {
        if ($localStorage.user) {
            var now = new Date();
            var auth = new Date($localStorage.portalExpireTime);
            var expires = (Math.abs(auth.getTime() - now.getTime()) / 1000 / 60).toString();

            if (auth <= now) {
                if ($cookies.get('IsAuthenticated') != null) {
                    var expireDate = new Date();
                    expireDate.setMinutes(expireDate.getMinutes() + 30);
                    $localStorage.portalExpireTime = expireDate;
                    return;
                } else {
                    $scope.expires = 'Expired!';
                    return;
                }
            };

            if (expires.indexOf('.') > -1) {
                var split = expires.split('.');
                var minutes = split[0];
                var seconds = (+('0.' + split[1]) * 60).toFixed(0).toString();
                $scope.expires = 'Timeout: ' + (+minutes < 10 ? '0' + minutes : minutes) + ':' + (+seconds < 10 ? '0' + seconds : seconds);
            } else {
                $scope.expires = 'Timeout: ' + (+expires < 10 ? '0' + expires : expires) + ':00';
            }
        };
    }, 1000);


    $scope.isCapable = function (permCheck) {
        var matches = false;

        permCheck.forEach(function (check, i) {
            $localStorage.user.capabilities.forEach(function (balance, i) {
                if (check == balance) {
                    matches = true;
                }
            })
        });

        return matches;
    };

    $scope.stage = location.port || false;

    $scope.$state = $state;

    $rootScope.userAgent = {
        chrome: navigator.userAgent.indexOf("Chrome") > -1,
        firefox: navigator.userAgent.indexOf("Firefox") > -1,
        edge: window.navigator.userAgent.indexOf("Edge") > -1,
        opera: window.navigator.userAgent.indexOf("OPR") > -1,
        IE: window.navigator.userAgent.indexOf("Trident") > -1
    };

    if ($rootScope.userAgent.IE || $rootScope.userAgent.edge) {
        alert('The apps on this website are not supported by IE OR Edge.\nPlease use Chrome or Firefox');
    };

})

.directive('clickKeepAlive', function ($cookies, $localStorage) {
    return function (scope, element, attrs) {
        element.bind('click', function (e) {
            if ($cookies.get('IsAuthenticated')) {
                var expireDate = new Date();
                expireDate.setMinutes(expireDate.getMinutes() + 30);
                $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                $localStorage.portalExpireTime = expireDate;
            };
        });
        element.bind('keyup', function (e) {
            if ($cookies.get('IsAuthenticated')) {
                var expireDate = new Date();
                expireDate.setMinutes(expireDate.getMinutes() + 30);
                $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                $localStorage.portalExpireTime = expireDate;
            };
        });
    };
})

.controller('siteSelect', function ($scope, $cookies, $localStorage, $state, $sessionStorage, ZuPortal_CONFIG) {

    $cookies.remove('Location');
    $cookies.remove('Location', { path: '/' });
    $localStorage.locationId = null;
    $cookies.remove('IsAuthenticated');
    $cookies.remove('IsAuthenticated', { path: '/' });
    $cookies.remove('portalUserId');
    $cookies.remove('portalUserId', { path: '/' });
    $cookies.remove('portalUsername');
    $cookies.remove('portalUsername', { path: '/' });
    $cookies.remove('roles');
    $cookies.remove('roles', { path: '/' });
    $localStorage.user = null;

    $scope.locationNames = ZuPortal_CONFIG.locationNames;

    $scope.locationsName = ZuPortal_CONFIG.locationsName;

    $scope.siteSelector = function (site) {
        console.log(site);
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 365);
        $cookies.put('Location', $scope.locationsName[site], { path: '/', expires: expireDate });
        $localStorage.locationId = Number($scope.locationsName[site]);
        $state.go('app.login');
    };
})

.controller('login', function ($scope, $cookies, $localStorage, $sessionStorage, $state, $http, $rootScope, $httpParamSerializer, blockUI, $stateParams, ZuPortal_CONFIG) {

    if ($cookies.get('portalUserId')) {
        $cookies.remove('IsAuthenticated');
        $cookies.remove('IsAuthenticated', { path: '/' });
        $localStorage.user = null;
    }

    $rootScope.editUserLink = null;

    $rootScope.picLink = null;

    $scope.loginSite = ZuPortal_CONFIG.locationsId[$localStorage.locationId];

    $scope.loginInfo = {
        username: '',
        password: '',
        badge: ''
    };

    $scope.login = function (type) {
        blockUI.start();

        switch (type) {
            case 1:
                if ($scope.loginInfo.username === '') {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Username Required!'
                    };
                    blockUI.stop();
                    return;
                } else if ($scope.loginInfo.password === '') {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Password Required!'
                    };
                    blockUI.stop();
                    return;
                } else {
                    $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/Auth.aspx', $httpParamSerializer({
                        locationId: $localStorage.locationId,
                        userName: $scope.loginInfo.username,
                        password: $scope.loginInfo.password,
                        windows: false
                    }), ZuPortal_CONFIG.ZuDash_API_Options)
                        .then(function (data) {
                            blockUI.stop();
                            $localStorage.user = data.data;
                            var expireDate = new Date();
                            expireDate.setMinutes(expireDate.getMinutes() + 30);
                            $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                            $localStorage.portalExpireTime = expireDate;
                            if ($stateParams.backTo != null) {
                                $state.go($stateParams.backTo);
                            } else {
                                $state.go('app.home');
                            }
                        }, function (error) {
                            blockUI.stop();
                            $rootScope.changeResponse = {
                                failure: true,
                                message: 'Incorrect Username or Password!'
                            };
                        });
                }
                break;
            case 2:
                if ($scope.loginInfo.badgeId === '') {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Badge ID Required!'
                    };
                    blockUI.stop();
                    return;
                } else {
                    $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/Auth.aspx', $httpParamSerializer({
                        locationId: $localStorage.locationId,
                        badgeId: $scope.loginInfo.badge,
                        windows: false
                    }), ZuPortal_CONFIG.ZuDash_API_Options)
                        .then(function (data) {
                            blockUI.stop();
                            $localStorage.user = data.data;
                            var expireDate = new Date();
                            expireDate.setMinutes(expireDate.getMinutes() + 30);
                            $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                            $localStorage.portalExpireTime = expireDate;
                            if ($stateParams.backTo != null) {
                                $state.go($stateParams.backTo);
                            } else {
                                $state.go('app.home');
                            }
                        }, function (error) {
                            blockUI.stop();
                            $rootScope.changeResponse = {
                                failure: true,
                                message: 'Invalid Badge ID!'
                            };
                        });
                }
                break;
            case 3:
                if ($scope.loginInfo.username === '') {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Username Required!'
                    };
                    blockUI.stop();
                    return;
                } else if ($scope.loginInfo.password === '') {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Password Required!'
                    };
                    blockUI.stop();
                    return;
                } else {
                    switch ($localStorage.locationId) {
                        case 7:
                        case 8:
                            $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/Auth.aspx', $httpParamSerializer({
                                locationId: $localStorage.locationId,
                                userName: $scope.loginInfo.username,
                                password: $scope.loginInfo.password,
                                windows: true
                            }), ZuPortal_CONFIG.ZuDash_API_Options)
                                .then(function (data) {
                                    data = data.data;
                                    blockUI.stop();
                                    var abc = 'abcdefghijklmnopqrstuvwxyz';
                                    if (data.Success) {
                                        data = data.Success;
                                        var id = data.username.toLowerCase().split('');
                                        id.forEach(function (l, i) {
                                            id[i] = Number(abc.indexOf(l) <= 9 ? '0' + abc.indexOf(l) : abc.indexOf(l));
                                        });
                                        id = id.join('');
                                        $localStorage.user = {
                                            loginName: data.username,
                                            id: id,
                                            firstName: data.firstName,
                                            lastName: data.lastName,
                                            capabilities: data.groups,
                                            windows: true
                                        };
                                        var expireDate = new Date();
                                        expireDate.setMinutes(expireDate.getMinutes() + 30);
                                        $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                                        $localStorage.portalExpireTime = expireDate;
                                        if ($stateParams.backTo != null) {
                                            $state.go($stateParams.backTo);
                                        } else {
                                            $state.go('app.home');
                                        }
                                    } else {
                                        $rootScope.changeResponse = {
                                            failure: true,
                                            message: data.Error
                                        };
                                    }
                                }, function (error) {
                                    blockUI.stop();
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Incorrect Username/ Password combo!'
                                    };
                                });
                            break;
                        default:
                            $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/Auth.aspx', $httpParamSerializer({
                                locationId: $localStorage.locationId,
                                userName: $scope.loginInfo.username,
                                password: $scope.loginInfo.password,
                                windows: true
                            }), ZuPortal_CONFIG.ZuDash_API_Options)
                                .then(function (data) {
                                    data = data.data;
                                    blockUI.stop();
                                    if (data.Success) {
                                        data = data.Success[0];
                                        $localStorage.user = {
                                            id: data.wmsid,
                                            loginName: data.wmsusername,
                                            firstName: data.firstname,
                                            lastName: data.lastname,
                                            kronosId: data.kronosId,
                                            capabilities: data.capabilities.length ? data.capabilities.split(',') : [],
                                            windows: true
                                        };
                                        var expireDate = new Date();
                                        expireDate.setMinutes(expireDate.getMinutes() + 30);
                                        $cookies.put('IsAuthenticated', 1, { path: '/', expires: expireDate });
                                        $localStorage.portalExpireTime = expireDate;
                                        if ($stateParams.backTo != null) {
                                            $state.go($stateParams.backTo);
                                        } else {
                                            $state.go('app.home');
                                        }
                                    } else {
                                        $rootScope.changeResponse = {
                                            failure: true,
                                            message: data.Error
                                        };
                                    }
                                }, function (error) {
                                    blockUI.stop();
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Incorrect Username/ Password combo!'
                                    };
                                });

                    }
                }
                break;


        }
    };
})

.filter('sanitize', ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}])

.filter('lbs', function () {
    return function (lbs) {
        if (lbs == null || lbs == 'null') {
            return '';
        } else {
            return lbs + ' lbs.';
        }
    };
})

.filter('splitCaps', function () {
    return function (str) {
        if (str.indexOf(' ') > -1) {
            return str.trim().replace(/([a-z])([A-Z])/g, "$1 $2");
        } else {
            return str.replace(/([a-z])([A-Z])/g, "$1 $2");
        };
    };
})

.filter('yearsAndDays', function () {
    return function (days) {
        days = days / 365;
        if (days.toString().indexOf('.') > -1) {
            var years = days.toString().split('.')[0];
            var newDays = Math.floor(365 * (days - Number(years)));
            return years + ' Year(s) and ' + newDays.toString() + ' Day(s)'
        } else {
            return days.toString() + ' Year(s) and 0 Day(s)'
        };
    };
})

.filter('sumArray', function () {
    return function (arr) {
        var total = 0;
        arr.split(',').forEach(function (v, k) {
            total += Number(v);
        });
        if (total.toString().indexOf('.') > -1 || total < 1) {
            return total.toPrecision(4);
        } else {
            return total;
        }
    };
})

.filter('divideArray', function () {
    return function (arr1, arr2) {
        var total = 0;
        var arr1Total = 0;
        var arr2Total = 0;
        arr1.split(',').forEach(function (v, k) {
            arr1Total += Number(v);
        });
        arr2.split(',').forEach(function (v, k) {
            arr2Total += Number(v);
        });
        total = arr1Total / arr2Total;
        if (total.toString().indexOf('.') > -1 || total < 1) {
            return total.toPrecision(4);
        } else {
            return total;
        }
    };
})

.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);

        for (var i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    };
})

.directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
})

.directive('bounceInMessage', function () {
    return {
        restrict: 'E',
        scope: {
            changeresponse: '='
        },
        link: function (scope, element, attrs) {
            scope.$watch("changeresponse.success", function (t, f) {
                if (t) {
                    setTimeout(function () {
                        scope.changeresponse.success = false;
                    }, 1000);
                };
            });
            scope.$watch("changeresponse.failure", function (t, f) {
                if (t) {
                    setTimeout(function () {
                        scope.changeresponse.failure = false;
                    }, 1000);
                };
            });
            scope.$watch("changeresponse.warning", function (t, f) {
                if (t) {
                    setTimeout(function () {
                        scope.changeresponse.warning = false;
                    }, 1000);
                };
            });
        },
        template: '<style>.failure,.success,.warning{padding:10px;text-align:center;border-radius:5px;width:400px;font-size:20px;font-weight:700;display:block!important}.success{color:green;background-color:#baffc9}.failure{color:red;background-color:#ffb3ba}.warning{color:#948e16;background-color:#e6e331}</style><div ng-class="{\'success animated bounceInDown\': changeresponse.success, \'failure animated bounceInDown\': changeresponse.failure, \'warning animated bounceInDown\': changeresponse.warning}" style="position: absolute; top: 10px; right: 10px; display: none" ng-bind-html="changeresponse.message | sanitize"></div>'
    };
})

.directive('appFilereader', function ($q) {
    /*
    made by elmerbulthuis@gmail.com WTFPL licensed
    Forked from http://plnkr.co/CMiHKv2BEidM9SShm9Vv
    */
    var slice = Array.prototype.slice;
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return;
            ngModel.$render = function () { }
            element.bind('change', function (e) {
                var element = e.target;
                if (!element.value) return;
                element.disabled = true;
                $q.all(slice.call(element.files, 0).map(readFile))
                .then(function (values) {
                    if (element.multiple) ngModel.$setViewValue(values);
                    else ngModel.$setViewValue(values.length ? values[0] : null);
                    element.value = null;
                    element.disabled = false;
                });
                function readFile(file) {
                    var deferred = $q.defer();
                    var reader = new FileReader()
                    reader.onload = function (e) {
                        deferred.resolve(e.target.result);
                    }
                    reader.onerror = function (e) {
                        deferred.reject(e);
                    }
                    reader.readAsDataURL(file);
                    return deferred.promise;
                }
            });
        }
    };
})

.directive('kioskLogout', function ($cookies, $state, $rootScope) {
    return {
        restrict: 'E',
        scope: {},
        template: '<span style="font-size: 1vw; font-weight: bold; font-style: italic;color: white;margin-right: 20px;">{{ fullName }}</span><button class="logoutButton btn btn-danger" onclick="return false;" ng-click="kioskLogout()" style="font-size: 1vw">Log Off Kiosk</button>',
        link: function (scope, element, attrs) {
            scope.fullName = JSON.parse($cookies.get('KioskUserInfo'))[0].fullName;
            scope.kioskLogout = function () {
                $cookies.remove('KioskUserInfo');
                $cookies.remove('KioskUserInfo', { path: '/' });
                $rootScope.kioskLoggedIn = false;
                $state.go('app.kiosk.kioskLogin');
            };
        }
    };
})

.directive('wmsScanContainer', function (ScanService, SCANNER_KEY_CODES, $document, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            visible: "=visible",
            inputClass: "@"
        },
        template: '<input type="text" tabindex="0"/>', //;
        link: function (scope, element) {
            var debouncedDispatch = ScanService.dispatch;
            var input = element.find('input')[0];

            // if the input is to be hidden, apply a style to make it invisible and off screen
            if (!scope.visible) {
                element.find('input').attr('style', 'width:10px;background: #ccc;position:absolute;z-index:100;opacity:0');
            }

            // if a class is provided then apply it to the input
            if (scope.inputClass) {
                element.find('input').attr('class', scope.inputClass);
            }

            $rootScope.$watch('scannerEnabled', function (n, o) {
                if (n) {
                    $document.bind('keyup', function (event) {
                        var code = event.which || event.keyCode || event.charCode || input.value.slice(-1).charCodeAt();
                        if (SCANNER_KEY_CODES.indexOf(code) !== -1) {
                            input.blur();
                        }
                    });

                    $document.bind('keydown keypress', function (event) {
                        var code = event.which || event.keyCode || event.charCode || input.value.slice(-1).charCodeAt();

                        if (document.activeElement !== input) {
                            input.focus();
                        }

                        if (SCANNER_KEY_CODES.indexOf(code) !== -1) {
                            var scanData = input.value.replace('â‚¬', '');
                            input.value = '';

                            if (scanData.length > 0) {
                                debouncedDispatch(scanData);
                            }
                        }
                    });
                } else {
                    $document.unbind('keyup');
                    $document.unbind('keydown keypress');
                }
            }, true)
        }
    };
})

.service('ScanService', function ($rootScope, SCAN_EVENT, SCAN_LOG_PREFIX, $log) {
    return {
        dispatch: function (barcode) {
            var scan = { barcode: barcode, timestamp: Date.now() };
            $log.info(SCAN_LOG_PREFIX, SCAN_EVENT, scan);
            $rootScope.$broadcast(SCAN_EVENT, scan);
        }
    };
})

.factory('csvParser', function () {
    return {
        desiredFormat: 'data:application/vnd.ms-excel;base64',

        convert: function (strData, strDelimiter) {

            strDelimiter = (strDelimiter || ",");

            var objPattern = new RegExp(
                (
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );


            var arrData = [[]];

            var arrMatches = null;


            while (arrMatches = objPattern.exec(strData)) {

                var strMatchedDelimiter = arrMatches[1];

                if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                    arrData.push([]);
                };

                var strMatchedValue;

                if (arrMatches[2]) {

                    strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                        );

                } else {

                    strMatchedValue = arrMatches[3];

                }

                arrData[arrData.length - 1].push(strMatchedValue);
            }

            var array = (arrData);

            var objArray = [];

            for (var i = 1; i < array.length; i++) {
                objArray[i - 1] = {};

                for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                    var key = array[0][k].split(' ').join('').split('\'').join('').split('\#').join('');

                    objArray[i - 1][key] = array[i][k].split('\'').join('');
                }
            }

            var json = JSON.stringify(objArray);

            var str = json.replace(/},/g, "},\r\n");

            return str;
        }

    }
})

.factory('searchUPC', function ($http, ZuPortal_CONFIG) {
    return {
        get: function (upc) {
            if (upc.length == 13) {
                return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/searchUPC.aspx', { params: { upc: upc } })
                    .then(function (data) {
                        return data.data;
                    }, function (err) {
                        return err.data;
                    });
            } else {
                upc = upc.split('');
                for (var i = 1; i <= 13; i++) {
                    if (upc.length != 13) {
                        upc.unshift('0');
                    }
                };
                upc = upc.join('');
                return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/searchUPC.aspx', { params: { upc: upc } })
                    .then(function (data) {
                        return data.data;
                    }, function (err) {
                        return err.data;
                    });
            };
        }
    };
});