# Palco Livre 🎸

## 1. Sobre o projeto

O **Palco Livre** é uma aplicação web desenvolvida com o objetivo de criar um espaço digital para a comunidade musical. A plataforma permite que músicos e interessados em música pesquisem artistas e músicas, além de publicar e consultar anúncios de instrumentos e equipamentos musicais.

O projeto foi desenvolvido como atividade acadêmica, utilizando tecnologias web e serviços em nuvem.

## 2. Integrante

- **Estudante:** Will - IFRJ- PInheiral

## 3. Aplicação publicada

A aplicação está hospedada no GitHub Pages e pode ser acessada pelo endereço:

https://willaraujono2.github.io/palco-livre/

**Repositório GitHub:**

https://github.com/willaraujono2/palco-livre

## 4. Tecnologias utilizadas

- HTML5: estrutura das páginas.
- CSS3: estilização e adaptação da interface para diferentes telas.
- JavaScript: funcionalidades e interatividade.
- GitHub Pages: hospedagem da aplicação.
- Firebase Authentication: cadastro e autenticação de usuários.
- Firebase Cloud Firestore: armazenamento dos anúncios na nuvem.

## 5. API externa utilizada

O projeto utiliza a **iTunes Search API**, serviço público da Apple que permite pesquisar informações sobre músicas e artistas.

A comunicação com a API é realizada por meio do método `fetch()` do JavaScript.

Endereço da API:

https://itunes.apple.com/search

A pesquisa permite consultar artistas e músicas, apresentando informações como título, nome do artista, gênero musical e imagem do álbum.

A aplicação também apresenta mensagens de carregamento, resultados encontrados e erros durante a consulta.

## 6. Banco de dados online

Foi utilizado o **Firebase Cloud Firestore** para armazenar os anúncios publicados pelos usuários.

O Firebase Authentication é utilizado para permitir o cadastro, login e logout.

Os anúncios armazenam informações como:

- Título do anúncio.
- Categoria do produto.
- Preço.
- Descrição.
- E-mail do proprietário.
- Identificação do usuário responsável pelo anúncio.
- Data de criação.

O banco de dados permite manter as informações disponíveis mesmo após o usuário sair da aplicação.

## 7. Funcionalidades

A aplicação possui as seguintes funcionalidades:

- Cadastro de usuários.
- Login e logout.
- Pesquisa de músicas e artistas.
- Consulta de informações musicais pela API do iTunes.
- Cadastro de anúncios de instrumentos e equipamentos.
- Listagem dos anúncios publicados.
- Edição dos próprios anúncios.
- Exclusão dos próprios anúncios.
- Armazenamento dos dados no Firebase Firestore.

## 8. Operações CRUD

O módulo de classificados implementa as quatro operações fundamentais de persistência de dados:

| Operação | Funcionalidade |
|---|---|
| Create | Criar e publicar anúncios. |
| Read | Consultar e listar anúncios. |
| Update | Editar anúncios publicados. |
| Delete | Excluir anúncios publicados. |

As operações foram implementadas utilizando o Firebase Cloud Firestore.

## 9. Como utilizar

1. Acesse a aplicação pelo link do GitHub Pages.
2. Realize o cadastro utilizando um endereço de e-mail e uma senha.
3. Entre na sua conta.
4. Acesse a área de classificados para publicar um anúncio.
5. Preencha o título, categoria, preço e descrição do produto.
6. Clique em publicar anúncio.
7. Consulte os anúncios disponíveis na página.
8. Utilize as opções de edição e exclusão nos anúncios de sua propriedade.
9. Acesse a pesquisa musical para consultar artistas e músicas.

## 10. Estrutura dos arquivos

O projeto está organizado da seguinte maneira:

```text
palco-livre/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   └── firebase.js
│
└── README.md
```

## 11. Capturas de tela

As imagens abaixo devem apresentar as principais funcionalidades da aplicação.

### Tela inicial

![Tela inicial do Palco Livre](docs/tela-inicial.png)

### Cadastro e login

![Tela de cadastro e login](docs/cadastro-login.png)

### Classificados musicais

![Tela de classificados](docs/classificados.png)

### Pesquisa musical

![Tela de pesquisa musical](docs/pesquisa-musical.png)

## 12. Considerações finais

O desenvolvimento do Palco Livre permitiu aplicar conhecimentos de HTML, CSS e JavaScript, integração com API externa, autenticação de usuários e persistência de informações em banco de dados online.

O projeto reúne funcionalidades de pesquisa musical e classificados de equipamentos, demonstrando na prática a integração entre uma aplicação web, serviços externos e banco de dados em nuvem.
