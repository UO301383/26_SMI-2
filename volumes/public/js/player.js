let currentVideo = null;
let dashPlayer = null;
let dashTimeoutId = null;

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
        mostrarError('No se pudo cargar el vídeo solicitado.');
        return;
    }

    currentVideo = video;

    document.getElementById('video-title').textContent = video.title || 'Sin título';
    document.getElementById('video-description').textContent = video.description || 'Sin descripción disponible.';
    document.getElementById('video-meta').textContent = construirMeta(video);

    reproducirMp4();

    const btnDash = document.getElementById('btn-modo-dash');
    if (!video.dash) {
        btnDash.disabled = true;
        btnDash.classList.add('disabled');
    }
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
}

function reproducirMp4() {
    if (!currentVideo || !currentVideo.path) {
        mostrarError('Este vídeo no tiene archivo MP4 disponible.');
        return;
    }

    const videoElement = document.getElementById('video-player');
    destruirDashSiExiste();

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
    destruirDashSiExiste();
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

    dashPlayer.initialize(videoElement, staticURL + currentVideo.dash, true);

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
    const autor = comment.User || comment.user || {};
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