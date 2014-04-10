
$(function() {

/** Declare state variables and constants here*/

var slideCount = 26;
var timer = 0;
var slideshow = false;
var currentSlide = 1;
var _handle = false;


// Plays/Pauses slide show and timer on click. Used for starting the show as well
$('#play_pause').touch(function() {
		slideshow = true;
		updateSlide('slides/Slide' + currentSlide + '.PNG'); // show current slide
		if (!_handle) {
			// The timer is updated every 1 ms
			_handle = setInterval(function() {
				timer++;
				$('#timer').text(Math.floor(timer / 60) + ':' + ((timer % 60) < 10 ? '0' : '') + (timer % 60));
			}, 1000);
		}
	});


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
		if (!$('#slide_container').is(':animated')) { // wait for animation to end
			previousSlide();
		}
	}).swipe({ direction: 'left', distance: 'short', speed: 'medium' }, function() {
		if (!$('#slide_container').is(':animated')) { // wait for animation to end
			nextSlide();
		}
	});

/*---------*/
/* startup */
/*---------*/

	// configure jQMultiTouch
	// Hide the button panel on application start - up
	// $('#button_panel').hide();

	/*$('#slide_container').touch(function() {
		$('#button_panel').toggle('fade');
	});*/
	
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

	/*// TODO: This can be optimized to not add slides on touch but on ready (only once)
	for (var i = 1; i <= slideCount; i++) {
		var slideTouchEvent = function() {
			if (mode != 'slideshow') return;
			var $this = $(this);
			slide = $this.index() + 1;
			updateSlide($this.attr('src'));
		};
		$('<img></img>', { src: 'slides/Slide' + i + '.PNG' }).touch(slideTouchEvent).appendTo('#preview');
	}*/

	// This bit is only to toggle the play and pause buttons
	$('#play_pause').on("click", function() {
  	var el = $(this);
  	el.text() == el.data("text-swap") 
    ? el.text(el.data("text-original")) 
    : el.text(el.data("text-swap"));
});

/*---------*/
/* Helper Functions */
/*---------*/

function updateSlideStatus(currentSlide) {
	$('#slide_status').text(currentSlide + ' / ' + slideCount);
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
})