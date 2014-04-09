$(function() {
	var slideCount = 26;
	var slideTouchEvent = function() {
		alert("HI,U Touch Me");
	};
	for (var i = 1; i <= slideCount; i++) {
		$('<img></img>', { src: 'slides/Slide' + i + '.PNG' , class: 'grid-image'}).touch(slideTouchEvent).appendTo('#container');
	}
});

