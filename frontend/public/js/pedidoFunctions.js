import { PedidoController, DetallePedidoController, MenuController, VistaController } from './imports.js';

// Función para cargar los pedidos
export async function cargarPedidos() {
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
export async function cargarOpcionesMenu() {
    try {
        const platos = await MenuController.obtenerOpciones();
        VistaController.llenarSelectMenu(platos);
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al cargar opciones del menú: ${error.message}`, 'danger');
    }
}

// Función para guardar un nuevo pedido
export async function guardarNuevoPedido() {
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
export async function cargarDetallesPedido(pedidoId) {
    try {
        const pedidoCompleto = await PedidoController.obtenerPedidoPorId(pedidoId);
        VistaController.mostrarDetallesPedido(pedidoCompleto);
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al cargar los detalles del pedido: ${error.message}`, 'danger');
    }
}

// Función para agregar un detalle a un pedido
export async function agregarDetallePedido() {
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
export async function eliminarDetalle(detalleId) {
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
export async function eliminarPedido(pedidoId) {
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