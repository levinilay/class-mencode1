/**
 * Class-Man | עמודי מוצר סטטיים – הוסף לעגלה
 */
document.addEventListener('DOMContentLoaded', function () {
  Cart.initCart();

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });

  document.querySelector('.btn-add-to-cart')?.addEventListener('click', function () {
    var id = parseInt(this.getAttribute('data-id'), 10);
    var name = this.getAttribute('data-name') || '';
    var price = parseInt(this.getAttribute('data-price'), 10) || 0;
    var sizeEl = document.querySelector('input[name="size"]:checked');
    var size = sizeEl ? sizeEl.value : null;
    var image = null;
    if (typeof PRODUCTS !== 'undefined' && PRODUCTS[id] && PRODUCTS[id].image) {
      image = PRODUCTS[id].image;
    } else {
      var img = document.querySelector('.product-detail-image img');
      if (img && img.src) {
        var src = img.getAttribute('src') || '';
        if (src.indexOf('../') === 0) image = src.replace('../', '');
        else image = src;
      }
    }
    Cart.addToCart(id, name, price, size, 1, image);
    Cart.updateUI();
    Cart.openCart();
  });
});
