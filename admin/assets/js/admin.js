import {
  auth,
  db,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onAuthStateChanged,
  signOut
} from "../../../assets/js/firebase.js";

import {
  uploadImage
} from "../../../assets/js/cloudinary.js";


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const ADMIN_EMAIL =
  "miluzzajoias@gmail.com";

const COLLECTION =
  "produtos";

const MAX_PHOTOS =
  10;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;


/* =========================================================
   ESTADO
========================================================= */

let products = [];

let photos = [];


/* =========================================================
   ELEMENTOS
========================================================= */

const $ =
  selector =>
    document.querySelector(selector);


/* =========================================================
   UTILITÁRIOS
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
    );

}


function parseMoney(value) {

  if (
    typeof value === "number"
  ) {

    return value;

  }


  const text =
    String(value ?? "")
      .trim()
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");


  return Number(text) || 0;

}


function formatMoney(value) {

  return Number(value || 0)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

}


function message(
  text,
  type = "ok"
) {

  const element =
    $("#message");


  if (!element) return;


  element.textContent =
    text;


  element.className =
    `message ${type}`;

}


function clearMessage() {

  const element =
    $("#message");


  if (!element) return;


  element.textContent =
    "";


  element.className =
    "message";

}


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
  auth,
  async user => {

    console.log(
      "Verificando autenticação..."
    );


    if (!user) {

      console.log(
        "Usuário não autenticado."
      );


      window.location.replace(
        "login.html"
      );


      return;

    }


    console.log(
      "Usuário autenticado:",
      user.email
    );


    if (
      !user.email ||
      user.email.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      console.log(
        "Conta sem permissão administrativa."
      );


      await signOut(auth);


      window.location.replace(
        "login.html"
      );


      return;

    }


    /*
     * A autenticação está correta.
     * Liberamos o painel.
     */

    const loading =
      $("#authLoading");

    const content =
      $("#adminContent");


    if (loading) {

      loading.hidden =
        true;

    }


    if (content) {

      content.hidden =
        false;

    }


    console.log(
      "Painel administrativo liberado."
    );


    await loadProducts();

  }
);


/* =========================================================
   LOGOUT
========================================================= */

$("#logout")?.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

    }
    finally {

      window.location.replace(
        "login.html"
      );

    }

  }
);


/* =========================================================
   GALERIA
========================================================= */

function renderPhotos() {

  const grid =
    $("#photoGrid");

  const empty =
    $("#noPhotos");

  const counter =
    $("#photoCounter");


  if (counter) {

    counter.textContent =
      `${photos.length} ${
        photos.length === 1
          ? "foto"
          : "fotos"
      }`;

  }


  if (empty) {

    empty.style.display =
      photos.length
        ? "none"
        : "block";

  }


  if (!grid) return;


  grid.innerHTML =
    photos
      .map(
        (photo, index) => `

          <div
            class="photo-item"
            data-index="${index}"
          >

            <div class="photo-image">

              <img
                src="${escapeHTML(photo.url)}"
                alt="Foto ${index + 1}"
              >

              ${
                index === 0
                  ? `
                    <span class="cover">
                      CAPA
                    </span>
                  `
                  : ""
              }

            </div>


            <div class="photo-buttons">

              <button
                type="button"
                data-photo-action="left"
                ${
                  index === 0
                    ? "disabled"
                    : ""
                }
              >
                ←
              </button>


              <button
                type="button"
                data-photo-action="right"
                ${
                  index ===
                  photos.length - 1
                    ? "disabled"
                    : ""
                }
              >
                →
              </button>


              <button
                type="button"
                class="remove"
                data-photo-action="remove"
              >
                Remover
              </button>

            </div>

          </div>

        `
      )
      .join("");

}


$("#photoGrid")?.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "button"
      );


    if (!button) return;


    const item =
      button.closest(
        ".photo-item"
      );


    if (!item) return;


    const index =
      Number(
        item.dataset.index
      );


    const action =
      button.dataset.photoAction;


    if (
      action === "remove"
    ) {

      photos.splice(
        index,
        1
      );

    }


    else if (
      action === "left" &&
      index > 0
    ) {

      [
        photos[index - 1],
        photos[index]
      ] = [
        photos[index],
        photos[index - 1]
      ];

    }


    else if (
      action === "right" &&
      index <
      photos.length - 1
    ) {

      [
        photos[index],
        photos[index + 1]
      ] = [
        photos[index + 1],
        photos[index]
      ];

    }


    renderPhotos();

  }
);


