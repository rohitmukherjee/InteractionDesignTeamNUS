$(function() {

/*---------*/
/* startup */
/*---------*/

	// connect to Presi
	var channel = location.hash || prompt('Channel:');

	var socket = io.connect('http://' + location.host);
	socket.on('welcome', function (data) {
		console.log('Connection successful: ' + data.message);
		$('#display').show();
		socket.emit('join channel', channel);
	});
	var color;
/*----------*/
/* commands */
/*----------*/

	socket.on('command', function(data) {
		console.log('Received command from PresiShare: ' + JSON.stringify(data));
		switch (data.command) {
			case 'reset':
				$('#slide').hide();
				break;
			case 'slide':
				console.log('Update slide: ' + data.url);
				$('#slide').css('background-image', 'url(' + data.url + ')').show();
				break;
			case 'blackscreen':
				console.log('Toggle blackscreen: ' + data.showOrHide);
				$('#blackscreen').toggle(data.showOrHide);
				break;
			case 'whitescreen':
				console.log('Toggle whitescreen: ' + data.showOrHide);
				$('#whitescreen').toggle(data.showOrHide);
				break;
			case 'drawLaser':
				if (!data.x) break; // sometimes not all data is sent
				var ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.beginPath();
				ctx.arc(data.x, data.y, 10, 0, Math.PI*2, true);
				ctx.fillStyle = color;
				ctx.fill();
				break;
			case 'drawPen':
				if (!data.x1) break; // sometimes not all data is sent
				var ctx = canvas.getContext('2d');
				ctx.beginPath();
				ctx.moveTo(data.x1, data.y1);
				ctx.lineTo(data.x2, data.y2);
				ctx.lineCap = 'round';
				ctx.lineWidth = 5;
				ctx.strokeStyle = color;
				ctx.stroke();
				break;
			case 'drawHighlight':
				if (!data.x1) break; // sometimes not all data is sent
				var ctx = canvas.getContext('2d');
				ctx.beginPath();
				ctx.moveTo(data.x1, data.y1);
				ctx.lineTo(data.x2, data.y2);
				ctx.lineCap = 'square';
				ctx.lineWidth = 20;
				ctx.strokeStyle = color;
				ctx.stroke();
				break;
			case 'clearCanvas':
				var ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				break;
			case 'canvas':
				console.log('Canvas: ' + data.width + 'x' + data.height);
				$('canvas').attr({ width: data.width, height: data.height });
				break;
			case 'changeColor':
				color = data.color;
				break;
			default:
				console.warn('Unexpected data: ' + data);
				break;
		}
	});

});