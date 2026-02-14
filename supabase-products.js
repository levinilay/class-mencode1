/**
 * Class-Man | Supabase Products Layer
 * Async CRUD for products and shop settings.
 * Load this AFTER supabase-config.js and the Supabase client script.
 */
(function (global) {
  if (!window.USE_SUPABASE || typeof supabase === 'undefined') {
    global.SupabaseProducts = null;
    return;
  }

  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;
  var client = supabase.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  });
  global.SupabaseClient = client;

  function rowToProduct(row) {
    if (!row) return null;
    var sizes = row.sizes;
    if (typeof sizes === 'string') {
      sizes = sizes ? sizes.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
    }
    if (!Array.isArray(sizes) || sizes.length === 0) sizes = ['S', 'M', 'L', 'XL'];
    var features = row.features;
    if (typeof features === 'string') {
      features = features ? features.split(',').map(function (f) { return f.trim(); }).filter(Boolean) : [];
    }
    if (!Array.isArray(features)) features = [];
    return {
      id: row.id,
      name: row.name || '',
      price: Number(row.price) || 0,
      description: row.description || '',
      image: row.image || '',
      features: features,
      material: row.material || '',
      color: row.color || '',
      sizes: sizes,
      category: row.category || 'shirts'
    };
  }

  function productToRow(p) {
    return {
      name: p.name || '',
      price: Number(p.price) || 0,
      description: p.description || '',
      image: p.image || '',
      category: p.category || 'shirts',
      material: p.material || '',
      color: p.color || '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || 'S, M, L, XL'),
      features: Array.isArray(p.features) ? p.features.join(', ') : (p.features || '')
    };
  }

  var SupabaseProducts = {
    /** Fetch all products. Returns Promise<Array> */
    fetchProducts: function () {
      return client
        .from('products')
        .select('*')
        .order('id', { ascending: true })
        .then(function (res) {
          if (res.error) throw res.error;
          return (res.data || []).map(rowToProduct);
        });
    },

    /** Add product. Returns Promise<product> */
    addProduct: function (productData) {
      var row = productToRow(productData);
      return client
        .from('products')
        .insert(row)
        .select('*')
        .single()
        .then(function (res) {
          if (res.error) throw res.error;
          return rowToProduct(res.data);
        });
    },

    /** Update product by id. Returns Promise<product> */
    updateProduct: function (id, productData) {
      var row = productToRow(productData);
      delete row.id;
      return client
        .from('products')
        .update(row)
        .eq('id', id)
        .select('*')
        .single()
        .then(function (res) {
          if (res.error) throw res.error;
          return rowToProduct(res.data);
        });
    },

    /** Delete product by id. Returns Promise<void> */
    deleteProduct: function (id) {
      return client
        .from('products')
        .delete()
        .eq('id', id)
        .then(function (res) {
          if (res.error) throw res.error;
        });
    },

    /** Fetch shop settings. Returns Promise<{bestSellerIds, dontMissIds}> */
    fetchSettings: function () {
      return client
        .from('shop_settings')
        .select('*')
        .eq('id', 1)
        .single()
        .then(function (res) {
          if (res.error && res.error.code !== 'PGRST116') throw res.error;
          var row = res.data || {};
          return {
            bestSellerIds: Array.isArray(row.best_seller_ids) ? row.best_seller_ids : [],
            dontMissIds: Array.isArray(row.dont_miss_ids) ? row.dont_miss_ids : []
          };
        });
    },

    /** Save shop settings. Returns Promise<void> */
    saveSettings: function (settings) {
      return client
        .from('shop_settings')
        .upsert({
          id: 1,
          best_seller_ids: settings.bestSellerIds || [],
          dont_miss_ids: settings.dontMissIds || [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .then(function (res) {
          if (res.error) throw res.error;
        });
    }
  };

  global.SupabaseProducts = SupabaseProducts;
})(typeof window !== 'undefined' ? window : this);
