let timerDisplay = document.querySelector('.timerDisplay');
let stopBtn = document.getElementById('stopBtn');
let startBtn = document.getElementById('startBtn');
let resetBtn = document.getElementById('resetBtn');

let msec = '00';
let secs = '00';
let mins = '00';

let timerId = null;

 

startBtn.addEventListener('click', function(){
    if(timerId !== null){
        clearInterval(timerId);
        
    }
        timerDisplay.classList.add('green')
        timerDisplay.classList.remove('red')
    timerId = setInterval(startTimer, 10);
});

stopBtn.addEventListener('click', function(){
    clearInterval(timerId);
            timerDisplay.classList.remove('green')
            

});

resetBtn.addEventListener('click', function(){
    clearInterval(timerId);
    timerDisplay.innerHTML = `00 : 00 : 00`;
    msec = secs = mins = '00';
    timerDisplay.classList.add('red')
});

function startTimer(){
    msec++;
    if(msec == 100){
        msec = 0;
        secs++;
        if(secs == 60){
            secs = 0;
mins++;
        }
    }

    let msecString = msec < 10 ? `${msec}` : msec;
    let secsString = secs < 10 ? `${secs}` : secs;
    let minsString = mins < 10 ? `${mins}` : mins;
    

    timerDisplay.innerHTML = `${minsString} : ${secsString} : ${msecString}`;
 
}