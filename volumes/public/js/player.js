let currentVideo = null;
let dashPlayer = null;
let dashTimeoutId = null;
let dashManifestQualities = [];
let selectedDashQuality = 'auto';

document.addEventListener('DOMContentLoaded', async function () {
    botonesAuth();

    const videoId = new URLSearchParams(window.location.search).get('id');
    if (!videoId) {
        mostrarError('No se ha indicado ningún vídeo.');
        return;
    }

    configurarControlesReproductor();
    configurarFormularioComentarios(videoId);
    configurarModalEditarComentario();
    configurarModalBorrarComentario();

    await cargarVideo(videoId);
    await cargarComentarios(videoId);
});

function mostrarError(message) {
    const errorBox = document.getElementById('player-error');
    errorBox.textContent = message;
    errorBox.classList.remove('d-none');
}

function ocultarError() {
    const errorBox = document.getElementById('player-error');
    errorBox.textContent = '';
    errorBox.classList.add('d-none');
}

async function cargarVideo(videoId) {
    ocultarError();

    const video = await obtenerVideosPorId(videoId);
    if (!video || video.error || !video.id) {
        mostrarError((video && video.error) || 'No se pudo cargar el vídeo solicitado. Puede que el vídeo no exista o todavía se esté procesando.');
        return;
    }

    if (!video.path && !video.dash) {
        mostrarError('Este vídeo todavía se está procesando o quedó incompleto. Vuelve al catálogo y actualiza la página.');
        document.getElementById('video-title').textContent = video.title || 'Vídeo no disponible';
        document.getElementById('video-description').textContent = video.description || '';
        document.getElementById('video-meta').textContent = construirMeta(video);
        return;
    }

    currentVideo = video;

    document.getElementById('video-title').textContent = video.title || 'Sin título';
    document.getElementById('video-description').textContent = video.description || 'Sin descripción disponible.';
    document.getElementById('video-meta').textContent = construirMeta(video);

    resetSelectorCalidadDash();
    if (video.path) {
        reproducirMp4();
    } else {
        reproducirDash();
    }

    const btnDash = document.getElementById('btn-modo-dash');
    btnDash.disabled = !video.dash;
    btnDash.classList.toggle('disabled', !video.dash);
}

function construirMeta(video) {
    const parts = [];

    if (video.userId) {
        parts.push('Usuario #' + video.userId);
    }

    if (video.createdAt) {
        parts.push(new Date(video.createdAt).toLocaleString('es-ES'));
    }

    return parts.join(' · ');
}

function configurarControlesReproductor() {
    document.getElementById('btn-modo-mp4').addEventListener('click', function () {
        reproducirMp4();
    });

    document.getElementById('btn-modo-dash').addEventListener('click', function () {
        reproducirDash();
    });

    document.getElementById('dash-quality-menu').addEventListener('click', cambiarCalidadDash);
}

function actualizarBotonesModo(isDash) {
    const btnMp4 = document.getElementById('btn-modo-mp4');
    const btnDash = document.getElementById('btn-modo-dash');

    if (isDash) {
        btnMp4.className = 'btn btn-outline-danger btn-sm';
        btnDash.className = 'btn btn-danger btn-sm';
    } else {
        btnMp4.className = 'btn btn-danger btn-sm';
        btnDash.className = 'btn btn-outline-danger btn-sm';
    }
}

function destruirDashSiExiste() {
    if (dashTimeoutId) {
        clearTimeout(dashTimeoutId);
        dashTimeoutId = null;
    }

    if (dashPlayer) {
        dashPlayer.reset();
        dashPlayer = null;
    }

    dashManifestQualities = [];
}

function reproducirMp4() {
    if (!currentVideo || !currentVideo.path) {
        mostrarError('Este vídeo no tiene archivo MP4 disponible.');
        return;
    }

    const videoElement = document.getElementById('video-player');
    destruirDashSiExiste();
    resetSelectorCalidadDash();

    videoElement.src = staticURL + currentVideo.path;
    videoElement.load();
    actualizarBotonesModo(false);
}

