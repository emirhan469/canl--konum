import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqs1-GYqpiou-vXvMS8kGN-s-79tM7iB8",
  authDomain: "konum-takip-ec67f.firebaseapp.com",
  databaseURL: "https://konum-takip-ec67f-default-rtdb.firebaseio.com",
  projectId: "konum-takip-ec67f",
  storageBucket: "konum-takip-ec67f.appspot.com",
  messagingSenderId: "92870443325",
  appId: "1:92870443325:web:e03043deae5a3c7b21c554",
  measurementId: "G-J6H6TQE3LX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap katkıda bulunanlar'
}).addTo(map);

const markers = {};

const userId = "kullanici_" + Math.floor(Math.random() * 1000);
const userName = prompt("Adınızı girin:", "Ziyaretçi") || "Ziyaretçi";
const userColor = "#" + Math.floor(Math.random()*16777215).toString(16);

if (navigator.geolocation) {
  navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    set(ref(db, 'konumlar/' + userId), {
      lat,
      lng,
      isim: userName,
      renk: userColor
    });
  }, (err) => {
    alert("Konum alınamadı: " + err.message);
  }, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  });
} else {
  alert("Tarayıcınız konum servisini desteklemiyor.");
}

const konumlarRef = ref(db, 'konumlar/');
onValue(konumlarRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    Object.entries(data).forEach(([uid, userData]) => {
      if (userData.lat && userData.lng) {
        if (markers[uid]) {
          markers[uid].setLatLng([userData.lat, userData.lng]);
        } else {
          markers[uid] = L.circleMarker([userData.lat, userData.lng], {
            radius: 10,
            color: userData.renk || "black",
            fillColor: userData.renk || "black",
            fillOpacity: 0.8
          }).addTo(map).bindPopup(`${userData.isim || uid}`);
        }
      }
    });
  }
});
