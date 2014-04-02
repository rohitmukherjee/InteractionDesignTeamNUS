// Last modified: 27.03.2014
$(function() {

/*--------*/
/* config */
/*--------*/

	var timer = 0,			// slideshow timer
		slide = 1,			// current slide
		slideCount = 26,	// number of slides
		slideshow = false,	// slideshow running
		mode = 'slideshow',	// slideshow|black|white|laser|pen|highlight
		_handle = false;	// helper variable

	console.log('This is good for debugging!');
	
/*----------*/
/* commands */
/*----------*/

	// start
	$('#start').touch(function() {
		if (mode != 'slideshow') return;
		slideshow = true;
		updateSlide('slides/Slide' + slide + '.PNG'); // show current slide
		if (!_handle) {
			_handle = setInterval(function() {
				timer++;
				$('#timer').text(Math.floor(timer / 60) + ':' + ((timer % 60) < 10 ? '0' : '') + (timer % 60));
			}, 1000);
		}
	});

	// stop
	$('#stop').touch(function() {
		if (mode != 'slideshow') return;
		if (!slideshow) { // reset timer if stop touched twice
			timer = 0;
			$('#timer').text('0:00');
		}
		slideshow = false;
		socket.emit('issueCommand', { channel: channel, command: 'reset' });
		if (_handle) {
			clearInterval(_handle);
			_handle = null;
		}
	});

	// next
	$('#next').touch(function() {
		if (mode != 'slideshow' || slide == slideCount) return;
		slide++;
		updateSlide('slides/Slide' + slide + '.PNG', 'slide', { direction: 'left' }, 'slide', { direction: 'right' });
 	});

	// prev
	$('#prev').touch(function() {
		if (mode != 'slideshow' || slide == 1) return;
		slide--;
		updateSlide('slides/Slide' + slide + '.PNG', 'slide', { direction: 'right' }, 'slide', { direction: 'left' });
	});

	// first
	$('#first').touch(function() {
		if (mode != 'slideshow') return;
		slide = 1;
		updateSlide('slides/Slide' + slide + '.PNG');
	});

	// last
	$('#last').touch(function() {
		if (mode != 'slideshow') return;
		slide = slideCount;
		updateSlide('slides/Slide' + slide + '.PNG');
	});

	// blackscreen
	$('#black').touch(function() {
		if (mode != 'black') {
			mode = 'black';
			$('#whitescreen').hide();
			$('#blackscreen').show();
		} else {
			mode = 'slideshow';
			$('#blackscreen').hide();
		}
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'blackscreen', showOrHide: $('#blackscreen').is(':visible') });
			socket.emit('issueCommand', { channel: channel, command: 'whitescreen', showOrHide: $('#whitescreen').is(':visible') });
		}
	});

	// whitescreen
	$('#white').touch(function() {
		if (mode != 'white') {
			mode = 'white';
			$('#blackscreen').hide();
			$('#whitescreen').show();
		} else {
			mode = 'slideshow';
			$('#whitescreen').hide();
		}
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'blackscreen', showOrHide: $('#blackscreen').is(':visible') });
			socket.emit('issueCommand', { channel: channel, command: 'whitescreen', showOrHide: $('#whitescreen').is(':visible') });
		}
	});

	// laser
	$('#laser').touch(function(){
		if (mode != 'laser') {
			mode = 'laser';
			updateCanvas();
			$('canvas').touchable({
				touchDown: drawLaser,
				touchMove: drawLaser,
				touchUp: clearCanvas,
			}).show();
		} else {
			mode = 'slideshow';
			$('canvas').hide();
			clearCanvas();
		}
		updateCanvas();
	});

	// pen
	$('#pen').touch(function(){
		if (mode != 'pen') {
			mode = 'pen';
			$('canvas').touchable({
				touchDown: function() { return false; }, // do nothing
				touchMove: drawPen,
				touchUp: function() { return false; }, // do nothing
			}).show();
		} else {
			mode = 'slideshow';
			$('canvas').hide();
		}
		updateCanvas();
	});

	// highlight
	$('#highlight').touch(function(){
		if (mode != 'highlight') {
			mode = 'highlight';
			$('canvas').touchable({
				touchDown: function() { return false; }, // do nothing
				touchMove: drawHighlight,
				touchUp: function() { return false; }, // do nothing
			}).show();
		} else {
			mode = 'slideshow';
			$('canvas').hide();
			clearCanvas();
		}
		updateCanvas();
	});

/*-------*/
/* slide */
/*-------*/

