
import { db, auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// =====================================
// PALCO LIVRE - ELEMENTOS DA PÁGINA
// =====================================

// Pesquisa musical
const searchInput = document.getElementById("artistSearch");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("status");
const resultsContainer = document.getElementById("results");

// Autenticação
const userEmail = document.getElementById("userEmail");
const userPassword = document.getElementById("userPassword");
const registerButton = document.getElementById("registerButton");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const authStatus = document.getElementById("authStatus");

// API musical
const API_URL = "https://itunes.apple.com/search";

// =====================================
// CADASTRO DE USUÁRIO
// =====================================

async function registerUser() {
    const email = userEmail.value.trim();
    const password = userPassword.value;

    if (!email || !password) {
        authStatus.textContent = "Preencha o e-mail e a senha.";
        return;
    }

    if (password.length < 6) {
        authStatus.textContent = "A senha deve ter pelo menos 6 caracteres.";
        return;
    }

    registerButton.disabled = true;
    authStatus.textContent = "Criando sua conta...";

    try {
        await createUserWithEmailAndPassword(auth, email, password);

        authStatus.textContent = "Conta criada com sucesso! Bem-vindo ao Palco Livre.";

        userPassword.value = "";

    } catch (error) {
        console.error("Erro no cadastro:", error);

        if (error.code === "auth/email-already-in-use") {
            authStatus.textContent = "Este e-mail já está cadastrado.";
        } else if (error.code === "auth/invalid-email") {
            authStatus.textContent = "Digite um e-mail válido.";
        } else if (error.code === "auth/weak-password") {
            authStatus.textContent = "A senha é muito fraca.";
        } else {
            authStatus.textContent = "Não foi possível criar a conta. Tente novamente.";
        }

    } finally {
        registerButton.disabled = false;
    }
}

// =====================================
// LOGIN DE USUÁRIO
// =====================================

async function loginUser() {
    const email = userEmail.value.trim();
    const password = userPassword.value;

    if (!email || !password) {
        authStatus.textContent = "Preencha o e-mail e a senha.";
        return;
    }

    loginButton.disabled = true;
    authStatus.textContent = "Verificando seus dados...";

    try {
        await signInWithEmailAndPassword(auth, email, password);

        authStatus.textContent = "Login realizado com sucesso!";

        userPassword.value = "";

    } catch (error) {
        console.error("Erro no login:", error);

        if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/wrong-password" ||
            error.code === "auth/user-not-found"
        ) {
            authStatus.textContent = "E-mail ou senha incorretos.";
        } else if (error.code === "auth/invalid-email") {
            authStatus.textContent = "Digite um e-mail válido.";
        } else {
            authStatus.textContent = "Não foi possível entrar. Tente novamente.";
        }

    } finally {
        loginButton.disabled = false;
    }
}

// =====================================
// LOGOUT - SAIR DA CONTA
// =====================================

async function logoutUser() {
    try {
        await signOut(auth);
        authStatus.textContent = "Você saiu da sua conta.";

    } catch (error) {
        console.error("Erro ao sair:", error);
        authStatus.textContent = "Não foi possível sair da conta.";
    }
}

// =====================================
// ACOMPANHAR ESTADO DA AUTENTICAÇÃO
// =====================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        authStatus.textContent =
            "Você está conectado como: " + user.email;

        registerButton.disabled = true;
        loginButton.disabled = true;
        logoutButton.disabled = false;

    } else {
        registerButton.disabled = false;
        loginButton.disabled = false;
        logoutButton.disabled = true;
    }
});

// Eventos dos botões de autenticação
registerButton.addEventListener("click", registerUser);
loginButton.addEventListener("click", loginUser);
logoutButton.addEventListener("click", logoutUser);

// =====================================
// PESQUISA MUSICAL - ITUNES API
// =====================================

async function searchMusic() {
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        statusMessage.textContent = "Digite o nome de um artista ou banda.";
        searchInput.focus();
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Pesquisando...";
    statusMessage.textContent = "Buscando informações musicais...";
    resultsContainer.replaceChildren();

    try {
        const response = await fetch(
            `${API_URL}?term=${encodeURIComponent(searchTerm)}&entity=musicArtist,song,musicTrack,album&limit=12`
        );

        if (!response.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            statusMessage.textContent =
                "Nenhum resultado encontrado. Tente outra pesquisa.";
            return;
        }

        displayResults(data.results);

        statusMessage.textContent =
            `${data.results.length} resultado(s) encontrado(s).`;

    } catch (error) {
        console.error("Erro na pesquisa musical:", error);

        statusMessage.textContent =
            "Erro ao buscar dados musicais. Verifique sua conexão e tente novamente.";

    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Pesquisar";
    }
}

// =====================================
// EXIBIR RESULTADOS DA PESQUISA
// =====================================

function displayResults(musicList) {
    resultsContainer.replaceChildren();

    musicList.forEach((music) => {
        const card = document.createElement("article");
        card.className = "card";

        if (music.artworkUrl100) {
            const image = document.createElement("img");

            image.src = music.artworkUrl100;
            image.alt = `Imagem de ${music.trackName || music.collectionName || music.artistName || "conteúdo musical"}`;
            image.loading = "lazy";
            image.style.width = "100%";
            image.style.maxWidth = "180px";
            image.style.borderRadius = "8px";
            image.style.marginBottom = "15px";

            card.appendChild(image);
        }

        const title = document.createElement("h3");

        title.textContent =
            music.trackName ||
            music.collectionName ||
            music.artistName ||
            "Conteúdo musical";

        card.appendChild(title);

        const artist = document.createElement("p");

        artist.textContent =
            "Artista: " + (music.artistName || "Não informado");

        card.appendChild(artist);

        if (music.primaryGenreName) {
            const genre = document.createElement("p");

            genre.textContent = "Gênero: " + music.primaryGenreName;

            card.appendChild(genre);
        }

        const musicLink =
            music.trackViewUrl ||
            music.collectionViewUrl ||
            music.artistViewUrl;

        if (musicLink) {
            const link = document.createElement("a");

            link.href = musicLink;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Ver na Apple Music ↗";

            link.style.display = "inline-block";
            link.style.marginTop = "15px";
            link.style.color = "#ff9b59";
            link.style.textDecoration = "none";

            card.appendChild(link);
        }

        resultsContainer.appendChild(card);
    });
}

// =====================================
// EVENTOS DA PESQUISA MUSICAL
// =====================================

searchButton.addEventListener("click", searchMusic);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchMusic();
    }
});
