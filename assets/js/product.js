import {
  db,
  doc,
  getDoc
} from "./firebase.js";

import {
  addToCart,
  cartCount
} from "./cart.js";


const COLLECTION = "produtos";

const WHATSAPP = "5563985003751";


const params =
  new URLSearchParams(
    window.location.search
  );


const productId =
  params.get("id");


const $ =
  selector =>
    document.querySelector(
      selector
    );


const loading =
  $("#loading");

const errorBox =
  $("#error");

const productBox =
  $("#product");

const mainPhoto =
  $("#mainPhoto");

const thumbnails =
  $("#thumbnails");

const category =
  $("#category");

const name =
  $("#name");

const code =
  $("#code");

const price =
  $("#price");

const oldPrice =
  $("#oldPrice");

const description =
  $("#description");

const specs =
  $("#specs");

const stock =
  $("#stock");

const cartButton =
  $("#cartButton");

const whatsappButton =
  $("#whatsappButton");


/* =====================================================
   SEGURANÇA
===================================================== */

function escapeHTML(value) {

  return String(
    value ?? ""
  ).replace(
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


/* =====================================================
   MOEDA
===================================================== */

function money(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "";

  }


  const numeric =
    Number(
      String(value)
        .replace(
          /[^\d,.-]/g,
          ""
        )
        .replace(
          /\./g,
          ""
        )
        .replace(
          ",",
          "."
        )
    );


  if (
    Number.isNaN(
      numeric
    )
  ) {

    return String(
      value
    );

  }


  return numeric.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


/* =====================================================
   FOTOS
===================================================== */

function getImages(product) {

  if (
    Array.isArray(
      product.images
    )
  ) {

    const images =
      product.images
        .filter(
          image =>
            typeof image ===
            "string" &&
            image.trim()
        );


    if (
      images.length
    ) {

      return images;

    }

  }


  if (
    product.image
  ) {

    return [
      product.image
    ];

  }


  return [];

}


/* =====================================================
   GALERIA
===================================================== */

function renderGallery(
  images,
  product
) {

  if (
    !images.length
  ) {

    mainPhoto.innerHTML = `
      <div
        style="
          width:100%;
          height:100%;
          display:grid;
          place-items:center;
          color:#8b807b;
        "
      >
        Foto indisponível
      </div>
    `;

    thumbnails.innerHTML = "";

    return;

  }


  mainPhoto.innerHTML = `
    <img
      src="${escapeHTML(images[0])}"
      alt="${escapeHTML(
        product.name ||
        "Produto Miluzza"
      )}"
    >
  `;


  thumbnails.innerHTML =
    images
      .map(
        (
          image,
          index
        ) => `

          <button
            type="button"
            class="product-thumb ${
              index === 0
                ? "active"
                : ""
            }"
            data-index="${index}"
          >

            <img
              src="${escapeHTML(image)}"
              alt="Foto ${
                index + 1
              } de ${images.length}"
            >

          </button>

        `
      )
      .join("");


  thumbnails
    .querySelectorAll(
      ".product-thumb"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );


            mainPhoto.innerHTML = `
              <img
                src="${escapeHTML(
                  images[index]
                )}"
                alt="${escapeHTML(
                  product.name ||
                  "Produto Miluzza"
                )}"
              >
            `;


            thumbnails
              .querySelectorAll(
                ".product-thumb"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );


            button.classList.add(
              "active"
            );

          }
        );

      }
    );

}


/* =====================================================
   ESPECIFICAÇÕES
===================================================== */

function renderSpecs(
  product
) {

  const fields = [

    [
      "Material",
      product.material
    ],

    [
      "Banho / acabamento",
      product.finish
    ],

    [
      "Garantia",
      product.warranty
    ],

    [
      "Categoria",
      product.subcategory
    ],

    [
      "Código",
      product.code
    ]

  ];


  specs.innerHTML =
    fields
      .filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          String(value).trim()
      )
      .map(
        ([label, value]) => `

          <div
            class="product-spec"
          >

            <small>
              ${escapeHTML(
                label
              )}
            </small>

            <strong>
              ${escapeHTML(
                value
              )}
            </strong>

          </div>

        `
      )
      .join("");


  specs.hidden =
    !specs.children.length;

}


/* =====================================================
   STATUS
===================================================== */

function isUnavailable(
  product
) {

  const status =
    String(
      product.status ||
      "Disponível"
    ).toLowerCase();


  if (
    status !==
    "disponível"
  ) {

    return true;

  }


  if (
    product.stock !==
      undefined &&
    product.stock !==
      null &&
    Number(
      product.stock
    ) <= 0
  ) {

    return true;

  }


  return false;

}


/* =====================================================
   RENDER
===================================================== */

