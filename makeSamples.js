// Code in ~2 hours by Bemmu, idea and sound code snippet from Viznut.

var replacements = {
    sin: "Math.sin",
    cos: "Math.cos",
    tan: "Math.tan",
    floor: "Math.floor",
    ciel: "Math.ceil"
};

function preprocessFunction(oneLiner) {

    for(var key in replacements) {
        oneLiner = oneLiner.replace(RegExp(key,'g'),replacements[key]);
    }
    return oneLiner;
}
function makeSampleFunction(rawOneLiner) {
    var oneLiner = preprocessFunction(rawOneLiner);
    eval("var f = function (t) { return " + oneLiner + "}");
    return f;
}

function generateSound(f,seconds,frequency,bitsPerSample,channels) {
    var count = frequency*seconds;
    var sampleArray = new Uint16Array(count);

    for (var t = 0; t < count; t++)
        sampleArray[t] = (f(t) & 0xff)<<8;;
    
    return sampleArray;
}

function makeSampleData(rawOneLiner) {
    var sampleFunction = makeSampleFunction(rawOneLiner);
    var bitsPerSample = 16;
    var frequency = 22000;
    var channels = 1;
    return generateSound(sampleFunction,30,frequency,bitsPerSample,channels);

}
function makeRiff(samples) {
    var bitsPerSample = 16;
    var frequency = 22000;
    var channels = 1;
    return RIFFChunk(channels, bitsPerSample, frequency,samples);
}
