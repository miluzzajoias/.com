# Miluzza Joias

Site mobile-first pronto para publicar, com vitrine elegante, categorias, busca, página individual de produto, login administrativo após 5 cliques na logo, Firebase Authentication + Firestore e Cloudinary.

## Configuração final (obrigatória)

Você não precisa apagar, instalar ou criar arquivos. Apenas preencha suas credenciais nos dois arquivos indicados:

### Firebase
`assets/js/firebase.js`

Substitua os 6 valores `COLE_AQUI` pela configuração do Web App do seu Firebase.

No Firebase: ative Authentication > Email/Password, crie o usuário da proprietária e crie o Firestore. Publique também `firebase/firestore.rules`.

### Cloudinary
`assets/js/cloudinary.js`

Preencha `CLOUD_NAME` e `UPLOAD_PRESET`. O Upload Preset deve ser `Unsigned`.

## Uso

Na loja, 5 cliques rápidos na logo abrem o login. O painel exige autenticação Firebase. Ao cadastrar uma peça, a imagem vai para o Cloudinary e os dados vão para a coleção `products` no Firestore. Clicar na peça abre `produto.html` com seus detalhes e botão de WhatsApp.

Contatos já configurados:
WhatsApp +55 63 98500-3751
miluzzajoias@gmail.com

As cores utilizadas são #4a0628, #650b36, #2c0318, #e9c778, #f5dda0 e #fbf8f3.
