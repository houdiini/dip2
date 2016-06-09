var fs = require('fs');
var brain = require('brain');
var randomName = require('random-name');
var kmeans = require('machine_learning');


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



.controller('learningNNetCtrl', function($scope, $rootScope, $timeout){
    var net = new brain.NeuralNetwork({
        hiddenLayers: [10],
        learningRate: .2
    });

    $timeout(generateNewData, 500);

    var trainerSet = [];
    $scope.current = {};

    function open () {
        
        try {
            var json = fs.readFileSync('KnowlegeIsPower.yes');
            trainerSet = JSON.parse(fs.readFileSync('trainerSet.yes'));
            json = JSON.parse(json);
            net.fromJSON(json);
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

    open();

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
        console.log('writen');
    };

    $scope.give = function(){
        pushNewData(1);
        generateNewData();
    }

    $scope.deny = function(){
        pushNewData(0);
        generateNewData();
    }

    function pushNewData(good) {
        $scope.current.good = good;
        $rootScope.db.users.push = $scope.current;
        
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

       $rootScope.newClient = {
            post: 1,
            education: 1,
            exp: 1,
            residence: 1,
            relationship: 1,
            live: 1,
            creditHistory: 1
        }

        try {
            net.train(trainerSet, {
                errorThresh: 0.0005,  // error threshold to reach 
                iterations: 20000,   // maximum training iterations 
                log: true,           // console.log() progress periodically 
                logPeriod: 5000,       // number of iterations between logging 
                learningRate: 0.3    // learning rate 
            });
            var res = net.run(simple($scope.current));
            console.log(res);
            $scope.answer = 'Мені лячно помилитись, допоможіть з відповіддю!';
            if (res > .7) {
                $scope.answer = 'Дать! Оценка: ' + Math.round(res * 100) / 100;
            } else if (res < .4) {
                $scope.answer = 'Не дать';
            }
        }
        catch (e) {
            try {
                var res = net.run(simple($scope.current));
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
        console.log(e);
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
        var victor = [$scope.newClient.live,
            $scope.newClient.relationship,
            $scope.newClient.education,
            $scope.newClient.creditHistory, 
            $scope.newClient.post, 
            $scope.newClient.residence,
            $scope.newClient.exp, 0, 1
        ];
        try {
            console.log(result);
            var a = distance(victor, result.means[1]);
            victor[victor.length - 1] = 0;
            var b = distance(victor, result.means[0]);
            console.log(a);
            console.log(b);
            var locResult = a - b;
            console.log(_.last(result.means[1]));
            if ( _.last(result.means[1]) === 0 ) {
                locResult = locResult > 0 ? false : true;
            } else locResult = locResult > 0 ? true : false;
            console.log(locResult);

            $rootScope.message = locResult ? 'Видати' : "Відмовити у видачі!"; 
            console.log($rootScope.message);
        }
        catch (err) { console.warn(err) }
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

        console.log(result);

        // console.log(kmeans.clusterize(vector, {k: 2}, (err, res) => {
        //     console.log(err);
        //     console.log(res);
        // }))
    }


})


.controller('kMeansCtrl', function($scope, $rootScope){
    // kmeans()
});







// 'use strict';

// const electron = require('electron');
// const app = electron.app;
// const BrowserWindow = electron.BrowserWindow;
// const ipc = electron.ipcMain ;

// let mainWindow = null, openFileWindow = null;

// function createWindow () {
//   mainWindow = new BrowserWindow({width: 800, height: 600});
//   mainWindow.loadURL('file://' + __dirname + '/app/index.html');

//   // Open the DevTools.
//   // mainWindow.webContents.openDevTools();
//   mainWindow.on('closed', function() {

//     mainWindow = null;
//   });
// }

// app.on('ready', createWindow);

// app.on('window-all-closed', function () {

//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// ipc.on('file-opened', function(res){
//   console.log('File opened');
//   console.log(res);
// });

// ipc.on('open-file-window', function(){
//   console.log('ipc weeeee');
//   if (!openFileWindow) {
//     openFileWindow = new BrowserWindow({width: 300, height: 600});
//     openFileWindow.loadURL('file://' + __dirname + '/app/templates/openDialog.html');
//     openFileWindow.on('closed', function(){
//       openFileWindow = null;
//     });
//   }
// });

// app.on('activate', function () {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });
