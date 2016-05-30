var fs = require ("fs");
var xlsx = require('xlsx');
var ipc = require('electron').ipcRenderer;
angular.module('BI', ['ngSanitize', 'ngAnimate', 'ui.router', 'BI.services', 'BI.controllers', 'BI.filters', 'BI.Mongo'])

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