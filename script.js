// 🚔 Police Simulator
// Firebase + Audio + System Setup


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


// Firebase

const firebaseConfig = {

    apiKey: "AIzaSyC_Sq_9puGZ0JcZaBTxcXOZieRLbrS3BJ8",

    authDomain: "police-simulator-gaura.firebaseapp.com",

    databaseURL:
    "https://police-simulator-gaura-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "police-simulator-gaura",

    storageBucket:
    "police-simulator-gaura.firebasestorage.app",

    messagingSenderId: "519382206394",

    appId:
    "1:519382206394:web:4ccfcd15972a9edd80ff83"

};



const app = initializeApp(firebaseConfig);


const db = getDatabase(app);


const policeRef = ref(db,"police");



// =====================
// AUDIO
// =====================


const sirenAudio =
new Audio("audio/Siren.wav");


sirenAudio.loop = true;



const hornAudio =
new Audio("audio/Horn.wav");




// =====================
// STATE
// =====================


let localState = {


    siren:false,


    lights:false,


    hornTrigger:0,


    pattern:"sweep"


};




// =====================
// PAGE DETECTION
// =====================


const isController =
document.getElementById("sirenBtn") !== null;



const isCar =
document.getElementById("mainBar") !== null;



console.log("🚔 Police Simulator Loaded");// =====================
// LIGHT PATTERN ENGINE
// =====================


let patternTimer = null;

let patternFrame = 0;



function clearLights(redLeds, blueLeds) {


    [...redLeds, ...blueLeds].forEach(light => {

        light.classList.remove("active");

    });


}



function stopPattern(redLeds, blueLeds) {


    if(patternTimer){

        clearInterval(patternTimer);

        patternTimer = null;

    }


    if(redLeds && blueLeds){

        clearLights(redLeds, blueLeds);

    }


}




function startPattern(redLeds, blueLeds, pattern){


    stopPattern(redLeds, blueLeds);



    patternFrame = 0;



    patternTimer = setInterval(()=>{


        clearLights(redLeds, blueLeds);



        // =====================
        // SWEEP
        // =====================

        if(pattern === "sweep"){


            redLeds[patternFrame]
            .classList.add("active");


            blueLeds[
                blueLeds.length - 1 - patternFrame
            ]
            .classList.add("active");


        }


// =====================
// NORMAL POLICE FLASH
// =====================

if(pattern === "normal"){


    if(patternFrame % 2 === 0){


        redLeds.forEach(light =>
            light.classList.add("active")
        );


    }
    else{


        blueLeds.forEach(light =>
            light.classList.add("active")
        );


    }


}

        // =====================
        // ALTERNATE
        // =====================

        if(pattern === "alternate"){


            if(patternFrame % 2 === 0){


                redLeds.forEach(light =>
                    light.classList.add("active")
                );


            }
            else{


                blueLeds.forEach(light =>
                    light.classList.add("active")
                );


            }


        }





        // =====================
        // WIG WAG
        // =====================

        if(pattern === "wigwag"){


            if(patternFrame % 2 === 0){


                redLeds.forEach(light =>
                    light.classList.add("active")
                );


            }
            else{


                blueLeds.forEach(light =>
                    light.classList.add("active")
                );


            }


        }





        // =====================
        // FULL FLASH
        // =====================

        if(pattern === "flash"){


            if(patternFrame % 2 === 0){


                [...redLeds, ...blueLeds]
                .forEach(light =>
                    light.classList.add("active")
                );


            }


        }




        patternFrame++;


        if(patternFrame >= 4){

            patternFrame = 0;

        }



    },250);


}// =====================
// CONTROLLER SYSTEM
// =====================


if(isController){


    const sirenBtn =
    document.getElementById("sirenBtn");


    const hornBtn =
    document.getElementById("hornBtn");


    const lightsBtn =
    document.getElementById("lightsBtn");



    const patternButtons =
    document.querySelectorAll(".patternBtn");



    const previewRed =
    document.querySelectorAll("#previewBar .red");


    const previewBlue =
    document.querySelectorAll("#previewBar .blue");





    // 🚨 Siren

    sirenBtn.onclick = () => {


        localState.siren =
        !localState.siren;


        set(policeRef, localState);


    };






    // 🔴🔵 Lights

    lightsBtn.onclick = () => {


        localState.lights =
        !localState.lights;


        set(policeRef, localState);


    };







    // 📣 Horn

    hornBtn.onclick = () => {


        localState.hornTrigger++;


        set(policeRef,localState);



        const horn =
        new Audio("audio/Horn.wav");


        horn.play()
        .catch(()=>{});


    };







    // 🚔 Pattern Selection

    patternButtons.forEach(button => {


        button.onclick = () => {


            localState.pattern =
            button.dataset.pattern;


            set(policeRef,localState);



            patternButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            button.classList.add("active");


        };


    });







    // Firebase Listener

    onValue(policeRef,(snapshot)=>{


        const data =
        snapshot.val();


        if(!data) return;



        localState=data;






        // Button states

        sirenBtn.classList.toggle(
            "active",
            data.siren
        );



        lightsBtn.classList.toggle(
            "active",
            data.lights
        );






        // Local siren

        if(data.siren){


            if(sirenAudio.paused){

                sirenAudio.play()
                .catch(()=>{});

            }


        }

        else{


            sirenAudio.pause();

            sirenAudio.currentTime=0;


        }







        // Preview Pattern

        if(data.lights){


            startPattern(
                previewRed,
                previewBlue,
                data.pattern || "sweep"
            );


        }

        else{


            stopPattern(
                previewRed,
                previewBlue
            );


        }




    });



}// =====================
// CAR SYSTEM
// =====================


if(isCar){


    const unlock =
    document.getElementById("audioUnlock");



    const carRed =
    document.querySelectorAll("#mainBar .red");


    const carBlue =
    document.querySelectorAll("#mainBar .blue");



    let lastHorn = 0;







    // 🔊 Unlock Audio

    unlock.onclick = () => {


        unlock.style.display = "none";


        sirenAudio.play()

        .then(()=>{


            sirenAudio.pause();


            sirenAudio.currentTime = 0;


        })

        .catch(()=>{});


    };









    // Firebase Listener

    onValue(policeRef,(snapshot)=>{


        const data =
        snapshot.val();



        if(!data) return;








        // =====================
        // LIGHTS
        // =====================


        if(data.lights){


            startPattern(

                carRed,

                carBlue,

                data.pattern || "sweep"

            );


        }

        else{


            stopPattern(

                carRed,

                carBlue

            );


        }








        // =====================
        // SIREN
        // =====================


        if(data.siren){


            if(sirenAudio.paused){


                sirenAudio.play()

                .catch(()=>{});


            }


        }

        else{


            sirenAudio.pause();


            sirenAudio.currentTime=0;


        }









        // =====================
        // HORN
        // =====================


        if(data.hornTrigger > lastHorn){



            const horn =
            new Audio("audio/Horn.wav");



            horn.play()

            .catch(()=>{});



            lastHorn =
            data.hornTrigger;


        }




    });



}