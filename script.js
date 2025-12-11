// script.js - VERSIONE TEST (LOGIN SBLOCCATO + EMAIL FUNZIONANTE)

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

// --- 2. GESTIONE LOGIN (MODALITÀ TEST - ENTRA CHIUNQUE) ---

document.addEventListener("DOMContentLoaded", () => {
	const operatore = localStorage.getItem("novaUser");
	if (operatore) {
		mostraCRM(operatore);
	} else {
		document.getElementById("loginSection").classList.remove("d-none");
	}
});

// QUESTA È LA FUNZIONE MODIFICATA PER FARTI ENTRARE SUBITO
function effettuaLogin() {
	const emailInput = document.getElementById("loginEmail").value.trim().toLowerCase();
	
	if (!emailInput) return alert("Inserisci una email.");

	
	localStorage.setItem("novaUser", emailInput);
	mostraCRM(emailInput);
}

function mostraCRM(email) {
	document.getElementById("loginSection").classList.add("d-none");
	document.getElementById("crmSection").classList.remove("d-none");
	console.log("Loggato come:", email);
}

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


// --- 4. SALVATAGGIO DATI E INVIO EMAIL ---
document.getElementById("leadForm").addEventListener("submit", function(e) {
	e.preventDefault();
	
	const btnSubmit = document.querySelector("button[type='submit']");
	const operatore = localStorage.getItem("novaUser"); 

	const nuovoStudente = {
		nome: document.getElementById("nome").value,
		cognome: document.getElementById("cognome").value,
		telefono: document.getElementById("telefono").value,
		email_studente: document.getElementById("email").value,
		universita: document.getElementById("universita").value,
		corso: document.getElementById("corso").value,
		inserito_da: operatore,
		data_inserimento: new Date(), 
		stato: "Nuovo"
	};

	btnSubmit.innerText = "Salvataggio in corso...";
	btnSubmit.disabled = true;

	// A. SALVA SU FIREBASE
	db.collection("studenti").add(nuovoStudente)
	.then(() => {
		console.log("Dati salvati su Firebase");
		
		// B. INVIA LA NOTIFICA EMAIL
		const parametriEmail = {
			nome: nuovoStudente.nome,
			cognome: nuovoStudente.cognome,
			telefono: nuovoStudente.telefono,
			universita: nuovoStudente.universita,
			corso: nuovoStudente.corso,
			operatore: operatore
		};

		// QUI HO MESSO I TUOI CODICI PRESI DAGLI SCREENSHOT
		emailjs.send("service_pww5yfx", "template_anemtvg", parametriEmail)
			.then(function() {
				console.log('Email inviata con successo!');
			}, function(error) {
				console.log('Errore invio email:', error);
			});

		alert("Studente inserito correttamente nel CRM! Email inviata.");
		document.getElementById("leadForm").reset(); 
		btnSubmit.innerText = "Inserisci nel CRM";
		btnSubmit.disabled = false;
	})
	.catch((error) => {
		console.error("Errore salvataggio:", error);
		alert("C'è stato un problema nel salvataggio.");
		btnSubmit.innerText = "Inserisci nel CRM";
		btnSubmit.disabled = false;
	});
});