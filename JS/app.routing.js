angular.module('ZuPortal.Routing', [])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/nav.html',
            controller: 'MainPage',
            restricted: false,
            auth: false
        })

        .state('app.home', {
            url: '/home',
            data: { pageTitle: 'Home' },
            templateUrl: 'templates/home.html',
            controller: 'MainPage',
            restricted: false,
            auth: true
        })

        .state('siteSelect', {
            url: '/siteSelect',
            data: { pageTitle: 'Site Select' },
            templateUrl: 'templates/siteSelect.html',
            controller: 'siteSelect',
            restricted: false,
            auth: false
        })

        .state('app.login', {
            url: '/login',
            data: { pageTitle: 'Login' },
            params: {
                backTo: null
            },
            templateUrl: 'templates/login.html',
            controller: 'login',
            restricted: false,
            auth: false
        })

        .state('logoff', {
            url: '/logoff',
            params: {
                backTo: null
            },
            template: '<h2 style="color:grey;margin:0">Redirecting...</h2>',
            controller: function ($state, $cookies, $localStorage, $timeout, $stateParams) {
                $cookies.remove('IsAuthenticated');
                $cookies.remove('IsAuthenticated', { path: '/' });
                $cookies.remove('portalUserId');
                $cookies.remove('portalUserId', { path: '/' });
                $cookies.remove('portalUsername');
                $cookies.remove('portalUsername', { path: '/' });
                $cookies.remove('roles');
                $cookies.remove('roles', { path: '/' });
                $localStorage.user = null;
                $timeout(function () {
                    if ($stateParams.backTo != null) {
                        $state.go('app.login', { backTo: $stateParams.backTo });
                    } else {
                        $state.go('app.login', { backTo: null });
                    }
                }, 1000);
            },
            restricted: false,
            auth: false
        })

        .state('app.404', {
            url: '/404',
            data: { pageTitle: 'Page not found' },
            templateUrl: 'templates/404.html',
            restricted: false,
            auth: true
        })

        .state('app.unauthorized', {
            url: '/unauthorized/:site',
            data: { pageTitle: 'Unauthorized' },
            controller: function ($scope, $stateParams) {
                $scope.site = null;
                if ($stateParams.site) {
                    $scope.site = $stateParams.site;
                };
            },
            templateUrl: 'templates/unauthorized.html',
            restricted: false,
            auth: true
        })

        .state('app.pdf', {
            url: '/pdf/:link',
            data: { pageTitle: 'PDF Viewer' },
            controller: function ($scope, $stateParams) {
                $scope.link = null;
                if ($stateParams.link) {
                    $scope.link = $stateParams.link;
                };
            },
            templateUrl: 'templates/pdf.html',
            restricted: false,
            auth: true
        });

    $urlRouterProvider.otherwise(function ($injector, $location) {

        var $state = $injector.get('$state');

        $state.go('app.404', null, {
            location: false
        });

    });

});