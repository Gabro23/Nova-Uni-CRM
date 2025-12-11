// script.js - VERSIONE CORRETTA E PULITA

console.log("Il file script.js è stato caricato!"); // Se non vedi questo in console, il file non è collegato.

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
if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth(); 

// --- 2. GESTIONE LOGIN ---

// Ascoltatore stato utente (Gestisce i refresh della pagina)
auth.onAuthStateChanged((user) => {
	if (user) {
		console.log("Utente già loggato:", user.email);
		mostraCRM(user.email);
	} else {
		console.log("Nessun utente loggato.");
		document.getElementById("loginSection").classList.remove("d-none");
		document.getElementById("crmSection").classList.add("d-none");
	}
});

// Funzione Login con Debug
function effettuaLogin() {
	console.log("Tentativo di login in corso..."); // Se non vedi questo, il bottone non è collegato
	
	const emailField = document.getElementById("loginEmail");
	const passField = document.getElementById("loginPassword");

	if (!emailField || !passField) {
		alert("Errore HTML: mancano gli ID loginEmail o loginPassword");
		return;
	}

	const email = emailField.value.trim();
	const pass = passField.value.trim();

	if (!email || !pass) {
		alert("Per favore, inserisci email e password.");
		return;
	}

	auth.signInWithEmailAndPassword(email, pass)
		.then((userCredential) => {
			console.log("Login riuscito:", userCredential.user.email);
			// Non serve chiamare mostraCRM qui, ci pensa onAuthStateChanged
		})
		.catch((error) => {
			console.error("Errore login:", error);
			let msg = "Errore sconosciuto";
			if(error.code === "auth/wrong-password") msg = "Password errata.";
			if(error.code === "auth/user-not-found") msg = "Utente non trovato.";
			if(error.code === "auth/invalid-email") msg = "Formato email non valido.";
			alert("Errore Login: " + msg);
		});
}

function mostraCRM(email) {
	document.getElementById("loginSection").classList.add("d-none");
	document.getElementById("crmSection").classList.remove("d-none");
	
	// Aggiorna un elemento visivo se vuoi mostrare chi è loggato
	const headerTitle = document.querySelector(".crm-header h4");
	if(headerTitle) headerTitle.innerText = "Operatore: " + email;
}

function logout() {
	auth.signOut().then(() => {
		console.log("Logout effettuato");
		location.reload();
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
// Aggiungiamo un controllo se l'elemento esiste per evitare errori se siamo nella pagina sbagliata
const formLead = document.getElementById("leadForm");

if (formLead) {
	formLead.addEventListener("submit", function(e) {
		e.preventDefault();
		
		const user = auth.currentUser;
		if (!user) {
			alert("Sessione scaduta. Rifai il login.");
			location.reload();
			return;
		}

		const btnSubmit = document.querySelector("button[type='submit']");
		const operatoreEmail = user.email;

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

		btnSubmit.innerText = "Salvataggio...";
		btnSubmit.disabled = true;

		// A. SALVA SU FIREBASE
		db.collection("studenti").add(nuovoStudente)
		.then(() => {
			console.log("Dati salvati su Firebase");
			
			// B. INVIA LA NOTIFICA EMAIL
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

			alert("Studente inserito e notifica inviata!");
			formLead.reset(); 
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
}