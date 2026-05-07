

let action, minutes_w, seconds_w; 
let clockRunning = false; 
let x; 

onmessage = (e) => {
  action = e.data[0]; 
  minutes_w = e.data[1]; 
  seconds_w = e.data[2]; 
  console.log('Message to worker recieved: ', e.data[0], e.data[1]); 
  if (action == 'Start' ) {
        const endTime = new Date(); 
        endTime.setMinutes(endTime.getMinutes() + minutes_w);
        endTime.setSeconds(endTime.getSeconds() + seconds_w);
        // clockRunning = true; 
        x = setInterval(
            function decrementTime() {
                currentTime = new Date(); 
                distance = endTime - currentTime;
                
                
                minutesRemaining = Math.floor(distance / (1000 * 60)); 
                secondsRemaining = Math.floor((distance % (1000 * 60)) / 1000); 

                if (distance <= 0) {
                    
                  postMessage(["Completed", "0" , "0"]);
                  clearInterval(x); 
                
                } else {
                  postMessage(["Ongoing", String(minutesRemaining) , String(secondsRemaining)]);
                }; 
                
            }, 100 
        );  
        
  } else if (action == 'Cancel') {
    postMessage(["Interrupt", "0" , "0"]);
    clearInterval(x); 
  }
  
}


// function updateClock() {
    
//     const endTime = new Date(); 
//     endTime.setMinutes(endTime.getMinutes() + minutes_w);
//     endTime.setSeconds(endTime.getSeconds() + seconds_w);
    
//     var x = setInterval(
//         function decrementTime() {
//             currentTime = new Date(); 
//             distance = endTime - currentTime;
            
            
//             minutesRemaining = Math.floor(distance / (1000 * 60)); 
//             secondsRemaining = Math.floor((distance % (1000 * 60)) / 1000); 

//             if (distance <= 0) {
                
//               postMessage(["Completed", "0" , "0"]);
//               clearInterval(x); 
            
//             } else {
//               postMessage(["Ongoing", String(minutesRemaining) , String(secondsRemaining)]);
//             }; 
            
//         }, 100 
//     );  
// }