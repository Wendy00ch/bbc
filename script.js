// script.js - Carga dinámica de productos + funcionalidades interactivas

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado - Iniciando script...');
    
    // 1. PRIMERO: Cargar los datos del JSON
    cargarDatosProductos();
    
    // 2. Configurar navbar para dispositivos móviles
    configurarNavbar();
    
    // 3. Configurar funcionalidades del carrito y búsqueda
    configurarInteracciones();
});

// =================== FUNCIÓN PRINCIPAL PARA CARGAR DATOS ===================
async function cargarDatosProductos() {
    try {
        console.log('📦 Cargando datos de productos...');
        
        // INTENTA DIFERENTES RUTAS (GitHub Pages puede ser especial)
        const rutasPosibles = [
            './data/products.json',           // Ruta relativa estándar
            'data/products.json',             // Sin punto
            '/data/products.json',            // Desde raíz
            'products.json'                   // Directamente
        ];
        
        let data = null;
        let ultimoError = null;
        
        // Intentar cada ruta posible
        for (const ruta of rutasPosibles) {
            try {
                console.log(`🔄 Intentando ruta: ${ruta}`);
                const response = await fetch(ruta);
                
                if (response.ok) {
                    data = await response.json();
                    console.log(`✅ Éxito cargando desde: ${ruta}`);
                    console.log(`📊 Productos encontrados: ${data.productos ? data.productos.length : 0}`);
                    break;
                } else {
                    console.log(`❌ Ruta ${ruta} - Status: ${response.status}`);
                }
            } catch (error) {
                ultimoError = error;
                console.log(`❌ Error en ruta ${ruta}:`, error.message);
            }
        }
        
        // Si no se cargó ningún archivo
        if (!data) {
            throw new Error(`No se pudo cargar products.json. Último error: ${ultimoError ? ultimoError.message : 'Desconocido'}`);
        }
        
        // Verificar si tenemos productos
        if (data.productos && data.productos.length > 0) {
            console.log(`🎯 Productos listos: ${data.productos.length}`);
            
            // A. Cargar producto destacado
            cargarProductoDestacado(data.productos);
            
            // B. Cargar productos recomendados
            cargarProductosRecomendados(data.productos);
            
        } else {
            console.warn('⚠️ No se encontraron productos en el JSON');
            mostrarErrorCarga('El archivo JSON no contiene productos.');
        }
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        // Mostrar un mensaje amigable al usuario
        mostrarErrorCarga(error.message);
    }
}

// =================== FUNCIONES PARA CARGAR PRODUCTOS ===================
function cargarProductoDestacado(productos) {
    console.log('🛒 Buscando producto destacado...');
    
    // Buscar producto destacado (con propiedad destacado: true)
    let productoDestacado = productos.find(p => p.destacado === true);
    
    // Si no hay ninguno destacado, usar el primero
    if (!productoDestacado) {
        productoDestacado = productos[0];
        console.log('ℹ️ No hay producto destacado, usando el primero:', productoDestacado.nombre);
    } else {
        console.log('⭐ Producto destacado encontrado:', productoDestacado.nombre);
    }
    
    if (productoDestacado) {
        // Actualizar título
        const tituloElement = document.querySelector('.product-title');
        if (tituloElement) {
            tituloElement.textContent = productoDestacado.nombre;
            console.log('📝 Título actualizado');
        }
        
        // Actualizar precio
        const precioElement = document.querySelector('.product-price');
        if (precioElement) {
            let precioHTML = `<span class="current-price">US$ ${productoDestacado.precio.toFixed(2)}</span>`;
            
            // Si hay precio original y descuento, mostrarlos
            if (productoDestacado.precioOriginal && productoDestacado.descuento) {
                precioHTML += `
                    <span style="text-decoration: line-through; color: #999; font-size: 18px; margin-left: 10px;">
                        US$ ${productoDestacado.precioOriginal.toFixed(2)}
                    </span>
                    <span style="color: #d97777; font-weight: bold; margin-left: 10px;">
                        ${productoDestacado.descuento}% OFF
                    </span>`;
            }
            
            precioElement.innerHTML = precioHTML;
            console.log('💰 Precio actualizado');
        }
        
        // Actualizar descripción
        const descripcionElement = document.querySelector('.editor-note p');
        if (descripcionElement && productoDestacado.descripcion) {
            descripcionElement.textContent = productoDestacado.descripcion;
            console.log('📄 Descripción actualizada');
        }
        
        // Actualizar imagen
        const imagenElement = document.querySelector('.product-image');
        if (imagenElement) {
            const colorFondo = getColorPorMarca(productoDestacado.marca);
            imagenElement.innerHTML = `
                <div style="background-color: ${colorFondo}; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <span style="color: rgba(0,0,0,0.5); font-size: 18px; font-weight: bold;">${productoDestacado.marca}</span>
                </div>
            `;
            console.log('🖼️ Imagen actualizada');
        }
    }
}

