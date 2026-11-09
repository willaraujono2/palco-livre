
// =====================================
// PALCO LIVRE - PESQUISA MUSICAL
// Integração com a iTunes Search API
// =====================================

// Elementos da página
const searchInput = document.getElementById("artistSearch");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("status");
const resultsContainer = document.getElementById("results");

// Endereço da API externa
const API_URL = "https://itunes.apple.com/search";

// =====================================
// FUNÇÃO PARA PESQUISAR ARTISTAS E MÚSICAS
// =====================================

async function searchMusic() {

    const searchTerm = searchInput.value.trim();

    // Verifica se o usuário digitou alguma coisa
    if (!searchTerm) {
        statusMessage.textContent = "Digite o nome de um artista ou banda.";
        searchInput.focus();
        return;
    }

    // Feedback de carregamento
    searchButton.disabled = true;
    searchButton.textContent = "Pesquisando...";
    statusMessage.textContent = "Buscando informações musicais...";
    resultsContainer.replaceChildren();

    try {

        // Consulta à API utilizando fetch
        const response = await fetch(
            `${API_URL}?term=${encodeURIComponent(searchTerm)}&entity=musicArtist,song,musicTrack,album&limit=12`
        );

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        // Converte a resposta para JSON
        const data = await response.json();

        // Verifica se existem resultados
        if (!data.results || data.results.length === 0) {
            statusMessage.textContent = "Nenhum resultado encontrado. Tente outra pesquisa.";
            return;
        }

        // Exibe os resultados na tela
        displayResults(data.results);

        statusMessage.textContent =
            `${data.results.length} resultado(s) encontrado(s).`;

    } catch (error) {

        // Tratamento de erros
        console.error("Erro na pesquisa musical:", error);

        statusMessage.textContent =
            "Erro ao buscar dados musicais. Verifique sua conexão e tente novamente.";

    } finally {

        // Restaura o botão
        searchButton.disabled = false;
        searchButton.textContent = "Pesquisar";

    }
}

// =====================================
// FUNÇÃO PARA EXIBIR OS RESULTADOS
// =====================================

function displayResults(musicList) {

    resultsContainer.replaceChildren();

    musicList.forEach((music) => {

        // Cria o cartão
        const card = document.createElement("article");
        card.className = "card";

        // Imagem do artista ou álbum
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

        // Nome da música, álbum ou artista
        const title = document.createElement("h3");

        title.textContent =
            music.trackName ||
            music.collectionName ||
            music.artistName ||
            "Conteúdo musical";

        card.appendChild(title);

        // Nome do artista
        const artist = document.createElement("p");

        artist.textContent =
            "Artista: " + (music.artistName || "Não informado");

        card.appendChild(artist);

        // Gênero musical
        if (music.primaryGenreName) {

            const genre = document.createElement("p");

            genre.textContent = "Gênero: " + music.primaryGenreName;

            card.appendChild(genre);
        }

        // Link para mais informações
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

        // Adiciona o cartão à página
        resultsContainer.appendChild(card);

    });
}

// =====================================
// EVENTOS DOS BOTÕES
// =====================================

// Pesquisa ao clicar no botão
searchButton.addEventListener("click", searchMusic);

// Pesquisa ao pressionar Enter
searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchMusic();
    }

});
