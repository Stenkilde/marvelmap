myApp.config(function($stateProvider, $urlRouterProvider) {


	// Here we make our 404 state
	$urlRouterProvider.otherwise('home');


	// Here we make our real routes
	$stateProvider
		.state('home', {
			url: '/',
			controller: 'HomeCtrl',
			templateUrl: 'views/home.html'
		})
		.state('map', {
			url: '/map',
			controller: 'MapCtrl',
			templateUrl: 'views/map.html'
		})
		.state('about', {
			url: '/about',
			controller: 'AboutCtrl',
			templateUrl: 'views/about.html'
		})
});