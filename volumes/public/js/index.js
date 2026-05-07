// espera a que el HTML esté completamente cargado antes de ejecutar el código
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
            let videoCreado;
            try {
                videoCreado = await crearVideo(titulo, descripcion);
            } catch (e) {
                error.textContent = 'No se pudo conectar con el backend.';
                btnConfirmar.disabled = false;
                progreso.style.display = 'none';
                return;
            }

            if (!videoCreado || !videoCreado.id) {
                error.textContent = obtenerMensajeError(videoCreado, 'Error al crear el vídeo.');
                btnConfirmar.disabled = false;
                progreso.style.display = 'none';
                return;
            }
            let resultado;
            try {
                resultado = await subirArchivoVideo(videoCreado.id, archivo);
            } catch (e) {
                error.textContent = 'No se pudo conectar con el backend al subir el archivo.';
                btnConfirmar.disabled = false;
                progreso.style.display = 'none';
                return;
            }

            btnConfirmar.disabled = false;
            progreso.style.display = 'none';
            if (resultado.id || resultado.path) {
                bootstrap.Modal.getInstance(document.getElementById('modal-subida')).hide();
                document.getElementById('upload-titulo').value = '';
                document.getElementById('upload-descripcion').value = '';
                document.getElementById('upload-archivo').value = '';
                await cargarVideos();
            } else {
                error.textContent = obtenerMensajeError(resultado, 'Error al subir el archivo.');
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

    const busquedaFormMobile = document.getElementById('busqueda-form-mobile');
    if (busquedaFormMobile) {
        busquedaFormMobile.addEventListener('submit', async function (e) {
            e.preventDefault();
            const termino = document.getElementById('busqueda-input-mobile').value;
            document.getElementById('busqueda-input').value = termino;
            await cargarVideos(termino);
        });
    }

    const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');
    if (btnLimpiarBusqueda) {
        btnLimpiarBusqueda.addEventListener('click', async function () {
            document.getElementById('busqueda-input').value = '';
            const inputMobile = document.getElementById('busqueda-input-mobile');
            if (inputMobile) {
                inputMobile.value = '';
            }
            await cargarVideos();
        });
    }
});

function obtenerMensajeError(response, fallback) {
    if (!response) {
        return fallback;
    }

    if (response.error) {
        return response.error;
    }

    if (response.message) {
        return response.message;
    }

    if (Array.isArray(response.errors) && response.errors.length > 0) {
        return response.errors.map(function (err) {
            return err.msg;
        }).join(' ');
    }

    return fallback;
}

async function cargarVideos(busqueda) {
    const grid = document.getElementById('video-grid');
    const catalogTitle = document.getElementById('catalog-title');
    const contador = document.getElementById('contador-videos-home');
    const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');
    const termino = busqueda ? busqueda.trim() : '';

    catalogTitle.textContent = termino ? 'Resultados para "' + termino + '"' : 'Últimos videos';
    btnLimpiarBusqueda.classList.toggle('d-none', !termino);
    grid.innerHTML = '<div class="col-12"><div class="home-empty-state">Cargando videos...</div></div>';

    const videos = await obtenerVideos(termino);
    contador.textContent = Array.isArray(videos) ? videos.length : 0;

    if (!videos || videos.length === 0) {
        if (termino) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="home-empty-state">
                        <p class="fs-4 mb-1">No se encontraron vídeos para "${escaparHtml(termino)}".</p>
                        <p class="text-muted small mb-0">Prueba con otro término o vuelve al catálogo completo.</p>
                    </div>
                </div>
            `;
        } else {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="home-empty-state">
                        <p class="fs-4 mb-1">No hay vídeos disponibles todavía.</p>
                        <p class="text-muted small mb-0">Sé el primero en subir uno.</p>
                    </div>
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

function escaparHtml(text) {
    return String(text || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
