import { MenuController, VistaController } from './script.js';

/**
 * Carga las opciones del menú desde el servidor
 * @returns {Promise<void>}
 */
export async function cargarMenu() {
    const $listaMenu = $('#listaMenu');
    try {
        mostrarCargando($listaMenu);
        const platos = await MenuController.obtenerOpciones();
        mostrarMenuEnInterfaz(platos);
    } catch (error) {
        mostrarError($listaMenu, error);
    }
}

/**
 * Muestra los platos en la interfaz
 * @param {Array} platos - Lista de platos a mostrar
 */
export function mostrarMenuEnInterfaz(platos) {
    const $contenedor = $('#listaMenu');
    $contenedor.empty();
    
    if (!platos.length) {
        mostrarMensajeVacio($contenedor);
        return;
    }
    
    // Ordenar platos por categoría
    const platosOrdenados = [...platos].sort((a, b) => a.idCategoria - b.idCategoria);
    
    // Cargar categorías para mostrar nombres
    obtenerCategorias()
        .then(categorias => renderizarPlatos(platosOrdenados, categorias, $contenedor))
        .catch(error => console.error('Error cargando categorías:', error));
}

/**
 * Crea un nuevo plato
 * @param {Object} platoData - Datos del plato a crear
 * @returns {Promise<Object>} Plato creado
 */
export async function crearNuevoPlato(platoData) {
    try {
        const response = await realizarPeticion('/api/platos', 'POST', platoData);
        await cargarMenu();
        VistaController.mostrarNotificacion('Plato creado correctamente', 'success');
        return response;
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al crear el plato: ${error.message}`, 'danger');
        throw error;
    }
}

/**
 * Actualiza un plato existente
 * @param {Object} platoData - Datos del plato a actualizar
 * @returns {Promise<Object>} Plato actualizado
 */
export async function actualizarPlato(platoData) {
    try {
        const response = await realizarPeticion(`/api/platos/${platoData.id}`, 'PUT', platoData);
        await cargarMenu();
        VistaController.mostrarNotificacion('Plato actualizado correctamente', 'success');
        return response;
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al actualizar el plato: ${error.message}`, 'danger');
        throw error;
    }
}

/**
 * Carga las categorías disponibles
 * @returns {Promise<Array>} Lista de categorías
 */
export async function cargarCategorias() {
    try {
        const categorias = await obtenerCategorias();
        llenarSelectCategorias(categorias, '#selectCategoria');
        return categorias;
    } catch (error) {
        VistaController.mostrarNotificacion(`Error al cargar categorías: ${error.message}`, 'danger');
        throw error;
    }
}

// Funciones auxiliares privadas
function mostrarCargando($elemento) {
    $elemento.html(`
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando menú...</p>
        </div>
    `);
}

function mostrarError($elemento, error) {
    $elemento.html(`
        <div class="col-12 alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> Error al cargar el menú: ${error.message}
        </div>
    `);
    VistaController.mostrarNotificacion(`Error al cargar el menú: ${error.message}`, 'danger');
}

function mostrarMensajeVacio($contenedor) {
    $contenedor.html(`
        <tr>
            <td colspan="6" class="text-center">
                <div class="alert alert-info mb-0">
                    <i class="bi bi-info-circle"></i> No hay platos disponibles.
                </div>
            </td>
        </tr>
    `);
}

async function obtenerCategorias() {
    const response = await fetch('/api/categorias', {
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

async function realizarPeticion(url, metodo, datos) {
    const response = await fetch(url, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }
    
    return await response.json();
}

function renderizarPlatos(platos, categorias, $contenedor) {
    const categoriasMap = crearMapaCategorias(categorias);
    
    platos.forEach((plato, index) => {
        const $template = $(document.getElementById('platoTemplate').content.cloneNode(true));
        
        $template.find('.card-plato').attr('data-categoria', plato.idCategoria);
        $template.find('.plato-id').text(index + 1);
        $template.find('.plato-categoria').text(categoriasMap[plato.idCategoria] || `Categoría ${plato.idCategoria}`);
        $template.find('.plato-nombre').text(plato.nombre);
        $template.find('.plato-precio').text(`${plato.precio.toFixed(2)} €`);
        $template.find('.plato-descripcion').text(plato.descripcion || 'Sin descripción');
        
        configurarEstadoPlato($template, plato);
        configurarBotonesPlato($template, plato);
        
        $contenedor.append($template);
    });
}

function crearMapaCategorias(categorias) {
    const map = {};
    categorias.forEach(cat => {
        map[cat.id] = cat.nombre;
    });
    return map;
}

function configurarEstadoPlato($template, plato) {
    const $estado = $template.find('.plato-estado');
    if (plato.estado === 1) {
        $estado.addClass('bg-success').text('Disponible');
    } else {
        $estado.addClass('bg-danger').text('No disponible');
    }
}

function configurarBotonesPlato($template, plato) {
    $template.find('.btn-editar-plato').attr('data-id', plato.id);
    $template.find('.btn-eliminar-plato').attr('data-id', plato.id);
}

export function llenarSelectCategorias(categorias, selectorId) {
    const $select = $(selectorId);
    $select.find('option:not(:first)').remove();
    
    categorias.forEach(categoria => {
        $select.append(`<option value="${categoria.id}">${categoria.nombre}</option>`);
    });
}