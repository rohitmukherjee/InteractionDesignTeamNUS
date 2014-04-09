$(function() {

/*---------*/
/* startup */
/*---------*/

	// configure jQMultiTouch
	// Hide the button panel on application start - up
	$('#button_panel').hide();

	$(document).touch(function() {
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