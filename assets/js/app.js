import { db, collection, getDocs } from './firebase.js';
import { addToCart, getCart, cartCount, cartTotal, formatBRL } from './cart.js';

const WA = '5563985003751';
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const year = $('#year'); if(year) year.textContent = new Date().getFullYear();
let produtos = [];

function normalize(p){ return {...p, name:p.name||'Peça Miluzza', category:p.category||'Miluzza', price:p.price||'', image:p.image||'', status:p.status||'Disponível'}; }

async function carregarProdutos(){
  const grid = $('#products'); if(!grid) return;
  grid.innerHTML = '<div class="loading-state"><p>Carregando nossa coleção...</p></div>';
  try{
    const snap = await getDocs(collection(db,'produtos'));
    produtos = snap.docs.map(d => normalize({id:d.id,...d.data()})).filter(p => String(p.status).toLowerCase() !== 'indisponível');
    produtos.sort((a,b) => Number(b.featured)-Number(a.featured));
    renderCategories(); renderProducts(); renderSearch('');
  }catch(err){ console.error(err); grid.innerHTML='<div class="loading-state"><p>Não foi possível carregar a coleção agora.</p></div>'; }
}

function renderCategories(){
  const el=$('#cats'); if(!el) return;
  const cats=['Todos',...new Set(produtos.map(p=>p.category).filter(Boolean))];
  el.innerHTML=cats.map((c,i)=>`<button class="${i===0?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  el.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{el.querySelectorAll('button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderProducts(btn.dataset.category);}));
}

function card(p){
  const unavailable = String(p.status).toLowerCase() !== 'disponível';
  return `<article class="product-card-wrap"><a class="product-card" href="produto.html?id=${encodeURIComponent(p.id)}">
    <div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:'<div class="placeholder">M</div>'}${p.featured?'<span class="product-badge">Destaque</span>':''}</div>
    <div class="product-info"><span class="product-category">${esc(p.category)}</span><div class="product-name">${esc(p.name)}</div>${p.price?`<div class="product-price">${esc(p.price)}</div>`:''}</div>
  </a><button class="quick-add" data-add="${esc(p.id)}">Adicionar ao carrinho</button></article>`;
}

function renderProducts(category='Todos'){
  const grid=$('#products'); if(!grid) return;
  const list=category==='Todos'?produtos:produtos.filter(p=>p.category===category);
  $('#count').textContent=`${list.length} ${list.length===1?'PEÇA':'PEÇAS'}`;
  grid.innerHTML=list.length?list.map(card).join(''):'<div class="loading-state"><p>Nenhuma peça encontrada.</p></div>';
  grid.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const p=produtos.find(x=>x.id===btn.dataset.add);if(p){addToCart(p);btn.textContent='Adicionado ✓';setTimeout(()=>btn.textContent='Adicionar ao carrinho',1200);}}));
}

function renderSearch(term){
  const out=$('#results'); if(!out) return;
  const q=term.trim().toLowerCase();
  if(!q){out.innerHTML='<p class="search-hint">Digite o nome, categoria ou código da peça.</p>';return;}
  const list=produtos.filter(p=>[p.name,p.category,p.code,p.description].some(v=>String(v||'').toLowerCase().includes(q)));
  out.innerHTML=list.length?list.map(p=>`<a class="search-result" href="produto.html?id=${encodeURIComponent(p.id)}"><div>${p.image?`<img src="${esc(p.image)}" alt="">`:'<div class="search-thumb">M</div>'}</div><span><b>${esc(p.name)}</b><small>${esc(p.category)}${p.price?` · ${esc(p.price)}`:''}</small></span></a>`).join(''):'<p class="search-hint">Nenhuma peça encontrada.</p>';
}

const searchBox=$('#searchBox');
$('#search')?.addEventListener('click',()=>searchBox?.classList.add('open'));
$('#close')?.addEventListener('click',()=>searchBox?.classList.remove('open'));
searchBox?.addEventListener('click',e=>{if(e.target===searchBox)searchBox.classList.remove('open')});
$('#q')?.addEventListener('input',e=>renderSearch(e.target.value));

// ATALHO ADMINISTRATIVO — 5 CLIQUES NA LOGO
let logoClicks = 0;
let logoClickTimer = null;

document.addEventListener('click', e => {
  const logo = e.target.closest('#logo');
  if (!logo) return;

  e.preventDefault();

  logoClicks++;

  clearTimeout(logoClickTimer);

  logoClickTimer = setTimeout(() => {
    logoClicks = 0;
  }, 1800);

  if (logoClicks >= 5) {
    logoClicks = 0;
    clearTimeout(logoClickTimer);

    window.location.href = 'admin/login.html';
  }
});

function updateCartBadge(){ const n=cartCount(); document.querySelectorAll('[data-cart-count]').forEach(el=>{el.textContent=n;n?el.classList.add('has-items'):el.classList.remove('has-items')}); const total=$('#cartTotalMini');if(total)total.textContent=formatBRL(cartTotal()); }
window.addEventListener('cart:updated',updateCartBadge); updateCartBadge(); carregarProdutos();
