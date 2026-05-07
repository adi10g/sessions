import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient('https://causmpvxowirkxowxmyr.supabase.co', 'sb_publishable_mFfwC94Ow4XrUib9jTWYTQ_hIPEMq-E')
console.log('Supabase Instance: ', supabase)

async function fetchSessions() {
    const { data, error } = await supabase
    .from('sessions_log')
    .select()
    .gt('minutes', 0)

    return data

}
const CATEGORY_COLORS = {
  Coding: '#3b82f6',
  GMAT:   '#8b5cf6',
  News:   '#10b981',
  Admin:  '#f59e0b',
  Other:  '#6b7280',
};



let minutes = 25;
let seconds = 0; 


// Tabs 
const calendarViewTabBtn = document.getElementById("calendarViewTabBtn") ;
const timerViewTabBtn = document.getElementById("timerViewTabBtn") ;


const clockReadingText =  document.getElementById("clockReadingText") ;
const startClockButton =  document.getElementById("startClockBtn") ;
const cancelClockButton =  document.getElementById("cancelClockBtn") ;
const taskSelect = document.getElementById('taskSelect');


// Audio Handling
let audioElement = document.getElementById("alarm");
audioElement.preload = "auto";
audioElement.volume = 0.8;

// Web Worker Config
let myWorker = new Worker("worker.js");

console.log("Hey, message coming from main");

clockReadingText.innerHTML = minutes + "m " + seconds + "s";
let savedStartTime; 
let savedEndTime;
let taskSelected = null; 
let timerOn = false; 

// document.addEventListener('visibilitychange', () => {
//   console.log('visibilitychange', document.visibilityState);
// });

// document.addEventListener('focus', () => {
//   console.log('focus event');
// });

    // Output the result in an element with id="demo"
startClockButton.addEventListener("click", () => {
    // Prime audio for Safari (user interaction unlocks audio)

    audioElement.load();
    Notification.requestPermission();

    

    if (!timerOn) {
        audioElement.currentTime = 0;
        taskSelected = taskSelect.value;
        savedStartTime = (new Date()).toLocaleString("en-US", {
            timeZone: "America/New_York"
        }); 

        
        console.log("Start Time: ", savedStartTime);
        myWorker.postMessage(["Start", minutes, seconds]);
        timerOn = true; 
    }

    //updateClock();
// wait for permission
});

cancelClockButton.addEventListener("click", () => {
    if (timerOn) {
        console.log("Cancelling timer");
        myWorker.postMessage(['Cancel', 0,0]);
    }
});
let calendarInitialized = false; 

calendarViewTabBtn.addEventListener("click", async () => {
    document.getElementById("timerView").style.display = "none";
    document.getElementById("calendarView").style.display = "block";
    calendarViewTabBtn.classList.add("active");
    timerViewTabBtn.classList.remove("active");

    if (!calendarInitialized) {
        const sessions = await fetchSessions();
        const minStart = new Date(Math.min(...sessions.map(s => new Date(s.start_time))));
        minStart.setHours(minStart.getHours() - 1);

        const pad = n => String(n).padStart(2, '0');
        const slotMin = `${pad(minStart.getHours())}:${pad(minStart.getMinutes())}:00`;
        
        const events = sessions.map(s => ({
        title: s.task_category,
        start: s.start_time,
        end:   s.end_time,
        color: CATEGORY_COLORS[s.task_category] || '#6b7280'
        }));

        console.log(events);

        const calendar = new FullCalendar.Calendar(document.getElementById('dayCalendar'), {
        initialView: 'timeGridDay',
        headerToolbar: false,
        slotMinTime: slotMin,
        slotMaxTime: '24:00:00',
        events: events,
        height: 600, 
        expandRows: false,
        timeZone: 'auto'
        });

        calendar.render();
        calendarInitialized = true;
    }


});

timerViewTabBtn.addEventListener("click", () => {
    document.getElementById("timerView").style.display = "block";
    document.getElementById("calendarView").style.display = "none";
    calendarViewTabBtn.classList.remove("active");
    timerViewTabBtn.classList.add("active");
});


let currentTime; 
let distance; 

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
// file:///Users/adi10g/sessions/main.html

myWorker.onmessage = async function(event) {
    if (event.data[0] == "Completed" ) {
        savedEndTime = (new Date()).toLocaleString("en-US", {
            timeZone: "America/New_York"
        }); 
        console.log("End Time: ", savedEndTime);
        console.log("Time Elapsed: ", savedEndTime - savedStartTime); 
 
        audioElement.play().catch(e => console.log("Audio failed:", e));
        // audioElement.addEventListener('ended', function() {
        //     this.remove(); // Removes the instance
        // });
          
        if (Notification.permission === "granted") {
            const notification = new Notification("Work Timer Expired!", {
                requireInteraction: true,
                tag: "timer-alarm"
            })
        } else {
            console.log('Notification permission not granted'); 
        }

        timerOn = false; 
        clockReadingText.innerHTML = minutes + "m " + seconds + "s ";

        const { data, error } = await supabase
        .from('sessions_log')
        .insert({
            minutes: minutes, 
            seconds: seconds, 
            start_time: savedStartTime, 
            end_time: savedEndTime, 
            task_category: taskSelected, 
            status: "Completed"
        })
        .select(); 
        
    } else if (event.data[0] == 'Interrupt') {
        clockReadingText.innerHTML = minutes + "m " + seconds + "s";
        savedEndTime = (new Date()).toLocaleString("en-US", {
            timeZone: "America/New_York"
        }); 
        
        timerOn = false; 

        const { data, error } = await supabase
        .from('sessions_log')
        .insert({
            minutes: minutes, 
            seconds: seconds, 
            start_time: savedStartTime, 
            end_time: savedEndTime, 
            task_category: taskSelected, 
            status: "Canceled"
        })
        .select(); 
    } else {
        clockReadingText.innerHTML = event.data[1] + "m " + event.data[2] + "s ";
    }
    
};

function openTab(evt, cityName) {
  // Declare all variables
  console.log("Does it recognize?");
//   var i, tabcontent, tablinks;

//   // Get all elements with class="tabcontent" and hide them
//   tabcontent = document.getElementsByClassName("tabcontent");
//   for (i = 0; i < tabcontent.length; i++) {
//     tabcontent[i].style.display = "none";
//   }

//   // Get all elements with class="tablinks" and remove the class "active"
//   tablinks = document.getElementsByClassName("tablinks");
//   for (i = 0; i < tablinks.length; i++) {
//     tablinks[i].className = tablinks[i].className.replace(" active", "");
//   }

//   // Show the current tab, and add an "active" class to the button that opened the tab
//   document.getElementById(cityName).style.display = "block";
//   evt.currentTarget.className += " active";
}

// Hover 

// function dragStart(ev) {
//     ev.dataTransfer.effectAllowed='move';
//     ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
//     ev.dataTransfer.setDragImage(ev.target,0,0);
//     return true;
// }
// function dragEnter(ev) {
//     ev.preventDefault();
//     return true;
// }
// function dragOver(ev) {
//     return false;
// }
// function dragDrop(ev) {
//     var src = ev.dataTransfer.getData("Text");
//     ev.target.appendChild(document.getElementById(src));
//     ev.stopPropagation();
//     return false;
// }
