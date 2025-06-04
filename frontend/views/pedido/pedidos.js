// Archivo para la gestión de pedidos y sus detalles
/**
 * Este archivo implementa la lógica de la interfaz de usuario para la gestión de pedidos.
 * Se integra con los controladores (PedidoController, MenuController) para realizar
 * las operaciones de comunicación con la API del backend.
 * 
 * La estructura sigue el patrón de arquitectura MVC (Modelo-Vista-Controlador):
 * - Las vistas están en los archivos HTML
 * - Los controladores manejan la comunicación con el backend (/src/controllers)
 * - Este archivo contiene la lógica de presentación y interacción con el usuario
 */

// Definición de URLs de API que se utilizarán a través de los controladores

// Objeto para gestionar los pedidos
const PedidosApp = {
    pedidos: [],
    menuItems: [],
    detallesPedidoActual: [],

    // Inicializar la aplicación
    init: function () {
        console.log('Inicializando PedidosApp...');

        // Cargar los pedidos al iniciar
        this.cargarPedidos();

        // Cargar el menú para el selector
        this.cargarMenu();

        // Eventos para filtros
        $('#btnFiltrar').on('click', this.aplicarFiltros.bind(this));

        // Eventos para nuevo pedido
        $('#btnGuardarPedido').on('click', this.guardarNuevoPedido.bind(this));

        // Eventos para detalles del pedido (delegación de eventos)
        $('#pedidosTableBody').on('click', '.btn-ver-detalles', this.mostrarDetallesPedido.bind(this));

        // Eventos para detalles
        $('#formNuevoDetalle').on('submit', function (e) {
            e.preventDefault();
            PedidosApp.guardarNuevoDetalle();
        });

        // Evento para eliminar un detalle (delegación de eventos)
        $('#detallesTableBody').on('click', '.btn-eliminar-detalle', this.eliminarDetalle.bind(this));

        // Evento para eliminar un pedido
        $('#btnEliminarPedido').on('click', this.eliminarPedido.bind(this));

        // Evento para mostrar la factura del pedido
        $('#btnMostrarFactura').on('click', function () {
            const pedidoId = $('#detalleId').text();
            fetch(`/api/pedidos/${pedidoId}/factura`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert('Error al obtener la factura: ' + data.error);
                    } else {
                        // Aquí puedes mostrar la factura en un modal o nueva ventana
                        alert(`Factura del Pedido ID ${pedidoId}:\n\n` +
                            `Fecha: ${data.fecha}\n` +
                            `Plato Principal: ${data.plato_principal}\n` +
                            `Precio Total: €${data.precio_total}`);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener la factura:', error);
                    alert('Error al obtener la factura.');
                });
        });

        // Evento para mostrar la factura desde la tabla de pedidos
        /* $('#pedidosTableBody').on('click', '.btn-mostrar-factura', function() {
             const pedidoId = $(this).data('id');
             fetch(`/api/pedidos/${pedidoId}/factura`)
                 .then(response => response.json())
                 .then(data => {
                     if (data.error) {
                         alert('Error al obtener la factura: ' + data.error);
                     } else {
                         // Mostrar la factura en un modal o alerta
                         alert(`Factura del Pedido ID ${pedidoId}:\n\n` +
                               `Fecha: ${data.fecha}\n` +
                               `Plato Principal: ${data.plato_principal}\n` +
                               `Precio Total: €${data.precio_total}`);
                     }
                 })
                 .catch(error => {
                     console.error('Error al obtener la factura:', error);
                     alert('Error al obtener la factura.');
                 });
         });*/        // Evento para mostrar la factura en modal desde la tabla de pedidos
        $('#pedidosTableBody').on('click', '.btn-imprimir-factura', function () {
            const pedidoId = $(this).data('id');
            
            // Mostrar modal con factura
            const facturaModal = new bootstrap.Modal(document.getElementById('facturaModal'));
            
            // Actualizar título del modal con el número de pedido
            $('#facturaModalLabel').html(`<i class="bi bi-receipt"></i> Factura del Pedido #${pedidoId}`);
            
            // Mostrar spinner de carga
            $('#facturaModalContent').html(`
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando datos de la factura...</p>
                </div>
            `);
            
            // Mostrar el modal
            facturaModal.show();
            
            // Cargar los datos de la factura
            $.ajax({
                url: `/api/pedidos/${pedidoId}/factura`,
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (data.error) {
                        $('#facturaModalContent').html(`
                            <div class="alert alert-danger">
                                <i class="bi bi-exclamation-triangle"></i> Error al obtener la factura: ${data.error}
                            </div>
                        `);
                    } else {
                        // Formatear la fecha
                        const fecha = new Date(data.fecha);
                        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        // Crear el contenido de la factura
                        let html = `
                            <div class="factura-header">
                                <h3 class="text-center mb-4">Restaurante Barlovento</h3>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>ID Pedido:</strong> ${data.pedido_id}</p>
                                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                                    </div>
                                    <div class="col-md-6 text-end">
                                        <p><strong>Mesa:</strong> ${data.numeroMesa || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <h5 class="mb-3">Detalles del Pedido</h5>
                        `;
                        
                        html += '<table class="table table-bordered table-striped">';
                        html += '<thead class="table-dark"><tr><th>Plato</th><th>Cantidad</th><th>Precio</th><th>Total</th></tr></thead><tbody>';
                        
                        if (Array.isArray(data.detalles) && data.detalles.length > 0) {
                            data.detalles.forEach(function(detalle) {
                                html += `<tr>
                                    <td>${detalle.plato || 'Sin nombre'}</td>
                                    <td>${detalle.cantidad || 0}</td>
                                    <td>€${detalle.precio ? detalle.precio.toFixed(2) : '0.00'}</td>
                                    <td>€${detalle.total ? detalle.total.toFixed(2) : '0.00'}</td>
                                </tr>`;
                            });
                        } else {
                            html += '<tr><td colspan="4" class="text-center">No hay detalles disponibles</td></tr>';
                        }
                        
                        html += '</tbody></table>';
                        html += `<div class="text-end mt-4">
                            <h5>Precio Total: €${data.precio_total ? data.precio_total.toFixed(2) : '0.00'}</h5>
                        </div>`;
                        
                        $('#facturaModalContent').html(html);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error al obtener la factura:', error);
                    $('#facturaModalContent').html(`
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle"></i> Error al obtener la factura. Por favor, inténtelo nuevamente.
                        </div>
                    `);
                }
            });
        });

        // Mostrar notificación de inicio
        this.mostrarNotificacion('Sistema de pedidos cargado correctamente', 'info');
          // Evento para imprimir la factura desde el modal
        $('#btnImprimirFactura').on('click', function() {
            // Crear un iframe oculto para imprimir sin afectar la página actual
            const printFrame = $('<iframe>', {
                name: 'printFrame',
                class: 'd-none' // Oculto
            }).appendTo('body');
            
            const contenidoParaImprimir = $('#facturaModalContent').html();
            const frameDoc = printFrame[0].contentWindow || printFrame[0].contentDocument.document || printFrame[0].contentDocument;
            
            frameDoc.document.open();
            frameDoc.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Factura - Restaurante Barlovento</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                    <style>
                        body { padding: 20px; }
                        .factura-header { margin-bottom: 30px; }
                        .text-end { text-align: right; }
                        @media print {
                            @page { margin: 0.5cm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container py-4">
                        <h2 class="text-center mb-4">Restaurante Barlovento</h2>
                        ${contenidoParaImprimir}
                    </div>
                </body>
                </html>
            `);
            frameDoc.document.close();
            
            // Esperar a que se carguen los estilos
            setTimeout(function() {
                frameDoc.focus();
                frameDoc.print();
                
                // Remover el iframe después de imprimir
                setTimeout(function() {
                    printFrame.remove();
                }, 1000);
            }, 500);
        });
    },

    // Método para cargar los pedidos desde la API
    cargarPedidos: async function (filtros = {}) {
        try {
            // Mostrar indicador de carga
            $('#pedidosTableBody').html(`
                <tr>
                    <td colspan="6" class="text-center py-3">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2 mb-0">Cargando pedidos...</p>
                    </td>
                </tr>
            `);

            // Usar PedidoController para obtener los datos
            this.pedidos = await PedidoController.obtenerPedidos(filtros);
            console.log('Pedidos obtenidos de la API:', this.pedidos);

            // Renderizar los pedidos en la interfaz
            this.renderizarPedidos();

            // Mostrar notificación con el resultado
            const mensaje = this.pedidos.length > 0
                ? `Se han cargado ${this.pedidos.length} pedidos`
                : "No hay pedidos disponibles";
            this.mostrarNotificacion(mensaje, this.pedidos.length > 0 ? 'success' : 'info');

        } catch (error) {
            console.error('Error al cargar pedidos:', error);

            // Mostrar mensaje de error en la interfaz
            $('#pedidosTableBody').html(`
                <tr>
                    <td colspan="6" class="text-center py-3">
                        <div class="alert alert-danger" role="alert">
                            <i class="bi bi-exclamation-triangle-fill"></i> No se pudieron cargar los pedidos. 
                            <button class="btn btn-sm btn-danger ms-2" id="btnReintentarPedidos">
                                <i class="bi bi-arrow-clockwise"></i> Reintentar
                            </button>
                        </div>
                    </td>
                </tr>
            `);

            // Agregar evento para reintentar
            $('#btnReintentarPedidos').on('click', () => this.cargarPedidos(filtros));

            // Mostrar notificación de error
            this.mostrarNotificacion('Error al cargar pedidos', 'danger');
        }
    },
    // Método para cargar el menú usando MenuController
    cargarMenu: async function () {
        try {
            // Usar MenuController para obtener datos del menú
            const data = await MenuController.obtenerOpciones();
            this.menuItems = data;

            // Llenar el selector de platos
            const $select = $('#selectMenu');
            $select.find('option:not(:first)').remove();

            data.forEach(plato => {
                $select.append(`<option value="${plato.id}">${plato.nombre} - €${plato.precio.toFixed(2)}</option>`);
            });
        } catch (err) {
            console.error('Error al cargar menú:', err);
            this.mostrarNotificacion('Error al cargar el menú de platos', 'danger');
        }
    },

    // Método para renderizar los pedidos en la tabla
    renderizarPedidos: function () {
        const $tabla = $('#pedidosTableBody');
        $tabla.empty();

        // Mostrar mensaje si no hay pedidos
        if (this.pedidos.length === 0) {
            $('#sinPedidos').removeClass('d-none');
            return;
        }

        // Ocultar mensaje si hay pedidos
        $('#sinPedidos').addClass('d-none');

        // Ordenar pedidos por fecha de creación (más recientes primero)
        const pedidosOrdenados = [...this.pedidos].sort((a, b) => {
            return new Date(b.createAt) - new Date(a.createAt);
        });

        // Generar filas de tabla para cada pedido
        pedidosOrdenados.forEach(pedido => {            // Buscar el nombre del plato en el menú
            const plato = this.menuItems.find(m => m.id === pedido.idMenu);
            const platoNombre = plato ? plato.nombre : 'Plato no disponible';
            const platoPrecio = plato ? plato.precio : 0;

            // Formatear fecha
            const fecha = new Date(pedido.createAt);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Determinar estado del pedido (podrías tener una lógica más compleja aquí)
            const tiempoTranscurrido = Date.now() - fecha.getTime();
            const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);

            let estado = 'Pendiente';
            let estadoClase = 'bg-warning';

            if (horasTranscurridas < 1) {
                estado = 'Nuevo';
                estadoClase = 'bg-success';
            } else if (horasTranscurridas > 24) {
                estado = 'Antiguo';
                estadoClase = 'bg-secondary';
            }              // Crear la fila
            const precioTotal = pedido.precio_total || 0;
            const fila = `
                <tr class="align-middle" data-id="${pedido.id}">
                    <td class="fw-bold">${pedido.id}</td>
                    <td class="fw-bold">${pedido.numeroMesa}</td>
                    <td>${platoNombre}</td>
                    <td class="text-end fw-bold text-success">$ ${precioTotal.toFixed(2)} COP</td>
                    <td>${fechaFormateada}</td>
                    <td><span class="badge ${estadoClase}">${estado}</span></td>
                    <td class="text-center">
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-info btn-ver-detalles" data-id="${pedido.id}" title="Ver detalles">
                                <i class="bi bi-eye"></i> Detalles
                            </button>
                            <button type="button" class="btn btn-sm btn-danger btn-eliminar" data-id="${pedido.id}" title="Eliminar pedido">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-primary btn-imprimir-factura" data-id="${pedido.id}" title="Ver factura">
                             <i class="bi bi-file-earmark-text"></i> Factura
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            $tabla.append(fila);
        });
    },

    // Método para aplicar filtros
    aplicarFiltros: function () {
        const filtros = {
            mesa: $('#filtroMesa').val(),
            fecha: $('#filtroFecha').val()
        };

        this.cargarPedidos(filtros);
    },
    // Método para guardar un nuevo pedido
    guardarNuevoPedido: async function () {
        const numeroMesa = $('#numeroMesa').val().trim();
        const idMenu = $('#selectMenu').val();

        // Quitar clases de error previas
        $('#numeroMesa, #selectMenu').removeClass('is-invalid');

        // Validaciones
        let isValid = true;
        if (!numeroMesa) {
            $('#numeroMesa').addClass('is-invalid');
            this.mostrarNotificacion('Por favor, ingrese un número de mesa', 'warning');
            isValid = false;
        }

        if (!idMenu) {
            $('#selectMenu').addClass('is-invalid');
            this.mostrarNotificacion('Por favor, seleccione un plato del menú', 'warning');
            isValid = false;
        }

        if (!isValid) return;

        // Datos del pedido
        const nuevoPedido = {
            numeroMesa: parseInt(numeroMesa),
            idMenu: parseInt(idMenu),
            createAt: new Date().toISOString(),
            updateAt: new Date().toISOString()
        };

        // Desactivar el botón de envío y mostrar indicador de carga
        const $submitBtn = $('#btnGuardarPedido');
        const originalBtnHtml = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...');
        // Guardar pedido usando PedidoController
        try {
            // Usar PedidoController para crear el pedido
            await PedidoController.crearPedido(nuevoPedido);

            // Mensaje de éxito
            const platoNombre = this.menuItems.find(m => m.id == idMenu)?.nombre || 'Plato seleccionado';
            this.mostrarNotificacion(`Pedido creado exitosamente: Mesa ${numeroMesa} - ${platoNombre}`, 'success');

            // Cerrar modal
            $('#nuevoPedidoModal').modal('hide');

            // Limpiar formulario
            $('#formNuevoPedido')[0].reset();
            $('#numeroMesa, #selectMenu').removeClass('is-invalid');

            // Recargar pedidos
            this.cargarPedidos();
        } catch (err) {
            console.error('Error al crear pedido:', err);
            this.mostrarNotificacion('Error al crear el pedido. Por favor intente nuevamente.', 'danger');
        } finally {
            // Restaurar botón
            $submitBtn.prop('disabled', false).html(originalBtnHtml);
        }
    },

    // Método para mostrar notificaciones
    mostrarNotificacion: function (mensaje, tipo = 'success') {
        // Crear el elemento toast
        const toastId = `toast-${Date.now()}`;
        const $toast = $(`
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}">
                <div class="toast-header bg-${tipo} text-white">
                    <i class="bi ${tipo === 'success' ? 'bi-check-circle' :
                tipo === 'danger' ? 'bi-exclamation-triangle' :
                    tipo === 'info' ? 'bi-info-circle' :
                        'bi-bell'} me-2"></i>
                    <strong class="me-auto">Barlovento</strong>
                    <small>Ahora</small>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${mensaje}
                </div>
            </div>
        `);

        // Agregar al contenedor
        if (!$('.toast-container').length) {
            $('body').append('<div class="toast-container position-fixed bottom-0 end-0 p-3"></div>');
        }
        $('.toast-container').append($toast);

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            $toast.fadeOut('slow', function () {
                $(this).remove();
            });
        }, 5000);
    },

    // Método para mostrar los detalles de un pedido
    mostrarDetallesPedido: function (e) {
        const pedidoId = $(e.currentTarget).data('id');
        const pedido = this.pedidos.find(p => p.id === pedidoId);

        if (!pedido) {
            this.mostrarNotificacion('Pedido no encontrado', 'danger');
            return;
        }

        // Cambiar el título del modal
        $('#detallesPedidoModal .modal-title').html(`<i class="bi bi-info-circle"></i> Detalles del Pedido #${pedido.id}`);

        // Guardar el ID del pedido actual para operaciones de detalles
        $('#pedidoId').val(pedido.id);
        $('#detalleId').text(pedido.id);

        // Llenar datos básicos del pedido en el modal
        $('#detalleMesa').text(pedido.numeroMesa);

        // Formatear fecha de forma más amigable
        const fecha = new Date(pedido.createAt);
        $('#detalleFecha').text(fecha.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));
        // Buscar el plato en el menú
        const plato = this.menuItems.find(m => m.id === pedido.idMenu);
        $('#detallePlatoPrincipal').text(plato ? plato.nombre : 'Plato no disponible');
        $('#detallePrecio').text(plato ? plato.precio.toFixed(2) : '0.00');

        // Mostrar el precio total del pedido
        $('#detallePrecioTotal').text(pedido.precio_total ? pedido.precio_total.toFixed(2) : '0.00');

        // Resetear el formulario de nuevo detalle
        $('#formNuevoDetalle')[0].reset();

        // Cargar detalles adicionales del pedido
        this.cargarDetallesPedido(pedido.id);

        // Abrir modal
        $('#detallesPedidoModal').modal('show');
    },

    // Método para cargar los detalles de un pedido
    cargarDetallesPedido: function (pedidoId) {
        // Mostrar indicador de carga
        $('#detallesTableBody').html(`
            <tr>
                <td colspan="5" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <span class="ms-2">Cargando detalles...</span>
                </td>
            </tr>
        `);

        // Ocultar mensaje de "sin detalles" mientras se carga
        $('#sinDetalles').addClass('d-none');

        // Usar PedidoController para obtener los detalles
        PedidoController.obtenerDetallesPedido(pedidoId)
            .then(detalles => {
                // Guardar detalles en el estado de la aplicación
                this.detallesPedidoActual = detalles;

                // Verificar si hay detalles
                if (detalles.length === 0) {
                    $('#detallesTableBody').empty();
                    $('#sinDetalles').removeClass('d-none');
                    return;
                }

                // Ocultar mensaje de "sin detalles"
                $('#sinDetalles').addClass('d-none');

                // Renderizar detalles en la tabla
                this.renderizarDetallesPedido(detalles);
            })
            .catch(err => {
                console.error('Error al cargar detalles:', err);
                $('#detallesTableBody').html(`
                    <tr>
                        <td colspan="5" class="text-center py-3">
                            <div class="alert alert-danger">
                                <i class="bi bi-exclamation-circle"></i> Error al cargar los detalles.
                                <button class="btn btn-sm btn-outline-danger ms-2" id="btnReintentarDetalles">
                                    <i class="bi bi-arrow-clockwise"></i> Reintentar
                                </button>
                            </div>
                        </td>
                    </tr>
                `);

                // Evento para reintentar cargar los detalles
                $('#btnReintentarDetalles').on('click', () => {
                    this.cargarDetallesPedido(pedidoId);
                });
            });
    },

    // Método para renderizar detalles del pedido en la tabla
    renderizarDetallesPedido: function (detalles) {
        const $tbody = $('#detallesTableBody');
        $tbody.empty();

        detalles.forEach((detalle, index) => {
            // Crear fila para cada detalle
            let fila = `
                <tr data-id="${detalle.id}">
                    <td>${index + 1}</td>
                    <td class="fw-bold">${detalle.cantidad}x</td>
                    <td>
            `;

            // Agregar información del plato si está disponible
            if (detalle.nombrePlato) {
                const precioFormateado = detalle.precioPlato ? `(€${detalle.precioPlato.toFixed(2)})` : '';
                fila += `<span class="fw-bold text-primary" ${detalle.descripcionPlato ? `title="${detalle.descripcionPlato}"` : ''}>${detalle.nombrePlato} ${precioFormateado}</span>`;
            } else {
                fila += `<span>Artículo adicional</span>`;
            }

            // Continuar con el resto de la fila
            fila += `
                    </td>
                    <td>${detalle.observacion || 'Sin observaciones'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-eliminar-detalle" data-id="${detalle.id}" title="Eliminar detalle">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;

            $tbody.append(fila);
        });

        // Inicializar tooltips para las descripciones
        $('[title]').tooltip();
    },
    // Método para guardar un nuevo detalle
    guardarNuevoDetalle: async function () {
        const pedidoId = $('#pedidoId').val();
        const cantidad = $('#cantidad').val();
        const observacion = $('#observacion').val().trim();

        // Validaciones
        if (!pedidoId) {
            this.mostrarNotificacion('Error: No se ha seleccionado ningún pedido', 'danger');
            return;
        }

        if (!cantidad || parseInt(cantidad) < 1) {
            this.mostrarNotificacion('Por favor, ingrese una cantidad válida', 'warning');
            $('#cantidad').addClass('is-invalid').focus();
            return;
        }

        // Desactivar el botón de envío y mostrar indicador de carga
        const $submitBtn = $('#formNuevoDetalle button[type="submit"]');
        const originalBtnHtml = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...');

        // Datos del detalle
        const nuevoDetalle = {
            idPedido: parseInt(pedidoId),
            cantidad: parseInt(cantidad),
            observacion: observacion || 'Sin observaciones'
        };
        // Guardar detalle usando PedidoController
        try {
            // Usar PedidoController para agregar detalle
            await PedidoController.agregarDetallePedido(nuevoDetalle);

            // Limpiar formulario pero mantener el pedidoId
            $('#cantidad').val(1).removeClass('is-invalid');
            $('#observacion').val('').removeClass('is-invalid');

            // Cerrar el formulario de nuevo detalle
            $('#formNuevoDetalleCollapse').collapse('hide');

            // Recargar detalles
            this.cargarDetallesPedido(pedidoId);

            // Mensaje de éxito
            this.mostrarNotificacion(`Detalle agregado exitosamente: ${cantidad}x ${observacion || 'Sin observaciones'}`, 'success');
        } catch (err) {
            console.error('Error al crear detalle:', err);
            this.mostrarNotificacion('No se pudo crear el detalle. Intente nuevamente.', 'danger');
        } finally {
            // Restaurar botón
            $submitBtn.prop('disabled', false).html(originalBtnHtml);
        }
    },

    // Método para eliminar un detalle
    eliminarDetalle: function (e) {
        e.preventDefault();

        const $btn = $(e.currentTarget);
        const detalleId = $btn.data('id');
        const pedidoId = $('#pedidoId').val();

        if (confirm('¿Está seguro de eliminar este detalle?')) {            // Desactivar el botón mientras se procesa
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status"></span>');

            // Usar PedidoController para eliminar detalle
            PedidoController.eliminarDetallePedido(detalleId)
                .then(() => {
                    // Recargar detalles
                    this.cargarDetallesPedido(pedidoId);

                    // Mensaje de éxito
                    this.mostrarNotificacion('Detalle eliminado exitosamente', 'success');
                })
                .catch((err) => {
                    console.error('Error al eliminar detalle:', err);
                    this.mostrarNotificacion('No se pudo eliminar el detalle. Intente nuevamente.', 'danger');
                    $btn.prop('disabled', false).html('<i class="bi bi-trash"></i> Eliminar'); // Rehabilitar el botón
                });
        }
    },

    // Método para eliminar un pedido completo
    eliminarPedido: function () {
        const pedidoId = $('#pedidoId').val();
        const pedido = this.pedidos.find(p => p.id == pedidoId);

        if (!pedido) {
            this.mostrarNotificacion('Pedido no encontrado', 'danger');
            $('#detallesPedidoModal').modal('hide');
            return;
        }

        if (confirm(`¿Está seguro de eliminar el pedido #${pedidoId} y todos sus detalles?`)) {
            const $confirmarBtn = $('#btnEliminarPedido');
            const originalBtnHtml = $confirmarBtn.html();
            $confirmarBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status"></span> Eliminando...');
            // Usar PedidoController para eliminar pedido
            PedidoController.eliminarPedido(pedidoId)
                .then(() => {
                    // Cerrar modal
                    $('#detallesPedidoModal').modal('hide');

                    // Recargar pedidos
                    this.cargarPedidos();

                    // Mensaje de éxito
                    this.mostrarNotificacion(`Pedido #${pedidoId} eliminado exitosamente`, 'success');
                })
                .catch((err) => {
                    console.error('Error al eliminar pedido:', err);
                    this.mostrarNotificacion('No se pudo eliminar el pedido. Intente nuevamente.', 'danger');
                    // Rehabilitar botón
                    $confirmarBtn.prop('disabled', false).html(originalBtnHtml);
                });
        }
    }
};

// Inicializar la aplicación cuando el documento esté listo
$(document).ready(function () {
    PedidosApp.init();
});
