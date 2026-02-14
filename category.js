/**
 * Class-Man | עמוד קטגוריה – מוצרים לפי קטגוריה מ-ProductsStore / Supabase
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Cart !== 'undefined') Cart.initCart();

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });

  if (typeof ProductsStore === 'undefined') return;

  var params = new URLSearchParams(window.location.search);
  var catId = params.get('cat');
  var heroImage = document.getElementById('category-hero-image');
  var titleEl = document.getElementById('category-title');
  var descEl = document.getElementById('category-desc');
  var gridEl = document.getElementById('category-products');
  var notFoundEl = document.getElementById('category-not-found');

  function render() {
    var categories = ProductsStore.getCategories();
    var cat = categories.find(function (c) { return c.id === catId; });
    if (!cat || !gridEl) {
      if (notFoundEl) notFoundEl.style.display = 'block';
      return;
    }
    if (titleEl) titleEl.textContent = cat.name || 'קטגוריה';
    if (descEl) descEl.textContent = cat.description || '';
    if (heroImage && cat.image) heroImage.style.backgroundImage = 'url(' + cat.image + ')';
    var products = ProductsStore.getProductsByCategory(catId);
    function card(p) {
      if (!p) return '';
      var img = p.image ? '<img src="' + p.image + '" alt="" class="product-card-img">' : '<div class="product-image-placeholder"></div>';
      var extra = [];
      if (p.material) extra.push(p.material);
      if (p.color) extra.push(p.color);
      var extraHtml = extra.length ? '<p class="product-card-extra">' + extra.join(' · ') + '</p>' : '';
      return (
        '<a href="product.html?id=' + p.id + '" class="product-card">' +
          '<div class="product-image">' + img + '<span class="product-card-link">לפרטים</span></div>' +
          '<div class="product-info"><h3>' + (p.name || '') + '</h3><span class="product-price">₪' + (p.price || 0) + '</span>' + extraHtml + '</div>' +
        '</a>'
      );
    }
    gridEl.innerHTML = products.map(card).join('');
    gridEl.classList.remove('loading');
  }
  if (ProductsStore.useSupabase) {
    if (gridEl) gridEl.classList.add('loading');
    ProductsStore.initFromSupabase().then(render).catch(render);
  } else {
    render();
  }
});
