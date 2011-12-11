// Code in ~2 hours by Bemmu, idea and sound code snippet from Viznut.
// 2011-09-30 - Modifications by raer.
// 2011-10-07 - Modifications by raer.

function makeSampleFunction(oneLiner) {
    var oneLiner = oneLiner.replace(/sin/g, "Math.sin");
    var oneLiner = oneLiner.replace(/cos/g, "Math.cos");
    var oneLiner = oneLiner.replace(/tan/g, "Math.tan");
    var oneLiner = oneLiner.replace(/floor/g, "Math.floor");
    var oneLiner = oneLiner.replace(/ceil/g, "Math.ceil");
    eval("var f = function (t) { return " + oneLiner + "}");
    return f;
}

function getFrequency() {
    theform = document.forms[0];
    if (theform) {
        len = theform.samplerate.length;
        for (i = 0; i < len; i++) {
            if (theform.samplerate[i].checked) {
                return theform.samplerate[i].value;
            }
        }
    }
    return 8000;
}

function mixAB(a, b, t) {
    return (a + b * t) / (1.0 + t);
}

function generateSound() {
    //get + check input values and set proper value back
    var frequency = getFrequency();
    var t0 = (document.getElementById('t0').value < 0) ? 0 : document.getElementById('t0').value;
    document.getElementById('t0').value = t0;
    var tmod = (document.getElementById('tmod').value < 0) ? 0 : document.getElementById('tmod').value;
    document.getElementById('tmod').value = tmod;
    var seconds = (document.getElementById('duration').value < 1.0) ? 1.0 : document.getElementById('duration').value;
    document.getElementById('duration').value = seconds;
    var separation = document.getElementById('separation').value;
    if (separation < 0) {
        separation = 0;
        document.getElementById('separation').value = separation;
    }
    if (separation > 100) {
        separation = 100;
        document.getElementById('separation').value = separation
    }
    separation = 1.0 - separation / 100.0;

    var sampleArray = [];
    var f = makeSampleFunction(document.getElementById('oneliner').value);
    var f2 = null;
    var channels = 1;
    if (document.getElementById('oneliner2').value != "") {
        f2 = makeSampleFunction(document.getElementById('oneliner2').value);
        channels = 2;
    }

    for (var t = t0; t < frequency * seconds; t++) {
        //mod t with user-set value if any
        var cT;
        if (tmod > 0) {
            cT = t % tmod;
        }
        else {
            cT = t;
        }

        //left channel
        var sample = f(cT);
        sample = (sample & 0xff) * 256;

        var sample2;

        if (channels > 1 && f2 != null) {
            //right channel
            sample2 = f2(cT);
            sample2 = (sample2 & 0xff) * 256;
            //calculate value with stereo separation and normalize
            //before, not working: (sample + sample2 * separation) / (1.0 + separation);
            //better, not working: mixed = a + b – a*b / max
            var newSample = mixAB(sample, sample2, separation);
            var newSample2 = mixAB(sample2, sample, separation);
            sample = newSample;
            sample2 = newSample2;
        }
        //store left sample
        if (sample < 0) sample = 0;
        if (sample > 65535) sample = 65535;
        sampleArray.push(sample);
        //store right sample if any
        if (channels > 1 && f2 != null) {
            if (sample2 < 0) sample2 = 0;
            if (sample2 > 65535) sample2 = 65535;
            sampleArray.push(sample2);
        }
    }
    return {frequency:frequency,  sampleArray:sampleArray, channelCount:channels};
}

var canvas = null;
var ctx = null;
var imgd = null;

var el;
var lastPosition;

