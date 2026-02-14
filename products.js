/**
 * Class-Man | ניהול מוצרים
 * מקור: Supabase (אם מוגדר) או localStorage
 */
(function (global) {
  const STORAGE_KEY = 'classman_products';
  const SETTINGS_KEY = 'classman_shop_settings';
  var useSupabase = !!(global.USE_SUPABASE && global.SupabaseProducts);
  var productsCache = [];
  var settingsCache = { bestSellerIds: [], dontMissIds: [] };

  var defaultProducts = [
    { id: 1, name: 'חולצת טריקו אומברה All The Way', price: 229, description: 'חולצת טריקו גברית עם אפקט אומברה ייחודי שמשנה גוון בהתאם לאור. עשויה כותנה אורגנית 100% לנשימות מקסימלית ונוחות לאורך היום.', image: 'images/products/shirts/product-1.png', features: ['כותנה אורגנית 100%', 'אפקט אומברה ייחודי'], material: 'כותנה אורגנית 100%', color: 'אומברה', sizes: ['XS', 'S', 'M', 'L', 'XL'], category: 'shirts' },
    { id: 2, name: 'מכנסי ג\'ינס סליים', price: 349, description: 'מכנסי ג\'ינס גבריים בחתך סליים מודרני שמתאים לגוף בלי להיות צמודים מדי. ג\'ינס פרימיום שמתרכך עם כל כביסה.', image: 'images/products/pants/product-2.png', features: ['ג\'ינס פרימיום', 'חתך סליים'], material: 'ג\'ינס פרימיום', color: 'כחול כהה', sizes: ['S', 'M', 'L', 'XL', 'XXL'], category: 'pants' },
    { id: 3, name: 'ז\'קט עור משובח', price: 499, description: 'ז\'קט עור גברי קלאסי מעור טבעי איכותי. עיצוב תמידי שמשתבח עם השנים ומתאים לכל אירוע.', image: 'images/products/jackets/product-34.png', features: ['עור איכותי', 'עיצוב קלאסי'], material: 'עור טבעי', color: 'שחור', sizes: ['S', 'M', 'L', 'XL'], category: 'jackets' },
    { id: 4, name: 'חולצת כפתורים אלגנטית', price: 279, description: 'חולצת כפתורים לגבר מבד כותנה מצופה שמתאימה למשרד ולאירועים חגיגיים. חתך מודרני, צווארון מושלם ותפירה איכותית.', image: 'images/products/shirts/product-35.png', features: ['בד איכותי', 'מתאים למשרד'], material: 'כותנה מצופה', color: 'לבן', sizes: ['XS', 'S', 'M', 'L', 'XL'], category: 'shirts' },
    { id: 5, name: 'מעיל חורף קלאסי', price: 459, description: 'מעיל חורף גברי חם ואלגנטי עם שכבת בידוד שמשמרת חום. עיצוב קלאסי שמתאים לשנים.', image: 'images/products/jackets/product-34.png', features: ['מבודד', 'קלאסי'], material: 'פוליאסטר מבודד', color: 'שחור', sizes: ['M', 'L', 'XL'], category: 'jackets' },
    { id: 6, name: 'סוודר צמר רך', price: 349, description: 'סוודר צמר נוח ואופנתי מצמר איכותי שמחמם בלי להכביד. מרקם רך ונעים לעור.', image: 'images/products/sweaters/product-6.png', features: ['צמר איכותי', 'נוח'], material: 'צמר מעורב', color: 'אפור', sizes: ['S', 'M', 'L', 'XL'], category: 'sweaters' },
    { id: 7, name: 'נעלי סניקרס לבנות קלאסיות', price: 349, description: 'נעלי סניקרס לבנות קלאסיות מעור ובד. מתאימות לכל לוק – מג\'ינס וחולצה ועד chino וחולצת כפתורים. סוליה נוחה, עיצוב נקי ופריט חובה בארון. קלאסיקה שלא יוצאת מהאופנה.', image: 'images/products/shoes/product-33.png', features: ['סניקרס', 'קלאסי'], material: 'עור ובד', color: 'לבן', sizes: ['40', '41', '42', '43', '44', '45'], category: 'shoes' }
  ];

  var defaultSettings = {
    bestSellerIds: [1, 2, 3, 4, 5, 6],
    dontMissIds: [1, 2, 4, 6]
  };

  var CATEGORY_NAMES = {
    shirts: 'חולצות',
    pants: 'מכנסיים',
    jackets: 'ז\'קטים ומעילים',
    sweaters: 'סוודרים',
    shoes: 'נעליים'
  };

  var CATEGORY_DESCS = {
    shirts: 'חולצות לגבר – טריקו, פולו, אוקספורד וכפתורים. כותנה איכותית, נוחות ויומיומיות לרחוב ולמשרד.',
    pants: 'מכנסיים וג\'ינס – חתכים קלאסיים ומודרניים. מג\'ינס דרך chino ועד קרגו. איכות תפירה והתאמה מושלמת.',
    jackets: 'ז\'קטים ומעילים לגבר – מבומבר ועור ועד טרנץ\' ופאדי. חום, סגנון והגנה מהקור ומהרוח.',
    sweaters: 'סוודרים וסווטשירטים – צמר, פריס ועיצובים urban. נוחות לחורף וללבוש בשכבות.',
    shoes: 'נעליים לגבר – סניקרס קלאסיות וקז\'ואל. נוחות, עמידות וסגנון לרחוב ולמשרד.'
  };

  function getProducts() {
    if (useSupabase) return productsCache.slice();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      }
      saveProducts(defaultProducts.slice());
      saveSettings(Object.assign({}, defaultSettings));
    } catch (e) {}
    return defaultProducts.slice();
  }

  function saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getSettings() {
    if (useSupabase) return Object.assign({}, defaultSettings, settingsCache);
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        return s || defaultSettings;
      }
    } catch (e) {}
    return Object.assign({}, defaultSettings);
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getNextId(products) {
    var max = 0;
    products.forEach(function (p) {
      if (p.id > max) max = p.id;
    });
    return max + 1;
  }

  function ensureProductFields(p) {
    return {
      id: p.id,
      name: p.name || '',
      price: Number(p.price) || 0,
      description: p.description || '',
      image: p.image || '',
      features: Array.isArray(p.features) ? p.features : [],
      material: p.material || '',
      color: p.color || '',
      sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
      category: p.category || 'shirts'
    };
  }

  function refreshFromSupabase() {
    return Promise.all([
      global.SupabaseProducts.fetchProducts(),
      global.SupabaseProducts.fetchSettings()
    ]).then(function (res) {
      productsCache = res[0] || [];
      settingsCache = res[1] || { bestSellerIds: [], dontMissIds: [] };
    });
  }

  var ProductsStore = {
    useSupabase: useSupabase,
    initFromSupabase: useSupabase ? refreshFromSupabase : function () { return Promise.resolve(); },
    getProducts: getProducts,
    getProduct: function (id) {
      var products = getProducts();
      return products.find(function (p) { return p.id === Number(id); }) || null;
    },
    addProduct: function (productData) {
      if (useSupabase) {
        var data = ensureProductFields(productData);
        return global.SupabaseProducts.addProduct(data)
          .then(function (p) { return refreshFromSupabase().then(function () { return p; }); });
      }
      var products = getProducts();
      var p = ensureProductFields(productData);
      p.id = getNextId(products);
      products.push(p);
      return saveProducts(products) ? Promise.resolve(p) : Promise.resolve(null);
    },
    updateProduct: function (id, productData) {
      if (useSupabase) {
        var data = ensureProductFields(productData);
        return global.SupabaseProducts.updateProduct(Number(id), data)
          .then(function (p) { return refreshFromSupabase().then(function () { return p; }); });
      }
      var products = getProducts();
      var idx = products.findIndex(function (p) { return p.id === Number(id); });
      if (idx < 0) return Promise.resolve(null);
      var p = ensureProductFields(Object.assign({}, products[idx], productData));
      p.id = products[idx].id;
      products[idx] = p;
      return saveProducts(products) ? Promise.resolve(p) : Promise.resolve(null);
    },
    deleteProduct: function (id) {
      if (useSupabase) {
        return global.SupabaseProducts.deleteProduct(Number(id)).then(function () {
          var s = getSettings();
          s.bestSellerIds = (s.bestSellerIds || []).filter(function (i) { return i !== Number(id); });
          s.dontMissIds = (s.dontMissIds || []).filter(function (i) { return i !== Number(id); });
          return global.SupabaseProducts.saveSettings(s).then(refreshFromSupabase);
        });
      }
      var products = getProducts().filter(function (p) { return p.id !== Number(id); });
      var settings = getSettings();
      settings.bestSellerIds = (settings.bestSellerIds || []).filter(function (i) { return i !== Number(id); });
      settings.dontMissIds = (settings.dontMissIds || []).filter(function (i) { return i !== Number(id); });
      saveSettings(settings);
      return saveProducts(products) ? Promise.resolve(true) : Promise.resolve(false);
    },
    getSettings: getSettings,
    saveSettings: saveSettings,
    getBestSellers: function () {
      var products = getProducts();
      var ids = getSettings().bestSellerIds || [];
      return ids.map(function (id) {
        return products.find(function (p) { return p.id === id; });
      }).filter(Boolean);
    },
    getDontMiss: function () {
      var products = getProducts();
      var ids = getSettings().dontMissIds || [];
      return ids.map(function (id) {
        return products.find(function (p) { return p.id === id; });
      }).filter(Boolean);
    },
    setBestSellers: function (ids) {
      var s = getSettings();
      s.bestSellerIds = ids;
      if (useSupabase) {
        return global.SupabaseProducts.saveSettings(s).then(refreshFromSupabase);
      }
      saveSettings(s);
      return Promise.resolve();
    },
    setDontMiss: function (ids) {
      var s = getSettings();
      s.dontMissIds = ids;
      if (useSupabase) {
        return global.SupabaseProducts.saveSettings(s).then(refreshFromSupabase);
      }
      saveSettings(s);
      return Promise.resolve();
    },
    saveFullSettings: function (opts) {
      var s = Object.assign({}, getSettings(), {
        bestSellerIds: opts.bestSellerIds !== undefined ? opts.bestSellerIds : getSettings().bestSellerIds,
        dontMissIds: opts.dontMissIds !== undefined ? opts.dontMissIds : getSettings().dontMissIds
      });
      if (useSupabase) {
        return global.SupabaseProducts.saveSettings(s).then(refreshFromSupabase);
      }
      saveSettings(s);
      return Promise.resolve();
    },
    resetToDefaults: function () {
      saveProducts(defaultProducts.slice());
      saveSettings(Object.assign({}, defaultSettings));
      return true;
    },
    getCategories: function () {
      var products = getProducts();
      var cats = ['shirts', 'pants', 'jackets', 'sweaters', 'shoes'];
      var defaultImages = {
        shirts: 'images/products/shirts/product-1.png',
        pants: 'images/products/pants/product-2.png',
        jackets: 'images/products/jackets/product-34.png',
        sweaters: 'images/products/sweaters/product-6.png',
        shoes: 'images/products/shoes/product-33.png'
      };
      return cats.map(function (id) {
        var ids = products.filter(function (p) { return p.category === id; }).map(function (p) { return p.id; });
        return {
          id: id,
          name: CATEGORY_NAMES[id] || id,
          description: CATEGORY_DESCS[id] || '',
          productIds: ids,
          image: defaultImages[id] || 'images/products/shirts/product-1.png'
        };
      });
    },
    getProductsByCategory: function (categoryId) {
      return getProducts().filter(function (p) { return p.category === categoryId; });
    }
  };

  global.ProductsStore = ProductsStore;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsStore;
  }
})(typeof window !== 'undefined' ? window : this);
