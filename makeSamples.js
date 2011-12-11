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

function generateSound(f,seconds,frequency,bitsPerSample,channels) {
    var sampleArray = [];

    for (var t = 0; t < frequency*seconds; t++) {
        // Between 0 - 65535
//        var sample = Math.floor(Math.random()*65535);
        
        var sample = (f(t)) & 0xff;
        sample *= 256;
        if (sample < 0) sample = 0;
        if (sample > 65535) sample = 65535;
        
        sampleArray.push(sample);
    }
    return sampleArray;
}


function makeURL() {
    var sampleFunction = makeSampleFunction();
    var bitsPerSample = 16;    
    var frequency = 8000;
    var channels = 1;
    var samples = generateSound(sampleFunction,30,frequency,bitsPerSample,channels);
    var riffData = RIFFChunk(channels, bitsPerSample, frequency,samples);
    var mimeType = "audio/x-wav";
    return makeDataUrl(mimeType, riffData);
}
    