function reproducirDash() {
    if (!currentVideo || !currentVideo.dash) {
        mostrarError('Este vídeo no tiene contenido DASH disponible.');
        return;
    }

    const videoElement = document.getElementById('video-player');
    const manifestUrl = staticURL + currentVideo.dash;
    destruirDashSiExiste();
    prepararSelectorCalidadDash();
    ocultarError();

    dashPlayer = dashjs.MediaPlayer().create();
    dashPlayer.updateSettings({
        streaming: {
            retryAttempts: {
                MPD: 1,
                MediaSegment: 1,
                InitializationSegment: 1
            }
        }
    });

    dashPlayer.on(dashjs.MediaPlayer.events.ERROR, function () {
        manejarFalloDash('No se pudo reproducir el contenido DASH. Se vuelve al modo MP4.');
    });

    registrarEventoDash(dashjs.MediaPlayer.events.MANIFEST_LOADED, cargarCalidadesDash);
    registrarEventoDash(dashjs.MediaPlayer.events.STREAM_INITIALIZED, cargarCalidadesDash);
    registrarEventoDash(dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED, cargarCalidadesDash);

    cargarCalidadesDesdeManifest(manifestUrl);

    dashPlayer.initialize(videoElement, manifestUrl, true);
    setTimeout(cargarCalidadesDash, 1000);
    setTimeout(cargarCalidadesDash, 2500);

    dashTimeoutId = setTimeout(function () {
        const noHaArrancado = videoElement.readyState < 2 || videoElement.currentTime === 0;
        if (noHaArrancado) {
            manejarFalloDash('El contenido DASH no respondió correctamente. Se vuelve al modo MP4.');
        }
    }, 5000);

    actualizarBotonesModo(true);
}

function manejarFalloDash(message) {
    destruirDashSiExiste();
    mostrarError(message);
    reproducirMp4();
}

function registrarEventoDash(eventName, handler) {
    if (eventName) {
        dashPlayer.on(eventName, handler);
    }
}

function prepararSelectorCalidadDash() {
    const wrapper = document.getElementById('dash-quality-wrapper');
    const button = document.getElementById('dash-quality-button');
    const menu = document.getElementById('dash-quality-menu');

    wrapper.classList.remove('d-none');
    button.disabled = false;
    button.textContent = 'Auto';
    selectedDashQuality = 'auto';
    menu.innerHTML =
        '<li><button class="dropdown-item active" type="button" data-quality="auto">Auto</button></li>' +
        '<li><span class="dropdown-item disabled">Cargando calidades...</span></li>';
}

function resetSelectorCalidadDash() {
    const wrapper = document.getElementById('dash-quality-wrapper');
    const button = document.getElementById('dash-quality-button');
    const menu = document.getElementById('dash-quality-menu');

    wrapper.classList.add('d-none');
    button.disabled = true;
    button.textContent = 'Auto';
    selectedDashQuality = 'auto';
    menu.innerHTML = '<li><button class="dropdown-item active" type="button" data-quality="auto">Auto</button></li>';
}

function cargarCalidadesDash() {
    if (!dashPlayer) {
        return;
    }

    const wrapper = document.getElementById('dash-quality-wrapper');
    const button = document.getElementById('dash-quality-button');
    const menu = document.getElementById('dash-quality-menu');
    const calidades = obtenerCalidadesDash();

    if (calidades.length === 0) {
        return;
    }

    menu.innerHTML = '';
    menu.appendChild(crearOpcionCalidadDash('auto', 'Auto', selectedDashQuality === 'auto'));

    calidades
        .slice()
        .sort(function (a, b) {
            return (a.height || 0) - (b.height || 0);
        })
        .forEach(function (calidad) {
            const altura = calidad.height ? calidad.height + 'p' : 'Calidad ' + (calidad.qualityIndex + 1);
            const bitrate = calidad.bitrate ? ' - ' + Math.round(calidad.bitrate / 1000) + ' kbps' : '';
            const value = String(calidad.qualityIndex);

            menu.appendChild(crearOpcionCalidadDash(value, altura + bitrate, selectedDashQuality === value));
        });

    wrapper.classList.remove('d-none');
    button.disabled = false;

    const opcionActiva = menu.querySelector('[data-quality="' + selectedDashQuality + '"]');
    if (!opcionActiva) {
        selectedDashQuality = 'auto';
        button.textContent = 'Auto';
        marcarOpcionCalidadActiva('auto');
    }
}

