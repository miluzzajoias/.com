const KEY = 'miluzza_cart_v1';

export function getCart(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function saveCart(cart){ localStorage.setItem(KEY, JSON.stringify(cart)); window.dispatchEvent(new CustomEvent('cart:updated')); }

export function addToCart(product, quantity=1){
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if(existing) existing.quantity += quantity;
  else cart.push({
    id: product.id,
    name: product.name || 'Peça Miluzza',
    price: product.price || '',
    image: product.image || '',
    code: product.code || '',
    quantity
  });
  saveCart(cart);
  return cart;
}

export function updateQuantity(id, quantity){
  const cart = getCart().map(item => item.id === id ? {...item, quantity: Math.max(1, quantity)} : item);
  saveCart(cart);
}

export function removeFromCart(id){ saveCart(getCart().filter(item => item.id !== id)); }
export function clearCart(){ saveCart([]); }

export function parsePrice(value){
  if(typeof value === 'number') return value;
  const text = String(value ?? '').trim().replace(/R\$\s?/gi,'').replace(/\s/g,'');
  if(!text) return 0;
  if(text.includes(',')) return Number(text.replace(/\./g,'').replace(',','.')) || 0;
  return Number(text.replace(/[^0-9.-]/g,'')) || 0;
}

export function formatBRL(value){
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0);
}

export function cartTotal(cart=getCart()){
  return cart.reduce((sum,item)=>sum + parsePrice(item.price) * item.quantity, 0);
}

export function cartCount(cart=getCart()){
  return cart.reduce((sum,item)=>sum + item.quantity, 0);
}

export function buildWhatsAppMessage(cart, customer={}){
  const lines = [
    'Olá, Miluzza! Quero finalizar meu pedido:',
    '',
    ...cart.map((item,i) => `${i+1}. ${item.name}${item.code ? ` (${item.code})` : ''} — ${item.quantity}x — ${formatBRL(parsePrice(item.price)*item.quantity)}`),
    '',
    `Total: ${formatBRL(cartTotal(cart))}`
  ];
  if(customer.name) lines.push('', `Nome: ${customer.name}`);
  if(customer.note) lines.push(`Observação: ${customer.note}`);
  lines.push('', 'Aguardo as informações para pagamento e entrega.');
  return lines.join('\n');
}
