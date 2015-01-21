myApp.controller('MapCtrl', function ($scope, ngDialog) {
	$scope.xandarOpen = function () {
		ngDialog.open({
			template: 'templates/xandar.html',
			className: 'ngdialog-theme-default'
		});
	};
	$scope.knowhereOpen = function () {
		ngDialog.open({
			template: 'templates/knowhere.html',
			className: 'ngdialog-theme-default'
		});
	};
	$scope.earthOpen = function () {
		ngDialog.open({
			template: 'templates/earth.html',
			className: 'ngdialog-theme-default'
		});
	};
});