function obtenerCalidadesDash() {
    let calidades = [];

    if (typeof dashPlayer.getBitrateInfoListFor === 'function') {
        calidades = dashPlayer.getBitrateInfoListFor('video') || [];
    }

    if (calidades.length === 0 && typeof dashPlayer.getRepresentationsByType === 'function') {
        calidades = (dashPlayer.getRepresentationsByType('video') || []).map(function (representation, index) {
            return {
                qualityIndex: typeof representation.index === 'number' ? representation.index : index,
                height: representation.height,
                bitrate: representation.bandwidth || representation.bitrate
            };
        });
    }

    if (calidades.length === 0) {
        calidades = dashManifestQualities;
    }

    return calidades
        .filter(function (calidad) {
            return typeof calidad.qualityIndex === 'number';
        })
        .filter(function (calidad, index, lista) {
            return lista.findIndex(function (otra) {
                return otra.qualityIndex === calidad.qualityIndex;
            }) === index;
        });
}

async function cargarCalidadesDesdeManifest(manifestUrl) {
    try {
        const response = await fetch(manifestUrl, { cache: 'no-store' });
        if (!response.ok) {
            return;
        }

        const manifestText = await response.text();
        const manifestXml = new DOMParser().parseFromString(manifestText, 'application/xml');
        const adaptationSets = Array.from(manifestXml.getElementsByTagNameNS('*', 'AdaptationSet'));
        const videoAdaptation = adaptationSets.find(function (adaptationSet) {
            const contentType = adaptationSet.getAttribute('contentType');
            const mimeType = adaptationSet.getAttribute('mimeType');
            return contentType === 'video' || (mimeType && mimeType.startsWith('video/'));
        });

        if (!videoAdaptation) {
            return;
        }

        dashManifestQualities = Array.from(videoAdaptation.getElementsByTagNameNS('*', 'Representation')).map(function (representation, index) {
            return {
                qualityIndex: index,
                height: Number(representation.getAttribute('height')) || 0,
                bitrate: Number(representation.getAttribute('bandwidth')) || 0
            };
        });

        cargarCalidadesDash();
    } catch (error) {
        // Si falla el parseo manual, dash.js seguirá intentando obtener las calidades.
    }
}

function cambiarCalidadDash(event) {
    const option = event.target.closest('[data-quality]');
    if (!option) {
        return;
    }

    if (!dashPlayer) {
        return;
    }

    const valor = option.dataset.quality;

    try {
        if (valor === 'auto') {
            actualizarModoAutoDash(true);
            selectedDashQuality = 'auto';
            document.getElementById('dash-quality-button').textContent = 'Auto';
            marcarOpcionCalidadActiva('auto');
            return;
        }

        actualizarModoAutoDash(false);
        cambiarCalidadManualDash(Number(valor));
        selectedDashQuality = valor;
        document.getElementById('dash-quality-button').textContent = option.textContent.trim();
        marcarOpcionCalidadActiva(valor);
    } catch (error) {
        mostrarError('No se pudo cambiar la calidad DASH.');
    }
}

