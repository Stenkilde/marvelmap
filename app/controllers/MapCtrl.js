myApp.controller('MapCtrl', ['$scope', function($scope) {
	$scope.dragOptions = {
		start: function(e) {
			console.log("STARTING");
		},
		drag: function(e) {
			console.log("DRAGGING");
		},
		stop: function(e) {
			console.log("STOPPING");
		},
		container: 'container'
	}
}]);
