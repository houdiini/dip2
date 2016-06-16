var mongoose = require('mongoose');

// Connection URL
var url = 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users';
var db;
var userSchema = mongoose.Schema({
  creditHistory: Number,
  exp: Number,
  good: Number,
  live: Number,
  name: String,
  post: Number,
  relationship: Number,
  education: Number,
  date: Date,
  residence: Number
}),
  User = mongoose.model('User', userSchema);


// Use connect method to connect to the Server

angular.module ('BI.Mongo', [])

.factory('Mongo', function() {
  var url = 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users';

  var connect = function(val) {
    mongoose.connect(val);
    db = mongoose.connection;
    return db;
  }

  var findAllDocuments = function(callback) {
    // User = mongoose.model('User', userSchema);
    User.find(function (err, users) {
      if (err) return console.error(err);
      console.log(users);
    })
    return User.find(callback)
  };


  var addClient = function(client){
    console.log(client);
    newClient = new User(client);
    newClient.save(function (err, newClient) {
      if (err) return console.error(err);
    });
  };

  var removeClient = function(id){
    console.log(id);
    User.findById(id._id).remove().exec();
  };

  var updateClient = function(id, newData) {
    console.log(id._id);
    console.log(newData);
    console.log(User);
    User.findById(id._id, function(err, user) {
      if (err) return console.error(err);
      console.log(user);
      user.creditHistory = newData.creditHistory;
      user.exp = newData.exp;
      // user.good = newData.good;
      user.live = newData.live;
      user.live = newData.live;
      user.name = newData.name;
      user.post = newData.post;
      user.relationship = newData.relationship;
      user.education = newData.education;
      user.residence = newData.residence;
      user.date = newData.date;
      user.save(function(err, user) {
        if (err) console.error(err);
        console.log(user);
      })
    })
  }
    return {
        connect: connect,
        addClient: addClient,
        removeClient: removeClient,
        updateClient: updateClient,
        findAll: findAllDocuments

    };
});
