/**
 * Archivo: pedidos.js
 * Descripción: Lógica del cliente para la página de pedidos
 * Este archivo se encarga de la interacción con la API para gestionar pedidos y sus detalles
 */
// Controlador de Pedidos en el cliente
const PedidoController = {
    // Obtener todos los pedidos con filtros opcionales
    async obtenerPedidos(filtroMesa = null, filtroFecha = null) {
        try {
            let url = '/api/pedidos';
            const params = new URLSearchParams();
            if (filtroMesa) params.append('mesa', filtroMesa);
            if (filtroFecha) params.append('fecha', filtroFecha);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            throw error;
        }
    },

    // Obtener un pedido específico por su ID
    async obtenerPedidoPorId(id) {
        try {
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error al obtener el pedido #${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo pedido
    async crearPedido(pedidoData) {
        try {
            // Validación básica del lado del cliente
            if (!pedidoData.numeroMesa) {
                throw new Error('El número de mesa es requerido');
            }

            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(pedidoData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            throw error;
        }
    },

    // Eliminar un pedido
    async eliminarPedido(id) {
        try {
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error al eliminar el pedido #${id}:`, error);
            throw error;
        }
    }
};

// Controlador de Detalles de Pedido en el cliente
const DetallePedidoController = {
    // Crear un nuevo detalle de pedido
    async crearDetalle(detalleData) {
        try {
            // Validación básica del lado del cliente
            if (!detalleData.idPedido || !detalleData.cantidad) {
                throw new Error('Datos incompletos para crear el detalle');
            }

            const response = await fetch('/api/detalles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(detalleData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al crear el detalle:', error);
            throw error;
        }
    },

    // Eliminar un detalle
    async eliminarDetalle(id) {
        try {
            const response = await fetch(`/api/detalles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error al eliminar el detalle #${id}:`, error);
            throw error;
        }
    }
};

// Controlador del Menú en el cliente
const MenuController = {
    // Obtener todas las opciones de menú disponibles
    async obtenerOpciones() {
        try {
            const response = await fetch('/api/platos', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al obtener opciones del menú:', error);
            throw error;
        }
    }
};

// Controlador de la Vista - Maneja la presentación de datos
const VistaController = {
    // Mostrar los pedidos en la interfaz
    mostrarPedidos(pedidos) {
        const $contenedor = $('#listaPedidos');
        $contenedor.empty();
        
        if (pedidos.length === 0) {
            $contenedor.html(`
                <div class="col-12 alert alert-info">
                    <i class="bi bi-info-circle"></i> No hay pedidos disponibles.
                </div>
            `);
            return;
        }
        
        // Ordenar pedidos por fecha (más recientes primero)
        pedidos.sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
        
        pedidos.forEach(pedido => {
            const $template = $(document.getElementById('pedidoTemplate').content.cloneNode(true));
            $template.find('.pedido-id').text(pedido.id);
            $template.find('.mesa-numero').text(pedido.numeroMesa);
            $template.find('.pedido-plato').text(pedido.nombreMenu || 'Sin plato asignado');
            
            // Formatear fecha
            const fecha = new Date(pedido.createAt);
            const fechaFormateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
            $template.find('.pedido-fecha').text(fechaFormateada);
            
            // Agregar ID al botón
            $template.find('.btn-ver-detalles').attr('data-id', pedido.id);
            
            $contenedor.append($template);
        });
    },

    // Llenar el select con las opciones de menú
    llenarSelectMenu(platos) {
        const $select = $('#selectMenu');
        $select.find('option:not(:first)').remove();
        
        platos.forEach(plato => {
            $select.append(`<option value="${plato.id}">${plato.nombre} - $${plato.precio.toFixed(2)}</option>`);
        });
    },

    // Mostrar los detalles de un pedido en el modal
    mostrarDetallesPedido(pedidoCompleto) {
        // Guardar el ID del pedido en el formulario
        $('#pedidoId').val(pedidoCompleto.id);
        
        // Mostrar información básica del pedido
        $('#detalleMesa').text(pedidoCompleto.numeroMesa);
        $('#detallePlatoPrincipal').text(pedidoCompleto.nombreMenu || 'Sin plato asignado');
        
        // Calcular y mostrar precio total
        const precioPlato = pedidoCompleto.precio || 0;
        const precioDetalles = pedidoCompleto.detalles?.reduce((total, detalle) => {
            return total + (detalle.cantidad * (detalle.precio || 0));
        }, 0) || 0;
        
        const precioTotal = precioPlato + precioDetalles;
        $('#detallePrecio').text(`${precioTotal.toFixed(2)}`);
        
        // Formatear fecha
        const fecha = new Date(pedidoCompleto.createAt);
        const fechaFormateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
        $('#detalleFecha').text(fechaFormateada);
        
        // Mostrar detalles
        const $listaDetalles = $('#listaDetalles');
        $listaDetalles.empty();
        
        if (!pedidoCompleto.detalles || pedidoCompleto.detalles.length === 0) {
            $listaDetalles.html('<p class="text-muted">No hay detalles adicionales</p>');
        } else {
            pedidoCompleto.detalles.forEach(detalle => {
                const $template = $(document.getElementById('detalleTemplate').content.cloneNode(true));
                $template.find('.detalle-cantidad').text(`x${detalle.cantidad}`);
                $template.find('.detalle-observacion').text(detalle.observacion || 'Sin observaciones');
                $template.find('.btn-eliminar-detalle').attr('data-id', detalle.id);
                $listaDetalles.append($template);
            });
        }
        
        // Abrir modal
        $('#detallesPedidoModal').modal('show');
    },

    // Mostrar notificaciones al usuario
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Tipos: success, danger, warning, info
        const colores = {
            success: '#198754',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#0d6efd'
        };
        
        // Crear elemento de notificación
        const $notificacion = $(`
            <div class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true" style="background-color: ${colores[tipo] || colores.info}">
                <div class="d-flex">
                    <div class="toast-body text-white">
                        ${mensaje}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `);
        
        // Crear contenedor si no existe
        if (!$('#notificacionesContainer').length) {
            $('body').append(`
                <div id="notificacionesContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>
            `);
        }
        
        // Agregar a contenedor
        $('#notificacionesContainer').append($notificacion);
        
        // Crear objeto Toast de Bootstrap y mostrarlo
        const toast = new bootstrap.Toast($notificacion, { autohide: true, delay: 5000 });
        toast.show();
        
        // Eliminar después de ocultarse
        $notificacion.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
};

// Inicialización y eventos
$(document).ready(function() {
    // Cargar todos los pedidos al iniciar
    cargarPedidos();
    
    // Cargar opciones de menú para el formulario
    cargarOpcionesMenu();
    
    // Event listener para el botón de filtrar
    $('#btnFiltrar').click(function() {
        cargarPedidos();
    });
    
    // Event listener para crear nuevo pedido
    $('#btnGuardarPedido').click(function() {
        guardarNuevoPedido();
    });
    
    // Event listener para agregar nuevo detalle
    $('#formNuevoDetalle').submit(function(e) {
        e.preventDefault();
        agregarDetallePedido();
    });
    
    // Event listener para eliminar pedido
    $('#btnEliminarPedido').click(function() {
        const pedidoId = $('#pedidoId').val();
        if (pedidoId) {
            eliminarPedido(pedidoId);
        }
    });
    
    // Delegación de eventos para los botones de ver detalles
    $('#listaPedidos').on('click', '.btn-ver-detalles', function() {
        const pedidoId = $(this).data('id');
        cargarDetallesPedido(pedidoId);
    });
    
    // Delegación de eventos para los botones de eliminar detalle
    $('#listaDetalles').on('click', '.btn-eliminar-detalle', function() {
        const detalleId = $(this).data('id');
        if (detalleId) {
            eliminarDetalle(detalleId);
        }
    });
});

// Función para cargar los pedidos
async function cargarPedidos() {
    try {
        const filtroMesa = $('#filtroMesa').val();
        const filtroFecha = $('#filtroFecha').val();
        
        // Mostrar indicador de carga
        $('#listaPedidos').html(`
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando pedidos...</p>
            </div>
        `);
        
        const pedidos = await PedidoController.obtenerPedidos(filtroMesa, filtroFecha);
        VistaController.mostrarPedidos(pedidos);
    } catch (error) {
        $('#listaPedidos').html(`
            <div class="col-12 alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Error al cargar los pedidos: ${error.message}
            </div>
        `);
        VistaController.mostrarNotificacion(`Error al cargar pedidos: ${error.message}`, 'danger');
    }
}

// Función para cargar las opciones del menú
async function cargarOpcionesMenu() {
    try {
        const platos = await MenuController.obtenerOpciones();
        VistaController.llenarSelectMenu(platos);
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al cargar opciones del menú: ${error.message}`, 'danger');
    }
}

// Función para guardar un nuevo pedido
async function guardarNuevoPedido() {
    const numeroMesa = $('#numeroMesa').val();
    const idMenu = $('#selectMenu').val();
    
    if (!numeroMesa) {
        VistaController.mostrarNotificacion('Debe ingresar un número de mesa', 'warning');
        return;
    }
    
    if (!idMenu) {
        VistaController.mostrarNotificacion('Debe seleccionar un plato del menú', 'warning');
        return;
    }
    
    const pedido = {
        numeroMesa: parseInt(numeroMesa),
        idMenu: parseInt(idMenu)
    };
    
    try {
        await PedidoController.crearPedido(pedido);
        $('#nuevoPedidoModal').modal('hide');
        $('#formNuevoPedido')[0].reset();
        await cargarPedidos();
        VistaController.mostrarNotificacion('Pedido creado correctamente', 'success');
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al crear el pedido: ${error.message}`, 'danger');
    }
}

// Función para cargar los detalles de un pedido
async function cargarDetallesPedido(pedidoId) {
    try {
        const pedidoCompleto = await PedidoController.obtenerPedidoPorId(pedidoId);
        VistaController.mostrarDetallesPedido(pedidoCompleto);
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al cargar los detalles del pedido: ${error.message}`, 'danger');
    }
}

// Función para agregar un detalle a un pedido
async function agregarDetallePedido() {
    const pedidoId = $('#pedidoId').val();
    const cantidad = $('#cantidad').val();
    const observacion = $('#observacion').val();
    
    if (!cantidad || cantidad <= 0) {
        VistaController.mostrarNotificacion('Debe ingresar una cantidad válida', 'warning');
        return;
    }
    
    const detalle = {
        idPedido: parseInt(pedidoId),
        cantidad: parseInt(cantidad),
        observacion: observacion || ''
    };
    
    try {
        await DetallePedidoController.crearDetalle(detalle);
        // Limpiar formulario
        $('#cantidad').val(1);
        $('#observacion').val('');
        // Recargar detalles del pedido
        await cargarDetallesPedido(pedidoId);
        VistaController.mostrarNotificacion('Detalle agregado correctamente', 'success');
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al agregar el detalle: ${error.message}`, 'danger');
    }
}

// Función para eliminar un detalle
async function eliminarDetalle(detalleId) {
    if (confirm('¿Está seguro que desea eliminar este detalle?')) {
        const pedidoId = $('#pedidoId').val();
        try {
            await DetallePedidoController.eliminarDetalle(detalleId);
            await cargarDetallesPedido(pedidoId);
            VistaController.mostrarNotificacion('Detalle eliminado correctamente', 'success');
        } catch (error) {
            VistaController.mostrarNotificacion(`Error al eliminar el detalle: ${error.message}`, 'danger');
        }
    }
}

// Función para eliminar un pedido
async function eliminarPedido(pedidoId) {
    if (confirm('¿Está seguro que desea eliminar este pedido? Esta acción eliminará también todos los detalles asociados.')) {
        try {
            await PedidoController.eliminarPedido(pedidoId);
            $('#detallesPedidoModal').modal('hide');
            await cargarPedidos();
            VistaController.mostrarNotificacion('Pedido eliminado correctamente', 'success');
        } catch (error) {
            VistaController.mostrarNotificacion(`Error al eliminar el pedido: ${error.message}`, 'danger');
        }
    }
}