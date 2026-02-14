/**
 * Class-Man | עמוד קטגוריה – גרסת ניהול עם הוספה/עריכה/מחיקה
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Cart !== 'undefined') Cart.initCart();
  if (typeof ProductsStore === 'undefined') return;

  var params = new URLSearchParams(window.location.search);
  var catId = params.get('cat');
  var heroImage = document.getElementById('category-hero-image');
  var titleEl = document.getElementById('category-title');
  var descEl = document.getElementById('category-desc');
  var gridEl = document.getElementById('category-products');
  var notFoundEl = document.getElementById('category-not-found');
  var overlay = document.getElementById('product-modal-overlay');
  var form = document.getElementById('product-form');
  var imageInput = document.getElementById('product-image-input');
  var imagePreview = document.getElementById('product-image-preview');
  var imageUrlInput = document.getElementById('product-image-url');
  var categorySelect = document.getElementById('product-category');
  var categoryGroup = document.getElementById('form-group-category');
  var currentImageData = null;

  document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('active');
    document.querySelector('.nav-toggle')?.classList.toggle('active');
  });

  if (!gridEl) return;

  function runUI() {
    var cat = ProductsStore.getCategories().find(function (c) { return c.id === catId; });
    if (!cat) {
      if (notFoundEl) notFoundEl.style.display = 'block';
      return;
    }
    if (notFoundEl) notFoundEl.style.display = 'none';
    if (titleEl) titleEl.textContent = cat.name || 'קטגוריה';
    if (descEl) descEl.textContent = cat.description || '';

    var cats = [
    { id: 'shirts', name: 'חולצות' },
    { id: 'pants', name: 'מכנסיים' },
    { id: 'jackets', name: 'ז\'קטים ומעילים' },
    { id: 'sweaters', name: 'סוודרים' },
    { id: 'shoes', name: 'נעליים' }
  ];
  categorySelect.innerHTML = cats.map(function (c) {
    return '<option value="' + c.id + '"' + (c.id === catId ? ' selected' : '') + '>' + c.name + '</option>';
  }).join('');

    if (heroImage && cat.image) heroImage.style.backgroundImage = 'url(' + cat.image + ')';

    function openModal(isEdit, product) {
    document.getElementById('product-modal-title').textContent = isEdit ? 'עריכת מוצר' : 'הוסף מוצר לקטגוריה';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    categorySelect.value = catId;
    if (product) {
      if (categoryGroup) categoryGroup.style.display = '';
      document.getElementById('product-id').value = product.id;
      document.getElementById('product-name').value = product.name || '';
      document.getElementById('product-price').value = product.price || 0;
      document.getElementById('product-description').value = product.description || '';
      document.getElementById('product-material').value = product.material || '';
      document.getElementById('product-color').value = product.color || '';
      document.getElementById('product-sizes').value = Array.isArray(product.sizes) ? product.sizes.join(', ') : 'S, M, L, XL';
      document.getElementById('product-features').value = Array.isArray(product.features) ? product.features.join(', ') : '';
      document.getElementById('product-category').value = product.category || catId;
      imageUrlInput.value = (product.image && !product.image.startsWith('data:')) ? product.image : '';
      currentImageData = product.image && product.image.startsWith('data:') ? product.image : null;
      imagePreview.style.backgroundImage = product.image ? 'url(' + product.image + ')' : '';
      imagePreview.classList.toggle('has-image', !!product.image);
    } else {
      if (categoryGroup) categoryGroup.style.display = 'none';
      form.reset();
      document.getElementById('product-id').value = '';
      document.getElementById('product-category').value = catId;
      currentImageData = null;
      imagePreview.style.backgroundImage = '';
      imagePreview.classList.remove('has-image');
      imageUrlInput.value = '';
    }
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function parseSizes(str) {
    if (!str || typeof str !== 'string') return ['S', 'M', 'L', 'XL'];
    return str.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function parseFeatures(str) {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function getImageValue() {
    if (currentImageData && currentImageData.startsWith('data:')) return currentImageData;
    return imageUrlInput.value.trim() || '';
  }

  function render() {
    var products = ProductsStore.getProductsByCategory(catId);
    gridEl.innerHTML = products.map(function (p) {
      var img = p.image ? '<img src="' + p.image + '" alt="" class="product-card-img">' : '<div class="product-image-placeholder"></div>';
      var extra = [];
      if (p.material) extra.push(p.material);
      if (p.color) extra.push(p.color);
      var extraHtml = extra.length ? '<p class="product-card-extra">' + extra.join(' · ') + '</p>' : '';
      return (
        '<div class="admin-product-wrap">' +
          '<a href="product.html?id=' + p.id + '&returnTo=admin" class="product-card">' +
            '<div class="product-image">' + img + '<span class="product-card-link">לפרטים</span></div>' +
            '<div class="product-info"><h3>' + (p.name || '') + '</h3><span class="product-price">₪' + (p.price || 0) + '</span>' + extraHtml + '</div>' +
          '</a>' +
          '<div class="admin-card-actions">' +
            '<button type="button" class="admin-btn-edit" data-id="' + p.id + '">עריכה</button>' +
            '<button type="button" class="admin-btn-delete" data-id="' + p.id + '">מחק</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    gridEl.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var p = ProductsStore.getProduct(parseInt(btn.dataset.id, 10));
        if (p) openModal(true, p);
      });
    });

    gridEl.querySelectorAll('.admin-btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = parseInt(btn.dataset.id, 10);
        var p = ProductsStore.getProduct(id);
        if (p && confirm('למחוק "' + (p.name || '') + '"?')) {
          ProductsStore.deleteProduct(id).then(render).catch(function (err) { alert('שגיאה במחיקה: ' + (err.message || err)); });
        }
      });
    });
  }

  document.getElementById('btn-add-to-category')?.addEventListener('click', function () {
    openModal(false);
  });

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel')?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  imageInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function () {
      currentImageData = reader.result;
      imagePreview.style.backgroundImage = 'url(' + reader.result + ')';
      imagePreview.classList.add('has-image');
      imageUrlInput.value = '';
    };
    reader.readAsDataURL(file);
    this.value = '';
  });
  document.getElementById('btn-clear-image')?.addEventListener('click', function () {
    currentImageData = null;
    imagePreview.style.backgroundImage = '';
    imagePreview.classList.remove('has-image');
    imageUrlInput.value = '';
  });
  imageUrlInput.addEventListener('input', function () {
    if (this.value.trim()) currentImageData = null;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = document.getElementById('product-id').value;
    var data = {
      name: document.getElementById('product-name').value.trim(),
      price: parseFloat(document.getElementById('product-price').value) || 0,
      description: document.getElementById('product-description').value.trim(),
      material: document.getElementById('product-material').value.trim(),
      color: document.getElementById('product-color').value.trim(),
      sizes: parseSizes(document.getElementById('product-sizes').value),
      features: parseFeatures(document.getElementById('product-features').value),
      category: document.getElementById('product-category').value,
      image: getImageValue()
    };
    if (!data.name) { alert('יש להזין שם מוצר'); return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; }
    var prom = id ? ProductsStore.updateProduct(id, data) : ProductsStore.addProduct(data);
    prom.then(function () {
      closeModal();
      render();
    }).catch(function (err) { alert('שגיאה בשמירה: ' + (err.message || err)); }).finally(function () {
      if (btn) btn.disabled = false;
    });
  });

    render();
  }

  if (ProductsStore.useSupabase) {
    gridEl.classList.add('loading');
    ProductsStore.initFromSupabase().then(runUI).catch(runUI).finally(function () { gridEl.classList.remove('loading'); });
  } else {
    runUI();
  }
});
