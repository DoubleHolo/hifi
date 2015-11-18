createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
createjs.Sound.on('fileload', createjs.proxy(loadHandler));
createjs.Sound.volume = 0.25;

function loadHandler(event) {
    // This is fired for each sound that is registered.
    var instance = createjs.Sound.play(event.id);
}

var lastTic = Date.now();
var loadedSounds = [];

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    document.getElementById('volume').addEventListener('input', function(e) {
        createjs.Sound.volume = Number(e.target.value) / 100.0;
    });
});

setSocket();

var socket;

function setSocket()
{
    socket = io();
    socket.on('queue', getSounds);
}

function getSounds(queue)
{
    files = queue;
    for (var i = 0; i < files.length; i++) {
        file = files[i];
        if (-1 == loadedSounds.indexOf(file)) {
           createjs.Sound.registerSound(file + '.ogg', file, 16, 'sfx/');
           loadedSounds.push(file);
        } else {
           createjs.Sound.play(file);
        }
    }

}


function checkQueue() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener("load", queueResponse);
    httpRequest.open('POST', 'php/queue.php', true);
    var tic = Date.now();
    var range = "start=" + lastTic;

    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    httpRequest.send(range);
}

function queueResponse() {
    if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
            var response = JSON.parse(this.responseText);
            files = response.queue
            for (var i = 0; i < files.length; i++) {
                file = files[i];
                if (-1 == loadedSounds.indexOf(file)) {
                    createjs.Sound.registerSound(file + '.ogg', file, 16, 'sfx/');
                    loadedSounds.push(file);
                } else {
                    createjs.Sound.play(file);
                }
            }
            lastTic = response.timestamp;
        } else {
            alert('There was a problem with the request.');
        }
    } else {
        lastTic = Date.now();
    }

    checkQueue();
}
