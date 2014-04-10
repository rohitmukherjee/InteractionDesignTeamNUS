$(document).ready(function(e, th) {
	//Setup, remove it when merge
	$.touch.triggerMouseEvents = true; // enable mouse events
	var slideCount = 26;

	//Touch the slide in grid view function, the index + 1 is the slide number
	var girdTouchSlide = function() {
		alert("HI,U Touch Me");
		alert($(this).index()+1);
	};

	//Back button function
	var gridBackButton = function() {
		alert("HI,U Wanna Back");
	}

	//Draw slides in gird view
	for (var i = 1; i <= slideCount; i++) {
		$('<img></img>', { src: 'slides/Slide' + i + '.PNG' , class: 'grid-image'}).touch(girdTouchSlide).appendTo('#grid-image-container');
	}

	//Register back function
	$('#grid-back').touch(gridBackButton);
});
