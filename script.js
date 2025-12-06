// script.js - Carga dinámica de productos + funcionalidades interactivas

document.addEventListener('DOMContentLoaded', function() {
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
        console.log('Cargando datos de productos...');
        
        // Cargar el archivo products.json
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Productos cargados:', data.productos.length);
        
        // Verificar si tenemos productos
        if (data.productos && data.productos.length > 0) {
            // A. Cargar producto destacado (primero que tenga destacado: true o el primero)
            cargarProductoDestacado(data.productos);
            
            // B. Cargar productos recomendados
            cargarProductosRecomendados(data.productos);
        } else {
            console.warn('No se encontraron productos en el JSON');
        }
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Mostrar un mensaje amigable al usuario
        mostrarErrorCarga();
    }
}

// =================== FUNCIONES PARA CARGAR PRODUCTOS ===================
function cargarProductoDestacado(productos) {
    // Buscar producto destacado (con propiedad destacado: true)
    let productoDestacado = productos.find(p => p.destacado === true);
    
    // Si no hay ninguno destacado, usar el primero
    if (!productoDestacado) {
        productoDestacado = productos[0];
    }
    
    if (productoDestacado) {
        // Actualizar título
        const tituloElement = document.querySelector('.product-title');
        if (tituloElement) {
            tituloElement.textContent = productoDestacado.nombre;
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
        }
        
        // Actualizar descripción
        const descripcionElement = document.querySelector('.editor-note p');
        if (descripcionElement && productoDestacado.descripcion) {
            descripcionElement.textContent = productoDestacado.descripcion;
        }
        
        // Actualizar imagen (si tuvieras imágenes reales)
        const imagenElement = document.querySelector('.product-image');
        if (imagenElement) {
            // Por ahora solo actualizamos el texto, luego puedes cambiar a imágenes reales
            const colorFondo = getColorPorMarca(productoDestacado.marca);
            imagenElement.innerHTML = `
                <div style="background-color: ${colorFondo}; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <span style="color: rgba(0,0,0,0.5); font-size: 18px; font-weight: bold;">${productoDestacado.marca}</span>
                </div>
            `;
        }
    }
}

function cargarProductosRecomendados(productos) {
    const gridElement = document.querySelector('.products-grid');
    if (!gridElement) return;
    
    // Limpiar contenido existente
    gridElement.innerHTML = '';
    
    // Tomar hasta 5 productos (excluyendo el destacado si es posible)
    const productosParaMostrar = productos
        .filter(p => !p.destacado || p.destacado === false) // Excluir destacado si queremos
        .slice(0, 5);
    
    // Si no tenemos suficientes productos, usar todos
    if (productosParaMostrar.length < 5) {
        productosParaMostrar = productos.slice(0, 5);
    }
    
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
}

// =================== FUNCIONES DE NAVBAR (TU CÓDIGO ORIGINAL) ===================
function configurarNavbar() {
    const navItems = document.querySelectorAll('.nav-item');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
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
}

// =================== FUNCIONES DE INTERACCIÓN ===================
function configurarInteracciones() {
    configurarBotonesCarrito();
    configurarBusqueda();
}

function configurarBotonesCarrito() {
    const addToCartButtons = document.querySelectorAll('.btn-add');
    
    addToCartButtons.forEach(button => {
        // Evitar duplicar eventos
        button.replaceWith(button.cloneNode(true));
    });
    
    // Volver a seleccionar después de clonar
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el clic en el botón active el clic en la tarjeta
            
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
                const originalBg = this.style.backgroundColor;
                const originalColor = this.style.color;
                
                this.textContent = '¡AGREGADO!';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = originalBg;
                    this.style.color = originalColor;
                }, 2000);
                
                // Actualizar contador del carrito (si tuvieras uno)
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
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        alert(`🔍 Buscando: "${searchTerm}"\n\nEn una versión completa, aquí se filtrarían los productos según tu búsqueda.`);
        
        // Podrías implementar búsqueda real aquí:
        // 1. Filtrar productos que contengan searchTerm en nombre, marca o descripción
        // 2. Mostrar resultados en la página
    }
}

// =================== FUNCIONES AUXILIARES ===================
function getColorPorMarca(marca) {
    // Asignar colores consistentes por marca
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
    // Si tuvieras un contador en el ícono del carrito
    const cartIcon = document.querySelector('.fa-shopping-cart').parentElement;
    
    // Crear o actualizar el badge
    let badge = cartIcon.querySelector('.cart-badge');
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
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(badge);
    }
    
    // Incrementar contador
    let currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
}

function mostrarErrorCarga() {
    const productosGrid = document.querySelector('.products-grid');
    if (productosGrid) {
        productosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: #666; margin-bottom: 20px;">
                    ⚠️ No se pudieron cargar los productos. Por favor, verifica tu conexión.
                </p>
                <button onclick="location.reload()" style="
                    background-color: #333;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// =================== INICIALIZACIÓN ADICIONAL ===================
// También puedes cargar categorías dinámicamente si quieres
async function cargarCategorias() {
    try {
        const response = await fetch('data/categories.json');
        const data = await response.json();
        console.log('Categorías cargadas:', data);
        // Aquí podrías actualizar el navbar dinámicamente
    } catch (error) {
        console.warn('No se pudieron cargar las categorías:', error);
    }
}

// Opcional: Cargar categorías al inicio
// cargarCategorias();