/**
 * Class-Man | פאנל ניהול – דף הבית זהה לאתר + עריכה
 */
(function () {
  var ADMIN_PASSWORD = '4934988';
  var AUTH_KEY = 'classman_admin_auth';

  if (window.USE_SUPABASE && !window.SupabaseClient && typeof supabase !== 'undefined' && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    window.SupabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage }
    });
  }
  var useSupabaseAuth = !!(window.USE_SUPABASE && window.SupabaseClient);

  function isAuthenticated() {
    if (useSupabaseAuth && window.SupabaseClient) {
      try {
        var session = window.SupabaseClient.auth.getSession();
        return !!(session && session.data && session.data.session);
      } catch (e) {}
      return false;
    }
    try {
      return sessionStorage.getItem(AUTH_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setAuthenticated() {
    try {
      sessionStorage.setItem(AUTH_KEY, '1');
    } catch (e) {}
  }

  function showAdmin() {
    var overlay = document.getElementById('admin-login-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.add('admin-mode');
  }

  function hideAdmin() {
    var overlay = document.getElementById('admin-login-overlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.classList.remove('admin-mode');
  }

  if (useSupabaseAuth && window.location.protocol === 'file:') {
    var hintEl = document.getElementById('admin-login-hint');
    if (hintEl) {
      hintEl.innerHTML = 'לא ניתן להתחבר כשהדף נפתח מקובץ. הרץ שרת מקומי: בטרמינל <code>npx serve .</code> ואז פתח <code>http://localhost:3000/admin.html</code>';
      hintEl.style.display = 'block';
    }
  }

  if (useSupabaseAuth && window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.location.protocol !== 'file:') {
    fetch(window.SUPABASE_URL + '/rest/v1/', { method: 'GET', headers: { apikey: window.SUPABASE_ANON_KEY, Accept: 'application/json' } })
      .catch(function () {
        var h = document.getElementById('admin-login-hint');
        if (h) {
          h.textContent = 'לא מגיע ל-Supabase. בדוק: 1) העלית supabase-config.js עם URL ו-key נכונים. 2) Supabase Dashboard שהפרויקט לא מושהה (Settings).';
          h.style.display = 'block';
        }
      });
  }

  document.getElementById('admin-login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var emailEl = document.getElementById('admin-email');
    var passwordEl = document.getElementById('admin-password');
    var errorEl = document.getElementById('admin-login-error');
    var hintEl = document.getElementById('admin-login-hint');
    if (useSupabaseAuth && window.SupabaseClient) {
      if (window.location.protocol === 'file:') {
        errorEl.textContent = 'פתח את האתר דרך שרת (למשל http://localhost:3000/admin.html), לא כקובץ. בטרמינל: npx serve .';
        errorEl.style.display = 'block';
        return;
      }
      var email = emailEl ? emailEl.value.trim() : '';
      var password = passwordEl ? passwordEl.value : '';
      if (!email || !password) {
        errorEl.textContent = 'יש להזין אימייל וסיסמה';
        errorEl.style.display = 'block';
        return;
      }
      window.SupabaseClient.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) throw res.error;
          setAuthenticated();
          showAdmin();
          errorEl.style.display = 'none';
          runAdminUI();
        })
        .catch(function (err) {
          if (typeof console !== 'undefined' && console.error) console.error('Supabase login error:', err);
          var raw = (err && err.message) ? String(err.message) : '';
          var msg;
          if (raw.toLowerCase().indexOf('fetch') !== -1) {
            if (window.location.protocol === 'file:') {
              msg = 'שגיאת רשת: פתח את האתר דרך http (לא קובץ). בטרמינל: npx serve . ואז http://localhost:3000/admin.html';
            } else {
              msg = 'שגיאת רשת (Failed to fetch). אתר סטטי: וודא ש-supabase-config.js על השרת מכיל את אותו URL ו-key מ-Supabase (Settings → API). אם הפרויקט על Free tier – בדוק ב-Dashboard שהפרויקט לא מושהה (Restore).';
            }
          } else if (raw.toLowerCase().indexOf('email not confirmed') !== -1 || raw.toLowerCase().indexOf('confirm') !== -1) {
            msg = 'האימייל לא מאושר. ב-Supabase: Authentication → Providers → Email → כבה "Confirm email", או אשר את האימייל מהקישור שנשלח.';
          } else if (raw.toLowerCase().indexOf('invalid') !== -1 || raw.toLowerCase().indexOf('credentials') !== -1) {
            msg = 'אימייל או סיסמה שגויים. וודא שהזנת בדיוק את האימייל והסיסמה שיצרת ב-Supabase (Authentication → Users).';
          } else {
            msg = raw || 'אימייל או סיסמה שגויים. שגיאה: ' + raw;
          }
          errorEl.textContent = msg;
          errorEl.style.display = 'block';
        });
    } else {
      if (passwordEl.value === ADMIN_PASSWORD) {
        setAuthenticated();
        showAdmin();
        errorEl.style.display = 'none';
        runAdminUI();
      } else {
        errorEl.textContent = 'סיסמה שגויה. נסה שוב.';
        errorEl.style.display = 'block';
      }
    }
  });

  function runAdminUI() {
    if (typeof ProductsStore === 'undefined') return;
    if (typeof Cart !== 'undefined') Cart.initCart();

    var runWhenReady = function () {
      setupAdminHandlers();
    };
    if (ProductsStore.useSupabase) {
      showLoading('#products-grid');
      showLoading('#dont-miss-grid');
      ProductsStore.initFromSupabase()
        .then(runWhenReady)
        .catch(function (err) {
          hideLoading();
          showError('שגיאה בטעינת מוצרים: ' + (err.message || err));
          runWhenReady();
        })
        .finally(hideLoading);
    } else {
      runWhenReady();
    }
  }

  function showLoading(selector) {
    var el = document.querySelector(selector);
    if (el) el.classList.add('loading');
  }
  function hideLoading() {
    [].forEach.call(document.querySelectorAll('.products-grid, #products-grid, #dont-miss-grid, #category-products, #categories-list'), function (el) {
      el.classList.remove('loading');
    });
  }
  function showError(msg) {
    alert(msg);
  }

  function setupAdminHandlers() {
    document.querySelector('.nav-toggle')?.addEventListener('click', function () {
      document.querySelector('.nav-links')?.classList.toggle('active');
      document.querySelector('.nav-toggle')?.classList.toggle('active');
    });

    var overlay = document.getElementById('product-modal-overlay');
    var form = document.getElementById('product-form');
    var imageInput = document.getElementById('product-image-input');
    var imagePreview = document.getElementById('product-image-preview');
    var imageUrlInput = document.getElementById('product-image-url');
    var currentImageData = null;
    var addToSection = 'bestSellers';

    var categoryGroup = document.getElementById('form-group-category');

    function openModal(isEdit, product) {
      document.getElementById('product-modal-title').textContent = isEdit ? 'עריכת מוצר' : 'הוסף מוצר חדש';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-price').value = product.price || 0;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-material').value = product.material || '';
        document.getElementById('product-color').value = product.color || '';
        document.getElementById('product-sizes').value = Array.isArray(product.sizes) ? product.sizes.join(', ') : 'S, M, L, XL';
        document.getElementById('product-features').value = Array.isArray(product.features) ? product.features.join(', ') : '';
        document.getElementById('product-category').value = product.category || 'shirts';
        imageUrlInput.value = (product.image && !product.image.startsWith('data:')) ? product.image : '';
        currentImageData = product.image && product.image.startsWith('data:') ? product.image : null;
        imagePreview.style.backgroundImage = product.image ? 'url(' + product.image + ')' : '';
        imagePreview.classList.toggle('has-image', !!product.image);
        if (categoryGroup) categoryGroup.style.display = '';
      } else {
        form.reset();
        document.getElementById('product-id').value = '';
        currentImageData = null;
        imagePreview.style.backgroundImage = '';
        imagePreview.classList.remove('has-image');
        imageUrlInput.value = '';
        if (addToSection === 'bestSellers' || addToSection === 'dontMiss') {
          if (categoryGroup) categoryGroup.style.display = 'none';
          document.getElementById('product-category').value = 'shirts';
        } else {
          if (categoryGroup) categoryGroup.style.display = '';
        }
      }
    }

    function closeModal() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      form.reset();
      document.getElementById('product-id').value = '';
      currentImageData = null;
      imagePreview.style.backgroundImage = '';
      imagePreview.classList.remove('has-image');
      imageUrlInput.value = '';
      if (categoryGroup) categoryGroup.style.display = '';
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

    function renderProductCard(p, linkText, cardClass, section) {
      if (!p) return '';
      var img = p.image
        ? '<img src="' + p.image + '" alt="' + (p.name || '').replace(/"/g, '&quot;') + '" class="product-card-img">'
        : '<div class="product-image-placeholder"></div>';
      var href = 'product.html?id=' + p.id + '&returnTo=admin';
      var cls = (cardClass || 'product-card').trim();
      var link = linkText || 'לפרטים';
      var extra = [];
      if (p.material) extra.push(p.material);
      if (p.color) extra.push(p.color);
      var extraHtml = extra.length ? '<p class="product-card-extra">' + extra.join(' · ') + '</p>' : '';
      var editBtns = '<div class="admin-card-actions"><button type="button" class="admin-btn-edit" data-id="' + p.id + '" data-section="' + section + '">עריכה</button><button type="button" class="admin-btn-delete" data-id="' + p.id + '">מחק</button></div>';
      return (
        '<div class="admin-product-wrap">' +
          '<a href="' + href + '" class="' + cls + '">' +
            '<div class="product-image">' + img + '<span class="product-card-link">' + link + '</span></div>' +
            '<div class="product-info"><h3>' + (p.name || '') + '</h3><span class="product-price">₪' + (p.price || 0) + '</span>' + extraHtml + '</div>' +
          '</a>' +
          editBtns +
        '</div>'
      );
    }

    function renderAll() {
      var bestSellers = ProductsStore.getBestSellers();
      var dontMiss = ProductsStore.getDontMiss();
      var allProducts = ProductsStore.getProducts();
      if (bestSellers.length === 0) bestSellers = allProducts.slice(0, 6);
      if (dontMiss.length === 0) {
        var bestIds = bestSellers.map(function (p) { return p.id; });
        dontMiss = allProducts.filter(function (p) { return bestIds.indexOf(p.id) === -1; }).slice(0, 4);
      }

      var gridEl = document.getElementById('products-grid');
      var dontMissEl = document.getElementById('dont-miss-grid');
      if (gridEl) gridEl.innerHTML = bestSellers.map(function (p) { return renderProductCard(p, 'לפרטים ולרכישה', 'product-card', 'bestSellers'); }).join('');
      if (dontMissEl) dontMissEl.innerHTML = dontMiss.map(function (p) { return renderProductCard(p, 'בחר אפשרויות', 'product-card product-card-light', 'dontMiss'); }).join('');

      document.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var id = parseInt(btn.dataset.id, 10);
          var p = ProductsStore.getProduct(id);
          if (p) openModal(true, p);
        });
      });

      document.querySelectorAll('.admin-btn-delete').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var id = parseInt(btn.dataset.id, 10);
          var p = ProductsStore.getProduct(id);
          if (!p) return;
          if (confirm('האם למחוק את "' + (p.name || '') + '"?')) {
            ProductsStore.deleteProduct(id)
              .then(renderAll)
              .catch(function (err) { alert('שגיאה במחיקה: ' + (err.message || err)); });
          }
        });
      });
    }

    document.getElementById('btn-add-best-sellers')?.addEventListener('click', function () {
      addToSection = 'bestSellers';
      openModal(false);
    });

    document.getElementById('btn-add-dont-miss')?.addEventListener('click', function () {
      addToSection = 'dontMiss';
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
      var categoryVal = document.getElementById('product-category').value;
      if ((addToSection === 'bestSellers' || addToSection === 'dontMiss') && !id) {
        categoryVal = 'shirts';
      }
      var data = {
        name: document.getElementById('product-name').value.trim(),
        price: parseFloat(document.getElementById('product-price').value) || 0,
        description: document.getElementById('product-description').value.trim(),
        material: document.getElementById('product-material').value.trim(),
        color: document.getElementById('product-color').value.trim(),
        sizes: parseSizes(document.getElementById('product-sizes').value),
        features: parseFeatures(document.getElementById('product-features').value),
        category: categoryVal,
        image: getImageValue()
      };
      if (!data.name) {
        alert('יש להזין שם מוצר');
        return;
      }
      var submitBtn = form.querySelector('button[type="submit"]');
      var origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'שומר...'; }
      var doSave = function () {
        if (id) return ProductsStore.updateProduct(id, data);
        return ProductsStore.addProduct(data).then(function (p) {
          if (p && addToSection === 'bestSellers') {
            var s = ProductsStore.getSettings();
            var bestIds = (s.bestSellerIds || []).slice();
            var dontIds = (s.dontMissIds || []).filter(function (x) { return x !== p.id; });
            bestIds.unshift(p.id);
            return ProductsStore.saveFullSettings({ bestSellerIds: bestIds, dontMissIds: dontIds });
          } else if (p && addToSection === 'dontMiss') {
            var s2 = ProductsStore.getSettings();
            var bestIds2 = (s2.bestSellerIds || []).filter(function (x) { return x !== p.id; });
            var dontIds2 = (s2.dontMissIds || []).slice();
            dontIds2.unshift(p.id);
            return ProductsStore.saveFullSettings({ bestSellerIds: bestIds2, dontMissIds: dontIds2 });
          }
          return Promise.resolve();
        });
      };
      doSave()
        .then(function () {
          closeModal();
          renderAll();
        })
        .catch(function (err) {
          alert('שגיאה בשמירה: ' + (err.message || err));
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
        });
    });

    renderAll();
  }

  (function checkAuth() {
    if (useSupabaseAuth && window.SupabaseClient) {
      var emailInput = document.getElementById('admin-email');
      if (emailInput) emailInput.setAttribute('required', 'required');
      window.SupabaseClient.auth.getSession().then(function (res) {
        if (res.data && res.data.session) {
          setAuthenticated();
          showAdmin();
          runAdminUI();
        } else {
          hideAdmin();
        }
      }).catch(function () { hideAdmin(); });
    } else {
      var wrap = document.getElementById('admin-email-wrap');
      if (wrap) wrap.style.display = 'none';
      document.getElementById('admin-email').removeAttribute('required');
      if (isAuthenticated()) {
        showAdmin();
        runAdminUI();
      } else {
        hideAdmin();
      }
    }
  })();
})();
