// script.js - VERSIONE DEFINITIVA E CORRETTA

console.log("✅ Script caricato correttamente");

// --- 1. CONFIGURAZIONE FIREBASE (QUELA TUA CHE FUNZIONAVA) ---
const firebaseConfig = {
	apiKey: "AIzaSyDeg2oFFnP4A-OKW549migyuD2xUIG2ers", // <--- RIMESSA QUELLA GIUSTA TUA
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

// --- 2. CONFIGURAZIONE EMAILJS (CORRETTA) ---
// Public Key presa dal tuo screenshot
emailjs.init("jeuHyjgd1RLFMZYI5"); 

// --- GESTIONE AUTENTICAZIONE ---

auth.onAuthStateChanged((user) => {
	if (user) {
		console.log("✅ Utente autenticato:", user.email);
		mostraCRM(user.email);
	} else {
		console.log("ℹ️ Nessun utente autenticato");
		mostraLogin();
	}
});

const loginForm = document.getElementById("loginForm");
if (loginForm) {
	loginForm.addEventListener("submit", function(e) {
		e.preventDefault();
		effettuaLogin();
	});
}

function effettuaLogin() {
	console.log("🔐 Tentativo di login...");
	
	const emailField = document.getElementById("loginEmail");
	const passField = document.getElementById("loginPassword");
	const btnText = document.getElementById("loginButtonText");
	const spinner = document.getElementById("loginSpinner");
	const errorDiv = document.getElementById("loginError");

	errorDiv.classList.add("d-none");

	if (!emailField || !passField) return;

	const email = emailField.value.trim();
	const pass = passField.value.trim();

	if (!email || !pass) {
		mostraErrore("Inserisci email e password");
		return;
	}

	btnText.textContent = "Accesso...";
	spinner.classList.remove("d-none");
	loginForm.querySelectorAll("input, button").forEach(el => el.disabled = true);

	auth.signInWithEmailAndPassword(email, pass)
		.then((userCredential) => {
			console.log("✅ Login riuscito:", userCredential.user.email);
		})
		.catch((error) => {
			console.error("❌ Errore login:", error);
			let messaggio = "Errore sconosciuto";
			switch(error.code) {
				case "auth/wrong-password": messaggio = "Password errata"; break;
				case "auth/user-not-found": messaggio = "Utente non trovato"; break;
				case "auth/invalid-email": messaggio = "Email non valida"; break;
				case "auth/invalid-credential": messaggio = "Credenziali errate"; break;
				default: messaggio = error.message;
			}
			mostraErrore(messaggio);
			btnText.textContent = "Entra";
			spinner.classList.add("d-none");
			loginForm.querySelectorAll("input, button").forEach(el => el.disabled = false);
		});
}

function mostraErrore(messaggio) {
	const errorDiv = document.getElementById("loginError");
	errorDiv.textContent = messaggio;
	errorDiv.classList.remove("d-none");
}

function mostraLogin() {
	document.getElementById("loginSection").classList.remove("d-none");
	document.getElementById("crmSection").classList.add("d-none");
}

function mostraCRM(email) {
	document.getElementById("loginSection").classList.add("d-none");
	document.getElementById("crmSection").classList.remove("d-none");
	const operatoreName = document.getElementById("operatoreName");
	if (operatoreName) operatoreName.textContent = email;
}

function logout() {
	if (confirm("Vuoi davvero uscire?")) {
		auth.signOut().then(() => location.reload());
	}
}

// --- DATABASE CORSI ---
const databaseCorsi = {
	"Pegaso": [
		"L-5 Filosofia ed Etica", "L-7 Ingegneria Civile", "L-10 Lettere, Arti e Umanesimo", 
		"L-15 Scienze Turistiche", "L-18 Economia Aziendale", "L-19 Scienze dell'Educazione", 
		"L-22 Scienze Motorie", "L-31 Informatica", "LMG-01 Giurisprudenza", 
		"LM-26 Ingegneria della Sicurezza", "LM-56 Economia", "LM-85 Scienze Pedagogiche"
	],
	"Mercatorum": [
		"L-8 Ingegneria Informatica", "L-9 Ingegneria Gestionale", "L-18 Gestione d'Impresa", 
		"L-24 Scienze Psicologiche", "L-36 Scienze Politiche", "LM-77 Management"
	],
	"SanRaffaele": [
		"L-4 Moda e Design", "L-22 Scienze Motorie", "L-26 Scienze dell'Alimentazione", 
		"LM-61 Nutrizione Umana", "LM-77 Management e Consulenza"
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
		alert("Sessione scaduta.");
		location.reload();
		return;
	}

	const btnText = document.getElementById("submitButtonText");
	const spinner = document.getElementById("submitSpinner");
	const submitBtn = leadForm.querySelector("button[type='submit']");

	const nuovoStudente = {
		nome: document.getElementById("nome").value.trim(),
		cognome: document.getElementById("cognome").value.trim(),