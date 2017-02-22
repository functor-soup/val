const fs = require('fs');
const k  = require('kefir');


function createFileReadStream(fileName, start, end){
  return k.fromEvents(fs.createReadStream(fileName, 
     {start:start, end:end, encoding:"utf-8"}), 'data');
}


// String -> Stream Observables
// creates a stream of readstreams
function valKefir(fileName){
   const initialFileSize = fs.statSync(fileName).size;
   const init = {seekFrom:0, size:initialFileSize};

   return k.fromEvents(fs.watch(fileName),'change')
            .map(x => fs.statSync(fileName).size)
	    .scan(function(x,y){
            		    return {seekFrom:(y>=x.size)?x.size:0, size:y}
	   	  }, init)
             // reason for filter: double notification on file change
            .filter(x => x.seekFrom != x.size)
	    .map(x => createFileReadStream(fileName, x.seekFrom, x.size));
}

// needs to be refactored
function val(fileName, callback){
    return valKefir(fileName).onValue(function(x){
               x.scan((x,y) => x + y, "")
	        .onValue(callback);
               })
}

//val("chicken.txt", console.log);
//

module.exports = {
    val: val
}
