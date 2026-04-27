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

    videoElement.src = baseURL + currentVideo.path;
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

    dashPlayer.initialize(videoElement, baseURL + currentVideo.dash, true);

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
    let html = 
        '<article class="card p-3 mb-2" id="com-' + comment.id + '">' +
            '<div class="d-flex justify-content-between align-items-start gap-3">' +
                '<div>' +
                    '<p class="fw-semibold mb-1">Usuario #' + comment.userId + '</p>' +
                    '<p class="mb-0" id="texto-' + comment.id + '">' + escaparHtml(comment.text) + '</p>' +
                '</div>' +
                '<div class="text-end">' +
                    '<small class="text-muted d-block mb-1">' + new Date(comment.createdAt).toLocaleString('es-ES') + '</small>';

    // Añadimos los botones de forma sencilla si hay sesión iniciada
    if (estaLogueado()) {
        html += 
            '<button class="btn btn-sm btn-link text-decoration-none p-0 me-2" onclick="editarComentario(' + comment.id + ')">Editar</button>' +
            '<button class="btn btn-sm btn-link text-decoration-none text-danger p-0" onclick="borrarComentario(' + comment.id + ')">Borrar</button>';
    }

    html += 
                '</div>' +
            '</div>' +
        '</article>';

    return html;
}
async function borrarComentario(id) {
    if (!confirm('¿Borrar comentario?')) return;

    const response = await fetch(baseURL + '/comment/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });

    if (response.ok) {
        // Si va bien, borramos la caja entera del HTML
        document.getElementById('com-' + id).remove();
    } else {
        // Si va mal (ej. error 403), sacamos un alert simple
        alert('No se pudo borrar el comentario. Asegúrate de que es tuyo.');
    }
}

async function editarComentario(id) {
    const parrafo = document.getElementById('texto-' + id);
    const nuevoTexto = prompt('Editar comentario:', parrafo.innerText);

    // Si cancela o no hay texto nuevo, no hacemos nada
    if (!nuevoTexto || nuevoTexto === parrafo.innerText) return;

    const response = await fetch(baseURL + '/comment/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ text: nuevoTexto })
    });

    if (response.ok) {
        // Si va bien, cambiamos el texto en la pantalla
        parrafo.innerText = nuevoTexto;
    } else {
        alert('No se pudo editar el comentario. Asegúrate de que es tuyo.');
    }
}

function escaparHtml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
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
