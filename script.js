// script.js - VERSIONE FINALE COLLEGATA AL TUO DATABASE

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

// --- 2. GESTIONE LOGIN (Whitelisting) ---

// All'avvio, controlla se l'utente è già loggato
document.addEventListener("DOMContentLoaded", () => {
	const operatore = localStorage.getItem("novaUser");
	
	if (operatore) {
		// Se c'è già un utente salvato, mostra direttamente il CRM
		mostraCRM(operatore);
	} else {
		// Altrimenti mostra la schermata di login
		document.getElementById("loginSection").classList.remove("d-none");
	}
});

// Funzione di Login
function effettuaLogin() {
	const emailInput = document.getElementById("loginEmail").value.trim().toLowerCase();
	const btnLogin = document.getElementById("btnLogin");

	if (!emailInput) return alert("Inserisci una email.");

	// Effetto "caricamento"
	btnLogin.innerText = "Verifica in corso...";
	btnLogin.disabled = true;

	// CHIEDI AL DATABASE: Esiste questa mail nella cartella 'utenti_ammessi'?
	db.collection("utenti_ammessi").where("email", "==", emailInput).get()
	.then((querySnapshot) => {
		if (!querySnapshot.empty) {
			// TROVATO! Accesso consentito
			localStorage.setItem("novaUser", emailInput); // Salva nel browser
			mostraCRM(emailInput);
		} else {
			// NON TROVATO
			alert("Accesso Negato: Email non autorizzata.");
			btnLogin.innerText = "Entra";
			btnLogin.disabled = false;
		}
	})
	.catch((error) => {
		console.error("Errore login:", error);
		alert("Errore di connessione. Riprova.");
		btnLogin.innerText = "Entra";
		btnLogin.disabled = false;
	});
}

// Funzione per mostrare la schermata CRM
function mostraCRM(email) {
	document.getElementById("loginSection").classList.add("d-none"); // Nasconde login
	document.getElementById("crmSection").classList.remove("d-none"); // Mostra CRM
	console.log("Loggato come:", email);
}

// Funzione Logout 
function logout() {
	localStorage.removeItem("novaUser");
	location.reload();
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


// --- 4. SALVATAGGIO DATI (INVIO AL CRM) ---
document.getElementById("leadForm").addEventListener("submit", function(e) {
	e.preventDefault();
	
	const btnSubmit = document.querySelector("button[type='submit']");
	const operatore = localStorage.getItem("novaUser"); // Chi sta inserendo il dato

	// Raccoglie i dati dal form
	const nuovoStudente = {
		nome: document.getElementById("nome").value,
		cognome: document.getElementById("cognome").value,
		telefono: document.getElementById("telefono").value,
		email_studente: document.getElementById("email").value,
		universita: document.getElementById("universita").value,
		corso: document.getElementById("corso").value,
		
		// Dati automatici
		inserito_da: operatore,
		data_inserimento: new Date(), // Data e ora attuali
		stato: "Nuovo" // Stato iniziale
	};

	// Effetto "caricamento"
	btnSubmit.innerText = "Salvataggio in corso...";
	btnSubmit.disabled = true;

	// SPEDISCE A FIREBASE (Nella raccolta "studenti")
	db.collection("studenti").add(nuovoStudente)
	.then(() => {
		alert("Studente inserito correttamente nel CRM!");
		document.getElementById("leadForm").reset(); // Pulisce il modulo
		btnSubmit.innerText = "Inserisci nel CRM";
		btnSubmit.disabled = false;
	})
	.catch((error) => {
		console.error("Errore salvataggio:", error);
		alert("C'è stato un problema nel salvataggio. Controlla la connessione.");
		btnSubmit.innerText = "Inserisci nel CRM";
		btnSubmit.disabled = false;
	});
});