/* =========================================================
   UPLOAD CLOUDINARY
========================================================= */

$("#photos")?.addEventListener(
  "change",
  async event => {

    clearMessage();


    const files =
      Array.from(
        event.target.files || []
      );


    if (!files.length) {

      return;

    }


    if (
      photos.length +
      files.length >
      MAX_PHOTOS
    ) {

      message(
        `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`,
        "error"
      );


      event.target.value =
        "";


      return;

    }


    for (
      const file of files
    ) {

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp"
        ].includes(
          file.type
        )
      ) {

        message(
          `A imagem "${file.name}" não é JPG, PNG ou WEBP.`,
          "error"
        );


        event.target.value =
          "";


        return;

      }


      if (
        file.size >
        MAX_FILE_SIZE
      ) {

        message(
          `A imagem "${file.name}" ultrapassa 5 MB.`,
          "error"
        );


        event.target.value =
          "";


        return;

      }

    }


    try {

      message(
        "Enviando imagens...",
        "ok"
      );


      for (
        const file of files
      ) {

        const url =
          await uploadImage(
            file
          );


        photos.push({

          url,

          name:
            file.name

        });


        renderPhotos();

      }


      message(
        "Fotos adicionadas com sucesso.",
        "ok"
      );

    }
    catch (error) {

      console.error(
        "Erro Cloudinary:",
        error
      );


      message(
        error.message ||
        "Não foi possível enviar as imagens.",
        "error"
      );

    }
    finally {

      event.target.value =
        "";

    }

  }
);


/* =========================================================
   CONTADOR DA DESCRIÇÃO
========================================================= */

$("#description")?.addEventListener(
  "input",
  event => {

    const counter =
      $("#descriptionCounter");


    if (counter) {

      counter.textContent =
        event.target.value.length;

    }

  }
);


/* =========================================================
   RESET
========================================================= */

function resetForm() {

  const form =
    $("#productForm");


  if (!form) return;


  form.reset();


  $("#productId").value =
    "";


  $("#stock").value =
    "1";


  $("#formMode").textContent =
    "NOVA PEÇA";


  $("#formTitle").textContent =
    "Cadastrar produto";


  $("#editingBadge").hidden =
    true;


  $("#cancel").hidden =
    true;


  $("#descriptionCounter").textContent =
    "0";


  photos = [];


  renderPhotos();


  clearMessage();

}


$("#newProduct")?.addEventListener(
  "click",
  resetForm
);


$("#cancel")?.addEventListener(
  "click",
  resetForm
);


/* =========================================================
   SALVAR
========================================================= */

$("#productForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    clearMessage();


    if (
      photos.length === 0
    ) {

      message(
        "Adicione pelo menos uma foto do produto.",
        "error"
      );


      return;

    }


    const id =
      $("#productId").value;


    const name =
      $("#name").value.trim();


    const code =
      $("#code").value
        .trim()
        .toUpperCase();


    const category =
      $("#category").value.trim();


    const subcategory =
      $("#subcategory").value.trim();


    const status =
      $("#status").value;


    const price =
      parseMoney(
        $("#price").value
      );


    const saleText =
      $("#salePrice").value.trim();


    const salePrice =
      saleText
        ? parseMoney(
            saleText
          )
        : null;


    const stock =
      Number(
        $("#stock").value || 0
      );


    const description =
      $("#description").value.trim();


    const material =
      $("#material").value.trim();


    const finish =
      $("#finish").value.trim();


    const warranty =
      $("#warranty").value.trim();


    const featured =
      $("#featured").checked;


    /* =========================
       VALIDAÇÃO
    ========================= */

    if (!name) {

      message(
        "Informe o nome do produto.",
        "error"
      );


      return;

    }


    if (!code) {

      message(
        "Informe o código do produto.",
        "error"
      );


      return;

    }


    if (!category) {

      message(
        "Informe a categoria.",
        "error"
      );


      return;

    }


    if (
      price <= 0
    ) {

      message(
        "Informe um preço válido.",
        "error"
      );


      return;

    }


    if (!description) {

      message(
        "Informe a descrição do produto.",
        "error"
      );


      return;

    }


    if (
      salePrice !== null &&
      salePrice >= price
    ) {

      message(
        "O preço promocional deve ser menor que o preço normal.",
        "error"
      );


      return;

    }


    if (
      stock < 0
    ) {

      message(
        "O estoque não pode ser negativo.",
        "error"
      );


      return;

    }


    const save =
      $("#save");


    save.disabled =
      true;


    save.textContent =
      id
        ? "Salvando..."
        : "Publicando...";


    /*
     * OBJETO DO PRODUTO
     */

    const data = {

      name,

      code,

      category,

      subcategory,

      status,

      price,

      salePrice,

      stock,

      description,

      material,

      finish,

      warranty,

      featured,

      images:
        photos.map(
          photo =>
            photo.url
        ),

      /*
       * Mantém compatibilidade
       * com a loja antiga.
       */

      image:
        photos[0]?.url ||
        "",

      updatedAt:
        serverTimestamp()

    };


    try {

      if (id) {

        await updateDoc(
          doc(
            db,
            COLLECTION,
            id
          ),
          data
        );


        message(
          "Produto atualizado com sucesso.",
          "ok"
        );

      }

      else {

        await addDoc(
          collection(
            db,
            COLLECTION
          ),
          {
            ...data,

            createdAt:
              serverTimestamp()

          }
        );


        message(
          "Produto publicado com sucesso.",
          "ok"
        );

      }


      await loadProducts();


      resetForm();

    }
    catch (error) {

      console.error(
        "Erro Firebase:",
        error
      );


      message(
        error.message ||
        "Não foi possível salvar o produto.",
        "error"
      );

    }
    finally {

      save.disabled =
        false;


      save.textContent =
        id
          ? "Salvar alterações"
          : "Publicar produto";

    }

  }
);


