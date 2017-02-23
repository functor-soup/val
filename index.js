const fs = require('fs');
const k = require('kefir');

const streamLog_name = "merged stream";


function val_pollForFileName_stream(fileName, interval) {
    return k.fromPoll(interval, () => fs.existsSync(fileName))
        .takeWhile(x => x == false)
}


// String -> Int -> Int -> ReadStream
// [convenience function]
function createFileReadStream(fileName, start, end) {
    return k.fromEvents(fs.createReadStream(fileName, {
        start: start,
        end: end,
        encoding: "utf-8"
    }), 'data');
}


// String -> Stream
// [in queue for considered for deletion]
function val_checkForFileDeletion_stream(fileName) {
    return k.fromEvents(fs.watch(fileName), 'change')
        .map(x => fs.existsSync(fileName))
        .skipWhile(x => x == true)
}


// String -> Stream Observables
// creates a stream of readstreams
function val_fileContentChange_stream(fileName) {
    const initialFileSize = fs.statSync(fileName).size;
    const init = {
        seekFrom: 0,
        size: initialFileSize
    };

    return k.fromEvents(fs.watch(fileName), 'change')
        .map(x => fs.statSync(fileName).size)
        .scan(function(x, y) {
            return {
                seekFrom: (y >= x.size) ? x.size : 0,
                size: y
            }
        }, init)
        // reason for filter: double notification on file change
        .filter(x => x.seekFrom != x.size)
        .map(x => createFileReadStream(fileName, x.seekFrom, x.size));
}


// String -> Stream
// [in queue to be considered for deletion]
// creates stream of read streams limited by the stream for file deletion events
function val_mergedStream(fileName) {
    return val_fileContentChange_stream(fileName)
        .takeUntilBy(val_checkForFileDeletion_stream(fileName));
}


// String -> Function -> Int -> Side Effect  
// main playground, applies callback to file diff (growth)
// in case of deletion, calls in a stream of polled file-existence-checking on termination
//  of which recursively starts up the function
function val(fileName, callback, interval, debugging) {

    val_mergedStream(fileName)
        .onValue(x => {
            const y = x.scan((x, y) => x + y, "")
	               .onValue(callback);

	    if(debugging) { y.log(streamLog_name); }
        })
        .onEnd(function(x) {
            //console.log(x+" got deleted")
            val_pollForFileName_stream(fileName, interval)
                .onEnd(x => val(fileName, callback, interval));
        })

}


module.exports = {
    val: val
}
