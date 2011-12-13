

var context = webkitAudioContext && new webkitAudioContext();
     context = context || (AudioContext && new AudioContext());


            var splitter = context.createChannelSplitter();
                 splitter.connect(context.destination);

             var node = context.createJavaScriptNode(256, 0, 1);
             node.onaudioprocess = function (event) {
               var outBuf = event.outputBuffer;
                var channel = outBuf.getChannelData(0);
                var count = channel.length;

                 var t = event.playbackTime / context.sampleRate;
                 node.audioFunction(channel,count,t);
                storedTime += count;
              }

function stop() {
   node.disconnect();
}

var storedTime = 0;

function play(audioFunction) {
    storedTime = 0;
    node.audioFunction = audioFunction;
   node.connect(splitter);
}
