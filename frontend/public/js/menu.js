/**
 * @file menu.js
 * @description Controlador principal para la página de menú
 */

import { 
    cargarMenu, 
    crearNuevoPlato, 
    cargarCategorias, 
    actualizarPlato, 
    llenarSelectCategorias 
} from './menuFunctions.js';
import { VistaController } from '../../backend/controllers/menuController.js';

/**
 * Inicialización cuando el DOM está listo
 */
$(document).ready(function() {
    inicializarPagina();
    registrarEventListeners();
});

/**
 * Inicializa la página cargando datos necesarios
 */
function inicializarPagina() {
    cargarMenu();
    
    cargarCategorias().then(categorias => {
        llenarFiltroCategorias(categorias);
    }).catch(error => {
        console.error('Error inicializando categorías:', error);
    });
}

/**
 * Registra todos los event listeners de la página
 */
function registrarEventListeners() {
    // Eventos de formularios
    $('#btnGuardarPlato').click(guardarNuevoPlato);
    $('#btnActualizarPlato').click(actualizarPlatoExistente);
    
    // Eventos de botones de acción en la tabla
    $('#listaMenu').on('click', '.btn-editar-plato', function() {
        const platoId = $(this).data('id');
        cargarDatosPlato(platoId);
    });
    
    $('#listaMenu').on('click', '.btn-eliminar-plato', function() {
        const platoId = $(this).data('id');
        confirmarEliminarPlato(platoId);
    });
    
    // Otros eventos
    $('#btnNuevoPlato').click(limpiarFormularioNuevoPlato);
    $('#filtroCategoria').change(filtrarPlatosPorCategoria);
}

/**
 * Prepara el formulario para un nuevo plato
 */
function limpiarFormularioNuevoPlato() {
    $('#formNuevoPlato')[0].reset();
    $('#platoId').val('');
}

/**
 * Recopila y valida datos del formulario para crear un nuevo plato
 */
async function guardarNuevoPlato() {
    const datosPlato = recopilarDatosFormulario('nuevo');
    
    if (!validarDatosPlato(datosPlato)) {
        return;
    }
    
    try {
        await crearNuevoPlato({
            ...datosPlato,
            createAt: new Date().toISOString(),
            updateAt: new Date().toISOString()
        });
        
        $('#nuevoPlatoModal').modal('hide');
        $('#formNuevoPlato')[0].reset();
    } catch (error) {
        console.error('Error al guardar el plato:', error);
    }
}

/**
 * Recopila y valida datos del formulario para actualizar un plato
 */
async function actualizarPlatoExistente() {
    const datosPlato = recopilarDatosFormulario('edit');
    
    if (!validarDatosPlato(datosPlato)) {
        return;
    }
    
    try {
        await actualizarPlato({
            ...datosPlato,
            updateAt: new Date().toISOString()
        });
        
        $('#editarPlatoModal').modal('hide');
    } catch (error) {
        console.error('Error al actualizar el plato:', error);
    }
}

/**
 * Recopila datos de un formulario según el prefijo especificado
 * @param {string} prefijo - Prefijo de los IDs de los campos ('nuevo' o 'edit')
 * @returns {Object} Datos del plato
 */
function recopilarDatosFormulario(prefijo) {
    const idPrefix = prefijo === 'nuevo' ? '' : 'edit';
    const id = $(`#${idPrefix}PlatoId`).val();
    
    return {
        id: id ? parseInt(id) : null,
        nombre: $(`#${idPrefix}NombrePlato`).val(),
        precio: parseFloat($(`#${idPrefix}PrecioPlato`).val()),
        descripcion: $(`#${idPrefix}DescripcionPlato`).val() || '',
        idCategoria: parseInt($(`#${idPrefix}SelectCategoria`).val()),
        estado: $(`#${idPrefix}EstadoPlato`).is(':checked') ? 1 : 0
    };
}

/**
 * Valida que los datos obligatorios estén presentes
 * @param {Object} datosPlato - Datos del plato a validar
 * @returns {boolean} True si los datos son válidos
 */
function validarDatosPlato(datosPlato) {
    if (!datosPlato.nombre || !datosPlato.precio || !datosPlato.idCategoria) {
        VistaController.mostrarNotificacion('Todos los campos son requeridos excepto la descripción', 'warning');
        return false;
    }
    return true;
}

/**
 * Carga los datos de un plato para su edición
 * @param {number} platoId - ID del plato a editar
 */
async function cargarDatosPlato(platoId) {
    try {
        const plato = await obtenerPlatoPorId(platoId);
        rellenarFormularioEdicion(plato);
        $('#editarPlatoModal').modal('show');
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al cargar datos del plato: ${error.message}`, 'danger');
    }
}

/**
 * Obtiene un plato por su ID
 * @param {number} platoId - ID del plato
 * @returns {Promise<Object>} Datos del plato
 */
async function obtenerPlatoPorId(platoId) {
    const response = await fetch(`/api/platos/${platoId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Rellena el formulario de edición con los datos del plato
 * @param {Object} plato - Datos del plato
 */
function rellenarFormularioEdicion(plato) {
    $('#editPlatoId').val(plato.id);
    $('#editNombrePlato').val(plato.nombre);
    $('#editPrecioPlato').val(plato.precio);
    $('#editDescripcionPlato').val(plato.descripcion);
    $('#editSelectCategoria').val(plato.idCategoria);
    $('#editEstadoPlato').prop('checked', plato.estado === 1);
}

/**
 * Confirma la eliminación de un plato
 * @param {number} platoId - ID del plato a eliminar
 */
function confirmarEliminarPlato(platoId) {
    if (confirm('¿Está seguro de que desea eliminar este plato? Esta acción no se puede deshacer.')) {
        eliminarPlato(platoId);
    }
}

/**
 * Elimina un plato
 * @param {number} platoId - ID del plato a eliminar
 */
async function eliminarPlato(platoId) {
    try {
        const response = await fetch(`/api/platos/${platoId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        await cargarMenu();
        VistaController.mostrarNotificacion('Plato eliminado correctamente', 'success');
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al eliminar el plato: ${error.message}`, 'danger');
    }
}

/**
 * Rellena el selector de filtro de categorías
 * @param {Array} categorias - Lista de categorías
 */
function llenarFiltroCategorias(categorias) {
    llenarSelectCategorias(categorias, '#filtroCategoria');
}

/**
 * Filtra los platos por categoría
 */
function filtrarPlatosPorCategoria() {
    const categoriaId = $('#filtroCategoria').val();
    
    if (!categoriaId) {
        $('.card-plato').show();
        return;
    }
    
    $('.card-plato').hide();
    $(`.card-plato[data-categoria="${categoriaId}"]`).show();
}