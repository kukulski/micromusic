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

// https://ccrma.stanford.edu/courses/422/projects/WaveFormat/

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
