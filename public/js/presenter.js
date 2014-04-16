
$(function() {

	/** Declare state variables and constants here*/

	var slideCount = 26;
	var timer = 0;
	var slideshow = false;
	var currentSlide = 1;
	var _handle = false;
	// This flag is set to true whenever the user FIRST goes into grid view, It prevents reloading images unnecessarily
	var loadedIntoGridView = false;

// Plays/Pauses slide show and timer on click. Used for starting the show as well
	$('#play_pause').touch(function() {
		if (!slideshow) {
			slideshow = true;
			updateSlide('slides/Slide' + currentSlide + '.PNG');
		}
		if (!_handle)
			startTimer();
		else
			stopTimer();
	});

	/* Handlers for showing and hiding the grid view  - PC*/

	$('#grid_button').click(showGridView);
	$('#grid-back').click(hideGridView);

	/* Touch Gestures go here */

	$('#grid_button').touch(showGridView);
	$('#grid-back').touch(hideGridView);	


	/* Handlers for handling slide show logic */

	$('#slide_container').dblclick(function () {
		console.log("Double click triggered on slide_container");
		previousSlide();
	});

	$('#slide_container').click(function () {
		console.log("Single click triggered on slide_container");
		nextSlide();
	});


	// predefined swipe left for next/swipe right for prev
	$('#slide_container').swipe({ direction: 'right', distance: 'short', speed: 'medium' }, function() {
			// if (!$('#slide_container').is(':animated')) { // wait for animation to end
				previousSlide();
		}).swipe({ direction: 'left', distance: 'short', speed: 'medium' }, function() {
			if (!$('#slide_container').is(':animated'))// wait for animation to end
				nextSlide();
	
		});

		/*---------*/
		/* startup */
		/*---------*/

		// configure jQMultiTouch
		// Hide the button panel on application start - up
		 // if (screen.width <= 700)
		 // $('#button_panel').hide();

		$('#slide_container').touch(function() {
			$('#button_panel').toggle('fade');
		});
		
		$(document).ready(loadSlidePreview);

		$.touch.preventDefault = true; // disable default behaviour

		$.touch.triggerMouseEvents = true; // enable mouse events

		$.touch.orientationChanged(function(e, orientation) {
			// TODO handle orientation
			//updateCanvas();
		});

		// connect to Presi
		var socket = io.connect('http://' + window.location.host),
		channel = location.hash || prompt('Channel:');

		/*---------*/
		/* preview */
		/*---------*/

		// This bit is only to toggle the play and pause buttons
		$('#play_pause').on("click", function() {
			var el = $(this);
			el.text() == el.data("text-swap") 
			? el.text(el.data("text-original")) 
			: el.text(el.data("text-swap"));
		});

		$('#play_pause').on("touch", function() {
			var el = $(this);
			el.text() == el.data("text-swap") 
			? el.text(el.data("text-original")) 
			: el.text(el.data("text-swap"));
		});

		/*---------*/
		/* Helper Functions */
		/*---------*/

		function loadSlidePreview() {
				for (var i = 1; i <= slideCount; i++) {	
				// set the width of list - container
				$('#list-container').css({'width' : slideCount * 65 + 'px'});
				$('#list').append('<li id=' + i + ' >');
				$('<img></img>', { src: 'slides/Slide' + i + '.PNG' }).appendTo("#" + i);
				$("#list #" + i).append('</li>');
				$("#list #" + i).touch(slideTouchEvent);
			// console.log($('#preview').html());
		}
	}

		function slideTouchEvent() {
			var $this = $(this);
			var slide = $this.index() + 1;
			updateSlide($this.attr('src'));
			currentSlide = slide;
			updateSlide('slides/Slide' + slide + '.PNG', 'slide', { direction: 'left' }, 'slide', { direction: 'right' });
		}

	function updateSlideStatus(currentSlide) {
		$('#slide_status').text(currentSlide + ' / ' + slideCount);
	}

	function stopTimer() {
		clearInterval(_handle);
		_handle = false;
	}

	function startTimer() {
		_handle = setInterval(function() {
			timer++;
			$('#timer').text(Math.floor(timer / 60) + ':' + ((timer % 60) < 10 ? '0' : '') + (timer % 60));
		}, 1000);
	}

	function nextSlide() {
		if (currentSlide == slideCount) return;
		currentSlide ++;
		updateSlide('slides/Slide' + currentSlide + '.PNG', 'slide', { direction: 'left' }, 'slide', { direction: 'right' });
	}

	function previousSlide() {
		if (currentSlide == 1) return;
		currentSlide --;
		updateSlide('slides/Slide' + currentSlide + '.PNG', 'slide', { direction: 'left' }, 'slide', { direction: 'right' });
	}

	function updateSlide(url, hideEffect, hideEffectOptions, showEffect, showEffectOptions) {
		updateSlideStatus(currentSlide);
		if (typeof hideEffect === 'undefined') hideEffect = 'fade';
		if (typeof showEffect === 'undefined') showEffect = 'fade';
		$('#slide_container').hide(hideEffect, hideEffectOptions, function() {
			$('#slide_container').css('background-image', 'url(' + url + ')');
			$('#slide_container').show(showEffect, showEffectOptions);
		});
			if (slideshow) { // only update display if slideshow is running
				socket.emit('issueCommand', { channel: channel, command: 'slide', url: url });
			}
		}

		/* Grid view specific code here */
		function showGridView() {
			$('#grid-view-container').css({"display" : "block"});
			$('#grid-view-navigate').css({"display" : "block"});
			$('#grid-image-container').css({"display" : "block"});
			loadSlidesIntoGridView();
		}

		function hideGridView() {
			$('#grid-view-container').css({"display" : "none"});
			$('#grid-view-navigate').css({"display" : "none"});
			$('#grid-image-container').css({"display" : "none"});
		}

		function loadSlidesIntoGridView() {
			if (!loadedIntoGridView) {
				for (var i = 1; i <= slideCount; i++) {
					$('<img></img>', { src: 'slides/Slide' + i + '.PNG' , class: 'grid-image'}).touch(gridTouchSlide).appendTo('#grid-image-container');
				}
				loadedIntoGridView = true;
			}
			}

		function gridTouchSlide() {
			var slideClickedOn = $(this).index() + 1;
			console.log("You clicked on slideNumber " + slideClickedOn);
			currentSlide = slideClickedOn;
			updateSlide('slides/Slide' + slideClickedOn + '.PNG', 'slide', { direction: 'left' }, 'slide', { direction: 'right' });
			hideGridView();
		}

	})