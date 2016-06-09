var fs = require ("fs");
var xlsx = require('xlsx');
var ipc = require('electron').ipcRenderer;
angular.module('BI', ['ngSanitize', 'nvd3', 'angularResizable', 'ui.router', 'BI.services', 'BI.controllers', 'BI.filters', 'BI.Mongo'])

.config(function($stateProvider, $urlRouterProvider){

    // For any unmatched url, send to /route1
    $urlRouterProvider.otherwise("/bi")


    $stateProvider
        .state( "bi", {
            url: '/bi',
            controller: 'mainCtrl',
            views: {
                "": {
                    templateUrl: 'templates/start-page.html'
                },
                'bi-adress': {
                    templateUrl: 'templates/bi_adress.html',
                    controller: 'usersCtrl'
                },
                'user-list': {
                    templateUrl: 'templates/userlist.html',
                    controller: 'usersCtrl'
                },
                'info': {
                    templateUrl: 'templates/details.html',
                    controller: 'usersCtrl'
                },
                'graphs': {
                    templateUrl: 'templates/graphs.html',
                    controller: 'usersCtrl'
                },
                'add_user': {
                    templateUrl: 'templates/add_user.html',
                    controller: 'usersCtrl'
                },
                'learningNNet': {
                    templateUrl: 'templates/learningNNet.html',
                    controller: 'learningNNetCtrl'
                },
                'kMeans': {
                    templateUrl: 'templates/k-means.html',
                    controller: 'learningNNetCtrl'      //kMeansCtrl
                }
            }
        })
})


//
//$stateProvider
//    .state( "app", {
//        name: 'app',
//        url: '/bi',
//        templateUrl: 'templates/start-page.html',
//        views: {
//            'fileList': {
//                name: 'firstList',
//                template: '<h1>hello</h1>',
//                templateUrl: 'templates/file-list.html',
//                controller: 'fileListCtrl'
//            }
//        }
//    })
//
//    .state('tab', {
//        templateUrl: './templates/tab.html',
//        controller: 'tabCtrl'
//    })
//    .state('option', {
//        templateUrl: './templates/opt.html',
//        controller: 'optionCtrl'
//    })
//    .state('workspace', {
//        template: './templates/workspace.html',
//        controller: 'workspaceCtrl'
//    });