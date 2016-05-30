angular.module('BI.filters', [])

.filter('split', function(){
    return function(text) {
        return text.split('/').join('</b>/<b>');
    }
});
