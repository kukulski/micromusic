function generatePreview(soundData,channels, canvas) {

    var imgD = getImageD(canvas);
    drawIntoImage(imgD, soundData,channels);

    var ctx = canvas.getContext("2d");
    //write image data to canvas
    ctx.putImageData(imgD, 0, 0);
}

function getImageD(canvas){
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    var imgd = false;
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
    return imgd;
}

function drawIntoImage(imgd, soundData, channels) {
    //get actual pixel data
    var pix = imgd.data;
    var width = imgd.width;
    var height = imgd.height;

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
}
