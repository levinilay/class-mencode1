/**
 * Class-Man | עמוד קטגוריות – גרסת ניהול
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Cart !== 'undefined') Cart.initCart();
  if (typeof ProductsStore === 'undefined') return;

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });

  var listEl = document.getElementById('categories-list');
  if (!listEl) return;

  function render() {
    var categories = ProductsStore.getCategories();
  var html = '';
  categories.forEach(function (cat) {
    var url = 'admin-category.html?cat=' + encodeURIComponent(cat.id);
    var count = (cat.productIds || []).length;
    var img = cat.image ? 'style="background-image: url(' + cat.image + ')"' : '';
    html += (
      '<a href="' + url + '" class="category-card">' +
        '<div class="category-image" ' + img + '></div>' +
        '<h3>' + (cat.name || '') + ' <span class="admin-cat-count">(' + count + ')</span></h3>' +
        '<p class="category-desc">' + (cat.description || '') + '</p>' +
      '</a>'
    );
  });
  listEl.innerHTML = html || '<p class="page-subtitle">אין קטגוריות.</p>';
  listEl.classList.remove('loading');
  }
  if (ProductsStore.useSupabase) {
    listEl.classList.add('loading');
    ProductsStore.initFromSupabase().then(render).catch(render);
  } else {
    render();
  }
});
