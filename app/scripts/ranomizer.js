var MongoClient = require('mongodb').MongoClient;
var random = require('random-name');
var randomDate = require('random-date');
var url = 'mongodb://admin:toha@ds015953.mlab.com:15953/bank_users';


MongoClient.connect(url, function(err, db) {

  var collection = db.collection('users');

  for (var i = 0; i < 500; i++) {
  	var arr = [], sum=0;
  	//summa na cartochkah
  	for (var j = 0, l = Math.round(Math.random()*2); j <= l; j++) {
  		arr.push(Math.round(Math.random()*2050 + 1450));
  		sum += arr[j];
  	}
  	var start = new Date(randomDate('-730d', '2013-01-01')),
  	finish = new Date(randomDate('+730d', new Date(start*1 + 24*3600000*365))),  	
  	income = Math.round(Math.random()*6000 + 2250),
  	amount = Math.round(Math.random()*(10000*Math.round(income/1000))/10000)*10000+10000;

  	// если сумма на всех карточках + инком-коеф(на жизнь)*колличество 
  	// годов > 
  	// суммы кредита то разрещить кредит 
  	// а если нет - то увеличеть период оплаты или уменьшить сумму, при этом
  	// сумма не должна быть меньше 10 000
  	// 
  	var years = new Date(finish-start).getYear - 70;
  	if (sum + (income-1500)* years < amount) {
  		if (amount > 10000) {
  			amount -= 10000;
  		} else {
  			finish += new Date(finish*1 + 24*3600000*365);
  		}
  	}
  	var h = history(amount, start, finish, income)  
  	var cred = {
  		start: start,
  		finish: finish,
  		amount: amount,
  		history: h.history,
  		overdue: h.overdue,
  		procent: h.procent
  	}; 
  	var user = {
  	  fName: random.first(),
  	  sName: random.last(),
  	  age: Math.round(Math.random()*25 + 35),
  	  income: income,
  	  amounts: arr,
  	  credits: cred,
  	};
  	collection.insert(user, function(err, result) { });
  	console.log(user);
	}
});


var history = function(sum, start, end, income){
	var div = (new Date(end - start).getYear()-70) * 12 + new Date(end - start).getMonth();
	var ar= [];
	var procent = Math.round((Math.random()*19))/100;
	var overdue = (income - sum * (1+procent) / div > 1500) ? false : true;
	var interept = !overdue ? 0 : (Math.random()*div+1);
	for(var i = 0; i < div-interept; i++) {
		ar.push(sum * (1+procent) / div);
	}
	var credInfo = {
		history: ar,
		overdue: overdue,
		procent: procent
	}
	return credInfo;
};