function cambiarCalidadManualDash(qualityIndex) {
    if (typeof dashPlayer.setRepresentationForTypeByIndex === 'function') {
        try {
            dashPlayer.setRepresentationForTypeByIndex('video', qualityIndex, true);
            return;
        } catch (error) {
            // Algunas versiones de dash.js exponen esta API pero no la aceptan con todos los manifiestos.
        }
    }

    if (typeof dashPlayer.setQualityFor === 'function') {
        try {
            dashPlayer.setQualityFor('video', qualityIndex, true);
            return;
        } catch (error) {
            // Compatibilidad con versiones antiguas: si falla, probamos con Representation.
        }
    }

    if (typeof dashPlayer.setRepresentationForType === 'function' && typeof dashPlayer.getRepresentationsByType === 'function') {
        const representations = dashPlayer.getRepresentationsByType('video') || [];
        if (representations[qualityIndex]) {
            try {
                dashPlayer.setRepresentationForType('video', representations[qualityIndex], true);
                return;
            } catch (error) {
                // Si tampoco funciona, se informa al usuario desde cambiarCalidadDash.
            }
        }
    }

    throw new Error('No hay API compatible para cambiar la calidad DASH.');
}

function crearOpcionCalidadDash(value, label, active) {
    const li = document.createElement('li');
    const button = document.createElement('button');

    button.className = 'dropdown-item' + (active ? ' active' : '');
    button.type = 'button';
    button.dataset.quality = value;
    button.textContent = label;

    li.appendChild(button);
    return li;
}

function marcarOpcionCalidadActiva(value) {
    document.querySelectorAll('#dash-quality-menu [data-quality]').forEach(function (option) {
        option.classList.toggle('active', option.dataset.quality === value);
    });
}

function actualizarModoAutoDash(activar) {
    if (typeof dashPlayer.updateSettings === 'function') {
        dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: {
                        video: activar
                    }
                }
            }
        });
    }

    if (typeof dashPlayer.setAutoSwitchQualityFor === 'function') {
        dashPlayer.setAutoSwitchQualityFor('video', activar);
    }

    if (typeof dashPlayer.setAutoSwitchBitrateFor === 'function') {
        dashPlayer.setAutoSwitchBitrateFor('video', activar);
    }
}

async function cargarComentarios(videoId) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '<p class="text-muted">Cargando comentarios...</p>';

    const comments = await obtenerComentarios(videoId);
    if (!comments || comments.error) {
        commentsList.innerHTML = '<p class="text-danger">No se pudieron cargar los comentarios.</p>';
        return;
    }

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-muted">Todavía no hay comentarios.</p>';
        return;
    }

    commentsList.innerHTML = '';
    comments.forEach(function (comment) {
        commentsList.innerHTML += crearComentarioHtml(comment);
    });
}

function crearComentarioHtml(comment) {
    //backend devuelve datos del autor en comment.user gracias al join con User en el controlador)
    const autor = comment.user || {};
    const username = autor.username || 'Usuario desconocido';

    //avatar con foto de perfil
    let avatarHtml;
    if (autor.icon) {
        avatarHtml = '<img src="' + staticURL + autor.icon + '" ' + 'alt="' + escaparHtml(username) + '" class="rounded-circle" style="width:36px;height:36px;object-fit:cover;flex-shrink:0;">'; 
    } else {
        const incial = username.charAt(0).toUpperCase();
        avatarHtml = '<div class="comment-avatar rounded-circle me-2 d-flex align-items-center justify-content-center bg-secondary text-white" ' +
                     'style="width: 40px; height: 40px; font-weight: bold;"' +
                     '>' + incial + '</div>';
    }
    const usuarioLocal = obtenerUsuarioLocal();
    const puedeGestionar = estaLogueado() && usuarioLocal && (usuarioLocal.id === comment.userId || usuarioLocal.role === 'admin');
    
    let botonesHtml = '';
    if (puedeGestionar) {
        botonesHtml = '<button class="btn btn-sm btn-link text-decoration-none p-0 me-2" ' + 'onclick="editarComentario(' + comment.id + ')">Editar</button>' + 
                '<button class="btn btn-sm btn-link text-decoration-none text-danger p-0" ' + 'onclick="borrarComentario(' + comment.id + ')">Borrar</button>';
    }
    return (
        '<article class="card p-3 mb-2" id="com-' + comment.id + '">' +
            '<div class="d-flex gap-3">' +
                avatarHtml +
                '<div class="flex-grow-1">' +
                    '<div class="d-flex justify-content-between align-items-start">' +
                        '<div>' +
                            '<span class="fw-semibold">' + escaparHtml(username) + '</span>' +
                            '<small class="text-muted ms-2">' +
                                new Date(comment.createdAt).toLocaleString('es-ES') +
                            '</small>' +
                        '</div>' +
                        '<div>' + botonesHtml + '</div>' +
                    '</div>' +
                    '<p class="mb-0 mt-1" id="texto-' + comment.id + '">' +
                        escaparHtml(comment.text) +
                    '</p>' +
                '</div>' +
            '</div>' +
        '</article>'
    );
}

