# Palco Livre 🎸

## 1. Sobre o projeto

O **Palco Livre** é uma aplicação web desenvolvida para aproximar pessoas da comunidade musical. A plataforma permite criar perfis de músicos e bandas, publicar e consultar anúncios de instrumentos e equipamentos, além de pesquisar artistas e músicas por meio de uma API externa.

O projeto foi desenvolvido como atividade acadêmica, utilizando HTML, CSS e JavaScript, com autenticação e armazenamento de dados em serviços do Firebase.

## 2. Integrante

- **Estudante:** Will — IFRJ, Campus Pinheiral.

## 3. Aplicação publicada

A aplicação está hospedada no GitHub Pages:

https://willaraujono2.github.io/palco-livre/

**Repositório GitHub:**

https://github.com/willaraujono2/palco-livre

## 4. Tecnologias utilizadas

- **HTML5:** estrutura e conteúdo das seções da aplicação.
- **CSS3:** identidade visual, organização dos componentes e responsividade.
- **JavaScript:** interatividade, validações e integração com serviços externos.
- **Firebase Authentication:** cadastro, login e logout dos usuários.
- **Cloud Firestore:** armazenamento dos perfis musicais e anúncios.
- **iTunes Search API:** consulta de músicas e informações de artistas.
- **GitHub Pages:** publicação da aplicação na internet.

## 5. API externa

O projeto utiliza a **iTunes Search API**, disponibilizada pela Apple, para pesquisar músicas.

A consulta é feita com `fetch()` a partir do endereço:

https://itunes.apple.com/search

A aplicação envia o termo digitado pelo usuário, solicita resultados do tipo música e limita a consulta a 12 resultados.

As informações apresentadas incluem título da faixa, artista, gênero musical, imagem do álbum e link para abrir a música no Apple Music.

O JavaScript trata o carregamento, a ausência de resultados e possíveis erros de comunicação.

## 6. Banco de dados e autenticação

O projeto utiliza o **Firebase Authentication** para cadastro, login e logout. O **Cloud Firestore** armazena os dados da aplicação.

São utilizadas duas coleções:

### `anuncios`

Armazena os classificados publicados pelos usuários:

- Título;
- Categoria;
- Preço;
- Descrição;
- Identificação do proprietário;
- E-mail do proprietário;
- Data de criação.

### `perfis_musicais`

Armazena os perfis de músicos e bandas:

- Tipo de perfil: Músico ou Banda;
- Nome;
- Instrumento ou estilo musical;
- Cidade;
- Descrição;
- Identificação do proprietário;
- E-mail do proprietário;
- Data de criação.

As regras do Firestore permitem a leitura pública dos anúncios e perfis. Para criar, atualizar ou excluir registros, é necessário estar autenticado. A atualização e a exclusão são permitidas somente ao proprietário do registro.

## 7. Funcionalidades

### Minha Conta
- Cadastro de usuário com e-mail e senha.
- Login e logout.
- Exibição do estado da autenticação.

### Músicos e Bandas
- Cadastro de perfil como músico ou banda.
- Inclusão de nome, instrumento ou estilo, cidade e descrição.
- Listagem dos perfis cadastrados.
- Edição e exclusão do próprio perfil.

### Classificados
- Cadastro de anúncios de instrumentos e equipamentos.
- Listagem dos anúncios.
- Edição e exclusão dos próprios anúncios.
- Exibição de categoria, preço, descrição e contato do anunciante.

### Equipamentos
- Consulta dos anúncios existentes.
- Pesquisa por texto no nome, descrição ou categoria.
- Filtro por categoria.

A área de Equipamentos reutiliza os documentos da coleção `anuncios`. Portanto, não cria uma segunda cópia dos produtos.

### Universo Musical
- Pesquisa de músicas por artista ou termo.
- Exibição de título, artista, gênero e capa.
- Link para abrir o resultado no Apple Music.

## 8. Operações CRUD

Os módulos de Classificados e Músicos e Bandas implementam as quatro operações CRUD:

| Operação | Significado | Aplicação |
|---|---|---|
| Create | Criar | Cadastrar anúncios e perfis. |
| Read | Consultar | Listar anúncios e perfis armazenados. |
| Update | Atualizar | Editar o próprio anúncio ou perfil. |
| Delete | Excluir | Excluir o próprio anúncio ou perfil. |

As operações são realizadas por meio dos métodos do Cloud Firestore.

## 9. Como utilizar

1. Acesse a aplicação pelo endereço do GitHub Pages.
2. Crie uma conta com e-mail e senha ou entre com uma conta existente.
3. Para divulgar uma banda ou músico, acesse **Músicos e Bandas**, preencha o formulário e cadastre o perfil.
4. Para anunciar um produto, acesse **Classificados**, informe título, categoria, preço e descrição e publique.
5. Consulte os anúncios na listagem de Classificados.
6. Acesse **Equipamentos** para pesquisar anúncios por texto ou filtrar por categoria.
7. Utilize as opções de edição e exclusão nos seus próprios registros.
8. Acesse **Universo Musical** para pesquisar músicas e artistas.

## 10. Estrutura dos arquivos

```text
palco-livre/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── firebase.js
└── README.md
```

O arquivo `firebase.js` contém a configuração e a inicialização dos serviços Firebase. As regras de segurança são configuradas no painel do Cloud Firestore.

## 11. Capturas de tela

As capturas de tela da aplicação podem ser adicionadas ao repositório em uma pasta chamada `docs/`.

Recomenda-se incluir imagens da tela inicial, cadastro/login, perfis musicais, classificados, equipamentos e pesquisa musical.

## 12. Considerações finais

O desenvolvimento do Palco Livre permitiu aplicar conhecimentos de estruturação com HTML, estilização com CSS, programação com JavaScript, consumo de API externa, autenticação de usuários e persistência de dados em banco de dados na nuvem.

A aplicação integra uma comunidade de músicos e bandas, classificados de instrumentos e equipamentos e pesquisa musical, demonstrando a comunicação entre o front-end, serviços do Firebase e uma API externa.
