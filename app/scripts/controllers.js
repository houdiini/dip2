var fs = require('fs');

var randomName = require('random-name');
var kmeans = require('machine_learning');
var cluster = require('hierarchical-clustering');


angular.module('BI.controllers', [])

.controller('mainCtrl', function($scope, NN, $rootScope){


	var activeUserInFirst, activeUserInSecond;

	$rootScope.add_client_flag = false;
	$rootScope.begin = 1;
	$rootScope.graph_flag = 0;
	$rootScope.learning_flag = 0;
	$rootScope.showEditFlag = undefined;
	$rootScope.showOptionsFlag = undefined;
	$rootScope.activeUser = undefined;
	$rootScope.db = {
	      url: 'mongodb://admin1:admin@ds013004.mlab.com:13004/clients',
	      users: []
	  };
	$rootScope.add_user_flag = 0;
	$rootScope.showInConsole = function(){ console.log($rootScope.db) };

	$rootScope.addClientFlag = function() { $rootScope.add_client_flag = !$rootScope.add_client_flag }

	$scope.$watch(function(){return $scope.side_window }, function(){
		console.log($scope.side_window);
		if ($scope.side_window == 1) {
			activeUserInSecond = $rootScope.activeUser;
			$rootScope.activeUser = activeUserInFirst;
		}
		if ($scope.side_window == 2) {
			activeUserInFirst = $rootScope.activeUser;
			console.log(activeUserInFirst);
			$rootScope.activeUser = activeUserInSecond;
		}
	});

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

.controller('usersCtrl', function($scope, Mongo, NN, $rootScope){
	$scope.settings = false;
	$scope.add_graph = false;
	$rootScope.editClient = {};


	if (localStorage["NeuralNetwork"]) NN.open();

  function complication(cur) {
        var result = {};

        switch (cur.live*1) {
            case 0: result.live = 'власне житло'; break;
            case .5: result.live = 'муніципальне житло'; break;
            case 1: result.live = 'аренда'; break;
        }

        switch (cur.relationship * 1) {
            case 0: result.relationship = 'одружений(-на)'; break;
            case .5: result.relationship = 'не одружений(-на)'; break;
            case 1: result.relationship = 'розведений(-на)'; break;
        }

        switch (cur.education * 1) {
            case 0: result.education = 'вищa'; break;
            case .5: result.education = 'молодший спеціаліст'; break;
            case 1: result.education = 'середнє'; break;
        }

        switch (cur.creditHistory * 1) {
            case 0: result.creditHistory = 'позитивна'; break;
            case .5: result.creditHistory = 'немає даних'; break;
            case 1: result.creditHistory = 'негативна'; break;
        }

        switch (cur.post * 1) {
            case 0: result.post = 'займає керівну посаду'; break;
            case .5: result.post = 'рядовий співробітник'; break;
            case 1: result.post = 'безробітний'; break;
        }


        switch (cur.residence * 1) {
            case 1: result.residence = 'менше року'; break;
            case .5: result.residence = '1-5 років'; break;
            case 0: result.residence = '> 5 років'; break;
        }


        switch (cur.exp * 1) {
            case 1: result.exp = 'менше року'; break;
            case .5: result.exp = '1-3 років'; break;
            case 0: result.exp = '> 3 років'; break;
        }
        result.name = cur.name;
				result.date = cur.date;
				result.good = cur.good * 1;
        return result;
    }


  $scope.$on("angular-resizable.resizeEnd", function (event, args) {
    console.log(args);
		$scope.graphs[args.id*1].options.chart.height = args.height -60;
    console.log($scope.graphs[args.id]);
  });


  try {
      var db = JSON.parse(fs.readFileSync('./bd.txt'));
			$rootScope.db.data = db;
      $rootScope.db.users = _.map(db, function(o){return complication(o)});
  } catch (e) { console.warn(e) }

	$scope.showOptions = function(id){
		$rootScope.showOptionsFlag = $rootScope.showOptionsFlag === id ? undefined : id;
	}

	$scope.showEdit = function(id){
		$rootScope.showEditFlag = id;
		$rootScope.editClient = simpleLikeObject($rootScope.db.users[id]);
		$scope.showOptions(id);
		if (!localStorage["NeuralNetwork"]) { NN.train($rootScope.db.users) }
		else { NN.open() };
		}

	$scope.hideEdit = function(id){
		$rootScope.showEditFlag = undefined;
	}


    // $scope.add = {
    //     param: {
    //         y: 'income',
    //         x: 'age'
    //     },
    //     graph: {
    //         data: [],
    //         options: {}
    //     }
    // }

    // $scope.graphs = [];

    // $scope.save_graph = function() {
    //     $scope.add_graph = false;
    //     var o = _.clone($scope.add.graph);
    //     $scope.graphs.push(o);
    // }

    // $scope.$watch(function(){return $scope.add.param.y + $scope.add.param.x}, function(p) {
    //     var workArray = _.map($rootScope.db.users, function(num){
    //         num.amount = Math.round(_.reduce(num.amounts, function(m, n){return n+m}, 0) / 1000) * 1000;
    //         num.creditAmount = num.credits.amount;
    //         num.income = Math.round(num.income /500)*500;
    //         return num
    //     });

    //     var labels = _.sortBy(_.union(_.pluck(workArray, $scope.add.param.x)));
    //     var byLabels = _.groupBy( workArray, $scope.add.param.x );

    //     var data = [];
    //     var options = {
    //             chart: {
    //                 type: 'lineChart',
    //                 height: 200,
    //                 margin: {
    //                     top: 55,
    //                     right: 25,
    //                     bottom: 20,
    //                     left: 55
    //                 },
    //                 x: function(d){ return d[0];},
    //                 y: function(d){ return Math.round(d[1])   },
    //                 showValues: true,
    //                 valueFormat: function(d){
    //                     return d3.format(',.4f')(d[0]);
    //                 },
    //                 transitionDuration: 300
    //             }
    //         };
    //     for ( var i = 0, l = labels.length; i < l; i++) {
    //         var d = [labels[i]];
    //         if ($scope.add.param.y === 'count_true') {
    //             var a = _.reduce(byLabels[''+ labels[i]], function(m, n) {var s = !n.credits.overdue ? 1: 0; return m+s}, 0);
    //         } else if ($scope.add.param.y === 'count_false') {
    //             var a = _.reduce(byLabels[''+ labels[i]], function(m, n) {var s = n.credits.overdue ? 1: 0; return m+s}, 0);
    //         } else {
    //             var a = _.reduce(byLabels[''+ labels[i]], function(m, n) {return m+n[$scope.add.param.y]}, 0) / byLabels['' + labels[i]].length;
    //         }
    //         d.push(a);
    //         data.push(d);
    //     }
    //     $scope.add.graph.options = options;
    //     $scope.add.graph.data = [{'values': data, key: '' + $scope.add.param.x + '-' +  $scope.add.param.y}];

    // });

    // $scope.remove_graph = function(id) {
    //     var i = $scope.graphs.indexOf(id);
    //     var newArr = _.union($scope.graphs.slice(0, i), $scope.graphs.slice(i+1));
    //     $scope.graphs = newArr;
    // }

    // $scope.add_graph_update = function(){
    //     console.log($scope.add.param.y);
    // }

    // $scope.toggle_add_bar = function(){
    //     $scope.add_graph = !$scope.add_graph;
    // }

    // $scope.toggle_graph_bar = function(){
    //     $rootScope.graphs_flag = !$rootScope.graphs_flag;
    // }

    // $scope.sum = function(id){
    // 	var am = $rootScope.db.users[id].amounts;
    // 	var sum = 0;
    // 	for (i = 0, l = am.length; i < l; i++) {
    // 		sum += am[i]
    // 	}
    // 	return sum;
    // }

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
        console.log($rootScope.activeUser);
    }

    $scope.openDB = function(){
			try {
				console.log($rootScope.db.url);
				Mongo.connect($rootScope.db.url);
	    	console.info('Conected!');
				var find = Mongo.findAll(function (err, users) {
					if (err) return console.error(err);
					fs.writeFile('bd.txt', JSON.stringify(users));
					$rootScope.db.users = _.clone(_.map(users, function(o){return complication(o)}));
					console.info('Loaded!');
				});
			} catch (e) {
				var find = Mongo.findAll(function (err, users) {
		      if (err) return console.error(err);
					fs.writeFile('bd.txt', JSON.stringify(users));
					$rootScope.db.users = _.clone(_.map(users, function(o){return complication(o)}));
					if (!localStorage["NeuralNetwork"]) { NN.train($rootScope.db.users) }
					else { NN.open() };
		      console.info('Data are refresh');
		    });
			}
		}

		function simpleLikeObject(ob) {
        var newOb = {};
        switch (ob.live) {
            case 'власне житло': newOb.live = 0; break;
            case 'муніципальне житло': newOb.live = .5; break;
            case 'аренда': newOb.live = 1; break;
        }

        switch (ob.relationship) {
            case 'одружений(-на)': newOb.relationship = 0; break;
            case 'не одружений(-на)': newOb.relationship = .5; break;
            case 'розведений(-на)': newOb.relationship = 1; break;
        }

        switch (ob.education) {
            case 'вищa': newOb.education = 0; break;
            case 'молодший спеціаліст': newOb.education = .5; break;
            case 'середнє': newOb.education = 1; break;
        }

        switch (ob.creditHistory) {
            case 'позитивна': newOb.creditHistory = 0; break;
            case 'немає даних': newOb.creditHistory = .5; break;
            case 'негативна': newOb.creditHistory = 1; break;
        }

        switch (ob.post) {
            case 'займає керівну посаду': newOb.post = 0; break;
            case 'рядовий співробітник': newOb.post = .5; break;
            case 'безробітний': newOb.post = 1; break;
        }


        switch (ob.residence) {
            case 'менше року': newOb.residence = 1; break;
            case '1-5 років': newOb.residence = .5; break;
            case '> 5 років': newOb.residence = 0; break;
        }


        switch (ob.exp) {
            case 'менше року': newOb.exp = 1; break;
            case '1-3 років': newOb.exp = .5; break;
            case '> 3 років': newOb.exp = 0; break;
        }
        newOb.name = ob.name;
        newOb.good = ob.good;
				newOb.date = ob.date;
        return newOb;
    }
})



.controller('learningNNetCtrl', function($scope, $filter, Mongo, NN, $rootScope, $timeout){
  	function simpleLikeObject(ob) {
        var newOb = ob;
        switch (ob.live) {
            case 'власне житло': newOb.live = 0; break;
            case 'муніципальне житло': newOb.live = .5; break;
            case 'аренда': newOb.live = 1; break;
						default: newOb.live = ob.live * 1;
        }

        switch (ob.relationship) {
            case 'одружений(-на)': newOb.relationship = 0; break;
            case 'не одружений(-на)': newOb.relationship = .5; break;
            case 'розведений(-на)': newOb.relationship = 1; break;
						default: newOb.relationship = ob.relationship*1;
        }

        switch (ob.education) {
            case 'вищa': newOb.education = 0; break;
            case 'молодший спеціаліст': newOb.education = .5; break;
            case 'середнє': newOb.education = 1; break;
						default: newOb.education = ob.education*1;
        }

        switch (ob.creditHistory) {
            case 'позитивна': newOb.creditHistory = 0; break;
            case 'немає даних': newOb.creditHistory = .5; break;
            case 'негативна': newOb.creditHistory = 1; break;
						default: newOb.creditHistory = ob.creditHistory*1;
        }

        switch (ob.post) {
            case 'займає керівну посаду': newOb.post = 0; break;
            case 'рядовий співробітник': newOb.post = .5; break;
            case 'безробітний': newOb.post = 1; break;
						default: newOb.post = ob.post*1;
        }


        switch (ob.residence) {
            case 'менше року': newOb.residence = 1; break;
            case '1-5 років': newOb.residence = .5; break;
            case '> 5 років': newOb.residence = 0; break;
						default: newOb.residence = ob.residence*1;
        }


        switch (ob.exp) {
            case 'менше року': newOb.exp = 1; break;
            case '1-3 років': newOb.exp = .5; break;
            case '> 3 років': newOb.exp = 0; break;
						default: newOb.exp = ob.exp*1;
        }
        newOb.name = ob.name;
        newOb.good = ob.good;
				newOb.date = ob.date;
        return newOb;
    }

		$scope.$watch( function(){return $rootScope.activeUser}, function() {
					var client = $scope.db.users[$rootScope.activeUser];
					console.log(client);
					var name = client.name;
					var res = NN.main.run(simple(client));
					if ( res > .9 ) {
						// console.log(client);
						$rootScope.resultNeuralNetwork = 'Я (нейронна мережа) розглянула дитя боже ' + name.toString() +
						' й пришла до висновку, що ця невинна істота, '+
						'не заслуговує но відмову. Цьому клієнту я рекомендую видати кредит! В характеристиці я не знайшла причини по якій треба відмовити цій людинкі!';
						} else
						if ( res > .5 ) {
						console.log(client);
						$rootScope.resultNeuralNetwork = 'Доброго здоров\'я, користувач! Я (нейронна мережа, але друзі називають мене Лора) розглянула характеристику обраного клієнта, а саме - ' + name.toString() +
						' й пришла до висновку, що, все-таки, йому можна надати кредит, хоч не без ризику, але ризик не великий!';
						} else
						if (res >= .4) {
						$rootScope.resultNeuralNetwork = 'Доброго здоров\'я, користувач! Я (нейронна мережа, але друзі називають мене Лора) розглянула характеристику обраного клієнта, а саме - ' + name.toString() +
						' й пришла до висновку, що, все-таки, саме йому, кредит краще не давати, хоч може й здатись, що клієнт, як людина не погана, але як надійни позичальник такий-собі!';
						} else
						if (res < .4) {
							$rootScope.resultNeuralNetwork = 'Доброго здоров\'я, користувач! Я (нейронна мережа, але друзі називають мене Лора) розглянула характеристику обраного клієнта, а саме - ' + name.toString() +
							' й пришла до висновку, що, йому я не дала б ні копійочки, краще пожертвуйте ці кошти на благодійність, накорміть безхатька, вуличного кота чи собаку, а йому - поясніть, що гроші не бачить йому, як на руці шостого пальця!';

							if (client.creditHistory == 'негативна') {
								$rootScope.resultNeuralNetwork += 'Слід відмітити, що в даного користувача не все гаразд з кредитною історією. '
							}
							if (client.post == 'безробітний') {
								$rootScope.resultNeuralNetwork += 'В клієнта певні складнощі з роботою, а саме - він безробітний. '
							}
							if (client.live == 'аренда' && client.residence == 'менше року') {
								$rootScope.resultNeuralNetwork += 'В бідної людини ситуація з місцем проживання могла бути й краща, хоча може бути й таке, що людина тільки переїхала в цілому цей факт не внушає довіри. '
							}

						}
		});

		$rootScope.newClient = {
				 post: 1,
				 education: 1,
				 exp: 1,
				 residence: 1,
				 relationship: 1,
				 live: 1,
				 creditHistory: .5,
				 name: '',
				 date: new Date()
		 }

    function simple(cur) {
        var input = [0, 0, 0, 0, 0, 0, 0, 0];
				console.log(cur);
        switch (cur.live) {
            case 'власне житло': input[0] = 0; break;
            case 'муніципальне житло': input[0] = .5; break;
            case 'аренда': input[0] = 1; break;
						default: input[0] = cur.live;
        }

        switch (cur.relationship) {
            case 'одружений(-на)': input[1] = 0; break;
            case 'не одружений(-на)': input[1] = .5; break;
            case 'розведений(-на)': input[1] = 1; break;
						default: input[1] = cur.relationship;
        }

        switch (cur.education) {
            case 'вищa': input[2] = 0; break;
            case 'молодший спеціаліст': input[2] = .5; break;
            case 'середнє': input[2] = 1; break;
						default: input[2] = cur.education;
        }

        switch (cur.creditHistory) {
            case 'позитивна': input[3] = 0; break;
            case 'немає даних': input[3] = .5; break;
            case 'негативна': input[3] = 1; break;
						default: input[3] = cur.creditHistory;
        }

        switch (cur.post) {
            case 'займає керівну посаду': input[4] = 0; break;
            case 'рядовий співробітник': input[4] = .5; break;
            case 'безробітний': input[4] = 1; break;
						default: input[4] = cur.post;
        }


        switch (cur.residence) {
            case 'менше року': input[5] = 1; break;
            case '1-5 років': input[5] = .5; break;
            case '> 5 років': input[5] = 0; break;
        }


        switch (cur.exp) {
            case 'менше року': input[6] = 1; break;
            case '1-3 років': input[6] = .5; break;
            case '> 3 років': input[6] = 0; break;
        }
				return input;
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
            $scope.message += locResult ? '<span class="green">Видати. </span>' : "<span class='red'>Відмовити у видачі!</span>";
						var NNetMess = 'Мені лячно помилитись, допоможіть з відповіддю!';
            if (NNetMessage > .7) {
                $scope.message += ' Результат нейронної мережі - <span class="green">видати!</span> Оцінка: ' + Math.round(NNetMessage * 10000) / 10000;
            } else if (NNetMessage < .5) {
                $scope.message += ' Результат нейронної мережі - <span class="red">відхилити.</span> Оцінка ' + Math.round(NNetMessage * 10000) / 10000;
            } else { $scope.message += 'Нейронна мережа не дала точноъ відповіді! Оцінка ' + Math.round(NNetMessage * 10000) / 10000;}


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
						var NNetMessage = net.run(victor);

						$scope.hierarchicalMessage = 'Результат методу - ';
            $scope.hierarchicalMessage += locResult ? '<span class="green">Видати. </span>' : "<span class='red'>Відмовити у видачі!</span>";
            if (NNetMessage > .7) {
                $scope.hierarchicalMessage += ' Результат нейронної мережі - <span class="green">видати!</span> Оцінка: ' + Math.round(NNetMessage * 10000) / 10000;
            } else if (NNetMessage < .4) {
                $scope.hierarchicalMessage += ' Результат нейронної мережі - <span class="red">відхилити.</span> Оцінка ' + Math.round(NNetMessage * 10000) / 10000;
            } else { $scope.hierarchicalMessage += 'Нейронна мережа не дала точноъ відповіді! Оцінка ' + Math.round(NNetMessage * 10000) / 10000;}
        }
        catch (err) {
					$rootScope.error = 'ERROR: Кластери для цього типу не згенеровані! Спочатку згенеруйте кластери, щоб було з чим порівнювати!';
					$timeout(function(){
						$rootScope.error = '';
					}, 3000);
					console.warn(err)
				 }
    }

    $rootScope.addClientToDB = function(){
				$rootScope.newClient.good = NN.main.run(simple($rootScope.newClient))[0];
				console.log($rootScope.newClient);
        Mongo.addClient(simpleLikeObject($rootScope.newClient))
				$rootScope.db.users.push(simpleLikeObject($rootScope.newClient));
    }

		$rootScope.updateClientInDB = function(){
			console.log($rootScope.editClient);
			$rootScope.editClient.good = NN.main.run(simple($rootScope.editClient))[0];
			var id = $rootScope.showEditFlag;
			console.log(id);
			Mongo.updateClient($rootScope.db.data[id], simpleLikeObject($rootScope.editClient));
		}

		$rootScope.removeClientFromDB = function(id){
			console.log('del ', id);
			Mongo.removeClient($rootScope.db.data[id]);
			$rootScope.db.users[id] = undefined;
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
