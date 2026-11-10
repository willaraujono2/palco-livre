
// =====================================
// PALCO LIVRE - APLICACAO PRINCIPAL
// =====================================

import { db, auth } from "./firebase.js";

// =====================================
// FIREBASE AUTHENTICATION
// =====================================

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// =====================================
// FIRESTORE
// =====================================

import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// =====================================
// ELEMENTOS DA TELA
// =====================================

const userEmail = document.getElementById("userEmail");
const userPassword = document.getElementById("userPassword");

const registerButton = document.getElementById("registerButton");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const authStatus = document.getElementById("authStatus");

const adForm = document.getElementById("adForm");
const adTitle = document.getElementById("adTitle");
const adCategory = document.getElementById("adCategory");
const adPrice = document.getElementById("adPrice");
const adDescription = document.getElementById("adDescription");
const adSubmitButton = document.getElementById("adSubmitButton");
const adStatus = document.getElementById("adStatus");
const adsList = document.getElementById("adsList");

// =====================================
// VARIAVEIS DE CONTROLE
// =====================================

let currentUser = null;
let editingAdId = null;

// =====================================
// CADASTRO DE USUARIO
// =====================================

registerButton.addEventListener("click", async () => {
    const email = userEmail.value.trim();
    const password = userPassword.value;

    if (!email || !password) {
        authStatus.textContent = "Informe e-mail e senha.";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);

        authStatus.textContent = "Conta criada com sucesso! Bem-vindo ao Palco Livre.";

    } catch (error) {
        authStatus.textContent = "Erro ao criar conta: " + error.message;
    }
});

// =====================================
// LOGIN
// =====================================

loginButton.addEventListener("click", async () => {
    const email = userEmail.value.trim();
    const password = userPassword.value;

    if (!email || !password) {
        authStatus.textContent = "Informe e-mail e senha.";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);

        authStatus.textContent = "Login realizado com sucesso!";

    } catch (error) {
        authStatus.textContent = "Erro ao entrar: " + error.message;
    }
});

// =====================================
// LOGOUT
// =====================================

logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);

        authStatus.textContent = "Você saiu da sua conta.";

    } catch (error) {
        authStatus.textContent = "Erro ao sair: " + error.message;
    }
});

// =====================================
// ACOMPANHAR USUARIO LOGADO
// =====================================

onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
        authStatus.textContent = "Logado como: " + user.email;

        registerButton.disabled = true;
        loginButton.disabled = true;
        logoutButton.disabled = false;

    } else {
        authStatus.textContent = "Você não está conectado.";

        registerButton.disabled = false;
        loginButton.disabled = false;
        logoutButton.disabled = true;

        editingAdId = null;

        if (adForm) {
            adForm.reset();
        }

        if (adSubmitButton) {
            adSubmitButton.textContent = "Publicar anúncio";
        }
    }

    displayAds();
});

// =====================================
// CADASTRAR OU ATUALIZAR ANUNCIO
// =====================================

adForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        adStatus.textContent = "Faça login para publicar um anúncio.";
        return;
    }

    const titulo = adTitle.value.trim();
    const categoria = adCategory.value;
    const preco = Number(adPrice.value);
    const descricao = adDescription.value.trim();

    if (!titulo || !categoria || !descricao) {
        adStatus.textContent = "Preencha todos os campos.";
        return;
    }

    if (adPrice.value.trim() === "" || !Number.isFinite(preco) || preco < 0) {
        adStatus.textContent = "Informe um preço válido.";
        return;
    }

    const anuncio = {
        titulo: titulo,
        categoria: categoria,
        preco: preco,
        descricao: descricao,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
    };

    try {
        adSubmitButton.disabled = true;

        if (editingAdId) {

            // ATUALIZAR ANUNCIO

            await updateDoc(
                doc(db, "anuncios", editingAdId),
                anuncio
            );

            adStatus.textContent = "Anúncio atualizado com sucesso!";

            editingAdId = null;

            adSubmitButton.textContent = "Publicar anúncio";

        } else {

            // CADASTRAR ANUNCIO

            anuncio.criadoEm = serverTimestamp();

            await addDoc(collection(db, "anuncios"), anuncio);

            adStatus.textContent = "Anúncio publicado com sucesso!";
        }

        adForm.reset();

    } catch (error) {
        adStatus.textContent = "Erro ao salvar anúncio: " + error.message;

    } finally {
        adSubmitButton.disabled = false;
    }
});

// =====================================
// EDITAR ANUNCIO
// =====================================

