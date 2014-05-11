
$(function() {

	/** Declare state variables and constants here*/

	var slideCount = 26;
	var timer = 0;
	var slideshow = false;
	var mode = 'slideshow';	
	var currentSlide = 1;
	var _handle = false;
	var color = '#ff0000';
	// This flag is set to true whenever the user FIRST goes into grid view, It prevents reloading images unnecessarily
	var loadedIntoGridView = false;

	// Plays/Pauses slide show and timer on click. Used for starting the show as well
	var playPauseButton = document.getElementById('play_pause');
	console.log("Binding playPause button");
	Hammer(playPauseButton).on("tap", function(event) {
		if (!slideshow) {
			slideshow = true;
			// $("#play_pause").css('background-image', 'icons/pause.PNG');
			
			updateSlide('slides/Slide' + currentSlide + '.PNG');
		}
		if (!_handle){
			$('#play_pause').css("background-image", "url(../icons/pause.png)"); 
			$("#play_pause").data("mode", "pause")
			startTimer();
		}
		else
		{	
			stopTimer();
			$('#play_pause').css("background-image", "url(../icons/play.png)"); 
			$("#play_pause").data("mode", "play")
		}
	});

	/* Handlers for showing and hiding the grid view */
	
	var gridButton = document.getElementById('grid_button'); 
	var gridBack = document.getElementById('grid-back'); 
	
	gridBack.click(hideGridView);
	gridButton.click(showGridView);

	console.log("Binding touch events to grid button");
	Hammer(gridButton).on("tap", function(event) {
		showGridView();
	});

	console.log("Binding touch events to grid back");
	Hammer(gridBack).on("tap", function(event) {
	hideGridView();
	});
	
	/* Handlers for showing and hiding annotation view */
	var annotationButton = document.getElementById('annotation_button');
	var annotationBack = document.getElementById('annotation-back');
	var redButton = document.getElementById('color-red');
	var yellowButton = document.getElementById('color-yellow');
	var greenButton = document.getElementById('color-green');
	var blueButton = document.getElementById('color-blue');

	annotationButton.click(showAnnotationView);
	annotationBack.click(hideAnnotationView);

	console.log("Binding touch events to annotation button");
	Hammer(annotationButton).on("tap", function(event) {
		showAnnotationView();
	});

	console.log("Binding touch events to annotation back button");
	Hammer(annotationBack).on("tap", function(event) {
		hideAnnotationView();
	});

	Hammer(redButton).on("tap", function(event) {
		pickColor('r');
	});
	Hammer(yellowButton).on("tap", function(event) {
		pickColor('y');
	});
	Hammer(greenButton).on("tap", function(event) {
		pickColor('g');
	});
	Hammer(blueButton).on("tap", function(event) {
		pickColor('b');
	});
	/* Handlers for showing and hiding the settings view */

	var settingsButton = document.getElementById('settings_button'); 
	var settingsBack = document.getElementById('settings-back'); 
	
	settingsButton.click(showSettingsView);
	settingsBack.click(hideSettingsView);	

	console.log("Binding touch events to settings button");
	Hammer(settingsButton).on("tap", function(event) { 
		showSettingsView();
	});

	console.log("Binding touch events to settings back");
	Hammer(settingsBack).on("tap", function(event) {
		hideSettingsView();
	});

	/* Handlers for handling slide show logic */
	var el = document.getElementById('slide_container');
  	Hammer(el).on("swipeleft", function(event) {
    	nextSlide();
    	});

    	Hammer(el).on("swiperight", function(event) {
        previousSlide();
    	});

	/*---------*/
	/* startup */
	/*---------*/

	// configure jQMultiTouch
	// Hide the button panel on application start - up
	
	if (window.orientation == 0) {
		console.log("Initial orientation is portrait!!");
		$('#button_panel').hide();
		var el = document.getElementById('slide_container');
		Hammer(el).on("tap", function(event) {
			$('#button_panel').toggle();
	    });
	    var el = document.getElementById('button_panel');
		Hammer(el).on("tap", function(event) {
			$('#button_panel').toggle();
	    });
	} else {
		console.log("Initial orientation is landscape!!");
		$('#button_panel').show();
	}

	$(window).on("orientationchange",function(){
		
	  	if(window.orientation == 0) // Portrait
	  	{
	  		console.log("orientation changes to portrait!!");
		    $('#button_panel').hide();
			var el = document.getElementById('slide_container');
			Hammer(el).on("tap", function(event) {
				$('#button_panel').toggle();
		    });
		    var el = document.getElementById('button_panel');
			Hammer(el).on("tap", function(event) {
				$('#button_panel').toggle();
		    });
	  	}
		else // Landscape
		{
			console.log("orientation changes to landscape!!");
	    	$('#button_panel').show();
			var el = document.getElementById('slide_container');
			Hammer(el).off('tap');
			Hammer(el).destroy();
			var el = document.getElementById('button_panel');
			Hammer(el).off('tap');
			Hammer(el).destroy();
	  	}
	});
	$(document).ready(loadSlidePreview);

	//$.touch.preventDefault = true; // disable default behaviour

	$.touch.triggerMouseEvents = true; // enable mouse events

	// connect to Presi
	var socket = io.connect('http://' + window.location.host),
	channel = location.hash || prompt('Channel:');

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
		if (currentSlide === slideCount) return;
		if (!slideshow) {
			currentSlide = 0;
			slideshow = true;
		}
		currentSlide++;
		console.log("Moving to next slide " + currentSlide);
		updateSlide('slides/Slide' + currentSlide + '.PNG', 'slide', { direction: 'left' }, 'slide', { direction: 'right' });
	}

	function previousSlide() {
		if (currentSlide === 1) return;
		currentSlide--;
		console.log("Moving to previous slide " + currentSlide);
		updateSlide('slides/Slide' + currentSlide + '.PNG', 'slide', { direction: 'right' }, 'slide', { direction: 'left' });
	}

	function updateSlide(url, hideEffect, hideEffectOptions, showEffect, showEffectOptions) {
		updateSlideStatus(currentSlide);
		updateNotes();
		updateScrollPreview();
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


	function updateNotes() {
		$("#notes_container").empty();
		$.get('notes/' + currentSlide + '.txt', function(data) {
		})
		.fail(function() {
			console.log(currentSlide + "has no notes");
		})
		.success(function(data) {
			if (data !== undefined)
	 		   	$("#notes_container").text(data);
		});
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
	
	/* Settings view specific code here*/
	function showSettingsView() {
		$('#settings-view-container').css({"display" : "block"});
		$('#settings-view-navigate').css({"display" : "block"});
		$('#slide-container-slider').css({"display" : "block"});
	}

	function hideSettingsView() {
		$('#settings-view-container').css({"display" : "none"});
		$('#settings-view-navigate').css({"display" : "none"});
		$('#slide-container-slider').css({"display" : "none"});
		setNewSlideContainerSize();
	}

	function setNewSlideContainerSize() {
		var sliderValue = $("#slide-size-slider").html();
		$("#slide_container").css('height', sliderValue + '%');
		$("#slide_container").css('background-size', sliderValue + '%');
		$("#notes_container").css('height', (100 - sliderValue) + '%');
		$("#notes_container").css('background-size', (100 - sliderValue) + '%');
	}

	/* Annotation View specific code here*/
	function showAnnotationView() {
		$('#annotation_panel').css({"display" : "block"});
		$('#button_panel').css({"display" : "none"});
	}

	function hideAnnotationView() {
		$('#annotation_panel').css({"display" : "none"});
		$('#button_panel').css({"display" : "block"});
		clearCanvas();
		mode='slideshow';
		$('#canvas').hide();
		hideColorPicker();
	}

	//Pen
	$('#annotation-pen').touch(function(){
		if (mode != 'pen') {
			mode = 'pen';
			showColorPicker();
			pickColor('r');
			$('canvas').touchable({
				touchDown: function() { return false; }, // do nothing
				touchMove: drawPen,
				touchUp: function() { return false; }, // do nothing
			}).show();
		} else {
			mode = 'slideshow';
			$('#canvas').hide();
		}
		updateCanvas();
	});

	// highlight
	$('#annotation-highlight').touch(function(){
		if (mode != 'highlight') {
			mode = 'highlight';
			showColorPicker();
			pickColor('y');
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

	//laser
	$('#annotation-laser').touch(function(){
		if (mode != 'laser') {
			mode = 'laser';
			pickColor('r');
			showColorPicker();
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

	function drawLaser(e) {
		var ctx = this.getContext('2d'),
			$this = $(this),
			offset = $this.offset(),
			x = e.clientX-5-offset.left,
			y = e.clientY-5-offset.top;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.arc(x, y, 10, 0, Math.PI*2, true);
		ctx.fillStyle = color;
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
		ctx.strokeStyle = color;
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
		ctx.strokeStyle = color;
		ctx.stroke();
		if (slideshow) { // only update display if slideshow is running
			socket.emit('issueCommand', { channel: channel, command: 'drawHighlight', x1: x1, x2: x2, y1: y1, y2: y2 });
		}
	}
	function updateCanvas() {
		// resize canvas
		var $slide = $('#slide_container'),
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

	function showColorPicker() {
		$('#annotation-color-picker').css({"display" : "block"});
	}

	function hideColorPicker() {
		$('#annotation-color-picker').css({"display" : "none"});
	}

	function pickColor(c) {
		$('#color-yellow').css({"border": "0px solid red"});
		$('#color-green').css({"border": "0px solid red"});
		$('#color-blue').css({"border": "0px solid red"});
		$('#color-red').css({"border": "0px solid red"});
		switch(c) {
			case 'y':
				color = '#ffff00';
				$('#color-yellow').css({"border": "1px solid red"});
			break;
			case 'r':
				color = '#ff0000';
				$('#color-red').css({"border": "1px solid red"});
			break;
			case 'b':
				color = '#0066FF';
				$('#color-blue').css({"border": "1px solid red"});
			break;
			case 'g':
				color = '#00FF00';
				$('#color-green').css({"border": "1px solid red"});
			break;
		}
	}
	/* Functions to handle autoscrolling */

	function updateScrollPreview() {
		if ($(window).width() > 700) {
			console.log("Device is in horizontal position");
			updateScrollPreviewHorizontal();
		}

		else if ($(window).width() < 700) {
			console.log("Device is in vertical position");
			updateScrollPreviewVertical();
		}
	}

	function updateScrollPreviewHorizontal() {
		var divId = $("#preview");
		var scrollAmount = currentSlide;
		console.log("Autoscrolling preview vertically " + divId.scrollTop());
		divId.scrollTop(scrollAmount * 65);
	}

	function updateScrollPreviewVertical() {
		var divId = $("#preview");
		var scrollAmount = currentSlide;
		console.log("Autoscrolling preview horizontally " + divId.scrollLeft());
		divId.scrollLeft(scrollAmount * 65 * 0.4);
	}

	/* Orientation specific helper functions */

	function isVertical() {
		var width =  $(window).width();
		return Boolean(width < 700);
	}

	function isHorizontal() {
		var width =  $(window).width();
	    return Boolean(width >= 701);
	}

})
