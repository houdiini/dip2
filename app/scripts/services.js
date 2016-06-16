var brain = require('brain');

angular.module ('BI.services', [])

.factory('NN', function() {  //NeuralNetwork
  var trained = false;
  var trainerSet = [];
  var net = new brain.NeuralNetwork({
    hiddenLayers: [10],
    learningRate: .2
  });

  var openNNet = function () {
      try {
        var json = localStorage.getItem( 'NeuralNetwork' );
        json = JSON.parse(json);
        net.fromJSON(json);
      } catch (e) { console.warn(e) };
  }

  var simple = function(cur) {
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

  var makeTrain = function(clients) {
    trained = true;
    for (var i = 0, l = clients.length; i < l; i++) {
      if (clients[i].good !== undefined && !_.isNaN(clients[i].good)) {
        console.log(clients[i].good);
        trainerSet.push({
          input: simple(clients[i]),
          output: [clients[i].good]
        });
      }
    }
    console.log(trainerSet);

    net.train(trainerSet, {
      errorThresh: 0.0005,  // error threshold to reach
      iterations: 20000,   // maximum training iterations
      log: true,           // console.log() progress periodically
      logPeriod: 100,       // number of iterations between logging
      learningRate: 0.3    // learning rate
    });
  	localStorage.setItem( 'NeuralNetwork', JSON.stringify(net.toJSON()) );
  };

  return {
    main: net,
    trained: trained,
    trainerSet: trainerSet,
    open: openNNet,
    train: makeTrain
  }
});