function cargarProductosRecomendados(productos) {
    console.log('📱 Cargando productos recomendados...');
    
    const gridElement = document.querySelector('.products-grid');
    if (!gridElement) {
        console.error('❌ No se encontró .products-grid');
        return;
    }
    
    // Limpiar contenido existente
    gridElement.innerHTML = '';
    
    // Filtrar productos no destacados
    let productosParaMostrar = productos.filter(p => !p.destacado || p.destacado === false);
    
    // Si no tenemos suficientes productos no destacados, mezclar con destacados
    if (productosParaMostrar.length < 5) {
        console.log(`ℹ️ Solo ${productosParaMostrar.length} productos no destacados, agregando destacados`);
        productosParaMostrar = productos.slice(0, 5);
    } else {
        productosParaMostrar = productosParaMostrar.slice(0, 5);
    }
    
    console.log(`🛍️ Mostrando ${productosParaMostrar.length} productos recomendados`);
    
    // Crear tarjetas para cada producto
    productosParaMostrar.forEach(producto => {
        const colorFondo = getColorPorMarca(producto.marca);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = producto.id;
        
        productCard.innerHTML = `
            <div class="product-card-image" style="background-color: ${colorFondo}">
                ${producto.marca}
            </div>
            
            <div class="product-card-info">
                <h3 class="product-card-title">${producto.nombre}</h3>
                
                <div class="product-card-price">
                    <span class="product-current-price">US$ ${producto.precio.toFixed(2)}</span>
                    ${producto.precioOriginal && producto.descuento ? 
                        `<span style="text-decoration: line-through; color: #999; font-size: 14px; margin-left: 5px;">
                            US$ ${producto.precioOriginal.toFixed(2)}
                        </span>
                        <span style="color: #d97777; font-size: 14px; margin-left: 5px;">
                            ${producto.descuento}% OFF
                        </span>` 
                        : ''}
                </div>
                
                <button class="btn-add" style="margin-top: 10px; width: 100%;">AGREGAR A LA CESTA</button>
            </div>
        `;
        
        gridElement.appendChild(productCard);
    });
    
    // Re-configurar los eventos de los botones de carrito para los nuevos productos
    configurarBotonesCarrito();
    console.log('✅ Productos recomendados cargados');
}

// =================== FUNCIONES DE NAVBAR ===================
function configurarNavbar() {
    console.log('🔧 Configurando navbar...');
    
    const navItems = document.querySelectorAll('.nav-item');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        console.log('📱 Dispositivo táctil detectado');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = item.querySelector('.dropdown-menu');
                    
                    document.querySelectorAll('.dropdown-menu').forEach(d => {
                        if (d !== dropdown) d.style.display = 'none';
                    });
                    
                    if (dropdown.style.display === 'block') {
                        dropdown.style.display = 'none';
                    } else {
                        dropdown.style.display = 'block';
                    }
                }
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.dropdown-menu').forEach(d => {
                    d.style.display = 'none';
                });
            }
        });
    }
    
    if (!isTouchDevice) {
        console.log('💻 Modo desktop detectado');
        
        navItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const dropdown = this.querySelector('.dropdown-menu');
                dropdown.style.display = 'block';
            });
            
            item.addEventListener('mouseleave', function() {
                const dropdown = this.querySelector('.dropdown-menu');
                dropdown.style.display = 'none';
            });
        });
    }
    
    console.log('✅ Navbar configurado');
}

