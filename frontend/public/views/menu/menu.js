$(document).ready(function () {
    // Variable para almacenar elementos del menú
    let menuItems = [];
    // Variable para almacenar categorías
    let categorias = [];

    // Variables para paginación
    const itemsPerPage = 10; // Aumentamos a 10 items por página
    let currentPage = 1;
    let totalPages = 0;

    // Cargar datos desde la API al iniciar
    cargarDatosDesdeAPI();    // Función para cargar datos desde la API usando MenuController
    async function cargarDatosDesdeAPI() {
        try {
            // Mostrar indicador de carga
            $('#menuTableBody').html('<tr><td colspan="7" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>');

            // Usar MenuController para obtener datos
            menuItems = await MenuController.obtenerOpciones();
            console.log('Datos obtenidos de la API:', menuItems);

            // Si las categorías ya están cargadas, enriquecemos los datos de menú
            if (categorias.length > 0) {
                menuItems = menuItems.map(item => {
                    const categoriaRelacionada = categorias.find(cat => cat.id === item.idCategoria);
                    return {
                        ...item,
                        categoriaTexto: categoriaRelacionada ? categoriaRelacionada.nombre : `Categoría ${item.idCategoria}`
                    };
                });
            }

            // Actualizar número total de páginas con los datos reales
            totalPages = Math.ceil(menuItems.length / itemsPerPage);

            // Cargar los elementos en la tabla
            loadMenuItems();

            // Mostrar estadísticas
            showNotification(`Se han cargado ${menuItems.length} elementos del menú`);
        } catch (error) {
            console.error('Error al cargar datos desde la API:', error);
            // Mostrar mensaje de error
            $('#menuTableBody').html('<tr><td colspan="7" class="text-center text-danger">Error al cargar datos. Por favor, intente nuevamente.</td></tr>');
            showNotification('Error al cargar datos del menú', 'danger');
        }
    }

    // Función para cargar los datos en la tabla
    function loadMenuItems() {
        $('#menuTableBody').empty();

        // Calcular índices para paginación
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, menuItems.length);
        const itemsToShow = menuItems.slice(startIndex, endIndex);

        if (itemsToShow.length === 0) {
            $('#menuTableBody').html('<tr><td colspan="7" class="text-center">No hay elementos disponibles</td></tr>');
            return;
        }

        $.each(itemsToShow, function (index, item) {
            // Formatear el precio
            const formattedPrice = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(item.precio);

            // Estado
            const estadoTexto = item.estado ? 'Activo' : 'Inactivo';
            // Obtener el nombre de la categoría
            let categoriaTexto = '';
            if (item.categoriaTexto) {
                categoriaTexto = item.categoriaTexto;
            } else if (item.categoria) {
                categoriaTexto = item.categoria;
            } else {
                // Buscar el nombre de la categoría por id
                const categoriaEncontrada = categorias.find(cat => cat.id === item.idCategoria);
                categoriaTexto = categoriaEncontrada ? categoriaEncontrada.nombre : `Categoría ${item.idCategoria}`;
            }

            const row = `
                <tr>
                    <td>${item.id}</td>
                    <td>${categoriaTexto}</td>
                    <td>${item.nombre}</td>
                    <td>${item.descripcion}</td>
                    <td>${formattedPrice}</td>
                    <td class="estado-cell">
                    <span class="badge ${item.estado ? 'text-bg-success' : 'text-bg-danger'}">
                        ${estadoTexto}
                    </span>
                    </td>
                    <td>
                        <button class="action-btn edit-btn btn btn-sm btn-outline-primary" data-id="${item.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-btn delete-btn btn btn-sm btn-outline-danger" data-id="${item.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

            $('#menuTableBody').append(row);
        });

        // Configurar botones de acción
        setupActionButtons();

        // Actualizar paginador
        updatePagination();
    }

    // Función para actualizar el paginador
    function updatePagination() {
        // Recalcular el total de páginas por si cambia el número de items
        totalPages = Math.ceil(menuItems.length / itemsPerPage);

        const $pagination = $('.pagination');
        $pagination.empty();        // Botón anterior
        const $prevBtn = $(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Anterior">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `);
        $prevBtn.on('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                loadMenuItems();
            }
        });
        $pagination.append($prevBtn);

        // Botones numéricos
        // Mostrar máximo 5 páginas en el paginador
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(startPage + 4, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const $pageBtn = $(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `);
            $pageBtn.on('click', function (e) {
                e.preventDefault();
                currentPage = i;
                loadMenuItems();
            });
            $pagination.append($pageBtn);
        }        // Botón siguiente
        const $nextBtn = $(`
            <li class="page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Siguiente">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `);
        $nextBtn.on('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                loadMenuItems();
            }
        });
        $pagination.append($nextBtn);
    }

    // Configurar botones de acción
    function setupActionButtons() {
        // Botones de editar
        $('.edit-btn').on('click', function () {
            const itemId = parseInt($(this).data('id'));
            editItem(itemId);
        });

        // Botones de eliminar
        $('.delete-btn').on('click', function () {
            const itemId = parseInt($(this).data('id'));
            showDeleteConfirmation(itemId);
        });

        // Botones de toggle estado
        $('.toggle-btn').on('click', function () {
            const itemId = parseInt($(this).data('id'));
            toggleItemStatus(itemId);
        });
    }    // Abrir modal para editar un ítem
    function editItem(itemId) {
        const item = menuItems.find(item => item.id === itemId);
        if (item) {
            // Cambiar título del modal
            $('#itemModalLabel').text('Editar elemento');

            // Llenar el formulario
            $('#itemId').val(item.id);
            $('#itemCategoria').val(item.idCategoria || item.categoria);
            $('#itemNombre').val(item.nombre);
            $('#itemDescripcion').val(item.descripcion);
            $('#itemPrecio').val(item.precio);
            $('#itemEstado').prop('checked', item.estado);

            // Mostrar el modal
            $('#itemModal').modal('show');
        }
    }

    // Mostrar confirmación para eliminar
    function showDeleteConfirmation(itemId) {
        const item = menuItems.find(item => item.id === itemId);
        if (item) {
            $('#deleteItemName').text(item.nombre);

            // Configurar botón de confirmación
            $('#confirmDeleteBtn').data('id', itemId);

            // Mostrar el modal
            $('#deleteModal').modal('show');
        }
    }    // Cambiar el estado de un ítem
    async function toggleItemStatus(itemId) {
        try {
            const itemIndex = menuItems.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                // Crear el objeto con los datos a actualizar
                const nuevoEstado = !menuItems[itemIndex].estado;
                const datosPlatoActualizado = {
                    ...menuItems[itemIndex],
                    estado: nuevoEstado,
                    updateAt: new Date().toISOString()
                };

                // Actualizar el plato en la base de datos
                await MenuController.actualizarPlato(itemId, datosPlatoActualizado);

                // Actualizar el estado local
                menuItems[itemIndex].estado = nuevoEstado;

                // Recargar los datos para reflejar los cambios en la BD
                await cargarDatosDesdeAPI();

                // Mostrar notificación
                showNotification(
                    `Estado cambiado: ${menuItems[itemIndex].nombre} ahora está ${nuevoEstado ? 'Activo' : 'Inactivo'}`
                );
            }
        } catch (error) {
            console.error('Error al cambiar el estado:', error);
            showNotification('Error al cambiar el estado del ítem', 'danger');
        }
    }    // Función para guardar un ítem nuevo o actualizado
    async function saveItem() {
        try {
            // Obtener valores del formulario
            const itemId = $('#itemId').val();
            const categoria = $('#itemCategoria').val();
            const nombre = $('#itemNombre').val();
            const descripcion = $('#itemDescripcion').val();
            const precio = parseInt($('#itemPrecio').val());
            const estado = $('#itemEstado').prop('checked');

            if (!categoria || !nombre || isNaN(precio)) {
                alert('Por favor completa los campos requeridos');
                return;
            }

            const fechaActual = new Date().toISOString();

            if (itemId) {
                // Actualizar ítem existente
                const itemIndex = menuItems.findIndex(item => item.id === parseInt(itemId));
                if (itemIndex !== -1) {
                    const platoActualizado = {
                        ...menuItems[itemIndex],
                        idCategoria: categoria, // Utilizamos idCategoria conforme al modelo
                        nombre,
                        descripcion,
                        precio,
                        estado,
                        updateAt: fechaActual
                    };

                    // Guardar en la base de datos
                    await MenuController.actualizarPlato(itemId, platoActualizado);

                    showNotification(`Ítem actualizado: ${nombre}`);
                }
            } else {
                // Crear nuevo ítem
                const nuevoPlato = {
                    idCategoria: categoria,
                    nombre,
                    descripcion,
                    precio,
                    estado,
                    createAt: fechaActual,
                    updateAt: fechaActual
                };

                // Guardar en la base de datos
                await MenuController.crearPlato(nuevoPlato);

                showNotification(`Nuevo ítem creado: ${nombre}`);
            }

            // Cerrar el modal
            $('#itemModal').modal('hide');

            // Recargar los datos desde la API
            await cargarDatosDesdeAPI();
        } catch (error) {
            console.error('Error al guardar el ítem:', error);
            showNotification('Error al guardar el ítem en la base de datos', 'danger');
        }
    }    // Función para eliminar un ítem
    async function deleteItem(itemId) {
        try {
            const itemIndex = menuItems.findIndex(item => item.id === parseInt(itemId));
            if (itemIndex !== -1) {
                const itemName = menuItems[itemIndex].nombre;

                // Eliminar el ítem de la base de datos
                await fetch(`/api/platos/${itemId}`, {
                    method: 'DELETE'
                });

                // Cerrar el modal
                $('#deleteModal').modal('hide');

                // Recargar los datos desde la API
                await cargarDatosDesdeAPI();

                // Mostrar notificación
                showNotification(`Ítem eliminado: ${itemName}`);
            }
        } catch (error) {
            console.error('Error al eliminar el ítem:', error);
            showNotification('Error al eliminar el ítem de la base de datos', 'danger');
        }
    }    // Mostrar notificación
    function showNotification(message, type = 'success') {
        console.log(message);

        // Crear elemento de notificación
        const $notification = $(`
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `);

        // Añadir al contenedor
        if (!$('#toastContainer').length) {
            $('body').append('<div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>');
        }

        $('#toastContainer').append($notification);

        // Inicializar el toast de Bootstrap
        const toast = new bootstrap.Toast($notification, {
            autohide: true,
            delay: 3000
        });

        // Mostrar y eliminar después
        toast.show();
        $notification.on('hidden.bs.toast', function () {
            $(this).remove();
        });
    }    // Al iniciar, ya llamamos a cargarDatosDesdeAPI() desde el inicio    // Agregar botón para recargar datos
    $('.d-flex.justify-content-between.align-items-center').append(`
        <button class="btn btn-outline-secondary reload-btn ms-2" title="Recargar datos">
            <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>
    `);

    // Configurar botón de recarga
    $('.reload-btn').on('click', async function () {
        $(this).find('i').addClass('fa-spin');
        await cargarDatosDesdeAPI();
        $(this).find('i').removeClass('fa-spin');
    });

    // Limpiar formulario cuando se abre el modal para crear
    $('[data-bs-toggle="modal"][data-bs-target="#itemModal"]').on('click', function () {
        $('#itemModalLabel').text('Nuevo elemento');
        $('#menuForm')[0].reset();
        $('#itemId').val('');
    });

    // Guardar ítem
    $('#saveItemBtn').on('click', saveItem);

    // Confirmar eliminación
    $('#confirmDeleteBtn').on('click', function () {
        const itemId = $(this).data('id');
        if (itemId) {
            deleteItem(itemId);
        }
    });

    // Cargar categorías desde la API
    cargarCategorias();

    // Función para cargar las categorías
    async function cargarCategorias() {
        try {
            const response = await fetch('/api/categorias', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            categorias = await response.json();
            console.log('Categorías cargadas:', categorias);

            // Actualizar el select de categorías en el modal
            actualizarSelectCategorias();
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            showNotification('No se pudieron cargar las categorías', 'danger');
        }
    }

    // Función para actualizar el select de categorías
    function actualizarSelectCategorias() {
        const $select = $('#itemCategoria');
        $select.empty();

        // Añadir opción por defecto
        $select.append('<option value="" disabled selected>Seleccione una categoría</option>');

        // Añadir opciones de categoría
        categorias.forEach(categoria => {
            $select.append(`<option value="${categoria.id}">${categoria.nombre}</option>`);
        });
    }
});