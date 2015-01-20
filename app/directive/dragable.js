// Nodes Dragable

(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('nodesDraggable', nodesDraggable);

	/* @ngInject */
	function nodesDraggable($http, $compile, $timeout) {
		/**
		 * @ngdoc directive
		 * @name oompApp.directive:nodesDraggable
		 * @description
		 * # nodesDraggable
		 */
		var directive = {
			link: link,
			restrict: 'EA'
			//scope: {
			//    clone: '=',
			//    restrict: '@',
			//    onMove: '='
			//}
		};

		return directive;

		function link(scope, element, attrs){
			// target elements with the "draggable" class
			var clone, lastX, lastY, firstMove = true, onMove = false;
			var restrictions = false;

			// InteractJS dragging options
			var options = {
				// allow dragging of multple elements at the same time
				max: Infinity,
				snap: {
					targets: [
						interact.createSnapGrid({ x: 10, y: 10 })
					],
					range: Infinity,
					elementOrigin: { x: 0, y: 0 }
				},
				onstart: onstart,
				// call this function on every dragmove event
				onmove: onmove,
				// call this function on every dragend event
				onend: onend
			};

			scope.$watch(attrs.clone, function(newVal, oldVal) {
				if(newVal) {
					clone = newVal;
				}
			}, true);

			scope.$watch(attrs.onMove, function(newVal, oldVal) {
				if(newVal) {
					onMove = newVal;
				}
			});

			$timeout(function() {
				calcRestrictions();
			});

			interact(element[0]).draggable(options);

			function calcRestrictions() {
				if(attrs.restrict) {
					var target = element;
					var parent = target.parent();

					restrictions = {
						element: {
							width: target.width(),
							height: target.height()
						},
						parent: {
							width: parent.width(),
							height: parent.height()
						},
						x: {
							min: Math.floor( parent.offset().left - target.offset().left ),
							max: Math.floor( (parent.width() + parent.offset().left) - (target.width() + target.offset().left) ) - 2
						},
						y: {
							min: Math.floor( parent.offset().top - target.offset().top ),
							max: Math.floor( (parent.height() + parent.offset().top ) - (target.height() + target.offset().top) ) - 2
						}
					};
				}
			}

			function recalcRestrictions(target) {
				var elm     = angular.element(target),
					eHeight = elm.height(),
					eWidth  = elm.width(),
					parent  = elm.parent(),
					pHeight = parent.height(),
					pWidth  = parent.width(),
					min,
					max,
					diff;

				// If element changed width
				if( restrictions.element.width !== eWidth ) {
					// Element resized smaller
					if(restrictions.element.width > eWidth) {
						diff = restrictions.element.width - eWidth;
						restrictions.x.max = restrictions.x.max + diff;
					} else {
						diff = eWidth - restrictions.element.width;
						restrictions.x.max = restrictions.x.max - diff;
					}
					restrictions.element.width = eWidth;
				}

				// If element changed height
				if( restrictions.element.height !== eHeight ) {
					// Element resized smaller
					if(restrictions.element.height > eHeight) {
						diff = restrictions.element.height - eHeight;
						restrictions.y.max = restrictions.y.max + diff;
					} else {
						diff = eHeight - restrictions.element.height;
						restrictions.y.max = restrictions.y.max - diff;
					}
					restrictions.element.height = eHeight;
				}

				// If parent changed width
				if( restrictions.parent.width !== pWidth ) {
					// Element resized smaller
					if(restrictions.parent.width > pWidth) {
						diff = restrictions.parent.width - pWidth;
						restrictions.x.max = restrictions.x.max - diff;
					} else {
						diff = pWidth - restrictions.parent.width;
						restrictions.x.max = restrictions.x.max + diff;
					}
					restrictions.parent.width = pWidth;
				}

				// If parent changed height
				if( restrictions.parent.height !== pHeight ) {
					// Element resized smaller
					if(restrictions.parent.height > pHeight) {
						diff = restrictions.parent.height - pHeight;
						restrictions.y.max = restrictions.y.max - diff;
					} else {
						diff = pHeight - restrictions.parent.height;
						restrictions.y.max = restrictions.y.max + diff;
					}
					restrictions.parent.height = pHeight;
				}
			};

			function onstart(event) {
				if( clone && clone.cloneable && !element.hasClass('clone') ) {
					try {
						element.after( $compile( element.clone() )(scope) );

						if(clone.template) {
							$http.get(clone.template).then(function(response) {
								element.html( $compile(response.data)(scope) );
							});
						}
						element.addClass('clone').attr('id', Math.random().toString(36).substring(7)).css({'z-index': 3});
					} catch(error) {
						console.log(error);
					}
				}
				element.addClass('dragging');
				if(!lastX || !lastY) {
					lastX = event.dx;
					lastY = event.dy;
				}
			}

			function onmove(event) {
				var target = event.target,
				// keep the dragged position in the data-x/data-y attributes
					x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
					y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

				// Round up to nearest 10 (snapping)
				x = Math.round(x / 10) * 10;
				y = Math.round(y / 10) * 10;

				if(attrs.restrict) {
					// If element or container has changed dimensions re-calc restrictions
					recalcRestrictions(target);

					x = Math.min(restrictions.x.max, x);
					x = Math.max(restrictions.x.min, x);

					y = Math.min(restrictions.y.max, y);
					y = Math.max(restrictions.y.min, y);
				}

				var oldX = target.getAttribute('data-x'),
					oldY = target.getAttribute('data-y');

				moveTarget(target, x, y);

				if(onMove) {
					if( !onMove( event, getDirection(target, x, y) ) ) {
						moveTarget( target, oldX, oldY );
					}
				}
			}

			function onend(event) {
				var target = event.target;
				element.removeClass('dragging');

				// If dropzone enabled
				if(element.attr('dropzone') === 'true') {
					if( element.hasClass('can-drop') ) {
						element.removeClass('dragging');
						element.addClass('dragged');

						// Save last allowed location
						lastX = parseFloat( target.getAttribute('data-x') );
						lastY = parseFloat( target.getAttribute('data-y') );

						firstMove = false;
					} else {
						// If clone remove element from dom otherwise move element to last allowed location
						if( element.hasClass('clone') && firstMove ) {
							element.remove();
						} else {
							moveTarget(target, x, y);
						}
					}
				}

			}

			function moveTarget(target, x, y) {
				// translate the element
				target.style.webkitTransform =
					target.style.transform =
						'translateZ(0) translate(' + x + 'px, ' + y + 'px)';

				// update the posiion attributes
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
			}

			function getDirection(target, x, y) {
				var cX = target.getAttribute('data-x'),
					cY = target.getAttribute('data-y');

				var direction = {up: false, down: false, left: false, right: false};

				if(x > cX) {
					direction.right = true;
				}
				if(x < cX) {
					direction.left = true;
				}
				if(y > cY) {
					direction.down = true;
				}
				if(y < cY) {
					direction.up = true;
				}

				return direction;
			}
		}
	}
})();
