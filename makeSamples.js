// Code in ~2 hours by Bemmu, idea and sound code snippet from Viznut.

var replacements = {
    sin: "Math.sin",
    cos: "Math.cos",
    tan: "Math.tan",
    floor: "Math.floor",
    ciel: "Math.ceil",
    pi:"Math.PI",
    round:"Math.round"
};

function preprocessFunction(oneLiner) {

    for(var key in replacements) {
        oneLiner = oneLiner.replace(RegExp(key,'g'),replacements[key]);
    }
    return oneLiner;
}
function makeSampleFunction(rawOneLiner,elt) {
    try {
        var oneLiner = preprocessFunction(rawOneLiner);
         eval("var f = function (t) { return " + oneLiner + "}");
        return f;
       } catch(e) {
        if(elt) elt.innerHTML = e.toString();
        return null;
    } 
}


function generateSound(f,seconds,frequency,bitsPerSample,channels) {
    var count = frequency*seconds*channels;
    var sampleArray = bitsPerSample == 16 ? new Int16Array(count): new Uint8Array(count);


    for (var t = 0; t < count; t++) {
        var sample = f(t) & 0xff;
        sampleArray[t] = sample<<8 | sample;
    }
    return sampleArray;
}

var backBuffer;

function genSound16x1(f,count) {
    backBuffer = new ArrayBuffer(count*2);
    var sampleArray =  new Int16Array(backBuffer);

    for (var t = 0; t < count; t++) {
        sampleArray[t] = ((f(t)*256) % 0xffff)-32768;
    }
    return sampleArray;
}


function makeSampleData(sampleFunction) {
    var bitsPerSample = 16;
    var frequency = 44100;
    var channels = 1;
    var duration=10;
    var sampleCount = duration*channels*frequency;
    return genSound16x1(sampleFunction,sampleCount);

//    return generateSound(sampleFunction,30,frequency,bitsPerSample,channels);

}
function makeRiff(samples) {
    var bitsPerSample = 16;
    var frequency = 44100;
    var channels = 1;
    return RIFFChunk(channels, bitsPerSample, frequency,samples);
}
