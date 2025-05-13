// 1. Inisialisasi Firebase (gantikan dengan config projek anda)
 const firebaseConfig = {
    apiKey: "AIzaSyASukWjXAEjjJTJOz49GuUd3bY4FRjSgwI",
    authDomain: "aplikasiabc-d9561.firebaseapp.com",
    databaseURL: "https://aplikasiabc-d9561-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aplikasiabc-d9561",
    storageBucket: "aplikasiabc-d9561.firebasestorage.app",
    messagingSenderId: "699708986263",
    appId: "1:699708986263:web:3f8c0176730b7d31e22ad2",
    measurementId: "G-DRKBY1Y04E"
};
firebase.initializeApp(firebaseConfig);

// 2. Referensi Auth & Database
const auth = firebase.auth();
const db   = firebase.database();

// 3. Cek akses game.html sekali pada load (tanpa alert)
if (window.location.pathname.includes('game.html')) {
  auth.onAuthStateChanged(user => {
    if (!user) window.location.href = 'index.html';
  });
}

// 4. Sign In (daftar akaun baru)
function signup() {
  const email = document.getElementById("email").value;
  const pass  = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Pendaftaran berjaya! Sila Log In."))
    .catch(e => alert(e.message));
}

// 5. Log In
function login() {
  const email = document.getElementById("email").value;
  const pass  = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      window.location.href = "game.html";
    })
    .catch(e => alert(e.message));
}

// 6. Log Out → terus ke index.html
function logout() {
  auth.signOut().then(() => {
    resetGame();
    window.location.href = "index.html";
  });
}

// 7. Logik Permainan & Simpan ke Realtime DB
let round = 0, playerWins = 0, compWins = 0;
function play(playerChoice) {
  if (round >= 3) return;

  const choices = ["Air","Batu","Cawan"];
  const comp = choices[Math.floor(Math.random()*3)];
  let result;

  if (playerChoice === comp) {
    result = `Seri! (${playerChoice} vs ${comp})`;
  } else if (
    (playerChoice==="Air"  && comp==="Batu") ||
    (playerChoice==="Batu" && comp==="Cawan") ||
    (playerChoice==="Cawan"&& comp==="Air")
  ) {
    result = `Menang! (${playerChoice} vs ${comp})`;
    playerWins++;
  } else {
    result = `Kalah! (${playerChoice} vs ${comp})`;
    compWins++;
  }

  round++;
  document.getElementById("result").innerText = `${result} — Pusingan ${round}/3`;

  // Simpan ke RTDB
  const u = auth.currentUser;
  if (u) {
    db.ref(`rekod/${u.uid}`).push({
      pemain: playerChoice,
      komputer: comp,
      keputusan: result,
      masa: new Date().toISOString()
    });
  }

  // Mesej akhir selepas 3 pusingan
  if (round === 3) {
    setTimeout(() => {
      let msg;
      if (playerWins >= 2)      msg = "Hebatlah kamu! Menang 2 daripada 3 pusingan! 🏆🥳";
      else if (compWins >= 2)   msg = "Alamak... Komputer menang kali ni. Cuba lagi ya! 💪💔";
      else                       msg = "Wah, seri! Kamu dan komputer sama hebat!  🤝😊";
      alert(msg);
      resetGame();
    }, 300);
  }
}

// 8. Reset state permainan
function resetGame() {
  round = 0;
  playerWins = 0;
  compWins = 0;
  const el = document.getElementById("result");
  if (el) el.innerText = "";
}