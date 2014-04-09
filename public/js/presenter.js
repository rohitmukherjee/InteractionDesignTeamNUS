$(function() {

/** Declare state variables and constants here*/

var slideCount = 26;
var timer = 0;
/*---------*/
/* startup */
/*---------*/

	// configure jQMultiTouch
	// Hide the button panel on application start - up
	$('#button_panel').hide();

	$('#slide_container').touch(function() {
		$('#button_panel').toggle('fade');
	});
	
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

	// TODO: This can be optimized to not add slides on touch but on ready (only once)
	for (var i = 1; i <= slideCount; i++) {
		var slideTouchEvent = function() {
			if (mode != 'slideshow') return;
			var $this = $(this);
			slide = $this.index() + 1;
			updateSlide($this.attr('src'));
		};
		$('<img></img>', { src: 'slides/Slide' + i + '.PNG' }).touch(slideTouchEvent).appendTo('#preview');
	}

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

var slideshow = true;
function updateSlide(url, hideEffect, hideEffectOptions, showEffect, showEffectOptions) {
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