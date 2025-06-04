/**
 * Controlador para gestionar la interfaz de usuario
 */
const VistaController = {
    /**
     * Muestra una notificación en la interfaz
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo de notificación (success, danger, warning, info)
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        const toast = $('#notificacionToast');
        const toastBody = $('#notificacionMensaje');
        
        // Configurar el toast
        toast.removeClass('bg-success bg-danger bg-warning bg-info text-white');
        
        switch(tipo) {
            case 'success':
                toast.addClass('bg-success text-white');
                break;
            case 'danger':
                toast.addClass('bg-danger text-white');
                break;
            case 'warning':
                toast.addClass('bg-warning');
                break;
            case 'info':
            default:
                toast.addClass('bg-info text-white');
        }
        
        // Establecer el mensaje y mostrar
        toastBody.html(mensaje);
        const bsToast = bootstrap.Toast.getOrCreateInstance(toast);
        bsToast.show();
    },
    
    /**
     * Confirma una acción con el usuario
     * @param {string} mensaje - Mensaje de confirmación
     * @returns {Promise<boolean>} Resultado de la confirmación
     */
    confirmar(mensaje) {
        return new Promise(resolve => {
            if (confirm(mensaje)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
};

export default VistaController;
