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

function makeBulkSampleFunction(rawOneLiner){
    var oneLiner = preprocessFunction(rawOneLiner);
  //  if(!makeFunction(oneLiner)) return null;
    var toEval = "var f = function (buf,count,t) {for(i=0; i<count;i++,t++) {buf[i]=(" + oneLiner + ");}}";
    return makeFunction(toEval) || nullFunction;
}

function makeBulkSample8BitFunction(rawOneLiner){
    var oneLiner = preprocessFunction(rawOneLiner);
  //  if(!makeFunction(oneLiner)) return null;
    var toEval = "var f =function(buf,count,t){for(i=0; i<count;i++,t++)buf[i]=127+127*(" + oneLiner + ");};"
    return makeFunction(toEval) || nullFunction;
}
function makeFunction(evalString) {
      try{
        eval(evalString);
    } catch(e){
      return null;
    }
    return f;
}
function nullFunction () {
    return 1;
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

var sampleHelper = {
    samples8: null,
    makeSampleData8: function(sampleFunction,wd,ht) {

    var sampleCount = wd*ht;
    this.samples8  = this.samples8 || new Uint8Array(sampleCount);
    var s = this.samples8;

    for (var t = 0; t < sampleCount; t++) {
        s[t] = 127+127*sampleFunction(t);
    }
    return this.samples8;
    }
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
