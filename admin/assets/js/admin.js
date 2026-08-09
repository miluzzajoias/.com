import {
  auth,
  db,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onAuthStateChanged,
  signOut
} from "../../../assets/js/firebase.js";

import {
  uploadImage
} from "../../../assets/js/cloudinary.js";


// ============================================================
// UTILITÁRIOS
// ============================================================

const $ = (selector) =>
  document.querySelector(selector);


function esc(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);

}


// ============================================================
// ELEMENTOS
// ============================================================

const form = $("#pf");
const saveButton = $("#save");
const message = $("#msg");
const fileInput = $("#file");
const preview = $("#preview");
const productList = $("#list");
const logoutButton = $("#logout");


// ============================================================
// PROTEÇÃO DO PAINEL
// ============================================================

let autenticacaoVerificada = false;


onAuthStateChanged(auth, async (user) => {

  // O Firebase terminou de verificar a sessão.
  autenticacaoVerificada = true;


  // ----------------------------------------------------------
  // NÃO ESTÁ LOGADA
  // ----------------------------------------------------------

  if (!user) {

    console.log(
      "Acesso ao painel negado: usuário não autenticado."
    );

    window.location.replace(
      "login.html"
    );

    return;

  }


  // ----------------------------------------------------------
  // ESTÁ LOGADA
  // ----------------------------------------------------------

  console.log(
    "Administradora autenticada:",
    user.email
  );


  // Só agora carregamos os produtos.
  await carregarProdutos();

});


// ============================================================
// PRÉVIA DA IMAGEM
// ============================================================

if (fileInput) {

  fileInput.addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];


      if (!file) {

        preview.textContent =
          "Prévia da imagem";

        return;

      }


      if (!file.type.startsWith("image/")) {

        preview.textContent =
          "Selecione uma imagem válida.";

        fileInput.value = "";

        return;

      }


      const imageUrl =
        URL.createObjectURL(file);


      preview.innerHTML = `
        <img
          src="${imageUrl}"
          alt="Prévia do produto"
          style="
            width:100%;
            height:100%;
            object-fit:contain;
            border-radius:12px;
          "
        >
      `;

    }
  );

}


// ============================================================
// CADASTRAR PRODUTO
// ============================================================

if (form) {

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const file =
        fileInput.files[0];


      const codigo =
        $("#code").value
          .trim()
          .toUpperCase();


      if (!codigo) {

        message.textContent =
          "Digite o código do produto.";

        $("#code").focus();

        return;

      }


      if (!file) {

        message.textContent =
          "Selecione uma imagem.";

        return;

      }


      saveButton.disabled = true;

      saveButton.textContent =
        "Salvando...";

      message.textContent = "";


      try {

        // ----------------------------------------------------
        // CLOUDINARY
        // ----------------------------------------------------

        const image =
          await uploadImage(file);


        // ----------------------------------------------------
        // FIRESTORE
        // ----------------------------------------------------

        await addDoc(
          collection(db, "produtos"),
          {

            code:
              codigo,

            name:
              $("#name").value.trim(),

            category:
              $("#cat").value.trim(),

            price:
              $("#price").value.trim(),

            description:
              $("#desc").value.trim(),

            image,

            featured:
              $("#featured").checked,

            createdAt:
              serverTimestamp()

          }
        );


        // ----------------------------------------------------
        // LIMPAR
        // ----------------------------------------------------

        form.reset();

        preview.textContent =
          "Prévia da imagem";

        message.textContent =
          "Peça cadastrada com sucesso.";


        await carregarProdutos();


      } catch (error) {

        console.error(
          "Erro ao cadastrar produto:",
          error
        );


        message.textContent =
          error.message ||
          "Não foi possível cadastrar a peça.";

      }


      saveButton.disabled = false;

      saveButton.textContent =
        "Salvar peça";

    }
  );

}


// ============================================================
// CARREGAR PRODUTOS
// ============================================================

async function carregarProdutos() {

  if (!productList) return;


  productList.innerHTML = `
    <p>Carregando peças...</p>
  `;


  try {

    const consulta =
      query(
        collection(db, "produtos"),
        orderBy(
          "createdAt",
          "desc"
        )
      );


    const snapshot =
      await getDocs(consulta);


    if (snapshot.empty) {

      productList.innerHTML = `
        <p>Nenhuma peça cadastrada.</p>
      `;

      return;

    }


    productList.innerHTML =
      snapshot.docs
        .map((documento) => {

          const produto =
            documento.data();


          return `
            <article
              class="item"
              data-id="${documento.id}"
            >

              ${
                produto.image

                  ? `
                    <img
                      src="${esc(produto.image)}"
                      alt="${esc(produto.name)}"
                      style="
                        width:80px;
                        height:80px;
                        object-fit:cover;
                        border-radius:10px;
                      "
                    >
                  `

                  : `
                    <div class="noimg">
                      M
                    </div>
                  `
              }


              <div>

                <h3>
                  ${esc(produto.name)}
                </h3>

                <p>
                  Código:
                  <strong>
                    ${esc(
                      produto.code ||
                      "Sem código"
                    )}
                  </strong>
                </p>

                <p>
                  ${esc(
                    produto.category || ""
                  )}

                  ${
                    produto.price
                      ? ` · ${esc(produto.price)}`
                      : ""
                  }
                </p>

              </div>


              <button
                class="delete"
                data-id="${documento.id}"
              >
                Excluir
              </button>

            </article>
          `;

        })
        .join("");


    document
      .querySelectorAll(".delete")
      .forEach((button) => {

        button.addEventListener(
          "click",
          async () => {

            const id =
              button.dataset.id;


            if (
              !window.confirm(
                "Excluir esta peça?"
              )
            ) {

              return;

            }


            button.disabled = true;

            button.textContent =
              "Excluindo...";


            try {

              await deleteDoc(
                doc(
                  db,
                  "produtos",
                  id
                )
              );


              await carregarProdutos();


            } catch (error) {

              console.error(
                "Erro ao excluir:",
                error
              );


              alert(
                "Não foi possível excluir a peça."
              );


              button.disabled = false;

              button.textContent =
                "Excluir";

            }

          }
        );

      });


  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );


    productList.innerHTML = `
      <p>
        Não foi possível carregar o catálogo.
      </p>
    `;

  }

}


// ============================================================
// LOGOUT
// ============================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.replace(
          "login.html"
        );

      } catch (error) {

        console.error(
          "Erro ao sair:",
          error
        );

      }

    }
  );

}