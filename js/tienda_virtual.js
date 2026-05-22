/*
	tienda_virtual.js
	Tienda virtual en una sola página.

	Este archivo contiene toda la lógica del frontend:
	- datos iniciales de productos
	- estado de la aplicación
	- almacenamiento local (localStorage)
	- renderizado de la interfaz (UI)
	- navegación por hash (#home, #product-1, #login, etc.)
	- sistema de usuario simple con login/registro
	- carrito persistente como invitado o usuario

	
*/

(function () {
	// --- Datos de ejemplo ---
	const PRODUCTS = [
		{ id: 1, 
			name: 'Laptop XPS', 
			price: 500.99, 
			stock: 5, 
			description: 'Laptop compacta y potente', 
			image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
		{ id: 2, 
			name: 'Camiseta básica', 
			price: 19.99, 
			stock: 50, 
			description: '100% algodón', 
			image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=600&q=80' },
		{ id: 3, 
			name: 'Libro: Aprende JS', 
			price: 29.99, 
			stock: 20, 
			description: 'Introducción al desarrollo web', 
			image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
		{ id: 4, 
			name: 'Pantalon Baggy', 
			price: 20.99, 
			stock: 40, 
			description: 'Pantalones cómodos y modernos', 
			image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
		{
			id: 5,
			name: 'Zapatos Deportivos',
			price: 99.99,
			stock: 30,
			image: 'https://images.unsplash.com/photo-1528701800489-20a13f0b14d8?auto=format&fit=crop&w=600&q=80'},
		{
			id: 6,
			name: 'Moto Deportiva',
			price: 9999.99,
			stock: 10,
			description: 'Moto potente y estilizada para los amantes de la velocidad',
			image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'},
		{
			id: 7,
			name: 'Televisor 4K',
			price: 999.99,
			stock: 25,
			description: 'Televisor de alta definición con resolución 4K',
			image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'},
		{
			id: 8,
			name: 'Celular Inteligente',
			price: 250.99,
			stock: 30,
			description: 'Celular moderno con características avanzadas',
			image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'},
		{
			id: 9,
			name: 'Carro Deportivo',
			price: 9000.99,
			stock: 5,
			description: 'Carro rápido y elegante para los amantes de la velocidad',
			image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80'}
	];


	// --- Claves de localStorage ---
	// Cada clave almacena un tipo de información diferente.
	const STORAGE_KEY = 'market-juanrr-cart'; // carrito de invitado o usuario
	const PRODUCT_STORAGE_KEY = 'market-juanrr-products'; // lista de productos personalizada
	const USERS_STORAGE_KEY = 'market-juanrr-users'; // datos de cuentas de usuario
	const CURRENT_USER_KEY = 'market-juanrr-current-user'; // email del usuario conectado

	// --- Funciones de almacenamiento de usuarios ---
	// Carga las cuentas registradas desde localStorage.
	function loadUsers() {
		try {
			const raw = localStorage.getItem(USERS_STORAGE_KEY);
			const data = raw ? JSON.parse(raw) : {};
			// Retornamos un objeto vacío si el valor guardado no es válido.
			return data && typeof data === 'object' ? data : {};
		} catch (e) {
			return {};
		}
	}

	// Guarda todas las cuentas de usuario en localStorage.
	function saveUsers() {
		localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(state.users));
	}

	// Lee el email del usuario actualmente conectado.
	function loadCurrentUserEmail() {
		return localStorage.getItem(CURRENT_USER_KEY) || null;
	}

	// Guarda o elimina el email del usuario conectado.
	function saveCurrentUserEmail(email) {
		if (email) {
			localStorage.setItem(CURRENT_USER_KEY, email);
		} else {
			localStorage.removeItem(CURRENT_USER_KEY);
		}
	}

	// Carga el carrito que usa el invitado (no logueado).
	function loadGuestCart() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const data = raw ? JSON.parse(raw) : [];
			// Aseguramos que lo cargado sea un arreglo válido.
			return Array.isArray(data) ? data : [];
		} catch (e) {
			return [];
		}
	}

	// Guarda el carrito en localStorage.
	// Si hay usuario conectado guarda el carrito dentro de su perfil.
	// Si no hay usuario guarda el carrito como invitado.
	function saveCart() {
		if (state.user && state.user.email) {
			state.user.cart = state.cart;
			state.users[state.user.email] = state.user;
			saveUsers();
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
		}
	}

	// Carga la lista de productos almacenados en localStorage.
	// Si no existe ninguno, carga la lista de productos de ejemplo.
	function loadProducts() {
		try {
			const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
			const data = raw ? JSON.parse(raw) : null;
			if (Array.isArray(data) && data.every(item => item && typeof item.id === 'number')) {
				return data;
			}
		} catch (e) {
			// Si hay error leyendo localStorage, usamos los productos de ejemplo.
		}
		return PRODUCTS.slice();
	}

	// Guarda los productos actuales (incluyendo los creados por usuarios).
	function saveProducts() {
		localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(state.products));
	}

	// --- Estado global de la aplicación ---
	// El objeto state guarda todo el estado actual en memoria.
	const state = {
		products: loadProducts(), // lista de productos actualizada
		users: loadUsers(), // cuentas de usuario registradas
		currentUserEmail: loadCurrentUserEmail(), // email de sesión activa
		user: null, // datos del usuario actualmente conectado
		guestCart: [], // carrito temporal para invitados
		cart: [], // carrito visible y editable en la UI
		view: { page: 'home', productId: null }, // vista activa
		searchQuery: '' // texto actual de búsqueda en el header
	};

	// Si hay un usuario conectado, recuperamos su perfil.
	state.user = state.currentUserEmail ? state.users[state.currentUserEmail] : null;
	state.guestCart = loadGuestCart();
	state.cart = state.user ? (state.user.cart || []) : state.guestCart;

	// Combina dos carritos teniendo en cuenta el stock disponible.
	// Se usa cuando un invitado inicia sesión o se registra.
	function mergeCarts(baseCart, incomingCart) {
		const merged = [...baseCart];
		incomingCart.forEach(item => {
			const existing = merged.find(i => i.productId === item.productId);
			if (existing) {
				existing.quantity = Math.min(existing.quantity + item.quantity, (state.products.find(p => p.id === item.productId) || {}).stock || Infinity);
			} else {
				merged.push({ productId: item.productId, quantity: Math.min(item.quantity, (state.products.find(p => p.id === item.productId) || {}).stock || item.quantity) });
			}
		});
		return merged;
	}

	// Guarda el carrito temporal del invitado.
	function saveGuestCart() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state.guestCart));
	}

	function setCurrentUser(email) {
		state.currentUserEmail = email;
		state.user = email ? state.users[email] || null : null;
		saveCurrentUserEmail(email);
	}

	// --- Utilidades ---
	const $ = (sel, ctx = document) => ctx.querySelector(sel);
	const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

	// --- BÚSQUEDA Y FILTRADO ---
	// Este bloque define cómo debe comportarse la búsqueda en el header.
	// Se aceptan sinónimos sencillos para mejorar los resultados.
	const SEARCH_SYNONYMS = {
		ropa: ['ropa','prenda','prendas','camiseta','pantalon','zapatos','vestido','indumentaria'],
		prenda: ['ropa','prenda','prendas','camiseta','pantalon','zapatos','vestido','indumentaria'],
		auto: ['carro','auto','coche','vehículo','vehiculo','vehículos','vehiculos'],
		carro: ['carro','auto','coche','vehículo','vehiculo','vehículos','vehiculos'],
		coche: ['carro','auto','coche','vehículo','vehiculo','vehículos','vehiculos']
	};

	function normalizeText(text) {
		return String(text || '').toLowerCase();
	}

	function buildSearchTokens(query) {
		return query
			.toLowerCase()
			.trim()
			.split(/\s+/)
			.filter(Boolean)
			.flatMap(token => SEARCH_SYNONYMS[token] || [token]);
	}

	function matchesProductSearch(product, query) {
		if (!query) return true;
		const terms = buildSearchTokens(query);
		const haystack = normalizeText(`${product.name} ${product.description || ''}`);
		return terms.every(term => haystack.includes(term));
	}

	function getFilteredProducts(query) {
		if (!query) return state.products.slice();
		return state.products.filter(product => matchesProductSearch(product, query));
	}

	function renderSearchSuggestions() {
		const query = normalizeText(state.searchQuery);
		const suggestions = $('#tv-search-results');
		if (!suggestions) return;
		if (!query) {
			suggestions.classList.remove('open');
			suggestions.innerHTML = '';
			return;
		}
		const items = getFilteredProducts(query).slice(0, 5);
		if (!items.length) {
			suggestions.innerHTML = '<div class="tv-search-no-results">No se encontraron coincidencias.</div>';
			suggestions.classList.add('open');
			return;
		}
		suggestions.innerHTML = items.map(product => `
			<div class="tv-search-item" data-product-id="${product.id}">
				<strong>${product.name}</strong>
				<div>${product.description ? product.description : 'Sin descripción'}</div>
			</div>
		`).join('');
		suggestions.classList.add('open');
	}

	function setupSearchInput() {
		const input = $('#tv-search-input');
		const suggestions = $('#tv-search-results');
		if (!input) return;
		const updateSearch = () => {
			state.searchQuery = input.value.trim();
			if (state.view.page !== 'home') {
				setHash('home');
				state.view = { page: 'home', productId: null };
			}
			renderView();
			renderSearchSuggestions();
		};
		input.oninput = updateSearch;
		input.onfocus = () => renderSearchSuggestions();
		input.onblur = () => setTimeout(() => {
			if (suggestions) {
				suggestions.classList.remove('open');
			}
		}, 120);
		if (!suggestions) return;
		suggestions.onclick = event => {
			const item = event.target.closest('.tv-search-item');
			if (!item) return;
			const productId = Number(item.dataset.productId);
			if (!productId) return;
			state.searchQuery = '';
			input.value = '';
			renderSearchSuggestions();
			setHash(`product-${productId}`);
			state.view = { page: 'product', productId };
			renderView();
		};
	}

	// --- Estilos inyectados (si no se encuentra el CSS externo) ---
	// Este bloque construye un CSS por defecto para que la app funcione
	// incluso si el archivo tienda_virtual.css no está cargado.
	function injectStyles() {
		// Si existe un link a tienda_virtual.css, no inyectamos estilos duplicados
		const css = `
			.tv-container{font-family:Arial,Helvetica,sans-serif;max-width:3000px;margin:20px auto;padding:16px}
			.tv-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px}
			.tv-card{border:1px solid #030202;padding:10px;border-radius:7px; background: #baddbab7}
			.tv-card h4{margin:0 0 8px}
			.product-detail{padding:16px}
			.product-detail .product-image{width:100%;max-width:320px;display:block;margin:0 auto 16px;height:auto}
			.product-image{width:70%;height:auto;border-radius:4px;margin-bottom:12px;object-fit:cover}
			.tv-header{display:flex;justify-content:space-between;align-items:center;gap:15px}
			.tv-hamburger{width:40px;height:40px;border:0.5px solid #000000;background: #baddbab7;border-radius:12px ;box-shadow:0px 5px 15px rgba(176, 190, 182, 0.75);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;flex-direction:column}
			.tv-hamburger span{display:block;width:18px;height:2px;background:#333;margin:2px 0;border-radius:2px;transition:background .2s ease}
			.tv-hamburger:hover{transform:translateY(-2px);box-shadow:0 6px 12px rgba(0,0,0,.16)}
			.tv-hamburger:hover span{background:#2b7cff}
			.tv-title-button{font-size:1.5rem;font-weight:700;border:1px solid #000000;background: #baddbab7;color:#0b1f70;cursor:pointer;padding:10px 20px;border-radius:999px;transition:transform .15s ease,  box-shadow:205px 200px 105px #0000,background .2s ease;white-space:nowrap}
			.tv-title-button:hover{transform:translateY(-2px);box-shadow:0 6px 12px rgba(0,0,0,.12);background:#dbe6ff}
			.tv-header-right{display:flex;align-items:center;gap:8px;margin-left:auto}
			.tv-search-container{position:relative;min-width:260px;max-width:320px}
			.tv-search-input{width:100%;padding:8px 12px;border:1px solid #ccc;border-radius:999px;background:#fff;color:#111;transition:box-shadow .15s ease,border-color .15s ease;}
			.tv-search-input:focus{outline:none;border-color:#2b7cff;box-shadow:0 0 0 4px rgba(43, 113, 255, .15);}
			.tv-search-results{position:absolute;top:calc(100% + 8px);left:0;right:0;max-height:260px;overflow:auto;background:#fff;border:1px solid #ccc;border-radius:12px;box-shadow:0 16px 32px rgba(0,0,0,.12);display:none;z-index:60}
			.tv-search-results.open{display:block}
			.tv-search-item{padding:10px 12px;cursor:pointer;border-bottom:1px solid #f0f0f0;transition:background .15s ease;}
			.tv-search-item:last-child{border-bottom:none}
			.tv-search-item strong{display:block;font-size:.95rem;margin-bottom:4px}
			.tv-search-item div{font-size:.85rem;color:#555}
			.tv-search-no-results{padding:10px 12px;color:#555}
			.tv-header-actions{display:flex;align-items:center;gap:8px}
			.tv-header-greeting{font-weight:600;color:#0b1f70}
			.tv-auth-button{padding:8px 14px;border:1px solid #000000;border-radius:999px;background: #baddbab7;color:#0b1f70;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,background .2s ease;font-weight:600}
			.tv-auth-button:hover{transform:translateY(-2px);box-shadow:0 5px 12px rgba(0,0,0,.12);background:#dbe6ff}
			.tv-actions{display:flex;gap:8px;margin-top:8px}
			.tv-btn{padding:8px 10px;border:none;border-radius:4px;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
			.tv-btn:hover{transform:translateY(-2px);box-shadow:0 5px 12px rgba(0,0,0,.12)}
			.tv-menu-panel{position:fixed;top:0;left:0;bottom:0;width:260px;background:#fff;border-right:1px solid #ddd;box-shadow:4px 0 16px rgba(0,0,0,.18);padding:20px;transform:translateX(-110%);transition:transform .3s ease;z-index:1000}
			.tv-menu-panel.open{transform:translateX(0)}
			.tv-menu-close{background:none;border:none;font-size:1.5rem;cursor:pointer;color:#333;position:absolute;top:14px;right:14px}
			.tv-menu-item{display:block;width:100%;padding:12px 14px;margin:10px 0;border:1px solid #3d4488;border-radius:999px;background:#eef2ff;color:#0b1f70;cursor:pointer;text-align:center;transition:transform .15s ease,box-shadow .15s ease,background .2s ease;font-weight:600}
			.tv-menu-item:hover{transform:translateY(-2px);box-shadow:0 5px 12px rgba(0,0,0,.12);background:#dbe6ff}
			.tv-menu-title{font-size:50px; margin-bottom:14px;font-weight:700;color:#16225e}
			.tv-menu-description{color:#555;font-size:.95rem;line-height:1.4}
			.tv-form-group{margin-bottom:14px}
			.tv-form-group label{display:block;margin-bottom:6px;font-weight:600}
			.tv-form-group input,.tv-form-group textarea{width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:1rem}
			.tv-form-group textarea{resize:none}
			.tv-support-box{background:#eef2ff;padding:16px;border-radius:10px;border:1px solid #d7e0ff}
			.tv-btn.ghost{background:#f4f4f4}
			.tv-btn.primary{background:#2b7cff;color:#fff}
			.tv-cart{border:1px solid #eeeeee25;padding:12px;border-radius:6px;background:#fafafa;width:320px}
			.tv-grid{display:flex;gap:16px}
			.tv-empty{color:#777}
			.cart-image{width:30px;height:30px;border-radius:4px;object-fit:cover}
			@media (max-width:800px){.tv-grid{flex-direction:column}.tv-cart{width:100%}}
		`;
		const s = document.createElement('style');
		s.textContent = css;
		document.head.appendChild(s);
	}

	// --- Renderizado ---
	// Esta función construye la estructura inicial del DOM y activa los
	// eventos principales del header, el menú y el carrito.
	function renderApp() {
		document.body.innerHTML = '';
		injectStyles();

		const container = document.createElement('div');
		container.className = 'tv-container';

		const grid = document.createElement('div');
		grid.className = 'tv-grid';

		// Header
		const header = document.createElement('div');
		header.className = 'tv-header';
		header.innerHTML = `
			<button type="button" class="tv-title-button">MARKET JUANRR</button>
			<button type="button" class="tv-hamburger" aria-label="Abrir menú"><span></span><span></span><span></span></button>
			<div class="tv-header-right">
				<div class="tv-search-container">
					<input id="tv-search-input" class="tv-search-input" type="search" placeholder="Buscar producto..." autocomplete="off">
					<div id="tv-search-results" class="tv-search-results"></div>
				</div>
				<div id="tv-header-actions" class="tv-header-actions"></div>
				<div id="tv-cart-summary"></div>
			</div>
		`;
		// .tv-title-button: vuelve a la vista principal.
		// .tv-hamburger: abre/cierra el menú lateral.
		// .tv-header-actions: botones de login/registro o logout.
		// .tv-cart-summary: muestra el total de items en el carrito.

		const mainWrap = document.createElement('main');
		mainWrap.id = 'tv-main-content';
		mainWrap.style.flex = '1';

		const cartWrap = document.createElement('aside');
		cartWrap.innerHTML = '<h3>Carrito</h3><div id="tv-cart" class="tv-cart"></div>';

		const menuPanel = document.createElement('div');
		menuPanel.id = 'tv-menu-panel';
		menuPanel.className = 'tv-menu-panel';
		menuPanel.innerHTML = `
			<button class="tv-menu-close" aria-label="Cerrar menú">×</button>
			<div class="tv-menu-title">Menú</div>
			<div class="tv-menu-description">Accede rápidamente a comprar, vender o soporte.</div>
			<div id="tv-menu-links"></div>
		`;

		grid.appendChild(mainWrap);
		grid.appendChild(cartWrap);

		container.appendChild(header);
		container.appendChild(grid);
		document.body.appendChild(container);
		document.body.appendChild(menuPanel);

		const titleButton = $('.tv-title-button');
		titleButton.onclick = () => {
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
		};

		const hamburger = $('.tv-hamburger');
		const menuClose = $('.tv-menu-close');

		// El botón del menú se usa para alternar la visibilidad del panel lateral.
		hamburger.onclick = () => {
			const isOpen = menuPanel.classList.toggle('open');
			toggleHeaderActions(!isOpen);
		};
		menuClose.onclick = () => {
			menuPanel.classList.remove('open');
			toggleHeaderActions(true);
		};

		setupSearchInput();

		window.addEventListener('hashchange', () => {
			state.view = parseHash();
			renderView();
		});

		renderHeaderActions();
		renderMenuButtons(menuPanel);
		state.view = parseHash();
		renderView();
		renderCart();
		updateCartSummary();
	}

	// Convierte el hash de la URL en una vista de la aplicación.
	// Por ejemplo: #product-1 -> vista de producto con id 1.
	function parseHash() {
		const hash = location.hash.slice(1);
		if (!hash || hash === 'home') return { page: 'home', productId: null };
		const productMatch = hash.match(/^product-(\d+)$/);
		if (productMatch) {
			return { page: 'product', productId: Number(productMatch[1]) };
		}
		if (hash === 'sell') return { page: 'sell', productId: null };
		if (hash === 'support') return { page: 'support', productId: null };
		if (hash === 'login') return { page: 'login', productId: null };
		if (hash === 'register') return { page: 'register', productId: null };
		return { page: 'home', productId: null };
	}

	// Cambia el hash de la URL sin recargar la página.
	function setHash(hash) {
		const newHash = hash.startsWith('#') ? hash : `#${hash}`;
		if (location.hash !== newHash) {
			location.hash = newHash;
		}
	}

	// Selecciona qué vista debe renderizarse según el estado actual.
	function renderView() {
		if (state.view.page === 'product' && state.view.productId != null) {
			renderProductDetail(state.view.productId);
		} else if (state.view.page === 'sell') {
			renderSellPage();
		} else if (state.view.page === 'support') {
			renderSupportPage();
		} else if (state.view.page === 'login') {
			renderLoginPage();
		} else if (state.view.page === 'register') {
			renderRegisterPage();
		} else {
			renderHome();
		}
		renderHeaderActions();
	}

	// Renderiza la página principal con la lista de productos.
	function renderHome() {
		const main = $('#tv-main-content');
		if (!main) return;
		main.innerHTML = '<h3>Productos</h3><div class="tv-products" id="tv-products"></div>';
		renderProducts();
	}

	// Renderiza la vista detallada de un producto seleccionado.
	// Incluye imagen, descripción, precio y botón para agregar al carrito.
	function renderProductDetail(productId) {
		const main = $('#tv-main-content');
		const p = state.products.find(x => x.id === productId);
		if (!main) return;
		if (!p) {
			main.innerHTML = '<div class="tv-empty">Producto no encontrado.</div>';
			return;
		}

		main.innerHTML = `
			<div class="tv-card product-detail">
				<h3>${p.name}</h3>
				${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/320x240?text=Sin+imagen'">` : ''}
				<div>${p.description || ''}</div>
				<div style="margin:12px 0"><strong>Precio:</strong> $${p.price.toFixed(2)}</div>
				<div><strong>Stock:</strong> ${p.stock}</div>
				<div class="tv-actions">
					<button class="tv-btn primary" id="tv-detail-add">Agregar al carrito</button>
					<button class="tv-btn ghost" id="tv-detail-back">Volver</button>
				</div>
			</div>
		`;

		$('#tv-detail-add').onclick = () => {
			addToCart(productId, 1);
		};
		$('#tv-detail-back').onclick = () => {
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
		};
	}

	// Renderiza la página para que un usuario suba un producto nuevo.
	// Los datos se validan y la imagen se lee como un data URL.
	function renderSellPage() {
		const main = $('#tv-main-content');
		if (!main) return;
		main.innerHTML = `
			<div class="tv-card">
				<h3>Vender producto</h3>
				<div class="tv-form-group">
					<label for="tv-sell-title">Título</label>
					<input id="tv-sell-title" type="text" maxlength="60" placeholder="Nombre del producto">
				</div>
				<div class="tv-form-group">
					<label for="tv-sell-description">Descripción (80 caracteres)</label>
					<textarea id="tv-sell-description" rows="4" maxlength="80" placeholder="Descripción breve"></textarea>
				</div>
				<div class="tv-form-group">
					<label for="tv-sell-price">Valor</label>
					<input id="tv-sell-price" type="number" min="0.01" step="0.01" placeholder="0.00">
				</div>
				<div class="tv-form-group">
					<label for="tv-sell-stock">Stock</label>
					<input id="tv-sell-stock" type="number" min="1" step="1" value="1">
				</div>
				<div class="tv-form-group">
					<label for="tv-sell-image">Imagen</label>
					<input id="tv-sell-image" type="file" accept="image/*">
				</div>
				<div class="tv-actions">
					<button class="tv-btn primary" id="tv-sell-submit">Subir producto</button>
					<button class="tv-btn ghost" id="tv-sell-cancel">Cancelar</button>
				</div>
			</div>
		`;

		$('#tv-sell-cancel').onclick = () => {
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
		};

		$('#tv-sell-submit').onclick = () => {
			const title = $('#tv-sell-title').value.trim();
			const description = $('#tv-sell-description').value.trim();
			const price = parseFloat($('#tv-sell-price').value);
			const stock = Math.max(1, parseInt($('#tv-sell-stock').value, 10) || 1);
			const imageInput = $('#tv-sell-image');
			if (!title || !description || !price || price <= 0 || !imageInput || !imageInput.files.length) {
				alert('Completa todos los campos y sube una imagen.');
				return;
			}
			if (description.length > 80) {
				alert('La descripción debe tener como máximo 80 caracteres.');
				return;
			}
			const file = imageInput.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const imageData = reader.result;
				const nextId = state.products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
				state.products.push({
					id: nextId,
					name: title,
					price: price,
					stock: stock,
					description: description,
					image: imageData
				});
				saveProducts();
				alert('Producto subido correctamente.');
				setHash('home');
				state.view = { page: 'home', productId: null };
				renderView();
			};
			reader.readAsDataURL(file);
		};
	}

	// Renderiza la página de soporte con información de contacto.
	function renderSupportPage() {
		const main = $('#tv-main-content');
		if (!main) return;
		main.innerHTML = `
			<div class="tv-card">
				<h3>Soporte</h3>
				<div class="tv-support-box">
					<p>¿Necesitas ayuda? Puedes escribirnos a:</p>
					<p><strong>soporte@marketjuanrr.local</strong></p>
					<p>También puedes usar el menú para volver a comprar o vender tus productos.</p>
				</div>
			</div>
		`;
	}

	// Control visual de los botones de sesión en el header.
	// Cuando el menú lateral está abierto, escondemos estas acciones
	// para evitar duplicar botones y mantener la interfaz clara.
	function toggleHeaderActions(show) {
		const headerActions = $('#tv-header-actions');
		if (!headerActions) return;
		headerActions.style.display = show ? 'flex' : 'none';
	}

	// Renderiza los botones de sesión que aparecen en el header.
	// Se muestran diferentes opciones según si hay un usuario logueado.
	// Renderiza los botones de autenticación en el header.
	// Dependiendo del estado de sesión, muestra login/register o logout.
	function renderHeaderActions() {
		const actions = $('#tv-header-actions');
		if (!actions) return;
		if (state.user && state.user.email) {
			actions.innerHTML = `
				<span class="tv-header-greeting">Hola, ${state.user.email}</span>
				<button class="tv-auth-button" id="tv-logout-header">Cerrar sesión</button>
			`;
			$('#tv-logout-header').onclick = logout;
		} else {
			actions.innerHTML = `
				<button class="tv-auth-button" id="tv-login-header">Iniciar sesión</button>
				<button class="tv-auth-button" id="tv-register-header">Crear cuenta</button>
			`;
			$('#tv-login-header').onclick = () => {
				setHash('login');
				state.view = { page: 'login', productId: null };
				renderView();
			};
			$('#tv-register-header').onclick = () => {
				setHash('register');
				state.view = { page: 'register', productId: null };
				renderView();
			};
		}
	}

	// Construye los botones del menú lateral.
	// El menú puede mostrar enlaces de navegación y opciones de sesión.
	function renderMenuButtons(menuPanel) {
		const menuLinks = $('#tv-menu-links');
		if (!menuLinks) return;
		const items = [
			{ label: 'Comprar', page: 'home' },
			{ label: 'Vender', page: 'sell' },
			{ label: 'Soporte', page: 'support' }
		];
		if (state.user && state.user.email) {
			items.push({ label: 'Cerrar sesión', page: 'logout' });
		} else {
			items.push({ label: 'Iniciar sesión', page: 'login' });
			items.push({ label: 'Crear cuenta', page: 'register' });
		}
		menuLinks.innerHTML = items.map(item => `<button class="tv-menu-item" data-menu="${item.page}">${item.label}</button>`).join('');
		$$('.tv-menu-item', menuLinks).forEach(btn => {
			btn.onclick = () => {
				const target = btn.getAttribute('data-menu');
				if (target === 'logout') {
					logout();
					menuPanel.classList.remove('open');
					toggleHeaderActions(true);
					return;
				}
				state.view = { page: target, productId: null };
				setHash(target);
				renderView();
				menuPanel.classList.remove('open');
				toggleHeaderActions(true);
			};
		});
	}

	// Renderiza la pantalla de inicio de sesión.
	// Si el usuario ingresa con éxito, se fusiona su carrito previo con el carrito de invitado.
	function renderLoginPage() {
		const main = $('#tv-main-content');
		if (!main) return;
		main.innerHTML = `
			<div class="tv-card">
				<h3>Iniciar sesión</h3>
				<div class="tv-form-group">
					<label for="tv-login-email">Correo</label>
					<input id="tv-login-email" type="email" placeholder="usuario@correo.com">
				</div>
				<div class="tv-form-group">
					<label for="tv-login-password">Clave</label>
					<input id="tv-login-password" type="password" placeholder="********">
				</div>
				<div class="tv-actions">
					<button class="tv-btn primary" id="tv-login-submit">Entrar</button>
					<button class="tv-btn ghost" id="tv-login-cancel">Cancelar</button>
				</div>
			</div>
		`;
		$('#tv-login-cancel').onclick = () => {
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
		};
		$('#tv-login-submit').onclick = () => {
			const email = $('#tv-login-email').value.trim().toLowerCase();
			const password = $('#tv-login-password').value;
			if (!email || !password) {
				alert('Completa correo y clave.');
				return;
			}
			const user = state.users[email];
			if (!user || user.password !== password) {
				alert('Usuario o clave incorrectos.');
				return;
			}
			state.user = user;
			setCurrentUser(email);
			const merged = mergeCarts(user.cart || [], state.guestCart || []);
			state.user.cart = merged;
			state.cart = merged;
			state.users[email] = state.user;
			saveUsers();
			state.guestCart = [];
			saveGuestCart();
			renderHeaderActions();
			renderMenuButtons($('#tv-menu-panel'));
			renderCart();
			updateCartSummary();
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
			alert('Has iniciado sesión correctamente.');
		};
	}

	// Renderiza la pantalla de registro de cuenta nueva.
	// Al crear la cuenta, el carrito de invitado se asocia al nuevo usuario.
	function renderRegisterPage() {
		const main = $('#tv-main-content');
		if (!main) return;
		main.innerHTML = `
			<div class="tv-card">
				<h3>Crear cuenta</h3>
				<div class="tv-form-group">
					<label for="tv-register-email">Correo</label>
					<input id="tv-register-email" type="email" placeholder="usuario@correo.com">
				</div>
				<div class="tv-form-group">
					<label for="tv-register-password">Clave</label>
					<input id="tv-register-password" type="password" placeholder="********">
				</div>
				<div class="tv-actions">
					<button class="tv-btn primary" id="tv-register-submit">Crear cuenta</button>
					<button class="tv-btn ghost" id="tv-register-cancel">Cancelar</button>
				</div>
			</div>
		`;
		$('#tv-register-cancel').onclick = () => {
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
		};
		$('#tv-register-submit').onclick = () => {
			const email = $('#tv-register-email').value.trim().toLowerCase();
			const password = $('#tv-register-password').value;
			if (!email || !password) {
				alert('Completa correo y clave.');
				return;
			}
			if (state.users[email]) {
				alert('Ya existe una cuenta con ese correo.');
				return;
			}
			const newUser = { email, password, cart: mergeCarts([], state.guestCart || []) };
			state.users[email] = newUser;
			saveUsers();
			setCurrentUser(email);
			state.user = newUser;
			state.cart = newUser.cart;
			state.guestCart = [];
			saveGuestCart();
			renderHeaderActions();
			renderMenuButtons($('#tv-menu-panel'));
			renderCart();
			updateCartSummary();
			setHash('home');
			state.view = { page: 'home', productId: null };
			renderView();
			alert('Cuenta creada y carrito guardado.');
		};
	}

	// Cierra sesión del usuario actual y convierte el carrito en carrito de invitado.
	function logout() {
		state.guestCart = state.cart;
		saveGuestCart();
		setCurrentUser(null);
		state.cart = state.guestCart;
		renderHeaderActions();
		renderMenuButtons($('#tv-menu-panel'));
		renderCart();
		updateCartSummary();
		setHash('home');
		state.view = { page: 'home', productId: null };
		renderView();
		alert('Has cerrado sesión.');
	}

	// Renderiza la lista de productos en la vista principal.
	// Cada tarjeta incluye botones para agregar al carrito o ver detalle.
	function renderProducts() {
		const wrap = $('#tv-products');
		wrap.innerHTML = '';
		const products = getFilteredProducts(state.searchQuery);
		if (!products.length) {
			wrap.innerHTML = '<div class="tv-empty">No se encontraron productos para esa búsqueda.</div>';
			return;
		}
		products.forEach(p => {
			const card = document.createElement('div');
			card.className = 'tv-card';
			card.innerHTML = `
				<h4>${p.name}</h4>
				${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/320x240?text=Sin+imagen'">` : ''}
				<div>${p.description || ''}</div>
				<div style="margin-top:8px">Precio: <strong>$${p.price.toFixed(2)}</strong></div>
				<div>Stock: ${p.stock}</div>
				<div class="tv-actions">
					<button class="tv-btn primary" data-add="${p.id}">Agregar</button>
					<button class="tv-btn ghost" data-view="${p.id}">Ver</button>
				</div>
			`;
			wrap.appendChild(card);

			// Hacer toda la tarjeta clickable para abrir el detalle
			card.addEventListener('click', (e) => {
				// Si el clic viene de un botón de acción, no navegamos
				if (e.target.closest('.tv-btn')) return;
				setHash(`product-${p.id}`);
				state.view = { page: 'product', productId: p.id };
				renderView();
			});
		});

		// Delegación para botones
		const main = $('#tv-main-content');
		if (!main) return;

		$$('.tv-btn[data-add]', main).forEach(btn => {
			btn.onclick = () => {
				const id = Number(btn.getAttribute('data-add'));
				addToCart(id, 1);
			};
		});

		$$('.tv-btn[data-view]', main).forEach(btn => {
			btn.onclick = () => {
				const id = Number(btn.getAttribute('data-view'));
				setHash(`product-${id}`);
				state.view = { page: 'product', productId: id };
				renderView();
			};
		});
	}

	// Renderiza el contenido del carrito en la barra lateral.
	// Incluye controles para cambiar cantidad y pagar o vaciar el carrito.
	function renderCart() {
		const wrap = $('#tv-cart');
		wrap.innerHTML = '';
		if (state.cart.length === 0) {
			wrap.innerHTML = '<div class="tv-empty">El carrito está vacío</div>';
			return;
		}

		const list = document.createElement('div');
		state.cart.forEach(item => {
			const p = state.products.find(x => x.id === item.productId);
			const row = document.createElement('div');
			row.style.display = 'flex';
			row.style.justifyContent = 'space-between';
			row.style.padding = '6px 0';
			row.style.alignItems = 'center';
			row.innerHTML = `
				<div style="display:flex;align-items:center;gap:10px;max-width:200px;">
					${p.image ? `<img src="${p.image}" alt="${p.name}" class="cart-image">` : ''}
					<div>
						<strong>${p.name}</strong><br><small>$${p.price.toFixed(2)} x ${item.quantity}</small>
					</div>
				</div>
				<div style="display:flex;gap:6px;align-items:center;">
					<button class="tv-btn tv-icon-btn" data-dec="${p.id}" aria-label="Restar">−</button>
					<button class="tv-btn tv-icon-btn" data-inc="${p.id}" aria-label="Sumar">+</button>
					<button class="tv-btn tv-icon-btn" data-rem="${p.id}" aria-label="Eliminar">✕</button>
				</div>
			`;
			list.appendChild(row);
		});

		// Totales
		const subtotal = state.cart.reduce((s, it) => {
			const p = state.products.find(x => x.id === it.productId);
			return s + p.price * it.quantity;
		}, 0);

		const totals = document.createElement('div');
		totals.style.marginTop = '10px';
		totals.innerHTML = `
			<div><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</div>
			<div style="margin-top:8px">
				<button class="tv-btn primary" id="tv-checkout">Pagar</button>
				<button class="tv-btn ghost" id="tv-clear">Vaciar</button>
			</div>
		`;

		wrap.appendChild(list);
		wrap.appendChild(totals);

		// botones del carrito
		$$('#tv-cart [data-inc]').forEach(b => b.onclick = () => changeQty(Number(b.getAttribute('data-inc')), 1));
		$$('#tv-cart [data-dec]').forEach(b => b.onclick = () => changeQty(Number(b.getAttribute('data-dec')), -1));
		$$('#tv-cart [data-rem]').forEach(b => b.onclick = () => removeFromCart(Number(b.getAttribute('data-rem'))));
		$('#tv-checkout').onclick = checkout;
		$('#tv-clear').onclick = clearCart;
	}

	// Actualiza el resumen del carrito en el header derecho.
	function updateCartSummary() {
		const sum = state.cart.reduce((s, it) => s + it.quantity, 0);
		const el = $('#tv-cart-summary');
		if (el) el.textContent = `Carrito: ${sum} item(s)`;
	}

	// --- Lógica del carrito ---
	// Agrega un producto al carrito o aumenta la cantidad si ya está agregado.
	function addToCart(productId, qty = 1) {
		const product = state.products.find(p => p.id === productId);
		if (!product) return;
		const existing = state.cart.find(i => i.productId === productId);
		if (existing) {
			if (existing.quantity + qty > product.stock) {
				alert('No hay suficiente stock');
				return;
			}
			existing.quantity += qty;
		} else {
			if (qty > product.stock) {
				alert('No hay suficiente stock');
				return;
			}
			state.cart.push({ productId, quantity: qty });
		}
		saveCart(); // persiste el carrito según el estado de sesión
		renderCart();
		updateCartSummary();
	}

	// Cambia la cantidad de un producto en el carrito.
	// delta puede ser +1 o -1 según el botón presionado.
	function changeQty(productId, delta) {
		const item = state.cart.find(i => i.productId === productId);
		if (!item) return;
		const product = state.products.find(p => p.id === productId);
		const newQty = item.quantity + delta;
		if (newQty <= 0) {
			removeFromCart(productId);
			return;
		}
		if (newQty > product.stock) {
			alert('No hay suficiente stock');
			return;
		}
		item.quantity = newQty;
		saveCart();
		renderCart();
		updateCartSummary();
	}

	// Elimina un producto completo del carrito.
	function removeFromCart(productId) {
		state.cart = state.cart.filter(i => i.productId !== productId);
		saveCart();
		renderCart();
		updateCartSummary();
	}

	// Vacía el carrito después de pedir confirmación.
	function clearCart() {
		if (!confirm('Vaciar el carrito?')) return;
		state.cart = [];
		saveCart();
		renderCart();
		updateCartSummary();
	}

	// Finaliza la compra: revisa el total, actualiza stock y limpia el carrito.
	function checkout() {
		if (state.cart.length === 0) { alert('El carrito está vacío'); return; }
		const subtotal = state.cart.reduce((s, it) => {
			const p = state.products.find(x => x.id === it.productId);
			return s + p.price * it.quantity;
		}, 0);
		if (!confirm(`Confirmar pago de $${subtotal.toFixed(2)}?`)) return;

		// Reducir stock de los productos vendidos.
		state.cart.forEach(it => {
			const p = state.products.find(x => x.id === it.productId);
			if (p) p.stock -= it.quantity;
		});
		state.cart = [];
		saveCart();
		saveProducts();
		state.view = { page: 'home', productId: null };
		setHash('home');
		renderView();
		renderCart();
		updateCartSummary();
		alert('Gracias por tu compra!');
	}

	// Inicializa la aplicación cuando el DOM está listo.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', renderApp);
	} else {
		renderApp();
	}

})();

