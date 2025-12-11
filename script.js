// script.js - VERSIONE PRODUZIONE (FIREBASE AUTH REALE + EMAILJS)

// --- 1. CONFIGURAZIONE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBGLgVz0HRkwYNLGfjbFKahitLZgi4xs5A",
  authDomain: "crm---nova-uni.firebaseapp.com",
  projectId: "crm---nova-uni",
  storageBucket: "crm---nova-uni.firebasestorage.app",
  messagingSenderId: "486298746752",
  appId: "1:486298746752:web:bea5f8f2934ddef6bdcb65",
  measurementId: "G-SRCYJ07HGN"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); // Aggiunto il servizio Auth

// --- 2. GESTIONE LOGIN (REALE CON EMAIL E PASSWORD) ---

// Questo "ascoltatore" controlla SEMPRE se c'è un utente loggato
// Appena apri la pagina, Firebase controlla se eri già dentro.
auth.onAuthStateChanged((user) => {
	if (user) {
		// Utente loggato: nascondi login, mostra CRM
		mostraCRM(user.email);
	} else {
		// Nessun utente: mostra form login
		document.getElementById("loginSection").classList.remove("d-none");
		document.getElementById("crmSection").classList.add("d-none");
	}
});

function effettuaLogin() {
	const emailInput = document.getElementById("loginEmail").value.trim();
	const passInput = document.getElementById("loginPassword").value.trim(); // Ora serve la password
	
	if (!emailInput || !passInput) return alert("Inserisci email e password.");

	// Login vero su Firebase
	auth.signInWithEmailAndPassword(emailInput, passInput)
		.then((userCredential) => {
			// Login riuscito! onAuthStateChanged gestirà la visualizzazione
			console.log("Login effettuato:", userCredential.user.email);
		})
		.catch((error) => {
			console.error("Errore login:", error);
			alert("Errore di accesso: " + error.message);
		});
}

function mostraCRM(email) {
	document.getElementById("loginSection").classList.add("d-none");
	document.getElementById("crmSection").classList.remove("d-none");
	console.log("Benvenuto nel CRM:", email);
}

function logout() {
	auth.signOut().then(() => {
		console.log("Logout effettuato");
		location.reload(); // Ricarica la pagina per pulire tutto
	});
}


// --- 3. LOGICA UNIVERSITÀ E CORSI ---
const databaseCorsi = {
	"Pegaso": [
		"L-5 Filosofia ed Etica", "L-7 Ingegneria Civile", "L-10 Lettere, Arti e Umanesimo", 
		"L-15 Scienze Turistiche", "L-18 Economia Aziendale", "L-19 Scienze dell'Educazione e della Formazione", 
		"L-22 Scienze Motorie", "L-31 Informatica", "LMG-01 Giurisprudenza", 
		"LM-14 Filologia Moderna e Comparata", "LM-26 Ingegneria della Sicurezza", "LM-39 Linguistica Moderna", 
		"LM-47 Management dello Sport e delle Attività Motorie", "LM-56 Economia, Digital Data Analysis", 
		"LM-85 Scienze Pedagogiche"
	],
	"Mercatorum": [
		"L-3 Scienze e Tecnologie delle Arti", "L-4 Design del Prodotto e della Moda", 
		"L-7 Ingegneria delle Infrastrutture", "L-8 Ingegneria Informatica", "L-9 Ingegneria Gestionale", 
		"L-12 Lingue e Mercati", "L-14 Scienze Giuridiche", "L-18 Gestione d'Impresa", 
		"L-20 Comunicazione e Multimedialità", "L-24 Scienze e Tecniche Psicologiche", 
		"L-36 Scienze Politiche", "L-40 Sociologia e Innovazione", "L-41 Statistica e Big Data", 
		"L-GASTR Gastronomia", "LM-31 Ingegneria Gestionale", "LM-38 Lingue per la Comunicazione", 
		"LM-51 Psicologia del Lavoro", "LM-52 Relazioni Internazionali", "LM-59 Comunicazione Digitale", 
		"LM-66 Sicurezza Informatica", "LM-77 Management"
	],
	"SanRaffaele": [
		"L-1 Patrimonio Culturale in Era Digitale", "L-4 Moda e Design Industriale", 
		"L-8 Ingegneria Informatica e AI", "L-9 Ingegneria Biomedica", "L-11 Lingue e Culture Straniere", 
		"L-13 Scienze Biologiche", "L-16 Scienze dell'Amministrazione", "L-22 Scienze Motorie", 
		"L-26 Scienze dell'Alimentazione", "LM-32 Ingegneria Informatica e AI", 
		"LM-37 Lingue e culture straniere", "LM-61 Scienze della Nutrizione Umana", 
		"LM-63 Management e PA", "LM-67 Scienze e Tecniche Attività Motorie", 
		"LM-77 Management e Consulenza"
	]
};