function renderProduct(
  product
) {

  document.title =
    `${
      product.name ||
      "Produto"
    } | Miluzza Joias`;


  category.textContent =
    product.category ||
    "Miluzza Joias";


  name.textContent =
    product.name ||
    "Peça Miluzza";


  code.textContent =
    product.code
      ? `Código: ${product.code}`
      : "";


  const hasSale =
    product.salePrice &&
    Number(
      product.salePrice
    ) > 0 &&
    product.price &&
    Number(
      product.salePrice
    ) <
    Number(
      product.price
    );


  if (
    hasSale
  ) {

    oldPrice.hidden =
      false;


    oldPrice.textContent =
      money(
        product.price
      );


    price.textContent =
      money(
        product.salePrice
      );

  }

  else {

    oldPrice.hidden =
      true;


    price.textContent =
      money(
        product.price
      );

  }


  description.textContent =
    product.description ||
    "Uma peça selecionada com o cuidado e a elegância da Miluzza Joias.";


  renderSpecs(
    product
  );


  const unavailable =
    isUnavailable(
      product
    );


  if (
    unavailable
  ) {

    stock.textContent =
      "Produto indisponível";

    stock.classList.add(
      "unavailable"
    );

    cartButton.disabled =
      true;

    whatsappButton.disabled =
      true;

  }

  else {

    if (
      product.stock !==
        undefined &&
      product.stock !==
        null
    ) {

      stock.textContent =
        `${product.stock} ${
          Number(
            product.stock
          ) === 1
            ? "unidade disponível"
            : "unidades disponíveis"
        }`;

    }

    else {

      stock.textContent =
        "Produto disponível";

    }

  }


  const images =
    getImages(
      product
    );


  renderGallery(
    images,
    product
  );


  cartButton.onclick =
    () => {

      addToCart(
        product
      );


      cartButton.textContent =
        "Adicionado ao carrinho ✓";


      setTimeout(
        () => {

          cartButton.textContent =
            "Adicionar ao carrinho";

        },
        1500
      );

    };


  whatsappButton.onclick =
    () => {

      const selectedPrice =
        hasSale
          ? product.salePrice
          : product.price;


      const message =
        [
          "Olá! Tenho interesse nesta peça da Miluzza Joias:",
          "",
          `Produto: ${
            product.name || ""
          }`,
          `Código: ${
            product.code || ""
          }`,
          `Valor: ${
            money(selectedPrice)
          }`,
          "",
          "Gostaria de mais informações e de realizar a compra."
        ].join(
          "\n"
        );


      const url =
        `https://wa.me/${WHATSAPP}?text=${
          encodeURIComponent(
            message
          )
        }`;


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    };

}


/* =====================================================
   ERRO
===================================================== */

function showError(
  message
) {

  loading.hidden =
    true;

  productBox.hidden =
    true;

  errorBox.hidden =
    false;


  errorBox.innerHTML = `

    <div>

      <h1>
        Produto não encontrado
      </h1>

      <p>
        ${escapeHTML(
          message
        )}
      </p>

      <a href="index.html">
        Voltar para a coleção
      </a>

    </div>

  `;

}


/* =====================================================
   CARREGAMENTO
===================================================== */

async function loadProduct() {

  if (
    !productId
  ) {

    showError(
      "O endereço desta página não contém um produto."
    );

    return;

  }


  console.log(
    "Carregando produto:",
    productId
  );


  try {

    const reference =
      doc(
        db,
        COLLECTION,
        productId
      );


    const snapshot =
      await getDoc(
        reference
      );


    console.log(
      "Produto encontrado:",
      snapshot.exists()
    );


    if (
      !snapshot.exists()
    ) {

      showError(
        "O produto não foi encontrado no catálogo."
      );

      return;

    }


    const product = {

      id:
        snapshot.id,

      ...snapshot.data()

    };


    renderProduct(
      product
    );


    loading.hidden =
      true;

    productBox.hidden =
      false;


  }

  catch (
    error
  ) {

    console.error(
      "Erro ao carregar produto:",
      error
    );


    showError(
      "Não foi possível carregar as informações deste produto."
    );

  }

}


/* =====================================================
   SACOLA
===================================================== */

function updateCartBadge() {

  const count =
    cartCount();


  document
    .querySelectorAll(
      "[data-cart-count]"
    )
    .forEach(
      element => {

        element.textContent =
          count;

      }
    );

}


window.addEventListener(
  "cart:updated",
  updateCartBadge
);


document.addEventListener(
  "DOMContentLoaded",
  () => {

    const year =
      $("#year");


    if (
      year
    ) {

      year.textContent =
        new Date()
          .getFullYear();

    }


    updateCartBadge();

    loadProduct();

  }
);