// =================== FUNCIONES DE INTERACCIÓN ===================
function configurarInteracciones() {
    console.log('⚙️ Configurando interacciones...');
    configurarBotonesCarrito();
    configurarBusqueda();
    console.log('✅ Interacciones configuradas');
}

function configurarBotonesCarrito() {
    const addToCartButtons = document.querySelectorAll('.btn-add');
    console.log(`🛒 Encontrados ${addToCartButtons.length} botones de carrito`);
    
    addToCartButtons.forEach(button => {
        // Eliminar eventos anteriores
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Volver a seleccionar después de clonar
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const productCard = this.closest('.product-card');
            const productInfo = this.closest('.product-info');
            
            let productTitle, productPrice;
            
            if (productCard) {
                productTitle = productCard.querySelector('.product-card-title').textContent;
                productPrice = productCard.querySelector('.product-current-price').textContent;
            } else if (productInfo) {
                productTitle = productInfo.querySelector('.product-title').textContent;
                productPrice = productInfo.querySelector('.current-price').textContent;
            }
            
            if (productTitle && productPrice) {
                // Mostrar mensaje
                alert(`✅ Producto agregado al carrito:\n${productTitle}\nPrecio: ${productPrice}`);
                
                // Animación del botón
                const originalText = this.textContent;
                this.textContent = '¡AGREGADO!';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '#333';
                    this.style.color = 'white';
                }, 2000);
                
                // Actualizar contador del carrito
                actualizarContadorCarrito();
            }
        });
    });
}

function configurarBusqueda() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
        console.log('🔍 Búsqueda configurada');
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        alert(`🔍 Buscando: "${searchTerm}"\n\nEn una versión completa, aquí se filtrarían los productos según tu búsqueda.`);
    }
}

// =================== FUNCIONES AUXILIARES ===================
function getColorPorMarca(marca) {
    const coloresMarcas = {
        'Beauty of Joseon': '#f0e6d6',
        'celimax': '#e6f0f7',
        'Dr. Althea': '#f7e6e6',
        'Punto SEOUL': '#e6f7e9',
        'AP LB': '#f0e6f7',
        'COSRX': '#e6f4f7',
        'I\'m from': '#f7f0e6',
        'LANEIGE': '#e6e7f7',
        'default': '#f5f5f5'
    };
    
    return coloresMarcas[marca] || coloresMarcas.default;
}

function actualizarContadorCarrito() {
    const cartIcon = document.querySelector('.fa-shopping-cart');
    if (!cartIcon) return;
    
    const cartContainer = cartIcon.parentElement;
    
    // Crear o actualizar el badge
    let badge = cartContainer.querySelector('.cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #d97777;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        cartContainer.style.position = 'relative';
        cartContainer.appendChild(badge);
    }
    
    // Incrementar contador
    let currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
    console.log(`🛒 Carrito actualizado: ${currentCount + 1} productos`);
}

function mostrarErrorCarga(mensaje) {
    console.error('❌ Mostrando error al usuario:', mensaje);
    
    const productosGrid = document.querySelector('.products-grid');
    if (productosGrid) {
        productosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: #666; margin-bottom: 20px;">
                    ⚠️ No se pudieron cargar los productos. 
                    <br><small>Error: ${mensaje || 'Desconocido'}</small>
                </p>
                <button onclick="cargarDatosProductos()" style="
                    background-color: #333;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 5px;
                ">
                    Reintentar
                </button>
                <button onclick="location.reload()" style="
                    background-color: #d97777;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 5px;
                ">
                    Recargar Página
                </button>
            </div>
        `;
    }
}

// =================== DEBUG - PARA VERIFICAR ===================
// Esto ayudará a ver si el script se carga
console.log('🎯 script.js cargado correctamente');
console.log('📍 URL actual:', window.location.href);
console.log('🖥️ User Agent:', navigator.userAgent);