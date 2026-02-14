/**
 * Class-Man | עמוד קטגוריות – טעינה מ-ProductsStore
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Cart !== 'undefined') Cart.initCart();

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });

  if (typeof ProductsStore === 'undefined') return;

  var listEl = document.getElementById('categories-list');
  if (!listEl) return;

  function render() {
    var categories = ProductsStore.getCategories();
    var html = '';
    categories.forEach(function (cat) {
      var url = 'category.html?cat=' + encodeURIComponent(cat.id);
      var img = cat.image ? 'style="background-image: url(' + cat.image + ')"' : '';
      html += (
        '<a href="' + url + '" class="category-card">' +
          '<div class="category-image" ' + img + '></div>' +
          '<h3>' + (cat.name || '') + '</h3>' +
          '<p class="category-desc">' + (cat.description || '') + '</p>' +
        '</a>'
      );
    });
    listEl.innerHTML = html || '<p class="page-subtitle">אין קטגוריות.</p>';
  }
  if (ProductsStore.useSupabase) {
    listEl.classList.add('loading');
    ProductsStore.initFromSupabase().then(render).catch(render).finally(function () { listEl.classList.remove('loading'); });
  } else {
    render();
  }
});
