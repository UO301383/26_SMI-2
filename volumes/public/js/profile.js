//espera a que el html esté completamente cargado
document.addEventListener('DOMContentLoaded', async function() {

    requiereAuth();
    botonesAuth();

    const usuario = obtenerUsuarioEnSesion();

    // muestra los datos del perfil
    document.getElementById('nombre-usuario').textContent = usuario.username;
    document.getElementById('username-usuario').textContent = '@' + usuario.username;

    //Pone el avatar del usuario si tiene uno, sino pone el avatar por defecto
    if (usuario.icon) {
        document.getElementById('avatar-usuario').src = baseURL + usuario.icon;
    }
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
                    document.getElementById('avatar-usuario').src = baseURL + resAvatar.icon;
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
    grid.innerHTML = '<p class="text-center">Cargando videos...</p>';

    const videos = await obtenerVideosPorUsuario(idUsario); //llama a api.js para obtener los videos del usuario

    if (videos.length === 0) {
        grid.innerHTML = '<p class="text-center">No has subido ningún video aún.</p>';
        return;
    }

    grid.innerHTML = ''; //limpia el mensaje de carga

    videos.forEach(function(video) {
        grid.innerHTML += crearTarjeta(video);
    });
}



