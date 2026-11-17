// =====================================
// PALCO LIVRE - APLICACAO PRINCIPAL
// =====================================

import { db, auth } from "./firebase.js";

// FIREBASE AUTHENTICATION
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// FIRESTORE
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

// Classificados
const adForm = document.getElementById("adForm");
const adTitle = document.getElementById("adTitle");
const adCategory = document.getElementById("adCategory");
const adPrice = document.getElementById("adPrice");
const adDescription = document.getElementById("adDescription");
const adSubmitButton = document.getElementById("adSubmitButton");
const adStatus = document.getElementById("adStatus");
const adsList = document.getElementById("adsList");

// Músicos e bandas
const profileForm = document.getElementById("profileForm");
const profileType = document.getElementById("profileType");
const profileName = document.getElementById("profileName");
const profileInstrument = document.getElementById("profileInstrument");
const profileCity = document.getElementById("profileCity");
const profileDescription = document.getElementById("profileDescription");
const profileSubmitButton = document.getElementById("profileSubmitButton");
const profileStatus = document.getElementById("profileStatus");
const profilesList = document.getElementById("profilesList");

// Equipamentos
const equipmentSearch = document.getElementById("equipmentSearch");
const equipmentCategory = document.getElementById("equipmentCategory");
const equipmentStatus = document.getElementById("equipmentStatus");
const equipmentList = document.getElementById("equipmentList");

// Pesquisa musical
const artistSearch = document.getElementById("artistSearch");
const searchButton = document.getElementById("searchButton");
const status = document.getElementById("status");
const results = document.getElementById("results");

// =====================================
// VARIAVEIS DE CONTROLE
// =====================================

let currentUser = null;
let editingAdId = null;
let editingProfileId = null;

let adsUnsubscribe = null;
let profilesUnsubscribe = null;

let cachedAds = [];
let cachedProfiles = [];

// =====================================
// FUNCOES AUXILIARES
// =====================================

function showCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
}

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
        editingProfileId = null;

        adForm.reset();
        adSubmitButton.textContent = "Publicar anúncio";

        profileForm.reset();
        profileSubmitButton.textContent = "Cadastrar perfil";
    }

    // Reapresenta os cartões para atualizar os botões do proprietário.
    renderAds();
    renderProfiles();

    // Mantém apenas uma assinatura ativa para cada coleção.
    subscribeToAds();
    subscribeToProfiles();
});

