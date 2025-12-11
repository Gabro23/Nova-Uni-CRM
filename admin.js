// --- CONFIGURAZIONE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBGLgVz0HRkwYNLGFjbFKahitLZgi4xs5A",
  authDomain: "crm--nova-uni.firebaseapp.com",
  projectId: "crm--nova-uni",
  storageBucket: "crm--nova-uni.firebasestorage.app",
  messagingSenderId: "466298746752",
  appId: "1:486298746752:web:bea6f8f2934ddef6bdcbe5",
  measurementId: "G-SKCYJS7HUY"
};

// Inizializza Firebase
if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
} else {
	firebase.app();
}

const db = firebase.firestore();
const auth = firebase.auth(); // Attiviamo il modulo Autenticazione

// -----------------------------------------------------------
// GESTIONE SICUREZZA (LOGIN/LOGOUT)
// -----------------------------------------------------------

// Appena la pagina si carica, controlla se c'è un utente loggato
auth.onAuthStateChanged((user) => {
	const loginBox = document.getElementById("loginContainer");
	const dashboard = document.getElementById("dashboardContainer");

	if (user) {
		// SE L'UTENTE È LOGGATO:
		console.log("Utente loggato:", user.email);
		loginBox.style.display = "none";      // Nascondi login
		dashboard.style.display = "block";    // Mostra tabella
		caricaTabella();                      // Scarica i dati
	} else {
		// SE NON È LOGGATO:
		console.log("Nessun utente loggato");
		loginBox.style.display = "block";     // Mostra login
		dashboard.style.display = "none";     // Nascondi tabella
	}
});

// Funzione per il tasto "Entra"
function faiLogin() {
	const email = document.getElementById("emailInput").value;
	const pass = document.getElementById("passwordInput").value;
	const msg = document.getElementById("msgErrore");

	auth.signInWithEmailAndPassword(email, pass)
		.catch((error) => {
			console.error("Errore login:", error);
			// Messaggi di errore in italiano
			if (error.code === 'auth/wrong-password') {
				msg.innerText = "Password sbagliata.";
			} else if (error.code === 'auth/user-not-found') {
				msg.innerText = "Utente non trovato.";
			} else {
				msg.innerText = "Errore: " + error.message;
			}
		});
}

// Funzione per il tasto "Esci"
function faiLogout() {
	auth.signOut().then(() => {
		alert("Logout effettuato.");
		// La pagina si aggiorna da sola grazie a onAuthStateChanged
	});
}


// -----------------------------------------------------------
// GESTIONE DATI (TABELLA)
// -----------------------------------------------------------

async function caricaTabella() {
	const tabella = document.getElementById("tabellaStudenti");
	tabella.innerHTML = "<tr><td colspan='4' style='text-align:center;'>🔄 Caricamento dati...</td></tr>";

	try {
		const snapshot = await db.collection("studenti").orderBy("data_inserimento", "desc").get();
		
		if (snapshot.empty) {
			tabella.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Nessun dato trovato.</td></tr>";
			return;
		}

		tabella.innerHTML = ""; 

		snapshot.forEach((doc) => {
			const studente = doc.data();
			let dataLeggibile = "N/D";
			if (studente.data_inserimento) {
				dataLeggibile = new Date(studente.data_inserimento.seconds * 1000).toLocaleDateString("it-IT");
			}

			const riga = `
				<tr class="riga-studente" data-orientatore="${studente.inserito_da}">
					<td><strong>${studente.nome} ${studente.cognome}</strong></td>
					<td><a href="tel:${studente.telefono}" style="color: blue;">${studente.telefono}</a></td>
					<td>${studente.inserito_da}</td>
					<td>${dataLeggibile}</td>
				</tr>
			`;
			tabella.innerHTML += riga;
		});

	} catch (error) {
		console.error("Errore CRM:", error);
		tabella.innerHTML = "<tr><td colspan='4' style='color:red;'>Errore. Se vedi questo messaggio spesso, controlla le Regole di Sicurezza su Firebase.</td></tr>";
	}
}

function filtraTabella() {
	const filtro = document.getElementById("filtroOrientatore").value;
	const righe = document.querySelectorAll(".riga-studente");

	righe.forEach(riga => {
		const orientatoreRiga = riga.getAttribute("data-orientatore");
		if (filtro === "tutti" || orientatoreRiga === filtro) {
			riga.style.display = ""; 
		} else {
			riga.style.display = "none"; 
		}
	});
}