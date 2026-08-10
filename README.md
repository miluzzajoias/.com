# Miluzza Joias — versão revisada

## O que foi incluído
- Catálogo conectado à coleção Firestore `produtos`.
- Página individual de produto corrigida.
- Carrinho persistente no navegador.
- Controle de quantidade e remoção de itens.
- Checkout que monta o pedido e abre o WhatsApp da Miluzza.
- Cadastro, edição, status, destaque e exclusão de produtos no painel.
- Upload Cloudinary com validação de JPG/PNG/WEBP e limite de 5 MB.
- Logo local para reduzir dependências externas.
- Busca por nome, categoria, código e descrição.
- Categorias dinâmicas.
- Regras Firestore alinhadas à coleção real e ao e-mail administrativo configurado.
- SEO/meta básicos e favicon.

## Dados já mantidos
Firebase e Cloudinary foram preservados conforme o arquivo original fornecido.
WhatsApp: +55 63 98500-3751
E-mail de contato: miluzzajoias@gmail.com

## Atenção antes de publicar
A regra do Firestore autoriza escrita somente ao e-mail `miluzzajoias@gmail.com`.
Se a conta usada no Firebase Authentication para entrar no painel tiver outro e-mail, altere esse endereço em:
- `firebase/firestore.rules`
- `assets/js/admin.js` (const ADMIN_EMAIL)

Depois publique novamente as regras do Firestore.

## Cloudinary
O preset usado continua sendo `miluzza_produtos`. Para produção, configure no Cloudinary o preset como unsigned apenas se essa for a estratégia desejada e aplique restrições de formato/tamanho/pasta compatíveis com a loja.

## Publicação
O projeto é uma aplicação estática e pode continuar sendo hospedado no Firebase Hosting. Publique os arquivos deste diretório e as regras do Firestore.
