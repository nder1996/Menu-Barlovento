// Define CategoriaController as a global object
window.CategoriaController = {
    /**
     * Obtiene todas las categorías
     * @returns {Promise<Array>} Lista de categorías
     */
    async obtenerCategorias() {
        try {
            console.log('Obteniendo categorías...');
            const response = await fetch('/api/categorias', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Error HTTP:', response.status);
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Categorías recibidas:', data);
            return data;
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    },

    /**
     * Obtiene una categoría por su ID
     * @param {number} id - ID de la categoría
     * @returns {Promise<Object>} Categoría encontrada
     */
    async obtenerCategoriaPorId(id) {
        try {
            const response = await fetch(`/api/categorias/${id}`, {
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
            console.error(`Error al obtener categoría con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea una nueva categoría
     * @param {Object} categoria - Datos de la categoría
     * @returns {Promise<Object>} Categoría creada
     */
    async crearCategoria(categoria) {
        try {
            const response = await fetch('/api/categorias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(categoria)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear categoría:', error);
            throw error;
        }
    },

    /**
     * Actualiza una categoría existente
     * @param {number} id - ID de la categoría
     * @param {Object} categoria - Datos actualizados
     * @returns {Promise<Object>} Categoría actualizada
     */
    async actualizarCategoria(id, categoria) {
        try {
            const response = await fetch(`/api/categorias/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(categoria)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error al actualizar categoría con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina una categoría
     * @param {number} id - ID de la categoría
     * @returns {Promise<void>}
     */
    async eliminarCategoria(id) {
        try {
            const response = await fetch(`/api/categorias/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error al eliminar categoría con ID ${id}:`, error);
            throw error;
        }
    }
};
