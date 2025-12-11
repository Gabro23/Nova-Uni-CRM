// script.js - VERSIONE CORRETTA CON DEBUG AVANZATO

console.log("✅ Script caricato correttamente");

// --- CONFIGURAZIONE FIREBASE ---
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
try {
	if (!firebase.apps.length) {
		firebase.initializeApp(firebaseConfig);
		console.log("✅ Firebase inizializzato");
	}
} catch (error) {
	console.error("❌ Errore inizializzazione Firebase:", error);
}

const db = firebase.firestore();
const auth = firebase.auth();

// ⚠️ IMPORTANTE: INSERISCI QUI LA TUA PUBLIC KEY DI EMAILJS
// Vai su https://dashboard.emailjs.com/admin/account
emailjs.init("LA_TUA_PUBLIC_KEY_EMAILJS"); // <-- CAMBIA QUESTO!

// --- GESTIONE AUTENTICAZIONE ---

// Monitora lo stato dell'autenticazione
auth.onAuthStateChanged((user) => {
	if (user) {
		console.log("✅ Utente autenticato:", user.email);
		mostraCRM(user.email);
	} else {
		console.log("ℹ️ Nessun utente autenticato");
		mostraLogin();
	}
});

// Form Login con gestione evento
const loginForm = document.getElementById("loginForm");
if (loginForm) {
	loginForm.addEventListener("submit", function(e) {
		e.preventDefault();
		effettuaLogin();
	});
}

// Funzione Login Migliorata
function effettuaLogin() {
	console.log("🔐 Tentativo di login...");
	
	const emailField = document.getElementById("loginEmail");
	const passField = document.getElementById("loginPassword");
	const btnText = document.getElementById("loginButtonText");
	const spinner = document.getElementById("loginSpinner");
	const errorDiv = document.getElementById("loginError");

	// Nascondi errori precedenti
	errorDiv.classList.add("d-none");

	if (!emailField || !passField) {
		mostraErrore("Errore interno: campi mancanti");
		return;
	}

	const email = emailField.value.trim();
	const pass = passField.value.trim();

	// Validazione base
	if (!email || !pass) {
		mostraErrore("Inserisci email e password");
		return;
	}

	// Validazione formato email
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		mostraErrore("Formato email non valido");
		return;
	}

	// UI Loading
	btnText.textContent = "Accesso...";
	spinner.classList.remove("d-none");
	loginForm.querySelectorAll("input, button").forEach(el => el.disabled = true);

	// Tentativo di login
	auth.signInWithEmailAndPassword(email, pass)
		.then((userCredential) => {
			console.log("✅ Login riuscito:", userCredential.user.email);
			// onAuthStateChanged gestirà il redirect
		})
		.catch((error) => {
			console.error("❌ Errore login:", error);
			console.error("Codice errore:", error.code);
			console.error("Messaggio:", error.message);
			
			let messaggio = "Errore sconosciuto";
			
			switch(error.code) {
				case "auth/wrong-password":
					messaggio = "Password errata";
					break;
				case "auth/user-not-found":
					messaggio = "Utente non trovato. Verifica l'email.";
					break;
				case "auth/invalid-email":
					messaggio = "Formato email non valido";
					break;
				case "auth/user-disabled":
					messaggio = "Account disabilitato. Contatta l'amministratore.";
					break;
				case "auth/too-many-requests":
					messaggio = "Troppi tentativi falliti. Riprova più tardi.";
					break;
				case "auth/network-request-failed":
					messaggio = "Errore di connessione. Verifica internet.";
					break;
				case "auth/invalid-credential":
					messaggio = "Credenziali non valide. Verifica email e password.";
					break;
				default:
					messaggio = `Errore: ${error.message}`;
			}
			
			mostraErrore(messaggio);
			
			// Reset UI
			btnText.textContent = "Entra";
			spinner.classList.add("d-none");
			loginForm.querySelectorAll("input, button").forEach(el => el.disabled = false);
		});
}

// Mostra errore nel login
function mostraErrore(messaggio) {
	const errorDiv = document.getElementById("loginError");
	errorDiv.textContent = messaggio;
	errorDiv.classList.remove("d-none");
}

