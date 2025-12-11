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

// -----------------------------------------------------------
// --- CODICE PER LA TABELLA ADMIN ---
// -----------------------------------------------------------

window.onload = async function() {
	const tabella = document.getElementById("tabellaStudenti");
	// Messaggio di attesa
	tabella.innerHTML = "<tr><td colspan='4' style='text-align:center;'>🔄 Caricamento dati in corso...</td></tr>";

	try {
		// Scarica gli studenti ordinati per data (dal più recente)
		const snapshot = await db.collection("studenti").orderBy("data_inserimento", "desc").get();
		
		// Se non ci sono studenti
		if (snapshot.empty) {
			tabella.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Nessun dato trovato nel database.</td></tr>";
			return;
		}

		tabella.innerHTML = ""; // Pulisce la scritta di caricamento

		snapshot.forEach((doc) => {
			const studente = doc.data();
			
			// Sistema la data per renderla leggibile (giorno/mese/anno)
			let dataLeggibile = "N/D";
			if (studente.data_inserimento) {
				dataLeggibile = new Date(studente.data_inserimento.seconds * 1000).toLocaleDateString("it-IT");
			}

			// Crea la riga HTML
			const riga = `
				<tr class="riga-studente" data-orientatore="${studente.inserito_da}">
					<td><strong>${studente.nome} ${studente.cognome}</strong></td>
					<td><a href="tel:${studente.telefono}" style="color: blue; text-decoration: underline;">${studente.telefono}</a></td>
					<td>${studente.inserito_da}</td>
					<td>${dataLeggibile}</td>
				</tr>
			`;
			tabella.innerHTML += riga;
		});

	} catch (error) {
		console.error("Errore CRM:", error);
		tabella.innerHTML = "<tr><td colspan='4' style='color:red; text-align:center;'>⚠️ Errore nel caricamento. Controlla la console (F12).</td></tr>";
	}
};

// Funzione Filtro (per vedere solo Giulia, Marta, ecc.)
function filtraTabella() {
	const filtro = document.getElementById("filtroOrientatore").value;
	const righe = document.querySelectorAll(".riga-studente");

	righe.forEach(riga => {
		const orientatoreRiga = riga.getAttribute("data-orientatore");
		
		// Logica: Se filtro è "tutti" OPPURE l'email corrisponde, mostra la riga
		if (filtro === "tutti" || orientatoreRiga === filtro) {
			riga.style.display = ""; 
		} else {
			riga.style.display = "none"; 
		}
	});
}