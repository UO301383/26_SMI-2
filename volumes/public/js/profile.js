//espera a que el html esté completamente cargado
document.addEventListener('DOMContentLoaded', async function() {

    requiereAuth();
    botonesAuth();

    const usuario = obtenerUsuarioEnSesion();

    // muestra los datos del perfil
    document.getElementById('nombre-usuario').textContent = usuario.name || usuario.username;
    document.getElementById('username-usuario').textContent = '@' + usuario.username;
    pintarAvatarUsuario(usuario);

    //Pone el avatar del usuario si tiene uno, sino pone el avatar por defecto
    // carga los videos del usuario
    await cargarVideosUsuario(usuario.id);

    const btnEditar = document.getElementById('btn-editar-perfil');
    if(btnEditar){
        btnEditar.addEventListener('click', function (){
            document.getElementById('editar-nombre').value=usuario.name || '';
            document.getElementById('editar-error').textContent='';
            const modal=new bootstrap.Modal(document.getElementById('modal-editar-perfil'));
            modal.show();
        });
    }
    const btnConfirmarEditar=document.getElementById('btn-confirmar-editar');
    if(btnConfirmarEditar){
        btnConfirmarEditar.addEventListener('click',async function (){
            const nombre=document.getElementById('editar-nombre').value.trim();
            const archivoAvatar=document.getElementById('editar-avatar').files[0];
            const error=document.getElementById('editar-error');

            error.textContent='';
            if (!nombre){
                error.textContent='El nombre es obligatorio';
                return;
            }

            btnConfirmarEditar.disabled=true;

            const resultado= await actualizarUsuario(usuario.id, {name:nombre});

            if(!resultado.id){
                error.textContent=resultado.error || 'Error al actualizar el perfil.';
                btnConfirmarEditar.disabled=false;
                return;
            }
            if(archivoAvatar){
                const resAvatar=await subirArchivoAvatar(archivoAvatar);
                if(resAvatar.icon){
                    usuario.icon = resAvatar.icon;
                    pintarAvatarUsuario(usuario);
                } else {
                    error.textContent=resAvatar.error || 'Error al actualizar la foto de perfil.';
                    btnConfirmarEditar.disabled=false;
                    return;
                }
            }

            usuario.name = nombre;
            localStorage.setItem('user', JSON.stringify(usuario));
            document.getElementById('nombre-usuario').textContent=nombre;
            btnConfirmarEditar.disabled=false;
            bootstrap.Modal.getInstance(document.getElementById('modal-editar-perfil')).hide();
        });
    }
});

async function cargarVideosUsuario(idUsario) {
    const grid = document.getElementById('videos-usuario-grid');
    const contador = document.getElementById('contador-videos');
    grid.innerHTML = '<div class="col-12"><div class="profile-empty-state">Cargando videos...</div></div>';

    const videos = await obtenerVideosPorUsuario(idUsario);
    contador.textContent = videos.length;

    if (videos.length === 0) {
        grid.innerHTML = '<div class="col-12"><div class="profile-empty-state">No has subido ningún video aún.</div></div>';
        return;
    }

    grid.innerHTML = ''; 

    videos.forEach(function(video) {
        let thumbnail = video.thumbnail ? staticURL + video.thumbnail : '';
        grid.innerHTML += 
            '<div class="col">' +
                '<div class="card h-100 border-0 shadow-sm">' +
                    '<a href="player.html?id=' + video.id + '">' +
                        '<img src="' + thumbnail + '" class="card-img-top" style="aspect-ratio:16/9; object-fit:cover;" alt="Miniatura">' +
                    '</a>' +
                    '<div class="card-body px-2 py-2">' +
                        '<p class="card-title fw-semibold text-dark mb-1" style="font-size:0.9rem;">' + escaparHtml(video.title) + '</p>' +
                        '<div class="d-flex justify-content-between align-items-center mt-2">' +
                            '<span class="text-muted" style="font-size:0.8rem;">' + new Date(video.createdAt).toLocaleDateString('es-ES') + '</span>' +
                            '<div>' +
                                '<button class="btn btn-sm btn-outline-secondary p-1 me-2" style="font-size:0.8rem;" onclick="editarVideo(' + video.id + ')">Editar</button>' +
                                '<button class="btn btn-sm btn-outline-danger p-1" style="font-size:0.8rem;" onclick="borrarVideo(' + video.id + ')">Borrar</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });
}

function pintarAvatarUsuario(usuario) {
    const avatar = document.getElementById('avatar-usuario');
    const fallback = document.getElementById('avatar-iniciales');
    const inicial = (usuario.name || usuario.username || 'U').trim().charAt(0).toUpperCase();

    fallback.textContent = inicial || 'U';

    if (usuario.icon) {
        avatar.src = staticURL + usuario.icon + '?t=' + Date.now();
        avatar.classList.remove('d-none');
        fallback.classList.add('d-none');
    } else {
        avatar.removeAttribute('src');
        avatar.classList.add('d-none');
        fallback.classList.remove('d-none');
    }
}

function escaparHtml(text) {
    return String(text || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function borrarVideo(id) {
    if (!confirm('¿Estás seguro de que quieres borrar este video? Esta acción no se puede deshacer.')) return;

    const response = await fetch(baseURL + '/video/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });

    if (response.ok) {
        const usuario = obtenerUsuarioEnSesion();
        await cargarVideosUsuario(usuario.id);
    } else {
        alert('No se pudo borrar el video. Asegúrate de que eres el propietario.');
    }
}

async function editarVideo(id) {
    const videoActual = await obtenerVideosPorId(id);
    if (!videoActual || videoActual.error) {
        alert('No se pudieron cargar los datos del vídeo.');
        return;
    }

    const nuevoTitulo = prompt('Edita el título del vídeo:', videoActual.title);
    if (nuevoTitulo === null) return; 

    const nuevaDesc = prompt('Edita la descripción del vídeo:', videoActual.description);
    if (nuevaDesc === null) return; 

    const response = await fetch(baseURL + '/video/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ 
            title: nuevoTitulo.trim(), 
            description: nuevaDesc.trim() 
        })
    });

    if (response.ok) {
        const usuario = obtenerUsuarioEnSesion();
        await cargarVideosUsuario(usuario.id);
    } else {
        alert('No se pudo editar el vídeo. Asegúrate de que eres el propietario.');
    }
}
