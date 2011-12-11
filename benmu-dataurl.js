// [255, 0] -> "%FF%00"
function b(values) {
    var out = "";
    for (var i = 0; i < values.length; i++) {
        var hex = values[i].toString(16);
        if (hex.length == 1) hex = "0" + hex;
        out += "%" + hex;
    }
    return out.toUpperCase();
}


function makeDataUrl(mimeType, byteArray) {
    return "data:" + mimeType + "," + b(byteArray);
}