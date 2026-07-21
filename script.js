import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_Sq_9puGZ0JcZaBTxcXOZieRLbrS3BJ8",
    authDomain: "police-simulator-gaura.firebaseapp.com",
    databaseURL: "https://police-simulator-gaura-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "police-simulator-gaura",
    storageBucket: "police-simulator-gaura.firebasestorage.app",
    messagingSenderId: "519382206394",
    appId: "1:519382206394:web:4ccfcd15972a9edd80ff83"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const policeRef = ref(db, 'police');

// Audio Objects
const sirenAudio = new Audio('audio/Siren.wav');
sirenAudio.loop = true;
const hornAudio = new Audio('audio/Horn.wav');

// Local State
let localState = {
    siren: false,
    lights: false,
    hornTrigger: 0
};

// Check which page we are on
const isController = document.getElementById('sirenBtn') !== null;
const isCar = document.getElementById('mainBar') !== null;

// --- Controller Logic ---
if (isController) {
    const sirenBtn = document.getElementById('sirenBtn');
    const lightsBtn = document.getElementById('lightsBtn');
    const hornBtn = document.getElementById('hornBtn');
    const previewBar = document.getElementById('previewBar');

    // Siren Toggle
    sirenBtn.onclick = () => {
        localState.siren = !localState.siren;
        updateDB();
    };

    // Lights Toggle
    lightsBtn.onclick = () => {
        localState.lights = !localState.lights;
        updateDB();
    };

    // Horn Trigger
    hornBtn.onclick = () => {
        localState.hornTrigger += 1;
        updateDB();
    };

    function updateDB() {
        set(policeRef, localState);
    }

    // Sync UI with DB (for local feedback)
    onValue(policeRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Update Buttons
        sirenBtn.classList.toggle('active', data.siren);
        lightsBtn.classList.toggle('active', data.lights);
        
        // Local Audio
        if (data.siren) {
            if (sirenAudio.paused) sirenAudio.play().catch(e => {});
        } else {
            sirenAudio.pause();
            sirenAudio.currentTime = 0;
        }

        // Preview Animation
        previewBar.classList.toggle('animating', data.lights);
    });

    // Handle Horn locally
    let lastHornCount = 0;
    onValue(ref(db, 'police/hornTrigger'), (snapshot) => {
        const count = snapshot.val() || 0;
        if (count > lastHornCount) {
            const h = new Audio('audio/Horn.wav');
            h.play().catch(e => {});
            lastHornCount = count;
        }
    });
}

// --- Car Logic ---
if (isCar) {
    const mainBar = document.getElementById('mainBar');
    const unlock = document.getElementById('audioUnlock');
    
    // User must click once to allow audio
    unlock.onclick = () => {
        unlock.style.display = 'none';
        // Play silent to initialize
        sirenAudio.play().then(() => {
            sirenAudio.pause();
        }).catch(e => console.log("Audio init"));
    };

    let lastHornCount = 0;

    onValue(policeRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Lights
        mainBar.classList.toggle('animating', data.lights);

        // Siren
        if (data.siren) {
            if (sirenAudio.paused) sirenAudio.play().catch(e => {});
        } else {
            sirenAudio.pause();
            sirenAudio.currentTime = 0;
        }

        // Horn Trigger
        if (data.hornTrigger > lastHornCount) {
            const h = new Audio('audio/Horn.wav');
            h.play().catch(e => {});
            lastHornCount = data.hornTrigger;
        }
    });
}