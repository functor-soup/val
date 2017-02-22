const fs = require('fs');
const k = require('kefir');


function createFileReadStream(fileName, start, end) {
    return k.fromEvents(fs.createReadStream(fileName, {
        start: start,
        end: end,
        encoding: "utf-8"
    }), 'data');
}

// don't think I need this needs to be put into queue for considered for deletion
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


// don't think I really need this .. needs to be considered for deletion
function val_mergedStream(fileName) {
    return val_fileContentChange_stream(fileName)
        .takeUntilBy(val_checkForFileDeletion_stream(fileName));
}

function val_pollForFileName_stream(fileName, interval) {
    return k.fromPoll(interval, () => fs.existsSync(fileName))
        .takeWhile(x => x == false)
}


// 
function val(fileName, callback, interval) {
    val_mergedStream(fileName)
        .onValue(x => {
            x.scan((x, y) => x + y, "")
                .onValue(callback);
        })
        .onEnd(function(x) {
            console.log("I got deleted")
	    val_pollForFileName_stream(fileName, interval)
	       .onEnd(x => val(fileName, callback, interval));
        })
}

//val("chicken.txt", console.log, 1000);
//

module.exports = {
    val: val
}
