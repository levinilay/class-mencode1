/**
 * Class-Man | עמוד השלמת הזמנה
 */
document.addEventListener('DOMContentLoaded', function () {
  Cart.initCart();

  var cart = Cart.getCart();
  var emptyEl = document.getElementById('checkout-empty');
  var contentEl = document.getElementById('checkout-content');
  var itemsEl = document.getElementById('checkout-items');
  var subtotalEl = document.getElementById('checkout-subtotal');
  var totalEl = document.getElementById('checkout-total');
  var form = document.getElementById('checkout-form');

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

    var subtotal = 0;
    itemsEl.innerHTML = cart.map(function (item) {
      var lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      var imageSrc = item.image;
      if (!imageSrc && typeof ProductsStore !== 'undefined' && item.id) {
        var prod = ProductsStore.getProduct(item.id);
        if (prod && prod.image) imageSrc = prod.image;
      }
      if (!imageSrc && typeof PRODUCTS !== 'undefined' && item.id && PRODUCTS[item.id]?.image) imageSrc = PRODUCTS[item.id].image;
      var imageHtml = imageSrc ? '<div class="checkout-item-image"><img src="' + imageSrc + '" alt=""></div>' : '';
      return (
        '<div class="checkout-item">' +
          imageHtml +
          '<span class="checkout-item-name">' + item.name + (item.size ? ' (' + item.size + ')' : '') + '</span>' +
          '<span class="checkout-item-qty">×' + item.quantity + '</span>' +
          '<span class="checkout-item-price">₪' + lineTotal + '</span>' +
        '</div>'
      );
    }).join('');

    if (subtotalEl) subtotalEl.textContent = '₪' + subtotal;
    if (totalEl) totalEl.textContent = '₪' + subtotal;
  }

  form?.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('name')?.value;
    var phone = document.getElementById('phone')?.value;
    var email = document.getElementById('email')?.value;
    var city = document.getElementById('city')?.value;
    var address = document.getElementById('address')?.value;
    if (!name || !phone || !email || !city || !address) return;
    alert('תודה על ההזמנה! נחזור אליך בהקדם לאישור ופרטי תשלום.');
    window.location.href = 'index.html';
  });

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });
});
