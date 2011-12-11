// refactored from http://wurstcaptures.untergrund.net/music/magic.js

String.prototype.toCharCodes = function() {
    var count = this.length;
    if (count == 1) {
        return this.charCodeAt(0);
    }
    var out = new Array(count);
    for (var i = 0; i < count; i++)
        out[i] = this.charCodeAt(i);
    return out;
};

(function() {

    function escapeCharcode(charCode) {
        var str = charCode.toString(16).toUpperCase();
        return (str.length == 1 ? '%0' : '%') + str;
    }

    var lookup = new Array(256);
    for (var i = 0; i < 256; i++) lookup[i] = escapeCharcode(i);
    Array.prototype.escapedStringTable = lookup;

})();

Array.prototype.toEscapedString = function() {
    var lookup = this.escapedStringTable;
    var count = this.length;
    var out = "";
    for (var i = 0; i < count; i++)
        out += lookup[this[i]];
    return out;
};


Array.prototype.littleEndianBytes = function(bitsPerSample) {

    if (bitsPerSample === 8) return this;
    if (bitsPerSample !== 16) throw new Error("littleEndianBytes: bad argument Only 8 or 16 bit supported.");

    var count = this.length;
    var data = new Array(count * 2);
    var j = 0;
    for (var i = 0; i < count; i++) {
        var sample = this[i];
        data[j++] = sample & 0xff;
        data[j++] = (sample & 0xff00) >> 8;
    }
    return data;
};

Array.prototype.dataUrl = function(mimeType) {
    return mimeType + ',' + this.toEscapedString();
};

SampleData.protype = {
    sampleArray: [],
    bitsPerSample: 16,
    channels: 1,
    frequency: 22000,
    toDataUrl: function (generated) {
        return dataUrl("data:audio/x-wav", RIFFChunk(generated));
    },

    RIFFChunk: function () {
        var fmt = this.FMTSubChunk();
        var subChunk = this.dataSubChunk();
        var header = [].concat("RIFF".toCharCodes(), littleEndianBytes(this.chunkSize(fmt, subChunk)), "WAVE".toCharCodes());
        return [].concat(header, fmt, subChunk);
    },


    FMTSubChunk: function() {
        var byteRate = this.frequency * this.channels * this.bitsPerSample / 8;
        var blockAlign = this.channels * this.bitsPerSample / 8;

        // could refactor if we merely added littleEndianBytes to String.prototype
        return [].concat(
            "fmt ".toCharCodes(),
            this.littleEndianBytes(16), // Subchunk1Size for PCM
            [1, 0], // PCM is 1, split to 16 bit
            [channels, 0],
            this.littleEndianBytes(this.frequency),
            this.littleEndianBytes(this.byteRate),
            [blockAlign, 0],
            [this.bitsPerSample, 0]
        );
    },

    dataSubChunk: function() {
        return [].concat(
            "data".toCharCodes(),
            this.littleEndianBytes(this.sampleArray.length * this.bitsPerSample / 8),
            this.sampleArray.littleEndianBytes(this.bitsPerSample)
        );
    },
    chunkSize: function(fmt, data) {
        return 4 + (8 + fmt.length) + (8 + data.length);
    },
    littleEndianBytes:function(l) {
        return [l & 0xff, (l & 0xff00) >> 8, (l & 0xff0000) >> 16, (l & 0xff000000) >> 24];
    }
};