// =====================================
// CLASSIFICADOS - CADASTRAR OU ATUALIZAR
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
        titulo,
        categoria,
        preco,
        descricao,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
    };

    try {
        adSubmitButton.disabled = true;

        if (editingAdId) {
            await updateDoc(doc(db, "anuncios", editingAdId), anuncio);
            adStatus.textContent = "Anúncio atualizado com sucesso!";
            editingAdId = null;
            adSubmitButton.textContent = "Publicar anúncio";
        } else {
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
// CLASSIFICADOS - EDITAR
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

    adForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

// =====================================
// CLASSIFICADOS - EXCLUIR
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
        'Tem certeza que deseja excluir o anúncio "' + anuncio.titulo + '"?'
    );

    if (!confirmar) return;

    try {
        await deleteDoc(doc(db, "anuncios", anuncio.id));

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
// CLASSIFICADOS - ASSINATURA E EXIBICAO
// =====================================

function subscribeToAds() {
    if (adsUnsubscribe) return;

    adsUnsubscribe = onSnapshot(collection(db, "anuncios"), (snapshot) => {
        cachedAds = snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        renderAds();
        renderEquipment();
    }, (error) => {
        adsList.textContent = "Erro ao carregar anúncios: " + error.message;
        equipmentList.textContent = "Erro ao carregar equipamentos: " + error.message;
    });
}

function renderAds() {
    adsList.innerHTML = "";

    if (cachedAds.length === 0) {
        adsList.appendChild(createTextElement("p", "Nenhum anúncio publicado ainda."));
        return;
    }

    cachedAds.forEach((anuncio) => {
        const card = document.createElement("article");
        card.className = "card ad-card";

        card.appendChild(createTextElement("h3", anuncio.titulo || "Sem título"));
        card.appendChild(createTextElement("p", "Categoria: " + (anuncio.categoria || "Não informada")));
        card.appendChild(createTextElement("p", "Preço: " + showCurrency(anuncio.preco)));
        card.appendChild(createTextElement("p", anuncio.descricao || ""));
        card.appendChild(createTextElement("p", "Vendedor: " + (anuncio.ownerEmail || "Não informado")));

        if (currentUser && currentUser.uid === anuncio.ownerId) {
            const actions = document.createElement("div");
            actions.className = "card-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Editar anúncio";
            editButton.addEventListener("click", () => editAd(anuncio));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "danger-button";
            deleteButton.textContent = "Excluir anúncio";
            deleteButton.addEventListener("click", () => deleteAd(anuncio));

            actions.append(editButton, deleteButton);
            card.appendChild(actions);
        }

        adsList.appendChild(card);
    });
}

// =====================================
// MUSICOS E BANDAS - CADASTRAR OU EDITAR
// =====================================

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        profileStatus.textContent = "Faça login para cadastrar seu perfil.";
        return;
    }

    const perfil = {
        tipo: profileType.value,
        nome: profileName.value.trim(),
        instrumento: profileInstrument.value.trim(),
        cidade: profileCity.value.trim(),
        descricao: profileDescription.value.trim(),
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
    };

    if (!perfil.tipo || !perfil.nome || !perfil.instrumento || !perfil.cidade || !perfil.descricao) {
        profileStatus.textContent = "Preencha todos os campos.";
        return;
    }

    try {
        profileSubmitButton.disabled = true;

        if (editingProfileId) {
            await updateDoc(doc(db, "perfis_musicais", editingProfileId), perfil);
            profileStatus.textContent = "Perfil atualizado com sucesso!";
            editingProfileId = null;
            profileSubmitButton.textContent = "Cadastrar perfil";
        } else {
            perfil.criadoEm = serverTimestamp();
            await addDoc(collection(db, "perfis_musicais"), perfil);
            profileStatus.textContent = "Perfil cadastrado com sucesso!";
        }

        profileForm.reset();
    } catch (error) {
        profileStatus.textContent = "Erro ao salvar perfil: " + error.message;
    } finally {
        profileSubmitButton.disabled = false;
    }
});

// =====================================
// MUSICOS E BANDAS - ASSINATURA
// =====================================

function subscribeToProfiles() {
    if (profilesUnsubscribe) {
        profilesUnsubscribe();
        profilesUnsubscribe = null;
    }

    profilesUnsubscribe = onSnapshot(collection(db, "perfis_musicais"), (snapshot) => {
        cachedProfiles = snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        renderProfiles();
    }, (error) => {
        profilesList.textContent = "Erro ao carregar perfis: " + error.message;
    });
}

// =====================================
// MUSICOS E BANDAS - EDITAR E EXCLUIR
// =====================================

