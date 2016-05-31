var MongoClient = require('mongodb').MongoClient;
 
// Connection URL 
var url = 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users';
// Use connect method to connect to the Server 

angular.module ('BI.Mongo', [])

.factory('Mongo', function() {
    var url = 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users';
    var connect = function(val) {
        url = val;
    }
    var findAllDocuments = function(callback) {
        return MongoClient.connect( url, function(err, db) {
          var collection = db.collection('users');
          collection.find({}).toArray(function(err, docs) {
            console.log(docs);
            callback(docs);
          });
    });
};
    return {
        connect: connect,
        findAll: findAllDocuments

    };
});