/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function loadProducts() {

  const container =
    $("#products");


  if (!container) return;


  container.innerHTML =
    `
      <div class="empty">
        Carregando produtos...
      </div>
    `;


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          COLLECTION
        )
      );


    products =
      snapshot.docs.map(
        item => ({

          id:
            item.id,

          ...item.data()

        })
      );


    populateCategories();

    renderProducts();

  }
  catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );


    container.innerHTML =
      `
        <div class="empty">
          Não foi possível carregar os produtos.
        </div>
      `;


    message(
      error.message ||
      "Erro ao acessar o catálogo.",
      "error"
    );

  }

}


/* =========================================================
   CATEGORIAS
========================================================= */

function populateCategories() {

  const categories =
    [
      ...new Set(
        products
          .map(
            product =>
              product.category
          )
          .filter(Boolean)
      )
    ]
      .sort();


  const subcategories =
    [
      ...new Set(
        products
          .map(
            product =>
              product.subcategory
          )
          .filter(Boolean)
      )
    ]
      .sort();


  $("#categories").innerHTML =
    categories
      .map(
        category =>
          `
            <option
              value="${escapeHTML(category)}"
            ></option>
          `
      )
      .join("");


  $("#subcategories").innerHTML =
    subcategories
      .map(
        category =>
          `
            <option
              value="${escapeHTML(category)}"
            ></option>
          `
      )
      .join("");

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderProducts() {

  const container =
    $("#products");


  const search =
    (
      $("#search").value ||
      ""
    )
      .trim()
      .toLowerCase();


  const filter =
    $("#filter").value;


  const filtered =
    products.filter(
      product => {

        const text =
          [
            product.name,
            product.code,
            product.category,
            product.subcategory,
            product.description
          ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
          !search ||
          text.includes(
            search
          );


        const matchesFilter =
          filter === "Todos" ||
          (
            product.status ||
            "Disponível"
          ) === filter;


        return (
          matchesSearch &&
          matchesFilter
        );

      }
    );


  $("#productCount").textContent =
    `${filtered.length} ${
      filtered.length === 1
        ? "produto"
        : "produtos"
    }`;


  if (!filtered.length) {

    container.innerHTML =
      `
        <div class="empty">
          Nenhum produto encontrado.
        </div>
      `;


    return;

  }


  container.innerHTML =
    filtered
      .map(
        renderProduct
      )
      .join("");

}


/* =========================================================
   CARD
========================================================= */

function renderProduct(
  product
) {

  const image =
    product.image ||
    product.images?.[0] ||
    "";


  const price =
    product.salePrice ||
    product.price ||
    0;


  const photoCount =
    Array.isArray(
      product.images
    )
      ? product.images.length
      : image
        ? 1
        : 0;


  return `

    <article
      class="product-row"
    >

      <div class="product-image">

        ${
          image
            ? `
              <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                  product.name ||
                  "Produto"
                )}"
              >
            `
            : "M"
        }

      </div>


      <div class="product-info">

        <div class="product-name-line">

          <strong class="product-name">

            ${escapeHTML(
              product.name ||
              "Sem nome"
            )}

          </strong>


          <span class="status">

            ${escapeHTML(
              product.status ||
              "Disponível"
            )}

          </span>

        </div>


        <div class="product-meta">

          Código:
          ${escapeHTML(
            product.code ||
            "Sem código"
          )}

          ·

          ${escapeHTML(
            product.category ||
            "Sem categoria"
          )}

          ·

          ${photoCount}
          ${
            photoCount === 1
              ? "foto"
              : "fotos"
          }

        </div>


        <div class="product-price">

          ${formatMoney(price)}

        </div>

      </div>


      <div class="product-actions">

        <button
          type="button"
          data-edit="${product.id}"
        >
          Editar
        </button>


        <button
          type="button"
          class="delete"
          data-delete="${product.id}"
        >
          Excluir
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   BUSCA / FILTRO
========================================================= */

$("#search")?.addEventListener(
  "input",
  renderProducts
);


$("#filter")?.addEventListener(
  "change",
  renderProducts
);


/* =========================================================
   EDITAR / EXCLUIR
========================================================= */

$("#products")?.addEventListener(
  "click",
  async event => {

    const edit =
      event.target.closest(
        "[data-edit]"
      );


    const remove =
      event.target.closest(
        "[data-delete]"
      );


    /* EDITAR */

    if (edit) {

      const product =
        products.find(
          item =>
            item.id ===
            edit.dataset.edit
        );


      if (!product) return;


      editProduct(
        product
      );


      return;

    }


    /* EXCLUIR */

    if (remove) {

      const product =
        products.find(
          item =>
            item.id ===
            remove.dataset.delete
        );


      if (!product) return;


      const confirmed =
        window.confirm(
          `Deseja excluir "${product.name}"?`
        );


      if (!confirmed) {

        return;

      }


      remove.disabled =
        true;


      try {

        await deleteDoc(
          doc(
            db,
            COLLECTION,
            product.id
          )
        );


        await loadProducts();


        message(
          "Produto excluído com sucesso.",
          "ok"
        );

      }
      catch (error) {

        console.error(
          "Erro ao excluir:",
          error
        );


        message(
          error.message ||
          "Não foi possível excluir.",
          "error"
        );


        remove.disabled =
          false;

      }

    }

  }
);


/* =========================================================
   EDITAR
========================================================= */

function editProduct(
  product
) {

  $("#productId").value =
    product.id;


  $("#name").value =
    product.name ||
    "";


  $("#code").value =
    product.code ||
    "";


  $("#category").value =
    product.category ||
    "";


  $("#subcategory").value =
    product.subcategory ||
    "";


  $("#status").value =
    product.status ||
    "Disponível";


  $("#price").value =
    product.price ??
    "";


  $("#salePrice").value =
    product.salePrice ??
    "";


  $("#stock").value =
    product.stock ??
    0;


  $("#description").value =
    product.description ||
    "";


  $("#material").value =
    product.material ||
    "";


  $("#finish").value =
    product.finish ||
    "";


  $("#warranty").value =
    product.warranty ||
    "";


  $("#featured").checked =
    Boolean(
      product.featured
    );


  $("#descriptionCounter").textContent =
    $("#description").value.length;


  /*
   * Fotos existentes.
   */

  if (
    Array.isArray(
      product.images
    ) &&
    product.images.length
  ) {

    photos =
      product.images.map(
        (url, index) => ({

          url,

          name:
            `Foto ${index + 1}`

        })
      );

  }

  else if (
    product.image
  ) {

    photos = [

      {

        url:
          product.image,

        name:
          "Capa"

      }

    ];

  }

  else {

    photos = [];

  }


  $("#formMode").textContent =
    "EDITAR PEÇA";


  $("#formTitle").textContent =
    product.name ||
    "Editar produto";


  $("#editingBadge").hidden =
    false;


  $("#cancel").hidden =
    false;


  renderPhotos();


  clearMessage();


  window.scrollTo({

    top: 0,

    behavior:
      "smooth"

  });

}


/* =========================================================
   INÍCIO
========================================================= */

renderPhotos();