/**
 * Created by JetBrains WebStorm.
 * User: kukulski
 * Date: 12/10/11
 * Time: 7:15 PM
 * To change this template use File | Settings | File Templates.
 */

var playerElement;

function stop() {
    if (playerElement) playerElement.pause();
}

function playDataURI(uri) {
    stop();
    playerElement = document.getElementById("player");

    if(typeof(playerElement.play) == 'undefined')
        alert("You don't seem to have a browser that supports audio. It's ok, you're not a bad person. But this app will now fail.");

    playerElement.setAttribute("src", uri);
    playerElement.play();
}

function play(bits) {
    try {
        var riffData = makeRiff(bits);
        var url = makeDataUrl("audio/x-wav", riffData);
        playDataURI(url);
        document.getElementById('error').innerText = "";
    } catch (err) {
        document.getElementById('error').innerText = "" + err;
    }
}

