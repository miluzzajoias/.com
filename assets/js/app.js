// ============================================================
// MILUZZA JOIAS — VITRINE
// ============================================================

import {
  db,
  collection,
  getDocs
} from "./firebase.js";


// ============================================================
// ELEMENTOS DA VITRINE ORIGINAL
// ============================================================

const logo =
  document.querySelector("#logo");

const categoryList =
  document.getElementById("cats");

const productGrid =
  document.getElementById("products");

const productCount =
  document.getElementById("count");

const year =
  document.getElementById("year");


// ============================================================
// BUSCA
// ============================================================

const searchButton =
  document.getElementById("search");

const searchBox =
  document.getElementById("searchBox");

const closeSearch =
  document.getElementById("close");

const searchInput =
  document.getElementById("q");

const searchResults =
  document.getElementById("results");


// ============================================================
// ACESSO SECRETO — 5 CLIQUES NA LOGO
// ============================================================

let logoClicks = 0;
let logoTimer = null;


document.addEventListener(
  "click",
  (event) => {

    const imagemLogo =
      event.target.closest(
        "#logo, #logo img"
      );


    if (!imagemLogo) {
      return;
    }


    event.preventDefault();
    event.stopPropagation();


    logoClicks++;


    clearTimeout(
      logoTimer
    );


    logoTimer =
      setTimeout(
        () => {

          logoClicks = 0;

        },
        2500
      );


    console.log(
      `Clique secreto: ${logoClicks}/5`
    );


    if (logoClicks === 5) {

      logoClicks = 0;

      clearTimeout(
        logoTimer
      );


      window.location.href =
        "./admin/login.html";

    }

  },
  true
);


// ============================================================
// ANO
// ============================================================

if (year) {

  year.textContent =
    new Date().getFullYear();

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHtml(value = "") {

  return String(value)
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


// ============================================================
// PRODUTOS
// ============================================================

let produtos = [];


// ============================================================
// CARREGAR PRODUTOS
// ============================================================

async function carregarProdutos() {

  if (!productGrid) {

    console.error(
      "Elemento #products não encontrado no index.html."
    );

    return;

  }


  productGrid.innerHTML = `
    <div class="loading-state">
      <p>Carregando nossa coleção...</p>
    </div>
  `;


  try {

    console.log(
      "Buscando produtos no Firestore..."
    );


    const snapshot =
      await getDocs(
        collection(
          db,
          "produtos"
        )
      );


    produtos =
      snapshot.docs.map(
        documento => ({

          id:
            documento.id,

          ...documento.data()

        })
      );


    console.log(
      "Produtos encontrados:",
      produtos
    );


    mostrarCategorias();

    mostrarProdutos();


  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );


    productGrid.innerHTML = `
      <div class="loading-state">
        <p>
          Não foi possível carregar a coleção.
        </p>
      </div>
    `;

  }

}


// ============================================================
// MOSTRAR PRODUTOS
// ============================================================

function mostrarProdutos(
  categoria = "Todos"
) {

  if (!productGrid) {
    return;
  }


  const lista =
    categoria === "Todos"

      ? produtos

      : produtos.filter(
          produto =>
            produto.category === categoria
        );


  if (productCount) {

    productCount.textContent =
      `${lista.length} ${
        lista.length === 1
          ? "PEÇA"
          : "PEÇAS"
      }`;

  }


  if (lista.length === 0) {

    productGrid.innerHTML = `
      <div class="loading-state">
        <p>
          Nenhuma peça cadastrada ainda.
        </p>
      </div>
    `;

    return;

  }


  productGrid.innerHTML =
    lista
      .map(
        produto => {

          const nome =
            produto.name ||
            "Peça Miluzza";


          const categoria =
            produto.category ||
            "Miluzza";


          const imagem =
            produto.image;


          return `

            <a
              class="product-card"
              href="produto.html?id=${encodeURIComponent(
                produto.id
              )}"
            >

              <div class="product-image">

                ${
                  imagem

                    ? `
                      <img
                        src="${escapeHtml(
                          imagem
                        )}"
                        alt="${escapeHtml(
                          nome
                        )}"
                        loading="lazy"
                      >
                    `

                    : `
                      <div class="placeholder">
                        M
                      </div>
                    `
                }


                ${
                  produto.featured

                    ? `
                      <span class="product-badge">
                        Destaque
                      </span>
                    `

                    : ""
                }

              </div>


              <div class="product-info">

                <span class="product-category">
                  ${escapeHtml(
                    categoria
                  )}
                </span>


                <div class="product-name">
                  ${escapeHtml(
                    nome
                  )}
                </div>


                ${
                  produto.price

                    ? `
                      <div class="product-price">
                        ${escapeHtml(
                          produto.price
                        )}
                      </div>
                    `

                    : ""
                }

              </div>

            </a>

          `;

        }
      )
      .join("");

}


