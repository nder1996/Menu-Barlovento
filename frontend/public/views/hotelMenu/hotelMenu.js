/**
 * Archivo: hotelMenu.js
 * Descripción: Script para la gestión de la carta del restaurante
 * Muestra todos los platos organizados por categorías y permite hacer pedidos
 */

$(document).ready(function () {    // Variables para almacenar datos
    let menuItems = []; // Array para almacenar todos los elementos del menú
    let categorias = []; // Array para almacenar todas las categorías
    let categoriaActual = null; // Para el filtrado por categoría
    
    // Variables para almacenar pedidos por mesa (1-8)
    let ordersByTable = {
        // Mesa 1-8: {items: [], total: 0}
    };
    
    // Variables para el pedido actual (el que se está visualizando/editando)
    let currentOrder = {
        tableNumber: null,
        items: [], // {id, nombre, cantidad, precioUnitario, observaciones}
        total: 0
    };

    // Inicializar la carta
    inicializarCarta();

    /**
     * Inicializa la carta del restaurante
     */
    async function inicializarCarta() {
        try {
            // Cargar primero las categorías
            await cargarCategorias();
            
            // Luego cargar los elementos del menú
            await cargarMenuItems();
            
            // Mostrar toda la carta
            mostrarMenuCompleto();
        } catch (error) {
            console.error('Error al inicializar la carta:', error);
            mostrarError('No se pudo cargar la carta del restaurante. Por favor, intenta más tarde.');
        }
    }    /**
     * Carga las categorías desde la API
     */
    async function cargarCategorias() {
        try {
            console.log('Intentando cargar categorías desde: /api/categorias');
            
            // Primero probamos el endpoint de test para confirmar que la API funciona
            try {
                const testResponse = await fetch('/api/test');
                const testResult = await testResponse.json();
                console.log('Test API response:', testResult);
            } catch (testError) {
                console.error('Error en test de API:', testError);
            }
            
            const response = await fetch('/api/categorias', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Respuesta no ok al cargar categorías:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Contenido de la respuesta de error:', errorText);
                throw new Error(`Error al cargar categorías: ${response.status} - ${response.statusText}`);
            }

            categorias = await response.json();
            console.log('Categorías cargadas:', categorias);
            
            // Actualizar el menú desplegable de categorías
            actualizarMenuCategorias();
        } catch (error) {
            console.error('Error al cargar las categorías:', error);
            mostrarError(`Error al cargar categorías: ${error.message}`);
            throw error;
        }
    }    /**
     * Carga los elementos del menú desde la API
     */
    async function cargarMenuItems() {
        try {
            console.log('Intentando cargar platos desde: /api/platos');
            
            const response = await fetch('/api/platos', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Respuesta no ok al cargar platos:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Contenido de la respuesta de error:', errorText);
                throw new Error(`Error al cargar menú: ${response.status} - ${response.statusText}`);
            }

            menuItems = await response.json();
            
            // Filtrar sólo los platos activos
            menuItems = menuItems.filter(item => item.estado);
            
            console.log('Elementos del menú cargados:', menuItems);
            
            // Enriquecer datos con nombres de categoría
            enriquecerDatosMenu();
        } catch (error) {
            console.error('Error al cargar los elementos del menú:', error);
            mostrarError(`Error al cargar platos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Actualiza el menú desplegable de categorías
     */
    function actualizarMenuCategorias() {
        const $dropdown = $('#categoriasDropdown');
        $dropdown.empty();

        categorias.forEach(categoria => {
            $dropdown.append(`
                <li><a class="dropdown-item categoria-filter" data-id="${categoria.id}" href="#">${categoria.nombre}</a></li>
            `);
        });

        // Agregar manejador de eventos para el filtrado por categoría
        $('.categoria-filter').on('click', function(e) {
            e.preventDefault();
            const categoriaId = parseInt($(this).data('id'));
            filtrarPorCategoria(categoriaId);
        });
    }

    /**
     * Enriquece los datos del menú con los nombres de categoría
     */
    function enriquecerDatosMenu() {
        menuItems = menuItems.map(item => {
            const categoriaRelacionada = categorias.find(cat => cat.id === item.idCategoria);
            return {
                ...item,
                categoriaTexto: categoriaRelacionada ? categoriaRelacionada.nombre : `Categoría ${item.idCategoria}`
            };
        });
    }

    /**
     * Muestra todos los elementos del menú agrupados por categoría
     */
    function mostrarMenuCompleto() {
        const $container = $('#menuContainer');
        $container.empty();

        // Agrupar los platos por categoría
        const platosPorCategoria = {};
        
        menuItems.forEach(item => {
            if (!platosPorCategoria[item.idCategoria]) {
                platosPorCategoria[item.idCategoria] = [];
            }
            platosPorCategoria[item.idCategoria].push(item);
        });

        // Ordenar las categorías según el orden del array categorias
        const categoriasOrdenadas = [...categorias].sort((a, b) => a.id - b.id);

        // Crear una sección para cada categoría
        categoriasOrdenadas.forEach(categoria => {
            const platosDeCategoria = platosPorCategoria[categoria.id] || [];
            
            if (platosDeCategoria.length === 0) return; // No mostrar categorías vacías
            
            // Crear sección para la categoría
            const seccionCategoria = $(`
                <div class="col-12 categoria-section mb-4" data-categoria-id="${categoria.id}">
                    <h3 class="category-title">${categoria.nombre}</h3>
                    <div class="row platos-container">
                        <!-- Aquí van los platos de esta categoría -->
                    </div>
                </div>
            `);
            
            // Agregar cada plato a la categoría
            const $platosContainer = seccionCategoria.find('.platos-container');
            
            platosDeCategoria.forEach(plato => {
                // Formatear el precio
                const formattedPrice = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(plato.precio);
                
                const platoCard = $(`
                    <div class="col-md-6 col-lg-4">
                        <div class="card dish-card">
                            <div class="card-body">
                                <h5 class="dish-name">${plato.nombre}</h5>
                                <p class="dish-description">${plato.descripcion || 'Sin descripción'}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="dish-price">${formattedPrice}</span>
                                    <button class="btn btn-sm btn-outline-dark view-dish-btn" 
                                            data-id="${plato.id}"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#dishModal">
                                        <i class="bi bi-eye"></i> Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                
                $platosContainer.append(platoCard);
            });
            
            $container.append(seccionCategoria);
        });
        
        // Si no hay platos, mostrar mensaje
        if (Object.keys(platosPorCategoria).length === 0) {
            $container.html('<div class="col-12 text-center"><p>No hay platos disponibles en este momento.</p></div>');
        }
        
        // Activar eventos para ver detalles del plato
        $('.view-dish-btn').on('click', function() {
            const platoId = $(this).data('id');
            mostrarDetallePlato(platoId);
        });
    }

    /**
     * Filtra los platos por categoría
     */
    function filtrarPorCategoria(categoriaId) {
        categoriaActual = categoriaId;
        
        // Mostrar la categoría seleccionada
        $('.categoria-section').hide();
        $(`.categoria-section[data-categoria-id="${categoriaId}"]`).show();
    }    /**
     * Muestra los detalles de un plato específico
     */
    function mostrarDetallePlato(platoId) {
        const plato = menuItems.find(p => p.id === platoId);
        
        if (!plato) {
            console.error('Plato no encontrado:', platoId);
            return;
        }
        
        // Formatear el precio
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(plato.precio);
        
        // Actualizar el modal con los detalles del plato
        $('#modalDishId').val(plato.id);
        $('#modalDishName').text(plato.nombre);
        $('#modalDishCategory').text(plato.categoriaTexto);
        $('#modalDishPrice').text(formattedPrice);
        $('#modalDishDescription').text(plato.descripcion || 'Sin descripción disponible.');
        
        // Reset form fields
        $('#dishQuantity').val(1);
        $('#dishObservations').val('');
        
        // Si ya hay un pedido en curso para una mesa, preseleccionar la mesa
        if (currentOrder.tableNumber) {
            $('#tableNumber').val(currentOrder.tableNumber);
        } else {
            $('#tableNumber').val('');
        }
        
        // Actualizar el total
        updateOrderTotal();
    }

    /**
     * Muestra todos los pedidos activos de las diferentes mesas
     */
    function mostrarTodosPedidos() {
        const $container = $('#allOrdersContainer');
        $container.empty();
        
        // Verificar si hay pedidos activos
        const mesasConPedidos = Object.keys(ordersByTable);
        
        if (mesasConPedidos.length === 0) {
            $container.html(`
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay pedidos activos en ninguna mesa en este momento.
                    </div>
                </div>
            `);
            return;
        }
        
        // Ordenar las mesas numéricamente
        mesasConPedidos.sort((a, b) => parseInt(a) - parseInt(b));
        
        // Crear una tarjeta para cada mesa con pedido
        mesasConPedidos.forEach(mesa => {
            const pedidoMesa = ordersByTable[mesa];
            const totalFormateado = formatPrice(pedidoMesa.total);
            
            // Crear el resumen del pedido
            let pedidoResumen = '';
            pedidoMesa.items.forEach(item => {
                pedidoResumen += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <span class="fw-bold">${item.cantidad}x</span> ${item.nombre}
                            ${item.observaciones ? '<small class="text-muted d-block">(' + item.observaciones + ')</small>' : ''}
                        </div>
                        <div>${formatPrice(item.precioUnitario * item.cantidad)}</div>
                    </div>
                `;
            });
            
            // Crear la tarjeta para esta mesa
            const mesaCard = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-header bg-primary text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Mesa ${mesa}</h5>
                                <span class="badge bg-light text-dark">${pedidoMesa.items.length} item(s)</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="order-items">
                                ${pedidoResumen}
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between align-items-center">
                                <strong>Total:</strong>
                                <span class="fs-5">${totalFormateado}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="d-flex justify-content-between">
                                <button class="btn btn-sm btn-outline-primary btn-ver-mesa" data-mesa="${mesa}">
                                    <i class="bi bi-pencil"></i> Editar
                                </button>
                                <button class="btn btn-sm btn-success btn-confirmar-mesa" data-mesa="${mesa}">
                                    <i class="bi bi-check-lg"></i> Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $container.append(mesaCard);
        });
        
        // Añadir manejadores de eventos para los botones de cada mesa
        $('.btn-ver-mesa').on('click', function() {
            const mesa = $(this).data('mesa');
            $('#allOrdersModal').modal('hide');
            cambiarMesa(mesa);
        });
        
        $('.btn-confirmar-mesa').on('click', function() {
            const mesa = $(this).data('mesa');
            confirmarPedidoDeMesa(mesa);
        });
    }
      /**
     * Confirma el pedido de una mesa específica
     */
    function confirmarPedidoDeMesa(mesa) {
        // Guardar el estado del pedido actual
        const pedidoActualTmp = { ...currentOrder };
        const mesaActualTmp = currentOrder.tableNumber;
        
        // Cerrar el modal de todos los pedidos
        $('#allOrdersModal').modal('hide');
        
        // Cargar el pedido de la mesa seleccionada sin mostrar notificaciones
        cambiarMesa(mesa, false);
        
        // Mostrar el modal de confirmación
        $('#confirmOrderTableNumber').text(mesa);
        $('#confirmOrderModal').modal('show');
        
        // Configurar evento para cuando se cierre el modal de confirmación
        $('#confirmOrderModal').on('hidden.bs.modal', function (e) {
            // Si no se confirmó el pedido, restaurar el pedido anterior
            if (ordersByTable[mesa]) {
                // Volver a la mesa que estaba activa
                if (mesaActualTmp) {
                    cambiarMesa(mesaActualTmp, false);
                }
            }
            // Eliminar este evento para evitar que se acumulen
            $('#confirmOrderModal').off('hidden.bs.modal');
        });
    }
    
    /**
     * Muestra un mensaje de error
     */
    function mostrarError(mensaje) {
        $('#menuContainer').html(`
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    ${mensaje}
                </div>
                <button id="btnReintentar" class="btn btn-primary mt-3">
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    Reintentar
                </button>
            </div>
        `);
        
        $('#btnReintentar').on('click', inicializarCarta);
    }    // Evento para mostrar todos los platos
    $('#btnMostrarTodos').on('click', function() {
        categoriaActual = null;
        $('.categoria-section').show();
    });
    
    // ============= FUNCIONES PARA MANEJAR PEDIDOS =============
    
    /**
     * Actualiza el total del pedido en el modal
     */
    function updateOrderTotal() {
        const cantidad = parseInt($('#dishQuantity').val()) || 1;
        const platoId = parseInt($('#modalDishId').val());
        const plato = menuItems.find(p => p.id === platoId);
        
        if (!plato) return;
        
        const subtotal = plato.precio * cantidad;
        const formattedPrice = formatPrice(subtotal);
        $('#orderTotal').text(formattedPrice);
    }
    
    /**
     * Formatea un precio en pesos colombianos
     */
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }
    
    /**
     * Agrega un plato al pedido actual
     */
    function addToOrder() {
        const platoId = parseInt($('#modalDishId').val());
        const cantidad = parseInt($('#dishQuantity').val()) || 1;
        const observaciones = $('#dishObservations').val().trim();
        const tableNumber = $('#tableNumber').val();
        
        // Validaciones
        if (!tableNumber) {
            showNotification('Por favor, seleccione una mesa', 'warning');
            return false;
        }
        
        if (!platoId) {
            showNotification('Error al identificar el plato', 'danger');
            return false;
        }
        
        // Obtener el plato
        const plato = menuItems.find(p => p.id === platoId);
        if (!plato) {
            showNotification('Plato no encontrado', 'danger');
            return false;
        }        // Si es necesario cambiar de mesa, usar la función cambiarMesa
        if (currentOrder.tableNumber !== tableNumber) {
            cambiarMesa(tableNumber);
        }
        
        // Buscar si el plato ya está en el pedido
        const existingItemIndex = currentOrder.items.findIndex(item => 
            item.id === platoId && item.observaciones === observaciones
        );
        
        if (existingItemIndex >= 0) {
            // Actualizar la cantidad
            currentOrder.items[existingItemIndex].cantidad += cantidad;
            showNotification('Se actualizó la cantidad de "' + plato.nombre + '"', 'info');
        } else {
            // Agregar nuevo item
            currentOrder.items.push({
                id: platoId,
                nombre: plato.nombre,
                cantidad: cantidad,
                precioUnitario: plato.precio,
                observaciones: observaciones,
                subtotal: plato.precio * cantidad
            });
            showNotification('Se agregó "' + plato.nombre + '" al pedido', 'success');
        }
        
        // Recalcular el total
        updateOrderGrandTotal();
        
        // Actualizar la UI
        updateOrderUI();
        
        return true;
    }
      /**
     * Guarda el pedido actual en ordersByTable
     */
    function guardarPedidoActual() {
        if (currentOrder.tableNumber !== null && currentOrder.items.length > 0) {
            ordersByTable[currentOrder.tableNumber] = {
                items: [...currentOrder.items],
                total: currentOrder.total
            };
            console.log(`Pedido de Mesa ${currentOrder.tableNumber} guardado:`, 
                        ordersByTable[currentOrder.tableNumber]);
        }
    }
    
    /**
     * Recalcular el total del pedido
     */
    function updateOrderGrandTotal() {
        currentOrder.total = currentOrder.items.reduce((sum, item) => 
            sum + (item.precioUnitario * item.cantidad), 0);
    }    /**
     * Actualiza la interfaz del pedido actual
     */
    function updateOrderUI() {
        // Guardar el pedido actual en la estructura por mesas
        guardarPedidoActual();
        
        // Mostrar el contenedor del pedido
        $('#currentOrderContainer').removeClass('d-none');
        
        // Actualizar información básica
        $('#orderTableNumber').text(currentOrder.tableNumber);
        $('#orderItemsCount').text(currentOrder.items.length + ' items en el pedido');
        
        // Actualizar indicadores de mesas
        actualizarIndicadoresMesas();
        
        // Actualizar resumen
        if (currentOrder.items.length > 0) {
            let summary = currentOrder.items
                .slice(0, 2)
                .map(item => `${item.cantidad}x ${item.nombre}`)
                .join(', ');
                
            if (currentOrder.items.length > 2) {
                summary += ' y ' + (currentOrder.items.length - 2) + ' más...';
            }
            
            $('#orderItemsSummary').text(summary);
        } else {
            $('#orderItemsSummary').text('Todavía no hay items en el pedido.');
        }
        
        // Actualizar total
        $('#orderGrandTotal').text(formatPrice(currentOrder.total));
    }
    
    /**
     * Muestra una notificación en pantalla
     */
    function showNotification(message, type = 'success') {
        // Crear el elemento de notificación
        const notification = $(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        
        // Agregar al contenedor
        $('#notificationsContainer').prepend(notification);
        
        // Autodestruir después de 5 segundos
        setTimeout(() => {
            notification.alert('close');
        }, 5000);
    }
    
    /**
     * Actualiza la tabla de detalles del pedido
     */
    function updateOrderDetailsTable() {
        const $tbody = $('#orderDetailsList');
        $tbody.empty();
        
        if (currentOrder.items.length === 0) {
            $tbody.html('<tr><td colspan="7" class="text-center">No hay items en el pedido</td></tr>');
            return;
        }
        
        // Agregar filas
        currentOrder.items.forEach((item, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.nombre}</td>
                    <td>${item.cantidad}</td>
                    <td>${formatPrice(item.precioUnitario)}</td>
                    <td>${item.observaciones || '<em>Sin observaciones</em>'}</td>
                    <td>${formatPrice(item.precioUnitario * item.cantidad)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-remove-item" data-index="${index}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            
            $tbody.append(row);
        });
        
        // Actualizar el total del modal
        $('#modalOrderTotal').text(formatPrice(currentOrder.total));
        $('#modalOrderTableNumber').text(currentOrder.tableNumber);
        $('#confirmOrderTableNumber').text(currentOrder.tableNumber);
        
        // Configurar los botones de eliminar
        $('.btn-remove-item').on('click', function() {
            const itemIndex = parseInt($(this).data('index'));
            removeOrderItem(itemIndex);
        });
    }
    
    /**
     * Elimina un item del pedido
     */
    function removeOrderItem(index) {
        if (index >= 0 && index < currentOrder.items.length) {
            const removedItem = currentOrder.items.splice(index, 1)[0];
            updateOrderGrandTotal();
            updateOrderUI();
            updateOrderDetailsTable();
            showNotification(`Se eliminó "${removedItem.nombre}" del pedido`, 'info');
            
            // Si no quedan items, ocultar el panel del pedido
            if (currentOrder.items.length === 0) {
                $('#currentOrderContainer').addClass('d-none');
                currentOrder.tableNumber = null;
            }
        }
    }
      /**
     * Limpia completamente el pedido actual
     */
    function clearOrder() {
        // Eliminar el pedido de la mesa actual de la estructura de datos
        if (currentOrder.tableNumber !== null) {
            // Borrar el pedido de la mesa
            delete ordersByTable[currentOrder.tableNumber];
            console.log(`Pedido de Mesa ${currentOrder.tableNumber} eliminado`);
        }
        
        currentOrder = {
            tableNumber: null,
            items: [],
            total: 0
        };
        
        // Ocultar el panel del pedido
        $('#currentOrderContainer').addClass('d-none');
          // Cerrar el modal
        $('#orderModal').modal('hide');
        
        // Actualizar indicadores de mesas
        actualizarIndicadoresMesas();
        
        showNotification('Pedido eliminado', 'info');
    }
      /**
     * Confirma y envía el pedido al servidor
     */
    async function confirmOrder() {
        if (currentOrder.items.length === 0) {
            showNotification('No hay items en el pedido para confirmar', 'warning');
            return;
        }
        
        try {
            console.log('Preparando datos para enviar pedido...');
            
            // Preparar datos para enviar
            const orderData = {
                numeroMesa: parseInt(currentOrder.tableNumber),
                createAt: new Date().toISOString(),
                updateAt: new Date().toISOString(),
                platos: currentOrder.items.map(item => ({
                    idMenu: item.id,
                    cantidad: item.cantidad,
                    observacion: item.observaciones || ''
                }))
            };
            
            console.log('Datos del pedido a enviar:', orderData);
            
            // Enviar pedido al servidor
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            console.log('Respuesta del servidor:', response.status);
            
            if (!response.ok) {
                console.error('Error HTTP:', response.status);
                let errorMsg = 'Error al procesar el pedido';
                try {
                    const errorData = await response.json();
                    console.error('Datos del error:', errorData);
                    errorMsg = errorData.error || `Error HTTP: ${response.status}`;
                } catch (e) {
                    // Si no se puede parsear como JSON, usar el texto de error
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);
                    errorMsg = errorText || errorMsg;
                }
                throw new Error(errorMsg);
            }
            
            const resultado = await response.json();
            console.log('Respuesta exitosa:', resultado);
            
            // Mostrar mensaje de éxito
            showNotification(`¡Pedido #${resultado.id || 'nuevo'} confirmado con éxito!`, 'success');
            
            // Reiniciar el pedido
            clearOrder();
            
            // Cerrar modales
            $('#confirmOrderModal').modal('hide');
            
        } catch (error) {
            console.error('Error al confirmar el pedido:', error);
            showNotification('Error al confirmar el pedido: ' + error.message, 'danger');
        }
    }
    
    // ========== CONFIGURACIÓN DE EVENTOS DE PEDIDOS ==========
    
    // Incrementar/decrementar cantidad
    $('#increaseQuantity').on('click', function() {
        let value = parseInt($('#dishQuantity').val()) || 0;
        $('#dishQuantity').val(Math.min(value + 1, 10)); // Máximo 10 unidades
        updateOrderTotal();
    });
    
    $('#decreaseQuantity').on('click', function() {
        let value = parseInt($('#dishQuantity').val()) || 2;
        $('#dishQuantity').val(Math.max(value - 1, 1)); // Mínimo 1 unidad
        updateOrderTotal();
    });
    
    // Actualizar precio al cambiar la cantidad manualmente
    $('#dishQuantity').on('change input', function() {
        let value = parseInt($(this).val()) || 1;
        $(this).val(Math.min(Math.max(value, 1), 10)); // Entre 1 y 10
        updateOrderTotal();
    });
    
    // Botón "Añadir al pedido"
    $('#btnAddToOrder').on('click', function() {
        const success = addToOrder();
        if (success) {
            $('#dishModal').modal('hide');
        }
    });
    
    // Botón para ver el pedido completo
    $('#btnViewOrder').on('click', function() {
        updateOrderDetailsTable();
        $('#orderModal').modal('show');
    });
    
    // Botón para limpiar el pedido
    $('#btnClearOrder').on('click', function() {
        if (confirm('¿Está seguro que desea eliminar todo el pedido?')) {
            clearOrder();
        }
    });
    
    // Botones para confirmar el pedido
    $('#btnConfirmOrder, #btnModalConfirmOrder').on('click', function() {
        $('#confirmOrderModal').modal('show');
    });
    
    // Botón de confirmación final
    $('#btnFinalConfirmOrder').on('click', function() {
        confirmOrder();
    });
    
    // Botón para ver todos los pedidos
    $('#btnVerTodosPedidos').on('click', function() {
        mostrarTodosPedidos();
        $('#allOrdersModal').modal('show');
    });
      /**
     * Cambia a la mesa especificada cargando su pedido si existe
     * @param {string|number} tableNumber - Número de mesa
     * @param {boolean} showNotifications - Indica si se deben mostrar notificaciones (default: true)
     */
    function cambiarMesa(tableNumber, showNotifications = true) {
        if (!tableNumber) return;
        
        // Guardar el pedido actual antes de cambiar
        guardarPedidoActual();
        
        // Limpiar interfaz del pedido anterior
        if (currentOrder.items.length === 0) {
            $('#currentOrderContainer').addClass('d-none');
        }
        
        // Cargar el pedido de la nueva mesa si existe
        if (ordersByTable[tableNumber]) {
            currentOrder = {
                tableNumber: tableNumber,
                items: [...ordersByTable[tableNumber].items],
                total: ordersByTable[tableNumber].total
            };
            // Mostrar el contenedor del pedido
            $('#currentOrderContainer').removeClass('d-none');            // Actualizar la UI
            updateOrderUI();
            console.log(`Cargado pedido de Mesa ${tableNumber}`, currentOrder);
            
            if (showNotifications) {
                showNotification(`Cargado pedido existente de Mesa ${tableNumber}`, 'info');
            }
        } else {
            // Crear un nuevo pedido para esta mesa
            currentOrder = {
                tableNumber: tableNumber,
                items: [],
                total: 0
            };
            console.log(`Iniciado nuevo pedido para Mesa ${tableNumber}`);
            
            if (showNotifications) {
                showNotification(`Iniciado nuevo pedido para Mesa ${tableNumber}`, 'success');
            }
        }
        
        // Actualizar el selector de mesa
        $('#tableNumber').val(tableNumber);
    }
    
    // Cambio de mesa en el selector
    $('#tableNumber').on('change', function() {
        const nuevaMesa = $(this).val();
        if (nuevaMesa) {
            cambiarMesa(nuevaMesa);
        }
    });
      /**
     * Actualiza el selector de mesas marcando las que tienen pedidos
     */
    function actualizarIndicadoresMesas() {
        // Contar mesas con pedidos activos
        const mesasConPedidos = Object.keys(ordersByTable);
        const numMesasConPedidos = mesasConPedidos.length;
        
        // Actualizar contador en la interfaz
        $('#mesasPedidosCount').text(
            numMesasConPedidos === 1 
                ? '1 mesa con pedido activo' 
                : `${numMesasConPedidos} mesas con pedidos activos`
        );
        
        // Mostrar u ocultar la alerta según haya pedidos o no
        if (numMesasConPedidos > 0) {
            $('.alert-info').removeClass('d-none');
        } else {
            $('.alert-info').addClass('d-none');
        }
        
        // Limpiar marcadores existentes
        $('#tableNumber option').each(function() {
            const mesaValue = $(this).val();
            if (!mesaValue) return; // Saltar la opción "Seleccione una mesa"
            
            // Comprobar si esta mesa tiene un pedido
            if (ordersByTable[mesaValue]) {
                const numItems = ordersByTable[mesaValue].items.length;
                $(this).text(`Mesa ${mesaValue} (${numItems} platos)`);
                $(this).addClass('text-success');
            } else {
                $(this).text(`Mesa ${mesaValue}`);
                $(this).removeClass('text-success');
            }
        });
    }
});