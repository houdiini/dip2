angular.module('BI.filters', [])

.filter('split', function(){
    return function(text) {
        return text.split('/').join('</b>/<b>');
    }
})

.filter('startWith', [function() {
    return function(input, index) {
        return input.slice(parseInt(index, 10));
    };
}]);