function editAd(anuncio) {

    if (!currentUser || currentUser.uid !== anuncio.ownerId) {
        alert("Você só pode editar seus próprios anúncios.");
        return;
    }

    editingAdId = anuncio.id;

    adTitle.value = anuncio.titulo || "";
    adCategory.value = anuncio.categoria || "";
    adPrice.value = anuncio.preco ?? "";
    adDescription.value = anuncio.descricao || "";

    adSubmitButton.textContent = "Salvar alterações";

    adStatus.textContent = "Editando anúncio: " + anuncio.titulo;

    adForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// =====================================
// EXCLUIR ANUNCIO
// =====================================

async function deleteAd(anuncio) {

    if (!currentUser) {
        alert("Faça login para excluir um anúncio.");
        return;
    }

    if (currentUser.uid !== anuncio.ownerId) {
        alert("Você só pode excluir seus próprios anúncios.");
        return;
    }

    const confirmar = window.confirm(
        'Tem certeza que deseja excluir o anúncio "' +
        anuncio.titulo +
        '"?'
    );

    if (!confirmar) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, "anuncios", anuncio.id)
        );

        // Se o anuncio excluido estava sendo editado,
        // limpar o formulario.

        if (editingAdId === anuncio.id) {
            editingAdId = null;
            adForm.reset();
            adSubmitButton.textContent = "Publicar anúncio";
        }

        adStatus.textContent = "Anúncio excluído com sucesso!";

    } catch (error) {
        adStatus.textContent = "Erro ao excluir anúncio: " + error.message;
    }
}

// =====================================
// LISTAR ANUNCIOS DO FIRESTORE
// =====================================

function displayAds() {

    onSnapshot(collection(db, "anuncios"), (snapshot) => {

        adsList.innerHTML = "";

        if (snapshot.empty) {
            adsList.innerHTML = "<p>Nenhum anúncio publicado ainda.</p>";
            return;
        }

        snapshot.forEach((documento) => {

            const anuncio = {
                id: documento.id,
                ...documento.data()
            };

            const card = document.createElement("div");
            card.className = "ad-card";

            const titulo = document.createElement("h3");
            titulo.textContent = anuncio.titulo || "Sem título";

            const categoria = document.createElement("p");
            categoria.textContent = "Categoria: " + (anuncio.categoria || "Não informada");

            const preco = document.createElement("p");
            preco.textContent = "Preço: " + Number(anuncio.preco || 0).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            const descricao = document.createElement("p");
            descricao.textContent = anuncio.descricao || "";

            const vendedor = document.createElement("p");
            vendedor.textContent = "Vendedor: " + (anuncio.ownerEmail || "Não informado");

            card.appendChild(titulo);
            card.appendChild(categoria);
            card.appendChild(preco);
            card.appendChild(descricao);
            card.appendChild(vendedor);

            // BOTOES SOMENTE PARA O PROPRIETARIO

            if (currentUser && currentUser.uid === anuncio.ownerId) {

                const editButton = document.createElement("button");

                editButton.type = "button";
                editButton.textContent = "Editar anúncio";

                editButton.addEventListener("click", () => {
                    editAd(anuncio);
                });

                card.appendChild(editButton);

                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.textContent = "Excluir anúncio";

                deleteButton.addEventListener("click", () => {
                    deleteAd(anuncio);
                });

                card.appendChild(deleteButton);
            }

            adsList.appendChild(card);
        });

    }, (error) => {

        adsList.textContent = "Erro ao carregar anúncios: " + error.message;

    });
}

// =====================================
// PESQUISA MUSICAL - ITUNES API
// =====================================

const artistSearch = document.getElementById("artistSearch");
const searchButton = document.getElementById("searchButton");
const status = document.getElementById("status");
const results = document.getElementById("results");

// =====================================
// BUSCAR MUSICAS
// =====================================

async function searchMusic() {

    const artist = artistSearch.value.trim();

    if (!artist) {
        status.textContent = "Digite o nome de um artista ou banda.";
        results.innerHTML = "";
        return;
    }

    status.textContent = "Buscando músicas...";
    results.innerHTML = "";

    try {

        const url =
            "https://itunes.apple.com/search?term=" +
            encodeURIComponent(artist) +
            "&entity=song&limit=12";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const data = await response.json();

        displayResults(data.results);

        if (data.results.length === 0) {
            status.textContent = "Nenhuma música encontrada.";
        } else {
            status.textContent = data.results.length + " resultado(s) encontrado(s).";
        }

    } catch (error) {

        status.textContent = "Erro na pesquisa: " + error.message;
    }
}

// =====================================
// EXIBIR RESULTADOS MUSICAIS
// =====================================

function displayResults(musicList) {

    results.innerHTML = "";

    musicList.forEach((music) => {

        const card = document.createElement("div");
        card.className = "music-card";

        const image = document.createElement("img");

        image.src = music.artworkUrl100 || "";
        image.alt = "Capa do álbum";
        image.loading = "lazy";

        const title = document.createElement("h3");
        title.textContent = music.trackName || "Música sem título";

        const artist = document.createElement("p");
        artist.textContent = music.artistName || "Artista desconhecido";

        const genre = document.createElement("p");
        genre.textContent = music.primaryGenreName || "Gênero não informado";

        const link = document.createElement("a");

        link.href = music.trackViewUrl || "#";
        link.textContent = "Ouvir no Apple Music";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(artist);
        card.appendChild(genre);
        card.appendChild(link);

        results.appendChild(card);
    });
}

// =====================================
// EVENTOS DA PESQUISA MUSICAL
// =====================================

searchButton.addEventListener("click", searchMusic);

artistSearch.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchMusic();
    }

});

// =====================================
// FIM DO PALCO LIVRE
// =====================================