// Mostra schermata login
function mostraLogin() {
	document.getElementById("loginSection").classList.remove("d-none");
	document.getElementById("crmSection").classList.add("d-none");
}

// Mostra CRM
function mostraCRM(email) {
	document.getElementById("loginSection").classList.add("d-none");
	document.getElementById("crmSection").classList.remove("d-none");
	
	const operatoreName = document.getElementById("operatoreName");
	if (operatoreName) {
		operatoreName.textContent = email;
	}
}

// Logout
function logout() {
	if (confirm("Vuoi davvero uscire?")) {
		auth.signOut()
			.then(() => {
				console.log("✅ Logout effettuato");
				location.reload();
			})
			.catch((error) => {
				console.error("❌ Errore logout:", error);
				alert("Errore durante il logout");
			});
	}
}

// --- DATABASE CORSI ---
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

// Aggiorna corsi in base all'università
function aggiornaCorsi() {
	const uniSelect = document.getElementById("universita");
	const corsoSelect = document.getElementById("corso");
	const ateneoScelto = uniSelect.value;
	
	corsoSelect.innerHTML = '<option value="">Seleziona il Corso...</option>';
	
	if (ateneoScelto && databaseCorsi[ateneoScelto]) {
		corsoSelect.disabled = false;
		databaseCorsi[ateneoScelto].forEach(corso => {
			const option = document.createElement("option");
			option.value = corso;
			option.textContent = corso;
			corsoSelect.appendChild(option);
		});
	} else {
		corsoSelect.disabled = true;
		corsoSelect.innerHTML = '<option value="">Prima seleziona un Ateneo</option>';
	}
}

// --- GESTIONE FORM STUDENTE ---
const leadForm = document.getElementById("leadForm");

if (leadForm) {
	leadForm.addEventListener("submit", function(e) {
		e.preventDefault();
		salvaStudente();
	});
}

function salvaStudente() {
	const user = auth.currentUser;
	
	if (!user) {
		alert("Sessione scaduta. Effettua nuovamente il login.");
		location.reload();
		return;
	}

	const btnText = document.getElementById("submitButtonText");
	const spinner = document.getElementById("submitSpinner");
	const submitBtn = leadForm.querySelector("button[type='submit']");

	// Raccogli dati
	const nuovoStudente = {
		nome: document.getElementById("nome").value.trim(),
		cognome: document.getElementById("cognome").value.trim(),
		telefono: document.getElementById("telefono").value.trim(),
		email_studente: document.getElementById("email").value.trim() || "Non fornita",
		universita: document.getElementById("universita").value || "Non specificata",
		corso: document.getElementById("corso").value || "Non specificato",
		inserito_da: user.email,
		data_inserimento: firebase.firestore.FieldValue.serverTimestamp(),
		stato: "Nuovo"
	};

	// Validazione
	if (!nuovoStudente.nome || !nuovoStudente.cognome || !nuovoStudente.telefono) {
		alert("Nome, Cognome e Telefono sono obbligatori!");
		return;
	}

	// UI Loading
	btnText.textContent = "Salvataggio...";
	spinner.classList.remove("d-none");
	submitBtn.disabled = true;

	// Salva su Firebase
	db.collection("studenti").add(nuovoStudente)
		.then((docRef) => {
			console.log("✅ Studente salvato con ID:", docRef.id);
			
			// Invia email notifica
			const parametriEmail = {
				nome_studente: `${nuovoStudente.nome} ${nuovoStudente.cognome}`,
				telefono_studente: nuovoStudente.telefono,
				orientatore: user.email,
				universita: nuovoStudente.universita,
				corso: nuovoStudente.corso
			};

			return emailjs.send("service_pww5yfx", "template_anemtvg", parametriEmail);
		})
		.then(() => {
			console.log("✅ Email inviata con successo");
			alert("✅ Studente inserito e notifica inviata!");
			leadForm.reset();
			document.getElementById("corso").disabled = true;
		})
		.catch((error) => {
			console.error("❌ Errore:", error);
			alert("⚠️ Errore: " + error.message);
		})
		.finally(() => {
			// Reset UI
			btnText.textContent = "Inserisci nel CRM";
			spinner.classList.add("d-none");
			submitBtn.disabled = false;
		});
}