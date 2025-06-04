$(document).ready(function () {
    // Variable para almacenar categorías
    let categorias = [];

    // Variables para paginación
    const itemsPerPage = 10;
    let currentPage = 1;
    let totalPages = 0;

    // Cargar datos desde la API al iniciar
    cargarDatosDesdeAPI();

    // Función para cargar datos desde la API usando CategoriaController
    async function cargarDatosDesdeAPI() {
        try {
            // Mostrar indicador de carga
            $('#categoriaTableBody').html('<tr><td colspan="4" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>');

            // Usar CategoriaController para obtener datos
            categorias = await CategoriaController.obtenerCategorias();
            console.log('Categorías obtenidas de la API:', categorias);

            // Actualizar número total de páginas con los datos reales
            totalPages = Math.ceil(categorias.length / itemsPerPage);

            // Cargar los elementos en la tabla
            loadCategorias();

            // Mostrar estadísticas
            showNotification(`Se han cargado ${categorias.length} categorías`);
        } catch (error) {
            console.error('Error al cargar datos desde la API:', error);
            // Mostrar mensaje de error
            $('#categoriaTableBody').html('<tr><td colspan="4" class="text-center text-danger">Error al cargar datos. Por favor, intente nuevamente.</td></tr>');
            showNotification('Error al cargar datos de categorías', 'danger');
        }
    }

    // Función para cargar los datos en la tabla
    function loadCategorias() {
        $('#categoriaTableBody').empty();

        // Calcular índices para paginación
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, categorias.length);
        const itemsToShow = categorias.slice(startIndex, endIndex);

        if (itemsToShow.length === 0) {
            $('#categoriaTableBody').html('<tr><td colspan="4" class="text-center">No hay categorías disponibles</td></tr>');
            return;
        }

        $.each(itemsToShow, function (index, categoria) {
            const row = `
                <tr>
                    <td>${categoria.id}</td>
                    <td>${categoria.nombre}</td>
                    <td>${categoria.descripcion || ''}</td>
                    <td>
                        <button class="action-btn edit-btn btn btn-sm btn-outline-primary" data-id="${categoria.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-btn delete-btn btn btn-sm btn-outline-danger" data-id="${categoria.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

            $('#categoriaTableBody').append(row);
        });

        // Configurar botones de acción
        setupActionButtons();

        // Actualizar paginador
        updatePagination();
    }

    // Función para actualizar el paginador
    function updatePagination() {
        // Recalcular el total de páginas por si cambia el número de items
        totalPages = Math.ceil(categorias.length / itemsPerPage);

        const $pagination = $('.pagination');
        $pagination.empty();

        // Botón anterior
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
                loadCategorias();
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
                loadCategorias();
            });
            $pagination.append($pageBtn);
        }

        // Botón siguiente
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
                loadCategorias();
            }
        });
        $pagination.append($nextBtn);
    }

    // Configurar botones de acción
    function setupActionButtons() {
        // Botones de editar
        $('.edit-btn').on('click', function () {
            const categoriaId = parseInt($(this).data('id'));
            editCategoria(categoriaId);
        });

        // Botones de eliminar
        $('.delete-btn').on('click', function () {
            const categoriaId = parseInt($(this).data('id'));
            showDeleteConfirmation(categoriaId);
        });
    }

    // Abrir modal para editar una categoría
    function editCategoria(categoriaId) {
        const categoria = categorias.find(cat => cat.id === categoriaId);
        if (categoria) {
            // Cambiar título del modal
            $('#categoriaModalLabel').text('Editar categoría');

            // Llenar el formulario
            $('#categoriaId').val(categoria.id);
            $('#categoriaNombre').val(categoria.nombre);
            $('#categoriaDescripcion').val(categoria.descripcion);

            // Mostrar el modal
            $('#categoriaModal').modal('show');
        }
    }

    // Mostrar confirmación para eliminar
    function showDeleteConfirmation(categoriaId) {
        const categoria = categorias.find(cat => cat.id === categoriaId);
        if (categoria) {
            $('#deleteCategoriaName').text(categoria.nombre);

            // Configurar botón de confirmación
            $('#confirmDeleteBtn').data('id', categoriaId);

            // Mostrar el modal
            $('#deleteModal').modal('show');
        }
    }

    // Función para guardar una categoría nueva o actualizada
    async function saveCategoria() {
        try {
            // Obtener valores del formulario
            const categoriaId = $('#categoriaId').val();
            const nombre = $('#categoriaNombre').val();
            const descripcion = $('#categoriaDescripcion').val();

            if (!nombre) {
                alert('Por favor completa el nombre de la categoría');
                return;
            }

            const fechaActual = new Date().toISOString();

            if (categoriaId) {
                // Actualizar categoría existente
                const categoriaIndex = categorias.findIndex(cat => cat.id === parseInt(categoriaId));
                if (categoriaIndex !== -1) {
                    const categoriaActualizada = {
                        ...categorias[categoriaIndex],
                        nombre,
                        descripcion
                    };

                    // Guardar en la base de datos
                    await CategoriaController.actualizarCategoria(categoriaId, categoriaActualizada);

                    showNotification(`Categoría actualizada: ${nombre}`);
                }
            } else {
                // Crear nueva categoría
                const nuevaCategoria = {
                    nombre,
                    descripcion
                };

                // Guardar en la base de datos
                await CategoriaController.crearCategoria(nuevaCategoria);

                showNotification(`Nueva categoría creada: ${nombre}`);
            }

            // Cerrar el modal
            $('#categoriaModal').modal('hide');

            // Recargar los datos desde la API
            await cargarDatosDesdeAPI();
        } catch (error) {
            console.error('Error al guardar la categoría:', error);
            showNotification('Error al guardar la categoría en la base de datos', 'danger');
        }
    }

    // Función para eliminar una categoría
    async function deleteCategoria(categoriaId) {
        try {
            const categoriaIndex = categorias.findIndex(cat => cat.id === parseInt(categoriaId));
            if (categoriaIndex !== -1) {
                const categoriaNombre = categorias[categoriaIndex].nombre;

                // Eliminar la categoría de la base de datos
                await CategoriaController.eliminarCategoria(categoriaId);

                // Cerrar el modal
                $('#deleteModal').modal('hide');

                // Recargar los datos desde la API
                await cargarDatosDesdeAPI();

                // Mostrar notificación
                showNotification(`Categoría eliminada: ${categoriaNombre}`);
            }
        } catch (error) {
            console.error('Error al eliminar la categoría:', error);
            showNotification('Error al eliminar la categoría de la base de datos', 'danger');
        }
    }

    // Mostrar notificación
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
    }

    // Agregar botón para recargar datos
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
    $('[data-bs-toggle="modal"][data-bs-target="#categoriaModal"]').on('click', function () {
        $('#categoriaModalLabel').text('Nueva categoría');
        $('#categoriaForm')[0].reset();
        $('#categoriaId').val('');
    });

    // Guardar categoría
    $('#saveCategoriaBtn').on('click', saveCategoria);

    // Confirmar eliminación
    $('#confirmDeleteBtn').on('click', function () {
        const categoriaId = $(this).data('id');
        if (categoriaId) {
            deleteCategoria(categoriaId);
        }
    });
});