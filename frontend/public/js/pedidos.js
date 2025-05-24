/**
 * Archivo: pedidos.js
 * Descripción: Lógica del cliente para la página de pedidos
 * Este archivo se encarga de la interacción con la API para gestionar pedidos y sus detalles
 */
 
import { cargarPedidos, cargarOpcionesMenu, guardarNuevoPedido, 
    cargarDetallesPedido, agregarDetallePedido, eliminarDetalle, 
    eliminarPedido } from './pedidoFunctions.js';

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