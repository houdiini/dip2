var fs = require('fs');
var brain = require('brain');
var randomName = require('random-name');
var kmeans = require('machine_learning');
var cluster = require('hierarchical-clustering');


angular.module('BI.controllers', [])

.controller('mainCtrl', function($scope, $rootScope){
	    $rootScope.activeUser = undefined;
        $rootScope.begin = 0;
        $rootScope.graph_flag = 0;
        $rootScope.learning_flag = 0;
        $rootScope.db = {
            url: 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users',
            users: []
        };
        $rootScope.add_user_flag = 0;


				$scope.tabClass = function(v){
					return $scope.side_window == v;
				}



        $scope.toggle_add_user_flag = function(){
            $rootScope.add_user_flag = ! $rootScope.add_user_flag;
        }


        $scope.learning_toggle = function(){
            $rootScope.learning_flag = !$rootScope.learning_flag;
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
    } catch (e) { console.warn(e) }

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



.controller('learningNNetCtrl', function($scope, $rootScope, $timeout){
    var net = new brain.NeuralNetwork({
        hiddenLayers: [10],
        learningRate: .2
    });

    $timeout(function(){generateNewData(), openTrainerSet()}, 500);

    var trainerSet = [];
    $scope.current = {};

    function openNNet () {
        try {
            var json = fs.readFileSync('KnowlegeIsPower.yes');
            json = JSON.parse(json);
            net.fromJSON(json);
						$scope.NeuralNetworkLog = 'Нейронна мережа відновленна з файлу!';
            var res = net.run(simple($scope.current));
            $scope.answer = 'Мені лячно помилитись, допоможіть з відповіддю!';
            if (res > .7) {
                $scope.answer = 'Дать! Оценка: ' + Math.round(res * 100) / 100;
            } else if (res < .4) {
                $scope.answer = 'Не дать';
            }
        }
        catch (e) { console.warn(e) };
    }

		function openTrainerSet() {
			trainerSet = JSON.parse(fs.readFileSync('trainerSet.yes'));
		};

		// $scope.openNNet = function(){open()};
		openNNet();
		console.log(trainerSet);
		$scope.NeuralNetworkLog = 'Не навчена!';

    $scope.save = function() {
        net.train(trainerSet, {
            errorThresh: 0.0005,  // error threshold to reach
            iterations: 20000,   // maximum training iterations
            log: true,           // console.log() progress periodically
            logPeriod: 100,       // number of iterations between logging
            learningRate: 0.3    // learning rate
        });
        console.log( net.toJSON() );
        fs.writeFileSync( 'KnowlegeIsPower.yes', JSON.stringify( net.toJSON() ) );
        fs.writeFileSync( 'trainerSet.yes', JSON.stringify( trainerSet ) );
    };

    $scope.give = function(){
        pushNewData(1);
				$scope.NeuralNetworkLog = 'Навчання нейронної мережі';
        generateNewData();

    }

    $scope.deny = function(){
        pushNewData(0);
        $timeout(generateNewData());
    }

    function pushNewData(good) {
        $scope.current.good = good;
        $rootScope.db.users.push = $scope.current;
				$scope.NeuralNetworkLog = 'Навчання нейронної мережі';
        trainerSet.push({
            input: simple($scope.current),
            output: [$scope.current.good]
        });
    }

    $scope.check = function(){
        console.log(simple($scope.current));
        console.log(net.run(simple($scope.current)));
    }

    function random(n) {
        return Math.round(Math.random()*n);
    }

		$rootScope.newClient = {
				 post: 1,
				 education: 1,
				 exp: 1.3,
				 residence: 1.1,
				 relationship: 1,
				 live: 1,
				 creditHistory: 1
		 }

    function generateNewData(){
        var live = ['аренда', 'муніципальне житло', 'власне житло'];
        var relationship = ['одружений(-на)', 'не одружений(-на)', 'розведений(-на)'];
        var education = ['вищa', "молодший спеціаліст", 'середнє'];
        var creditHistory = ['немає даних', "позитивна", 'негативна'];
        var post = ['займає керівну посаду', "рядовий співробітник", "безробітний"];
        var age = Math.round(Math.random()*43)+19;
        var residence = ['менше року', '1-5 років', '> 5 років'];
        var exp = ['менше року', '1-3 років', '> 3 років'];

        $scope.current = {
            name: randomName.first() + ' ' + randomName.last(),
            live: live[random(2)],
            relationship: relationship[random(2)],
            education: education[random(2)],
            creditHistory: creditHistory[random(2)],
            post: post[random(2)],
            age: age,
            residence: residence[random(2)],
            exp: exp[random(2)],
            procent: random(40)
        }
        try {
						$scope.calculation = true;
            net.train(trainerSet, {
                errorThresh: 0.01,  // error threshold to reach
                iterations: 20000,   // maximum training iterations
                log: true,           // console.log() progress periodically
                logPeriod: 5000,       // number of iterations between logging
                learningRate: 0.1    // learning rate
            });
						$scope.calculation = false;
						$scope.NeuralNetworkLog = 'Нейронна мережа навчена!';
            var res = net.run(simple($scope.current));

            $scope.answer = 'Мені лячно помилитись, допоможіть з відповіддю!';
            if (res > .7) {
                $scope.answer = 'Дать! Оценка: ' + Math.round(res * 1000) / 1000;
            } else if (res < .4) {
                $scope.answer = 'Не дать';
            }
        }
        catch (e) {
						console.warn(e);
            try {
                var res = net.run(simple($scope.current));
								$scope.NeuralNetworkLog = 'Нейронна мережа відновлена з файлу!'
            }
            catch (e) { console.warn(e) }
        }

        $scope.current.liveClass = {
            'good': 'власне житло' === $scope.current.live,
            'warn': 'муніципальне житло' === $scope.current.live,
            'bad': 'аренда' === $scope.current.live
        }

        $scope.current.relationshipClass = {
            'good': 'одружений(-на)' === $scope.current.relationship,
            'warn': 'не одружений(-на)' === $scope.current.relationship,
            'bad': 'розведений(-на)' === $scope.current.relationship
        }

        $scope.current.educationClass = {
            'good': 'вищa' === $scope.current.education,
            'warn': 'молодший спеціаліст' === $scope.current.education,
            'bad': 'середнє' === $scope.current.education
        }

        $scope.current.creditHistoryClass = {
            'good': 'позитивна' === $scope.current.creditHistory,
            'warn': 'немає даних' === $scope.current.creditHistory,
            'bad': 'негативна' === $scope.current.creditHistory
        }

        $scope.current.postClass = {
            'good': 'займає керівну посаду' === $scope.current.post,
            'warn': 'рядовий співробітник' === $scope.current.post,
            'bad': 'безробітний' === $scope.current.post
        }

        $scope.current.residenceClass = {
            'bad': 'менше року' === $scope.current.residence,
            'warn': '1-5 років' === $scope.current.residence,
            'good': '> 5 років' === $scope.current.residence
        }

        $scope.current.expClass = {
            'bad': 'менше року' === $scope.current.exp,
            'warn': '1-3 років' === $scope.current.exp,
            'good': '> 3 років' === $scope.current.exp
        }
    }

    function simple(cur) {
        var input = [0, 0, 0, 0, 0, 0, 0, 0];
        switch (cur.live) {
            case 'власне житло': input[0] = 0; break;
            case 'муніципальне житло': input[0] = .5; break;
            case 'аренда': input[0] = 1; break;
        }

        switch (cur.relationship) {
            case 'одружений(-на)': input[1] = 0; break;
            case 'не одружений(-на)': input[1] = .5; break;
            case 'розведений(-на)': input[1] = 1; break;
        }

        switch (cur.education) {
            case 'вищa': input[2] = 0; break;
            case 'молодший спеціаліст': input[2] = .5; break;
            case 'середнє': input[2] = 1; break;
        }

        switch (cur.creditHistory) {
            case 'позитивна': input[3] = 0; break;
            case 'немає даних': input[3] = .5; break;
            case 'негативна': input[3] = 1; break;
        }

        switch (cur.post) {
            case 'займає керівну посаду': input[4] = 0; break;
            case 'рядовий співробітник': input[4] = .5; break;
            case 'безробітний': input[4] = 1; break;
        }


        switch (cur.residence) {
            case 'менше року': input[5] = 1; break;
            case '1-5 років': input[5] = .5; break;
            case '> 5 років': input[5] = 0; break;
        }


        switch (cur.exp) {
            case 'менше року': input[6] = 1; break;
            case '1-3 років': input[6] = 0.5; break;
            case '> 3 років': input[6] = 0; break;
        }


        return input;
    }




    $scope.actionKey = function(e){
        if (e.keyCode === 39) {
            pushNewData(1);
            generateNewData();
        }
        if (e.keyCode === 37) {
            pushNewData(0);
            generateNewData();
        }
    }




    //tak eto ne doljno bit'

		function means(data, clusters, k) {
			means = [];
			console.log(clusters);
														console.log(data);
			for(i=0 ; i<k ; i++) {
					var avgs = [];
					for(j=0 ; j<data[0].length ; j++)
							avgs.push(0.0);
					if(clusters[i].length > 0) {
							for(j=0 ; j<clusters[i].length ; j++) {
									for(l=0 ; l<data[0].length ; l++) {
											avgs[l] += data[clusters[i][j]][l];
									}
							}
							for(j=0 ; j<data[0].length ; j++) {
									avgs[j] /= clusters[i].length;
							}
							means[i] = avgs;
					}
			}
			return means;
		}

    function distance(a, b) {
      if (a.length !== b.length) {
        return (new Error('The vectors must have the same length'));
      }
      let d = 0.0;
      for (let i = 0, max = a.length; i < max; ++i) {
        d += Math.pow((a[i] - b[i]), 2);
      }
      return Math.sqrt(d);
    }

    var result;
    $rootScope.message = 'Введіть дані';

    $scope.showNewUser = function(){
        var victor = [$scope.newClient.live*1,
            $scope.newClient.relationship*1,
            $scope.newClient.education*1,
            $scope.newClient.creditHistory*1,
            $scope.newClient.post*1,
            $scope.newClient.residence*1,
            $scope.newClient.exp*1, 0
        ];
				console.log(victor);
				var NNetMessage = net.run(victor);
				victor.push(1);
        try {
						var indexOfOverdue = _.last(result.means[0]) === 1 ? 0 : 1;
						var indexOfNoOverdue = _.last(result.means[1]) === 0 ? 1 : 0;
            var a = distance(victor, result.means[indexOfOverdue]);
            victor[victor.length - 1] = 0;
            var b = distance(victor, result.means[indexOfNoOverdue]);
            var locResult = a - b;
						console.log('Give:\n%o\nDeny:\n%o', a, b)
            locResult = locResult > 0 ? false : true;
						console.log(NNetMessage);
						$scope.message = 'Результат методу - ';
            $scope.message += locResult ? 'Видати. ' : "Відмовити у видачі!";
						var NNetMess = 'Мені лячно помилитись, допоможіть з відповіддю!';
            if (NNetMessage > .7) {
                $scope.message += ' Результат нейронної мережі - видати! Оцінка: ' + Math.round(NNetMessage * 10000) / 10000;
            } else if (NNetMessage < .4) {
                $scope.message += ' Результат нейронної мережі - відхилити. Оцінка ' + Math.round(NNetMessage * 10000) / 10000;
            }


        }
        catch (err) {
					$rootScope.error = 'ERROR: Кластери не згенеровані! Спочатку згенеруйте кластери, щоб було з чим порівнювати!';
					$timeout(function(){
						$rootScope.error = '';
					}, 3000);
					console.warn(err)
				 }
    }

    $scope.doKMeans = function(){
			console.log('doKMENS');
        var vector = new Array();
        for (var i = 1, l = trainerSet.length; i < l; i++) {
            vector[i-1] = _.clone(trainerSet[i].input);
            vector[i-1].push(trainerSet[i].output[0]);
        }

        result = kmeans.kmeans.cluster({
            data : vector,
            k : 2,
            epochs: 100,
            distance : {type : "pearson"}
        });
    }

		function linkage(distances) {
		  return Math.min.apply(null, distances);
		}

		$scope.doHierarchialClustering = function(){
			var vector = new Array();
			for (var i = 1, l = trainerSet.length; i < l; i++) {
					vector[i-1] = _.clone(trainerSet[i].input);
					vector[i-1].push(trainerSet[i].output[0]);
			};

			var levels = cluster({
			  input: vector,
			  distance: distance,
			  linkage: linkage,
			  minClusters: 2
			});

			var clusters = _.last(levels);
			clusters.means = means(vector, clusters.clusters, 2);
			hierarchialResult = clusters;
		}

		var hierarchialResult;

		$scope.calcHierchial = function(){
        var victor = [$scope.newClient.live*1,
            $scope.newClient.relationship*1,
            $scope.newClient.education*1,
            $scope.newClient.creditHistory*1,
            $scope.newClient.post*1,
            $scope.newClient.residence*1,
            $scope.newClient.exp*1, 0, 1
        ];
        try {
					console.log(victor);
					console.log(hierarchialResult.means);
						var indexOfOverdue = _.last(hierarchialResult.means[0]) === 1 ? 0 : 1;
						var indexOfNoOverdue = _.last(hierarchialResult.means[1]) === 0 ? 1 : 0;
            var a = distance(victor, hierarchialResult.means[indexOfOverdue]);
            victor[victor.length - 1] = 0;
            var b = distance(victor, hierarchialResult.means[indexOfNoOverdue]);
            var locResult = a - b;
						console.log('Give:\n%o\nDeny:\n%o', a, b);
						console.log(locResult);
            locResult = locResult > 0 ? false : true;

            $scope.hierarchicalMessage = locResult ? 'Видати' : "Відмовити у видачі!";
        }
        catch (err) {
					$rootScope.error = 'ERROR: Кластери для цього типу не згенеровані! Спочатку згенеруйте кластери, щоб було з чим порівнювати!';
					$timeout(function(){
						$rootScope.error = '';
					}, 3000);
					console.warn(err)
				 }
    }

    $scope.doKMeans = function(){
        var vector = new Array();
        for (var i = 1, l = trainerSet.length; i < l; i++) {
            vector[i-1] = _.clone(trainerSet[i].input);
            vector[i-1].push(trainerSet[i].output[0]);
        }

        result = kmeans.kmeans.cluster({
            data : vector,
            k : 2,
            epochs: 100,
            distance : {type : "pearson"}
        });
    }

}) /// prev coontroller


.controller('kMeansCtrl', function($scope, $rootScope){
    // kmeans()
});
