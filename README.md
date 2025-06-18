# Sobre a aplicação
O sistema foi criado para gamificar a participação de patrulhas (grupos escoteiros ou similares) por meio de capturas temáticas de Pokémon. A plataforma permite que cada patrulha registre capturas de forma visual, com informações como imagem, nome do Pokémon, descrição, local e elementos. Essas capturas são avaliadas por um gestor, e há um sistema de pontuação e comparação entre patrulhas, fomentando o espírito de competição saudável e engajamento entre os grupos.

Perfis e Funcionalidades:
1. Patrulha (usuário comum)
2. Gestor (usuário administrador)

## Requisitos Funcionais

### Patrulha (usuário comum)
- [x] Deve ser possível se cadastrar como patrulha;
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível enviar uma captura e fazer upload da imagem;
- [x] Deve ser possível listar suas capturas;

### Gestor (usuário administrador)
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível listar todas as capturas;
- [x] Deve ser possível filtrar as capturas;
- [x] Deve ser possível aprovar/negar uma captura;
- [x] Deve ser possível obter uma leaderboard das patrulhas com mais capturas;
- [x] Deve ser possível comparar duas patrulhas;

## Regras de negócio

- [x] O usuário não deve poder se cadastrar com um telefone duplicado;
- [x] Deve ser adicionado uma quantidade de pontos à patrulha quando uma captura da mesma é aprovada; (+10)
- [x] Deve ser adicionado pontos a mais caso a patrulha tenha sido a primeira a capturar um Pokémon (comparação dois a dois);
- [x] Deve ser adicionado pontos a mais caso a patrulha tenha sido a única a capturar um Pokémon (comparação dois a dois);
- [x] A patrulha com a maior quantidade de pontos vence (comparação dois a dois);

## Requisitos não-funcionais

- [x] A senha do usuário precisa ser criptografada;
- [x] Todas listas de dados precisam estar paginadas com no máximo 20 itens por página;
- [x] O usuário deve ser identificado na autenticação por meio um JWT;
- [x] O servidor deve armazenar os uploads das imagens no seu próximo armazenamento (raiz do projeto);
