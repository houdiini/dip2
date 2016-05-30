var fs = require('fs');


angular.module('BI.controllers', [])

.controller('mainCtrl', function($scope, $rootScope){
	    $rootScope.activeUser = undefined;
        $rootScope.begin = 0;
})

.controller('usersCtrl', function($scope, Mongo, $rootScope){
    $scope.db = {
        url: 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users',
		users: [],
    }; 


    var db = JSON.parse(fs.readFileSync('bd.txt'));
    $scope.db.users = db;

    $scope.sum = function(id){
    	var am = $scope.db.users[id].amounts;
    	var sum = 0;
    	for (i = 0, l = am.length; i < l; i++) {
    		sum += am[i]
    	}
    	console.log(sum);
    	return sum;
    }

    $scope.nav = function (direct) {
        if (direct === 'next') {
            if ($rootScope.begin+100 < $scope.db.users.length)
                $rootScope.begin += 100;
        } else {
            if ($rootScope.begin - 100 > 0)
                $rootScope.begin -= 100;
        }
    };

    $scope.getDate = function(time) {
        console.log(time);
        var t = new Date(time);
        var str = t.getFullYear() + '/' + t.getMonth() + '/' + t.getDate();
        return str;
    }

    $scope.extraInfo = function(id) {
    	$rootScope.activeUser = id;
    }

    $scope.openDB = function(){
    	console.log('click');
    	Mongo.findAll(function(docs){
    		console.log(docs);
    		fs.writeFile('bd.txt', JSON.stringify(docs));
    		$scope.db.users = docs;
    	});
    }
})
