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
    renderPlaylist(playlistVideos);
}

function renderPlaylist(playlistVideos) {
    const list = document.getElementById('playlist-list');
    list.innerHTML = '';

    playlistVideos.forEach(function (video, index) {
        const item = document.createElement('a');
        item.href = `player.html?id=${video.id}`;
        item.className = 'card p-3 text-start border-0 text-decoration-none';
        item.innerHTML = `
            <div class="d-flex align-items-start gap-3">
                <img src="${video.thumbnail ? baseURL + video.thumbnail : ''}" alt="" class="rounded" style="width:96px;height:54px;object-fit:cover;background:#e9ecef;">
                <div>
                    <p class="fw-semibold mb-1 text-dark">${video.title || 'Sin título'}</p>
                    <p class="text-muted mb-0 small">Usuario #${video.userId || '-'}</p>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}
