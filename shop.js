/**
 * Class-Man | חנות דינמית – טעינת מוצרים מ-ProductsStore
 * המוצרים מוצגים בדף הבית (המוצרים הנמכרים + Don't miss)
 */
(function () {
  if (typeof ProductsStore === 'undefined') return;

  function renderProductCard(p, linkText, cardClass) {
    if (!p) return '';
    var img = p.image
      ? '<img src="' + p.image + '" alt="' + (p.name || '').replace(/"/g, '&quot;') + '" class="product-card-img">'
      : '<div class="product-image-placeholder"></div>';
    var href = 'product.html?id=' + p.id;
    var cls = (cardClass || 'product-card').trim();
    var link = linkText || 'לפרטים';
    var extra = [];
    if (p.material) extra.push(p.material);
    if (p.color) extra.push(p.color);
    var extraHtml = extra.length ? '<p class="product-card-extra">' + extra.join(' · ') + '</p>' : '';
    return (
      '<a href="' + href + '" class="' + cls + '">' +
        '<div class="product-image">' +
          img +
          '<span class="product-card-link">' + link + '</span>' +
        '</div>' +
        '<div class="product-info">' +
          '<h3>' + (p.name || '') + '</h3>' +
          '<span class="product-price">₪' + (p.price || 0) + '</span>' +
          extraHtml +
        '</div>' +
      '</a>'
    );
  }

  function render() {
    var bestSellers = ProductsStore.getBestSellers();
    var dontMiss = ProductsStore.getDontMiss();

    var gridEl = document.getElementById('products-grid');
    var dontMissEl = document.getElementById('dont-miss-grid');

    if (gridEl) {
      if (bestSellers.length === 0) {
        bestSellers = ProductsStore.getProducts().slice(0, 6);
      }
      gridEl.innerHTML = bestSellers.map(function (p) {
        return renderProductCard(p, 'לפרטים ולרכישה', 'product-card');
      }).join('');
    }

    if (dontMissEl) {
      if (dontMiss.length === 0) {
        var all = ProductsStore.getProducts();
        var bestIds = bestSellers.map(function (p) { return p.id; });
        dontMiss = all.filter(function (p) { return bestIds.indexOf(p.id) === -1; }).slice(0, 4);
      }
      dontMissEl.innerHTML = dontMiss.map(function (p) {
        return renderProductCard(p, 'בחר אפשרויות', 'product-card product-card-light');
      }).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var gridEl = document.getElementById('products-grid');
    var dontMissEl = document.getElementById('dont-miss-grid');
    if (ProductsStore.useSupabase) {
      if (gridEl) gridEl.classList.add('loading');
      if (dontMissEl) dontMissEl.classList.add('loading');
      ProductsStore.initFromSupabase()
        .then(render)
        .catch(function () { render(); })
        .finally(function () {
          if (gridEl) gridEl.classList.remove('loading');
          if (dontMissEl) dontMissEl.classList.remove('loading');
        });
    } else {
      render();
    }
  });
})();
