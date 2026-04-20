0// espera a que el HTML esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', async function () {
    botonesAuth();
    await cargarVideos();
    const btnSubir = document.getElementById('btn-subir');
    if (btnSubir) {
        btnSubir.addEventListener('click', function () {
            if (!estaLogueado()) {
                window.location.href = 'auth.html';
                return;
            }
            const modal = new bootstrap.Modal(document.getElementById('modal-subida'));
            modal.show();
        });
    }
    // Botón confirmar subida
    const btnConfirmar = document.getElementById('btn-confirmar-subida');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async function () {
            const titulo = document.getElementById('upload-titulo').value.trim();
            const descripcion = document.getElementById('upload-descripcion').value.trim();
            const archivo = document.getElementById('upload-archivo').files[0];
            const error = document.getElementById('subida-error');
            const progreso = document.getElementById('subida-progreso');
            error.textContent = '';
            if (!titulo) {
                error.textContent = 'El título es obligatorio.';
                return;
                
            }
            if (!archivo) {
                error.textContent = 'Selecciona un archivo de vídeo.';
                return;
            }
            btnConfirmar.disabled = true;
            progreso.style.display = 'block';
            const videoCreado = await crearVideo(titulo, descripcion);

            if (!videoCreado || !videoCreado.id) {
                error.textContent = videoCreado.error || 'Error al crear el vídeo.';
                btnConfirmar.disabled = false;
                progreso.style.display = 'none';
                return;
            }
            const resultado = await subirArchivoVideo(videoCreado.id, archivo);

            btnConfirmar.disabled = false;
            progreso.style.display = 'none';
            if (resultado.id || resultado.path) {
                bootstrap.Modal.getInstance(document.getElementById('modal-subida')).hide();
                document.getElementById('upload-titulo').value = '';
                document.getElementById('upload-descripcion').value = '';
                document.getElementById('upload-archivo').value = '';
                await cargarVideos();
            } else {
                error.textContent = resultado.error || 'Error al subir el archivo.';
            }
        });
    }
    const busquedaForm = document.getElementById('busqueda-form');
    if (busquedaForm) {
        busquedaForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const termino = document.getElementById('busqueda-input').value;
            await cargarVideos(termino);
        });
    }
});
async function cargarVideos(busqueda) {
    const grid = document.getElementById('video-grid');
    grid.innerHTML = '<p class="text-muted">Cargando videos...</p>';

    const videos = await obtenerVideos(busqueda);

    if (!videos || videos.length === 0) {
        if (busqueda) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="fs-4 text-muted">No se encontraron vídeos para "${busqueda}".</p>
                </div>
            `;
        } else {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="fs-4 text-muted">No hay vídeos disponibles todavía.</p>
                    <p class="text-muted small">¡Sé el primero en subir uno!</p>
                </div>
            `;
        }
        return;
    }
    grid.innerHTML = '';
    videos.forEach(function (video) {
        grid.innerHTML += crearTarjeta(video);
    });
}
