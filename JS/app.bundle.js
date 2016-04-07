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