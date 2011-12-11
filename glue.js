/**
 * Created by JetBrains WebStorm.
 * User: kukulski
 * Date: 12/10/11
 * Time: 7:15 PM
 * To change this template use File | Settings | File Templates.
 */
var el;

function stop() {
    if (el) document.getElementById('player').removeChild(el);
    el = null;
}

function playDataURI(uri) {
    stop();
    el = document.createElement("audio");
    el.setAttribute("autoplay", true);
    el.setAttribute("src", uri);
    el.setAttribute("controls", "controls");
    document.getElementById('player').appendChild(el);
}