function editProfile(perfil) {
    if (!currentUser || currentUser.uid !== perfil.ownerId) {
        alert("Você só pode editar seu próprio perfil.");
        return;
    }

    editingProfileId = perfil.id;
    profileType.value = perfil.tipo || "";
    profileName.value = perfil.nome || "";
    profileInstrument.value = perfil.instrumento || "";
    profileCity.value = perfil.cidade || "";
    profileDescription.value = perfil.descricao || "";
    profileSubmitButton.textContent = "Salvar alterações";
    profileStatus.textContent = "Editando perfil: " + perfil.nome;

    profileForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function deleteProfile(perfil) {
    if (!currentUser || currentUser.uid !== perfil.ownerId) {
        alert("Você só pode excluir seu próprio perfil.");
        return;
    }

    const confirmar = window.confirm(
        'Deseja excluir o perfil "' + perfil.nome + '"?'
    );

    if (!confirmar) return;

    try {
        await deleteDoc(doc(db, "perfis_musicais", perfil.id));

        if (editingProfileId === perfil.id) {
            editingProfileId = null;
            profileForm.reset();
            profileSubmitButton.textContent = "Cadastrar perfil";
        }

        profileStatus.textContent = "Perfil excluído com sucesso!";
    } catch (error) {
        profileStatus.textContent = "Erro ao excluir perfil: " + error.message;
    }
}

function renderProfiles() {
    profilesList.innerHTML = "";

    if (cachedProfiles.length === 0) {
        profilesList.appendChild(createTextElement("p", "Nenhum músico ou banda cadastrado ainda."));
        return;
    }

    cachedProfiles.forEach((perfil) => {
        const card = document.createElement("article");
        card.className = "card profile-card";

        card.appendChild(createTextElement("h3", perfil.nome || "Perfil sem nome"));
        card.appendChild(createTextElement("p", "Tipo: " + (perfil.tipo || "Não informado")));
        card.appendChild(createTextElement("p", "Instrumento / Estilo: " + (perfil.instrumento || "Não informado")));
        card.appendChild(createTextElement("p", "Cidade: " + (perfil.cidade || "Não informada")));
        card.appendChild(createTextElement("p", perfil.descricao || ""));
        card.appendChild(createTextElement("p", "Contato: " + (perfil.ownerEmail || "Não informado")));

        if (currentUser && currentUser.uid === perfil.ownerId) {
            const actions = document.createElement("div");
            actions.className = "card-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Editar perfil";
            editButton.addEventListener("click", () => editProfile(perfil));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "danger-button";
            deleteButton.textContent = "Excluir perfil";
            deleteButton.addEventListener("click", () => deleteProfile(perfil));

            actions.append(editButton, deleteButton);
            card.appendChild(actions);
        }

        profilesList.appendChild(card);
    });
}

// =====================================
// EQUIPAMENTOS - FILTRO DOS ANUNCIOS EXISTENTES
// =====================================

function renderEquipment() {
    equipmentList.innerHTML = "";

    const termo = equipmentSearch.value.trim().toLocaleLowerCase("pt-BR");
    const categoriaSelecionada = equipmentCategory.value;

    const filtrados = cachedAds.filter((anuncio) => {
        const correspondeCategoria = !categoriaSelecionada ||
            anuncio.categoria === categoriaSelecionada;

        const texto = (
            (anuncio.titulo || "") + " " +
            (anuncio.descricao || "") + " " +
            (anuncio.categoria || "")
        ).toLocaleLowerCase("pt-BR");

        return correspondeCategoria && texto.includes(termo);
    });

    if (filtrados.length === 0) {
        equipmentStatus.textContent = "Nenhum item encontrado com os filtros selecionados.";
        return;
    }

    equipmentStatus.textContent = filtrados.length + " item(ns) encontrado(s).";

    filtrados.forEach((anuncio) => {
        const card = document.createElement("article");
        card.className = "card equipment-card";

        card.appendChild(createTextElement("h3", anuncio.titulo || "Sem título"));
        card.appendChild(createTextElement("p", "Categoria: " + (anuncio.categoria || "Não informada")));
        card.appendChild(createTextElement("p", "Preço: " + showCurrency(anuncio.preco)));
        card.appendChild(createTextElement("p", anuncio.descricao || ""));
        card.appendChild(createTextElement("p", "Contato: " + (anuncio.ownerEmail || "Não informado")));

        equipmentList.appendChild(card);
    });
}

equipmentSearch.addEventListener("input", renderEquipment);
equipmentCategory.addEventListener("change", renderEquipment);

// =====================================
// PESQUISA MUSICAL - ITUNES API
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
        const url = "https://itunes.apple.com/search?term=" +
            encodeURIComponent(artist) + "&entity=song&limit=12";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const data = await response.json();
        displayResults(data.results || []);

        if (!data.results || data.results.length === 0) {
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
        const card = document.createElement("article");
        card.className = "card music-card";

        const image = document.createElement("img");
        image.src = music.artworkUrl100 || "";
        image.alt = "Capa do álbum";
        image.loading = "lazy";

        const title = createTextElement("h3", music.trackName || "Música sem título");
        const artist = createTextElement("p", music.artistName || "Artista desconhecido");
        const genre = createTextElement("p", music.primaryGenreName || "Gênero não informado");

        const link = document.createElement("a");
        link.href = music.trackViewUrl || "#";
        link.textContent = "Ouvir no Apple Music";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.append(image, title, artist, genre, link);
        results.appendChild(card);
    });
}

// EVENTOS DA PESQUISA MUSICAL
searchButton.addEventListener("click", searchMusic);

artistSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchMusic();
    }
});

// =====================================
// FIM DO PALCO LIVRE
// =====================================
