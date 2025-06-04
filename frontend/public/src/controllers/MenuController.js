// Define MenuController as a global object
window.MenuController = {
    /**
     * Obtiene todas las opciones del menú
     * @returns {Promise<Array>} Lista de platos
     */
    async obtenerOpciones() {
        try {
            console.log('Obteniendo opciones de menú...');
            const response = await fetch('/api/platos', {
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
            console.log('Datos recibidos:', data);
            return data;
        } catch (error) {
            console.error('Error al obtener opciones de menú:', error);
            throw error;
        }
    },

    /**
     * Obtiene un plato por su ID
     * @param {number} id - ID del plato
     * @returns {Promise<Object>} Plato encontrado
     */
    async obtenerPlatoPorId(id) {
        try {
            const response = await fetch(`/api/platos/${id}`, {
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
            console.error(`Error al obtener plato #${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo plato en el menú
     * @param {Object} plato - Datos del plato a crear
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async crearPlato(plato) {
        try {
            console.log('Creando nuevo plato:', plato);
            const response = await fetch('/api/platos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(plato)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear plato:', error);
            throw error;
        }
    },

    /**
     * Actualiza un plato existente
     * @param {number} id - ID del plato a actualizar
     * @param {Object} plato - Datos actualizados del plato
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async actualizarPlato(id, plato) {
        try {
            console.log(`Actualizando plato #${id}:`, plato);
            const response = await fetch(`/api/platos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(plato)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error al actualizar plato #${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un plato del menú
     * @param {number} id - ID del plato a eliminar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async eliminarPlato(id) {
        try {
            console.log(`Eliminando plato #${id}`);
            const response = await fetch(`/api/platos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error al eliminar plato #${id}:`, error);
            throw error;
        }
    },

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
    }
};

// No export needed as we're using window.MenuController