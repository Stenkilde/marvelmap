(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('nodesDropzone', nodesDropzone);

	/* @ngInject */
	function nodesDropzone() {
		/**
		 * @ngdoc directive
		 * @name oompApp.directive:nodesDropzone
		 * @description
		 * # nodesDropzone
		 */
		var directive = {

			link: link,
			restrict: 'EA',
			scope: {
				noOnDrop: '='
			}
		};

		return directive;

		function link(scope, element, attrs){
			/* The dragging code for '.draggable' from the demo above
			 * applies to this demo as well so it doesn't have to be repeated. */

			// enable draggables to be dropped into this
			interact(element[0]).dropzone({
				// only accept elements matching this CSS selector
				accept: 'li',
				// Require a 75% element overlap for a drop to be possible
				overlap: 1,

				// listen for drop related events:

				ondropactivate: function (event) {
					// add active dropzone feedback
					event.target.classList.add('drop-active');
				},
				ondragenter: function (event) {
					console.log('DROP ENTER');
					var draggableElement = event.relatedTarget,
						dropzoneElement = event.target;

					// feedback the possibility of a drop
					dropzoneElement.classList.add('drop-target');
					draggableElement.classList.add('can-drop');
				},
				ondragleave: function (event) {
					// remove the drop feedback style
					event.target.classList.remove('drop-target');
					event.relatedTarget.classList.remove('can-drop');
				},
				ondrop: function (event) {
					scope.noOnDrop(event);
				},
				ondropdeactivate: function (event) {
					// remove active dropzone feedback
					event.target.classList.remove('drop-active');
					event.target.classList.remove('drop-target');
				}
			});
		};
	};
})();
