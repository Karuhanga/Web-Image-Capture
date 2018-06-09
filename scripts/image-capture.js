var selector;
var finalFile;
var POST_URL='http://google.com';

window.addEventListener('load', function () {
	selector = document.querySelector('select');
	initialiseCapture();
	setUpListeners();
});

function setUpListeners() {
	document.querySelector('#id-button-capture').addEventListener('click', captureImage);
	document.querySelector('#id-button-submit').addEventListener('click', onSubmit);
}

function initialiseCapture() {
	loadCaptureDevices();
}

function loadCaptureDevices() {
	if (mediaAvailable()) {
		loadVideoInputOptions();
	} else {
		notifyError("No input devices could be detected");
	}
}

function mediaAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function loadVideoInputOptions() {
	selector.onchange = switchStream();

	navigator.mediaDevices.enumerateDevices().then(displayVideoOptions).catch(notifyError);
}

function displayVideoOptions(devices) {
	var device;
	for(device in devices){
		device = devices[device]
		if (device.kind == 'videoinput') {
			var option = document.createElement('option');
			option.value = device.deviceId;
			option.text = 'Stream ' + (selector.length+1) + " " + device.label;
			selector.appendChild(option);
		}
	}
	switchStream();
}

function switchStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  var requirements = {
    'video': {
      deviceId: {exact: selector.value}
    }
  };
  console.log(selector.value);

  navigator.mediaDevices.getUserMedia(requirements).then(onStreamReady).catch(notifyError);
}

function onStreamReady(stream) {
  window.stream = stream; // make stream available to console
  document.querySelector('video').srcObject = stream;
}

function notifyError(error) {
  console.error('Error: ', error);
}

function captureImage() {
	document.querySelector('#id-button-capture').innerHTML = "Recapture";
	canvas = takeImageShot();
	hideLoader();
	displayImage(canvas);
	enableSubmit(canvas);
}

function takeImageShot() {
	var videoFeed = document.querySelector('video');
	var canvas = document.createElement('canvas');
	canvas.width = videoFeed.videoWidth;
	canvas.height = videoFeed.videoHeight;
	canvas.getContext('2d').drawImage(videoFeed, 0, 0);
	return canvas
}

function hideLoader() {
	var loader = document.querySelector('#id-loader');
	loader.style.display = 'none';
}

function displayImage(canvas) {
	var imageHolder = document.querySelector('#id-image');
	imageHolder.width = document.querySelector('video').width;
	imageHolder.src = canvas.toDataURL('image/png');
	imageHolder.style.display = 'unset';
}

function enableSubmit(canvas) {
	finalFile = canvas.toDataURL('image/png');
	var submitButton = document.querySelector('#id-button-submit');
	submitButton.disabled = false;
}

function onSubmit() {
	fetch(POST_URL, {
	    method: 'POST',
	    body: finalFile,
	    headers:{
	    	'Content-Type': 'image/png'
		}
	}).then(function(argument) {
		console.log('Success');
	}).catch(function(error) {
		console.log(error);
	})
}