/*
-------------------------------------------------------------------------------
Below you can find three different ways of implementing simple touch
interactions based on standard touch events, predefined gestures and
custom gestures.
-------------------------------------------------------------------------------
*/

$('#controls').hide();

$(document).touch(function() {
	$('#controls').show('fade');
});

	// simple touch for next
	$('#slide').touch(function() {
		$('#next').touch();
	});

/*
	// predefined swipe left for next/swipe right for prev
	$('#slide').swipe({ direction: 'right', distance: 'short', speed: 'medium' }, function() {
		if (!$('#slide').is(':animated')) { // wait for animation to end
			$('#prev').touch();
		}
	}).swipe({ direction: 'left', distance: 'short', speed: 'medium' }, function() {
		if (!$('#slide').is(':animated')) { // wait for animation to end
			$('#next').touch();
		}
	});

	// swipe right for prev, simple touch for next
	$('#slide').touchable({
		touchUp: function(e, th) {
			th = th.stop({ type: 'touchdown' }); // only look back until last touchdown
			if (th.match({ finger: 0, deltaX: '>100', time: '1..100' })) { // swipe right
				$('#prev').touch();
			} else {
				$('#next').touch();
			}
		},
	});
*/

/*---------*/
/* preview */
/*---------*/

	// generate slides for preview
	for (var i = 1; i <= slideCount; i++) {
		var slideTouchEvent = function() {
			if (mode != 'slideshow') return;
			var $this = $(this);
			slide = $this.index() + 1;
			updateSlide($this.attr('src'));
		};
		$('<img></img>', { src: 'slides/Slide' + i + '.PNG' }).touch(slideTouchEvent).appendTo('#preview');
	}

/*---------*/
/* startup */
/*---------*/

	// configure jQMultiTouch
	$.touch.preventDefault = true; // disable default behaviour

	$.touch.triggerMouseEvents = true; // enable mouse events

	$.touch.orientationChanged(function(e, orientation) {
		// TODO handle orientation
		updateCanvas();
	});

	// show first slide
	//$('#first').touch();

	// connect to Presi
	var socket = io.connect('http://' + window.location.host),
		channel = location.hash || prompt('Channel:');

/*------------------*/
/* helper functions */
/*------------------*/

	function updateSlide(url, hideEffect, hideEffectOptions, showEffect, showEffectOptions) {
		if (typeof hideEffect === 'undefined') hideEffect = 'fade';
		if (typeof showEffect === 'undefined') showEffect = 'fade';
		$('#slide').hide(hideEffect, hideEffectOptions, function() {
			$('#slide').css('background-image', 'url(' + url + ')');
			$('#slide').show(showEffect, showEffectOptions);
		});
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'slide', url: url });
		}
	}

	function drawLaser(e) {
		var ctx = this.getContext('2d'),
			$this = $(this),
			offset = $this.offset(),
			x = e.clientX-5-offset.left,
			y = e.clientY-5-offset.top;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.arc(x, y, 10, 0, Math.PI*2, true);
		ctx.fillStyle = '#ff0000';
		ctx.fill();
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'drawLaser', x: x, y: y });
		}
	}

	function drawPen(e, h) {
		var ctx = this.getContext('2d'),
			$this = $(this),
			offset = $this.offset(),
			e2 = h.get(0) || e,
			x1 = e2.clientX-offset.left,
			y1 = e2.clientY-offset.top,
			x2 = e.clientX-offset.left,
			y2 = e.clientY-offset.top;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineCap = 'round';
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#ff0000';
		ctx.stroke();
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'drawPen', x1: x1, x2: x2, y1: y1, y2: y2 });
		}
	}

	function drawHighlight(e, h) {
		var ctx = this.getContext('2d'),
			$this = $(this),
			offset = $this.offset(),
			e2 = h.get(0) || e,
			x1 = e2.clientX-offset.left,
			y1 = e2.clientY-offset.top,
			x2 = e.clientX-offset.left,
			y2 = e.clientY-offset.top;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineCap = 'square';
		ctx.lineWidth = 20;
		ctx.strokeStyle = '#ffff00';
		ctx.stroke();
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'drawHighlight', x1: x1, x2: x2, y1: y1, y2: y2 });
		}
	}

	function updateCanvas() {
		// resize canvas
		var $slide = $('#slide'),
			width = $slide.width(),
			height = $slide.height();
		$('canvas').attr({ width: width, height: height });
		// calibrate canvas on Presi Display
		socket.emit('issueCommand', { channel: channel, command: 'canvas', width: width, height: height });
	}

	function clearCanvas() {
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'clearCanvas' });
		}
	}

});