// ============================================================
// CATEGORIAS
// ============================================================

function mostrarCategorias() {

  if (!categoryList) {
    return;
  }


  const categorias = [

    "Todos",

    ...new Set(

      produtos
        .map(
          produto =>
            produto.category
        )
        .filter(Boolean)

    )

  ];


  categoryList.innerHTML =
    categorias
      .map(
        categoria => `

          <button
            type="button"
            data-category="${escapeHtml(
              categoria
            )}"
            class="${
              categoria === "Todos"
                ? "active"
                : ""
            }"
          >
            ${escapeHtml(
              categoria
            )}
          </button>

        `
      )
      .join("");


  categoryList
    .querySelectorAll(
      "[data-category]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            categoryList
              .querySelectorAll(
                "[data-category]"
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


            mostrarProdutos(
              button.dataset.category
            );

          }
        );

      }
    );

}


// ============================================================
// BUSCA
// ============================================================

function abrirBusca() {

  if (!searchBox) {
    return;
  }

  searchBox.classList.add(
    "open"
  );


  if (searchInput) {

    setTimeout(
      () => searchInput.focus(),
      150
    );

  }

}


function fecharBusca() {

  if (!searchBox) {
    return;
  }

  searchBox.classList.remove(
    "open"
  );

}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    abrirBusca
  );

}


if (closeSearch) {

  closeSearch.addEventListener(
    "click",
    fecharBusca
  );

}


// ============================================================
// RESULTADOS DA BUSCA
// ============================================================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      const termo =
        searchInput.value
          .trim()
          .toLowerCase();


      if (!searchResults) {
        return;
      }


      if (!termo) {

        searchResults.innerHTML = "";

        return;

      }


      const resultados =
        produtos.filter(
          produto => {

            const nome =
              String(
                produto.name || ""
              ).toLowerCase();


            const categoria =
              String(
                produto.category || ""
              ).toLowerCase();


            const codigo =
              String(
                produto.code || ""
              ).toLowerCase();


            return (
              nome.includes(termo) ||
              categoria.includes(termo) ||
              codigo.includes(termo)
            );

          }
        );


      if (!resultados.length) {

        searchResults.innerHTML = `
          <p>
            Nenhuma peça encontrada.
          </p>
        `;

        return;

      }


      searchResults.innerHTML =
        resultados
          .map(
            produto => `

              <a
                href="produto.html?id=${encodeURIComponent(
                  produto.id
                )}"
              >

                ${
                  produto.image

                    ? `
                      <img
                        src="${escapeHtml(
                          produto.image
                        )}"
                        alt="${escapeHtml(
                          produto.name
                        )}"
                      >
                    `

                    : ""
                }

                <span>
                  ${escapeHtml(
                    produto.name ||
                    "Peça Miluzza"
                  )}
                </span>

              </a>

            `
          )
          .join("");

    }
  );

}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

console.log(
  "Miluzza Joias — vitrine carregada."
);


carregarProdutos();