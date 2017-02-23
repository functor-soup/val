# Val (വാ ല്)

- This is supposed to be a library written in server side javascript( node ) and Kefir.js whose goal is
  to mimic `tail -f` functionality

### Work done so far
 - Basic functionality implemented (assuming everything works right) i.e follows the file growth whether the file is appended to/overwritten with content 
 - On file deletion, file existence is polled till return true and then the whole process is restarted again

### Show me how it works and what to expect

```javascript

// touch chicken.txt 
>> val("chicken.txt", console.log, 1000)

// echo "beef curry" >> chicken.txt
output>> beef curry

// rm chicken.txt
output>> chicken.txt has been deleted  // program doesn't exit polling starts

// echo "beef fried rice" >> chicken.txt
output>> beef fried rice  

```

### Pending work
 - Make sure it works in non-favourable conditions
 - Testing
 - The output has yet to be worked on in terms of line breaks/other what-nots
 - Stress testing to check if it performs as well as it should, not sure if the recursive
   call is tail recursive sooooooo gotta check that out as well

#### The name of this library
 - It comes from the Malayalam (South Indian language) word for tail

#### License
 - MIT License
 

