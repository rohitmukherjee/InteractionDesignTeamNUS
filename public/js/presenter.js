
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

	function updateScrollPreview() {
	var divId = $("#preview");
	var scrollAmount = currentSlide;
	console.log("Autoscrolling preview" + divId.scrollTop());
	divId.scrollTop(scrollAmount * 65);	
	}

})
