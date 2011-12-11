// Code in ~2 hours by Bemmu, idea and sound code snippet from Viznut.

function makeSampleFunction() {
//    var oneLiner = "t * ((t>>12|t>>8)&63&t>>4);";
    var oneLiner = document.getElementById('oneliner').value;//"t * (t>>9) * (t>>8)";
    
    var oneLiner = oneLiner.replace(/sin/g, "Math.sin");
    var oneLiner = oneLiner.replace(/cos/g, "Math.cos");
    var oneLiner = oneLiner.replace(/tan/g, "Math.tan");
    var oneLiner = oneLiner.replace(/floor/g, "Math.floor");
    var oneLiner = oneLiner.replace(/ceil/g, "Math.ceil");
    
    if (window.console) {
	console.log(oneLiner);
    }

    eval("var f = function (t) { return " + oneLiner + "}");
    return f;
}

function generateSound() {
    var frequency = 8000;
    var seconds = 30;

    var sampleArray = [];
    var f = makeSampleFunction();
    
    for (var t = 0; t < frequency*seconds; t++) {
        // Between 0 - 65535
//        var sample = Math.floor(Math.random()*65535);
        
        var sample = (f(t)) & 0xff;
        sample *= 256;
        if (sample < 0) sample = 0;
        if (sample > 65535) sample = 65535;
        
        sampleArray.push(sample);
    }
    return [frequency, sampleArray];
}

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

// Character to ASCII value, or string to array of ASCII values.
function c(str) {
    if (str.length == 1) {
        return str.charCodeAt(0);
    } else {
        var out = [];
        for (var i = 0; i < str.length; i++) {
            out.push(c(str[i]));
        }
        return out;
    }
}

function split32bitValueToBytes(l) {
    return [l&0xff, (l&0xff00)>>8, (l&0xff0000)>>16, (l&0xff000000)>>24];
}


function FMTSubChunk(channels, bitsPerSample, frequency) {
    var byteRate = frequency * channels * bitsPerSample/8;
    var blockAlign = channels * bitsPerSample/8;
    return [].concat(
        c("fmt "),
        split32bitValueToBytes(16), // Subchunk1Size for PCM
        [1, 0], // PCM is 1, split to 16 bit
        [channels, 0], 
        split32bitValueToBytes(frequency),
        split32bitValueToBytes(byteRate),
        [blockAlign, 0],
        [bitsPerSample, 0]
    );
}

function sampleArrayToData(sampleArray, bitsPerSample) {
    if (bitsPerSample === 8) return sampleArray;
    if (bitsPerSample !== 16) {
        alert("Only 8 or 16 bit supported.");
        return;
    }
    
    var data = [];
    for (var i = 0; i < sampleArray.length; i++) {
        data.push(0xff & sampleArray[i]);
        data.push((0xff00 & sampleArray[i])>>8);
    }
    return data;
}

function dataSubChunk(channels, bitsPerSample, sampleArray) {
    return [].concat(
        c("data"),
        split32bitValueToBytes(sampleArray.length * channels * bitsPerSample/8),
        sampleArrayToData(sampleArray, bitsPerSample)
    );
}

function chunkSize(fmt, data) {
    return split32bitValueToBytes(4 + (8 + fmt.length) + (8 + data.length));
}
    
function RIFFChunk(channels, bitsPerSample, frequency, sampleArray) {
    var fmt = FMTSubChunk(channels, bitsPerSample, frequency);
    var data = dataSubChunk(channels, bitsPerSample, sampleArray);
    var header = [].concat(c("RIFF"), chunkSize(fmt, data), c("WAVE"));
    return [].concat(header, fmt, data);
}

function makeURL() {
    var bitsPerSample = 16;    
    var generated = generateSound();
    var frequency = generated[0];
    var samples = generated[1];
    var channels = 1;
    return "data:audio/x-wav," + b(RIFFChunk(channels, bitsPerSample, frequency,samples));    
}
    
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
