document.addEventListener('DOMContentLoaded', async function () {
    botonesAuth();
    await cargarPlaylist();
});

function mostrarError(message) {
    const errorBox = document.getElementById('playlist-error');
    errorBox.textContent = message;
    errorBox.classList.remove('d-none');
}

function ocultarError() {
    const errorBox = document.getElementById('playlist-error');
    errorBox.textContent = '';
    errorBox.classList.add('d-none');
}

async function cargarPlaylist() {
    ocultarError();

    let videos = await obtenerPlaylist();
    if (!videos || videos.error) {
        mostrarError('No se pudo cargar la playlist.');
        return;
    }

    if (videos.length === 0) {
        videos = await obtenerVideos();
    }

    if (!videos || videos.length === 0) {
        mostrarError('No hay vídeos disponibles para la playlist.');
        return;
    }

    const playlistVideos = videos.filter(function (video) {
        return video.path;
    });

    if (playlistVideos.length === 0) {
        mostrarError('No hay vídeos procesados disponibles para reproducir.');
        return;
    }

    document.getElementById('playlist-count').textContent = playlistVideos.length + ' vídeos';
    const firstLink = document.getElementById('playlist-first-link');
    if (firstLink) {
        firstLink.href = 'player.html?id=' + playlistVideos[0].id;
    }
    renderPlaylist(playlistVideos);
}

function renderPlaylist(playlistVideos) {
    const list = document.getElementById('playlist-list');
    list.innerHTML = '';

    playlistVideos.forEach(function (video, index) {
        const item = document.createElement('a');
        item.href = `player.html?id=${video.id}`;
        item.className = 'playlist-item text-start text-decoration-none';
        item.innerHTML = `
            <div class="d-flex align-items-start gap-3">
                <div class="playlist-index">${index + 1}</div>
                <img src="${video.thumbnail ? staticURL + video.thumbnail : ''}" alt="" class="playlist-thumb">
                <div class="min-width-0">
                    <p class="fw-semibold mb-1 text-dark">${escaparHtml(video.title || 'Sin título')}</p>
                    <p class="text-muted mb-0 small">Usuario #${video.userId || '-'} · Video #${video.id}</p>
                </div>
            </div>
        `;
        list.appendChild(item);
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