function escaparHtml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function borrarComentario(id){
    document.getElementById('borrar-comentario-id').value = id;
    const modal = new bootstrap.Modal(document.getElementById('modal-confirmar-borrar'));
    modal.show();
}
function editarComentario(id) {
    const parrafo = document.getElementById('texto-' + id);
    document.getElementById('editar-comentario-id').value = id;
    document.getElementById('editar-comentario-texto').value = parrafo.innerText;
    document.getElementById('editar-comentario-error').textContent = '';

    const modal = new bootstrap.Modal(document.getElementById('modal-editar-comentario'));
    modal.show();
}

function configurarFormularioComentarios(videoId) {
    const commentInput = document.getElementById('comment-input');
    const commentError = document.getElementById('comment-error');
    const commentButton = document.getElementById('btn-comment');
    const formWrapper = document.getElementById('comment-form-wrapper');

    if (!estaLogueado()) {
        formWrapper.innerHTML = '<p class="mb-0 text-muted">Inicia sesión para publicar comentarios.</p>';
        return;
    }

    commentButton.addEventListener('click', async function () {
        const text = commentInput.value.trim();
        commentError.textContent = '';

        if (!text) {
            commentError.textContent = 'Escribe un comentario antes de publicar.';
            return;
        }

        commentButton.disabled = true;
        const response = await publicarComentario(videoId, text);
        commentButton.disabled = false;

        if (response.error) {
            commentError.textContent = response.error;
            return;
        }

        commentInput.value = '';
        await cargarComentarios(videoId);
    });
}

function configurarModalEditarComentario() {
    const btn = document.getElementById('btn-confirmar-editar-comentario');
    if (!btn) return;

    btn.addEventListener('click', async function () {
        const id = document.getElementById('editar-comentario-id').value;
        const textoNuevo = document.getElementById('editar-comentario-texto').value.trim();
        const error = document.getElementById('editar-comentario-error');

        error.textContent = '';
        if (!textoNuevo) {
            error.textContent = 'El comentario no puede estar vacío.';
            return;
        }
        btn.disabled = true;
        const respuesta = await fetch(baseURL + '/comment/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ text: textoNuevo })
        });
        btn.disabled = false;
        if (respuesta.ok) {
            document.getElementById('texto-' + id).textContent = textoNuevo;
            bootstrap.Modal.getInstance(document.getElementById('modal-editar-comentario')).hide();
        } else {
            error.textContent = 'Error al editar el comentario.';
        }
    });
}
function configurarModalBorrarComentario() {
    const btn = document.getElementById('btn-confirmar-borrar-comentario');
    if (!btn) return;

    btn.addEventListener('click', async function () {
        const id = document.getElementById('borrar-comentario-id').value;

        btn.disabled = true;
        const respuesta = await fetch(baseURL + '/comment/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        btn.disabled = false;
        if (respuesta.ok) {
            document.getElementById('com-' + id).remove();
            bootstrap.Modal.getInstance(document.getElementById('modal-confirmar-borrar')).hide();
        } else {
            alert('Error al borrar el comentario.');
        }
    });
}
