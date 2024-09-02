document.addEventListener('DOMContentLoaded', function() {
    const successAlert = document.getElementById('success-alert');
    const errorAlert = document.getElementById('error-alert');
    
    if (successAlert) {
        setTimeout(() => {
            const alert = new bootstrap.Alert(successAlert);
            alert.close();
        }, 5000); // 5000 milliseconds = 5 seconds
    }

    if (errorAlert) {
        setTimeout(() => {
            const alert = new bootstrap.Alert(errorAlert);
            alert.close();
        }, 5000); // 5000 milliseconds = 5 seconds
    }
});