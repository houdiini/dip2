angular.module ('BI.services', [])

.factory('Works', function() {
    var files = [], info = {select: -123, selection: []};
    var addFile = function(file, fileName) {
      files.push({file: file, name: fileName});
    };
    var setSelect = function(val) {
        info.select = val;
    }
    var setSelection = function(arr) {
        info.selection = [];
        for (var i = 0, l = arr.length; i < l; i++) {
            info.selection.push(arr[i]);
        }
    }
    return {
        addFile: addFile,
        files: files,
        info: info,
        setSelection: setSelection,
        selection: info.selection,
        setSelect: setSelect
    }
});