function generatePreview(data) {
    var channels = data.channelCount;
    var soundData = data.sampleArray;

    //get canvas element
    canvas = document.getElementById('canvas');
    //get drawing context from canvas element
    ctx = canvas.getContext("2d");

    if (!canvas || !canvas.getContext) {
        alert("No canvas or context. Your browser sucks!");
        return;
    }

    imgd = false;
    var width = canvas.width;
    var height = canvas.height;
    var x = 0;
    var y = 0;

    //Try to create image data from scratch
    //If that doesn't work, try to load it from the context
    //If that fails too, create an array of the same size and pray
    if (ctx.createImageData) {
        imgd = ctx.createImageData(width, height);
        //clear image
        ctx.fillStyle = "#FF0000FF";
        ctx.fillRect(0, 0, width, height);
    } else if (ctx.getImageData) {
        imgd = ctx.getImageData(0, 0, width, height);
        //clear image
        ctx.fillStyle = "#FF0000FF";
        ctx.fillRect(0, 0, width, height);
    } else {
        imgd = {'width' : width, 'height' : height, 'data' : new Array(width * height * 4)};
    }
    //get actual pixel data
    var pix = imgd.data;

    //calculate length of sample array an how many samples per pixel
    var nrOfSamples = soundData.length / channels;
    var samplesPerPixel = nrOfSamples / (width * height);

    //draw sample preview
    var iSample = 0;
    const base = (channels > 1) ? height / 2 : 0;
    const scale = (channels > 1 ? height / 2 : height) / 65535.0;
    for (var p = 0; p < (width * height); p++) {
        //accumulate sample data for pixel
        var sampleValue = 0;
        var sampleValue2 = 0;
        //for (var i = 0; i < samplesPerPixel; i++) {
        sampleValue += soundData[Math.floor(iSample/* + i*/) * channels];
        if (channels > 1) {
            sampleValue2 += soundData[Math.floor(iSample/* + i*/) * channels + 1];
        }
        //}
        sampleValue = sampleValue / 256; //(samplesPerPixel * 256.0);
        //var py = p / height; //base + sampleValue * scale;
        var index = (width * Math.floor(p % height) + Math.floor(p / height)) * 4;
        if (channels > 1) {
            //write right channel
            sampleValue2 = sampleValue2 / 256; //(samplesPerPixel * 256.0);
        }
        pix[index] = sampleValue;
        pix[index + 1] = sampleValue2;
        pix[index + 2] = 00;
        pix[index + 3] = 0xFF;
        //increase sample index
        iSample += 256 / height; //samplesPerPixel;
    }

    //write image data to canvas
    ctx.putImageData(imgd, 0, 0);
}


function onTimeUpdate() {
    if (el && canvas && ctx && imgd) {
        var pix = imgd.data;
        //alpha values from last position to FF again
        var index = lastPosition * 4;
        for (var p = 0; p < canvas.height; p++) {
            pix[index] = pix[index] ^ 0xFF;
            pix[index + 1] = pix[index + 1] ^ 0xFF;
            pix[index + 2] = pix[index + 2] ^ 0xFF;
            index += canvas.width * 4;
        }
        var time = el.currentTime;
        var duration = el.duration;
        var pos = Math.floor(canvas.width * time / duration);
        index = pos * 4;
        for (var p = 0; p < canvas.height; p++) {
            pix[index] = pix[index] ^ 0xFF;
            pix[index + 1] = pix[index + 1] ^ 0xFF;
            pix[index + 2] = pix[index + 2] ^ 0xFF;
            index += canvas.width * 4;
        }
        lastPosition = pos;
        //write image data to canvas
        ctx.putImageData(imgd, 0, 0);
    }
}

function stop() {
    if (el) {
        //stop audio and reset src before removing element, otherwise audio keeps playing
        el.pause();
        el.src = "";
        document.getElementById('player').removeChild(el);
        lastPosition = 0;
    }
    el = null;
}

function playDataURI(uri) {
    stop();
    el = document.createElement("audio");
    el.setAttribute("autoplay", true);
    el.setAttribute("src", uri);
    el.setAttribute("controls", "controls");
    el.ontimeupdate = onTimeUpdate;
    document.getElementById('player').appendChild(el);
}


function makeURL() {
    var generated = generateSound();
    generatePreview(generated);
    return toDataUrl(generated);
}