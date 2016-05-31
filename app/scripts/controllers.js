var fs = require('fs');


angular.module('BI.controllers', [])

.controller('mainCtrl', function($scope, $rootScope){
	    $rootScope.activeUser = undefined;
        $rootScope.begin = 0;
        $rootScope.graph_flag = 0;
        $rootScope.db = {
            url: 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users',
            users: []
        }; 
        $rootScope.add_user_flag = 0;



        $scope.toggle_add_user_flag = function(){
            $rootScope.add_user_flag = ! $rootScope.add_user_flag;
        }
})

.controller('usersCtrl', function($scope, Mongo, $rootScope){


    $scope.$on("angular-resizable.resizeEnd", function (event, args) {
                console.log(args);
                $scope.graphs[args.id*1].options.chart.height = args.height -60;
                console.log($scope.graphs[args.id]);
            });


    try {
        var db = JSON.parse(fs.readFileSync('./bd.txt'));
        $rootScope.db.users = db;
    } catch (e) { console.log(e) }

    $scope.settings = false;
    $scope.add_graph = false;

    $scope.add = {
        param: {
            y: 'income',
            x: 'age'
        },
        graph: {
            data: [],
            options: {}
        }
    }

    $scope.graphs = [];

    $scope.save_graph = function() {
        $scope.add_graph = false;
        var o = _.clone($scope.add.graph);
        $scope.graphs.push(o);
    }

    $scope.$watch(function(){return $scope.add.param.y + $scope.add.param.x}, function(p) {
        var workArray = _.map($rootScope.db.users, function(num){
            num.amount = Math.round(_.reduce(num.amounts, function(m, n){return n+m}, 0) / 1000) * 1000;
            num.creditAmount = num.credits.amount;
            num.income = Math.round(num.income /500)*500;
            return num
        });
        
        var labels = _.sortBy(_.union(_.pluck(workArray, $scope.add.param.x)));
        var byLabels = _.groupBy( workArray, $scope.add.param.x );

        var data = [];
        var options = {
                chart: {
                    type: 'lineChart',
                    height: 200,
                    margin: {
                        top: 55,
                        right: 25,
                        bottom: 20,
                        left: 55
                    },
                    x: function(d){ return d[0];},
                    y: function(d){ return Math.round(d[1])   },
                    showValues: true,
                    valueFormat: function(d){
                        return d3.format(',.4f')(d[0]);
                    },
                    transitionDuration: 300
                }   
            };
        for ( var i = 0, l = labels.length; i < l; i++) {
            var d = [labels[i]];
            if ($scope.add.param.y === 'count_true') {
                var a = _.reduce(byLabels[''+ labels[i]], function(m, n) {var s = !n.credits.overdue ? 1: 0; return m+s}, 0);                
            } else if ($scope.add.param.y === 'count_false') {
                var a = _.reduce(byLabels[''+ labels[i]], function(m, n) {var s = n.credits.overdue ? 1: 0; return m+s}, 0);
            } else {
                var a = _.reduce(byLabels[''+ labels[i]], function(m, n) {return m+n[$scope.add.param.y]}, 0) / byLabels['' + labels[i]].length;
            }
            d.push(a);
            data.push(d);
        }
        $scope.add.graph.options = options;
        $scope.add.graph.data = [{'values': data, key: '' + $scope.add.param.x + '-' +  $scope.add.param.y}];

    });

    $scope.remove_graph = function(id) {
        console.log(id);
        var i = $scope.graphs.indexOf(id);
        var newArr = _.union($scope.graphs.slice(0, i), $scope.graphs.slice(i+1));
        $scope.graphs = newArr;
    }

    $scope.add_graph_update = function(){
        console.log($scope.add.param.y);
    }

    $scope.toggle_add_bar = function(){
        $scope.add_graph = !$scope.add_graph;
    }

    $scope.toggle_graph_bar = function(){
        $rootScope.graphs_flag = !$rootScope.graphs_flag;
    }

    $scope.sum = function(id){
    	var am = $rootScope.db.users[id].amounts;
    	var sum = 0;
    	for (i = 0, l = am.length; i < l; i++) {
    		sum += am[i]
    	}
    	return sum;
    }

    $scope.nav = function (direct) {
        if (direct === 'next') {
            if ($rootScope.begin+100 < $rootScope.db.users.length)
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
        $rootScope.db.users.push(1);
    	Mongo.findAll(function(docs){
    		fs.writeFile('bd.txt', JSON.stringify(docs));
            console.log(docs);
    		$rootScope.db.users = docs;
    	});
    }
})
