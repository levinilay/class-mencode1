/**
 * Class-Man | עמוד מוצר דינמי – טעינה מ-ProductsStore / Supabase
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Cart !== 'undefined') Cart.initCart();

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });

  if (typeof ProductsStore === 'undefined') {
    document.getElementById('product-not-found').style.display = 'block';
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var idNum = id ? parseInt(id, 10) : NaN;
  var container = document.getElementById('product-container');
  var notFound = document.getElementById('product-not-found');

  function tryRender() {
    var p = idNum && !isNaN(idNum) ? ProductsStore.getProduct(idNum) : null;
    if (!p) {
      var returnTo = params.get('returnTo');
      var backHref = returnTo === 'admin' ? 'admin.html#products' : 'index.html#products';
      var backLink = notFound.querySelector('a');
      if (backLink) backLink.href = backHref;
      notFound.style.display = 'block';
      return;
    }
    notFound.style.display = 'none';
    document.title = 'Class-Man | ' + (p.name || 'פרטי מוצר');

    var sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL'];
    var sizeOptions = sizes.map(function (s) {
    var checked = s === 'M' || sizes[0] === s ? ' checked' : '';
    return '<label class="size-option"><input type="radio" name="size" value="' + s + '"' + checked + '><span>' + s + '</span></label>';
    }).join('');

    var meta = [];
    if (p.material) meta.push('<p class="product-detail-meta-item"><span class="product-detail-meta-label">חומר:</span> ' + p.material + '</p>');
  if (p.color) meta.push('<p class="product-detail-meta-item"><span class="product-detail-meta-label">צבע:</span> ' + p.color + '</p>');
  var metaHtml = meta.length ? '<div class="product-detail-meta">' + meta.join('') + '</div>' : '';

  var CATEGORY_NAMES = { shirts: 'חולצות', pants: 'מכנסיים', jackets: 'ז\'קטים ומעילים', sweaters: 'סוודרים', shoes: 'נעליים' };
  var tags = [];
  if (p.category && CATEGORY_NAMES[p.category]) tags.push(CATEGORY_NAMES[p.category]);
  if (Array.isArray(p.features) && p.features.length) tags = tags.concat(p.features);
  var tagsHtml = tags.length ? '<ul class="product-detail-features">' + tags.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' : '';

  var imgHtml = p.image
    ? '<img src="' + p.image + '" alt="' + (p.name || '').replace(/"/g, '&quot;') + '">'
    : '<div class="product-image-placeholder" style="min-height: 400px;"></div>';

  var returnTo = params.get('returnTo');
  var fromAdmin = returnTo === 'admin' || (document.referrer && document.referrer.indexOf('admin') !== -1);
  var backUrl = fromAdmin ? 'admin.html#products' : 'index.html#products';
  var html =
    '<div class="product-detail">' +
      '<a href="' + backUrl + '" class="back-link">← חזרה למוצרים</a>' +
      '<div class="product-detail-grid">' +
        '<div class="product-detail-image">' + imgHtml + '</div>' +
        '<div class="product-detail-info">' +
          '<h1>' + (p.name || '') + '</h1>' +
          '<p class="product-detail-price">₪' + (p.price || 0) + '</p>' +
          metaHtml +
          '<p class="product-detail-description">' + (p.description || '') + '</p>' +
          tagsHtml +
          '<div class="product-detail-options">' +
            '<div class="size-selector">' +
              '<label for="size">מידה:</label>' +
              '<div class="size-options">' + sizeOptions + '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-add-to-cart" data-id="' + p.id + '" data-name="' + (p.name || '').replace(/"/g, '&quot;') + '" data-price="' + (p.price || 0) + '">הוסף לעגלה</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    container.innerHTML = html;

    if (window.ScrollRevealObserve) window.ScrollRevealObserve();

    document.querySelector('.btn-add-to-cart')?.addEventListener('click', function () {
    var btn = this;
    var id = parseInt(btn.getAttribute('data-id'), 10);
    var name = btn.getAttribute('data-name') || '';
    var price = parseFloat(btn.getAttribute('data-price')) || 0;
    var sizeEl = document.querySelector('input[name="size"]:checked');
    var size = sizeEl ? sizeEl.value : null;
    var image = p.image || null;
      Cart.addToCart(id, name, price, size, 1, image);
      Cart.updateUI();
      Cart.openCart();
    });
  }

  if (ProductsStore.useSupabase) {
    ProductsStore.initFromSupabase().then(tryRender).catch(tryRender);
  } else {
    tryRender();
  }
});
