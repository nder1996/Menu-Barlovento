// Define PedidoController como un objeto global
window.PedidoController = {
    /**
     * Obtiene todos los pedidos
     * @param {Object} filtros - Filtros aplicables (mesa, fecha)
     * @returns {Promise<Array>} Lista de pedidos
     */
    async obtenerPedidos(filtros = {}) {
        try {
            console.log('Obteniendo pedidos...', filtros);
            let url = '/api/pedidos';
            
            // Agregar filtros como query params si existen
            const queryParams = [];
            if (filtros.mesa) queryParams.push(`mesa=${filtros.mesa}`);
            if (filtros.fecha) queryParams.push(`fecha=${filtros.fecha}`);
            
            if (queryParams.length > 0) {
                url += '?' + queryParams.join('&');
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

            const data = await response.json();
            console.log('Pedidos recibidos:', data);
            return data;
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            throw error;
        }
    },

    /**
     * Obtiene un pedido por su ID
     * @param {number} id - ID del pedido
     * @returns {Promise<Object>} Pedido encontrado
     */
    async obtenerPedidoPorId(id) {
        try {
            console.log(`Obteniendo pedido #${id}...`);
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Pedido #${id} recibido:`, data);
            return data;
        } catch (error) {
            console.error(`Error al obtener pedido #${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo pedido
     * @param {Object} pedido - Datos del pedido (idMenu, numeroMesa)
     * @returns {Promise<Object>} Pedido creado
     */
    async crearPedido(pedido) {
        try {
            console.log('Creando nuevo pedido:', pedido);
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(pedido)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Pedido creado:', data);
            return data;
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error;
        }
    },

    /**
     * Actualiza un pedido existente
     * @param {number} id - ID del pedido
     * @param {Object} pedido - Datos actualizados del pedido
     * @returns {Promise<Object>} Pedido actualizado
     */
    async actualizarPedido(id, pedido) {
        try {
            console.log(`Actualizando pedido #${id}:`, pedido);
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(pedido)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Pedido actualizado:', data);
            return data;
        } catch (error) {
            console.error(`Error al actualizar pedido #${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un pedido
     * @param {number} id - ID del pedido a eliminar
     * @returns {Promise<Object>} Respuesta de confirmación
     */
    async eliminarPedido(id) {
        try {
            console.log(`Eliminando pedido #${id}...`);
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Pedido #${id} eliminado:`, data);
            return data;
        } catch (error) {
            console.error(`Error al eliminar pedido #${id}:`, error);
            throw error;
        }
    },    /**
     * Obtiene los detalles de un pedido
     * @param {number} pedidoId - ID del pedido
     * @returns {Promise<Array>} Lista de detalles del pedido
     */    async obtenerDetallesPedido(pedidoId) {
        try {
            console.log(`Obteniendo detalles del pedido #${pedidoId}...`);
            const response = await fetch(`/api/detalles-pedido/pedido/${pedidoId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Detalles del pedido #${pedidoId} recibidos:`, data);
            return data;
        } catch (error) {
            console.error(`Error al obtener detalles del pedido #${pedidoId}:`, error);
            throw error;
        }
    },    /**
     * Agrega un detalle a un pedido
     * @param {Object} detalle - Datos del detalle (pedidoId, cantidad, observacion)
     * @returns {Promise<Object>} Detalle creado
     */
    async agregarDetallePedido(detalle) {
        try {
            console.log('Agregando detalle al pedido:', detalle);
            const response = await fetch('/api/detalles-pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(detalle)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Detalle agregado:', data);
            return data;
        } catch (error) {
            console.error('Error al agregar detalle:', error);
            throw error;
        }
    },    /**
     * Elimina un detalle de pedido
     * @param {number} id - ID del detalle a eliminar
     * @returns {Promise<Object>} Respuesta de confirmación
     */
    async eliminarDetallePedido(id) {
        try {
            console.log(`Eliminando detalle #${id}...`);
            const response = await fetch(`/api/detalles-pedido/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Detalle #${id} eliminado:`, data);
            return data;
        } catch (error) {
            console.error(`Error al eliminar detalle #${id}:`, error);
            throw error;
        }
    }
};