function aggiornaCorsi() {
	const uniSelect = document.getElementById("universita");
	const corsoSelect = document.getElementById("corso");
	const ateneoScelto = uniSelect.value;
	corsoSelect.innerHTML = '<option value="">Seleziona il Corso...</option>';
	
	if (ateneoScelto && databaseCorsi[ateneoScelto]) {
		corsoSelect.disabled = false;
		databaseCorsi[ateneoScelto].forEach(corso => {
			let option = document.createElement("option");
			option.text = corso;
			option.value = corso;
			corsoSelect.add(option);
		});
	} else {
		corsoSelect.disabled = true;
		corsoSelect.innerHTML = '<option value="">Prima seleziona un Ateneo</option>';
	}
}


// --- 4. SALVATAGGIO DATI E INVIO EMAIL ---
document.getElementById("leadForm").addEventListener("submit", function(e) {
	e.preventDefault();
	
	// Controlliamo se l'utente è loggato davvero
	const user = auth.currentUser;
	if (!user) {
		alert("Sessione scaduta. Rifai il login.");
		location.reload();
		return;
	}

	const btnSubmit = document.querySelector("button[type='submit']");
	const operatoreEmail = user.email; // Prendiamo la mail vera da Firebase Auth

	// Dati per Firebase
	const nuovoStudente = {
		nome: document.getElementById("nome").value,
		cognome: document.getElementById("cognome").value,
		telefono: document.getElementById("telefono").value,
		email_studente: document.getElementById("email").value,
		universita: document.getElementById("universita").value,
		corso: document.getElementById("corso").value,
		inserito_da: operatoreEmail,
		data_inserimento: new Date(), 
		stato: "Nuovo"
	};

	btnSubmit.innerText = "Salvataggio in corso...";
	btnSubmit.disabled = true;

	// A. SALVA SU FIREBASE
	db.collection("studenti").add(nuovoStudente)
	.then(() => {
		console.log("Dati salvati su Firebase");
		
		// B. INVIA LA NOTIFICA EMAIL (CORRETTO)
		const parametriEmail = {
			nome_studente: nuovoStudente.nome + " " + nuovoStudente.cognome, 
			telefono_studente: nuovoStudente.telefono,
			orientatore: operatoreEmail
		};

		emailjs.send("service_pww5yfx", "template_anemtvg", parametriEmail)
			.then(function() {
				console.log('Email inviata con successo!');
			}, function(error) {
				console.log('Errore invio email:', error);
			});

		// Messaggio finale e reset
		alert("Studente inserito e notifica inviata!");
		document.getElementById("leadForm").reset(); 
		btnSubmit.innerText = "Inserisci nel CRM";
		btnSubmit.disabled = false;
	})
	.catch((error) => {
		console.error("Errore salvataggio:", error);
		alert("Errore salvataggio: " + error.message);
		btnSubmit.innerText = "Inserisci nel CRM";
		btnSubmit.disabled = false;
	});
});