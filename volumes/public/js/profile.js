//espera a que el html esté completamente cargado
document.addEventListener('DOMContentLoaded', async function() {

    requiereAuth();
    botonesAuth();

    const usuario = getSessionUser();

    // muestra los datos del perfil
    document.getElementById('nombre-usuario').textContent = usuario.username;
    document.getElementById('username-usuario').textContent = '@' + usuario.username;

    //Pone el avatar del usuario si tiene uno, sino pone el avatar por defecto
    if (usuario.avatar) {
        document.getElementById('avatar-usuario').src = usuario.avatar;
    }
    // carga los videos del usuario
    await cargarVideosUsuario(usuario.id);

    //click en "+" para cambiar el icono del usuario
    document.getElementById('btn-cambiar-icono').addEventListener('click', function() {
        document.getElementById('input-avatar').click(); //simula un click en el input oculto
    });

    //cuando se selecciona un archivo en el input de subida de icono
    document.getElementById('input-avatar').addEventListener('change', async function() {
        const archivo = this.files[0];
        if (!archivo) {
            return;
        }
        const respuesta= await subirArchivoAvatar(archivo); //llama a api.js para subir el nuevo icono del usuario
        if(respuesta.avatar){
            document.getElementById('avatar-usuario').src = URL + respuesta.avatar; //actualiza el avatar en la página
        }
    });
});

async function cargarVideosUsuario(idUsario) {
    const grid = document.getElementById('videos-usuario-grid');
    grid.innerHTML = '<p class="text-center">Cargando videos...</p>';

    const videos = await fetchVideosByUserId(idUsario); //llama a api.js para obtener los videos del usuario

    if (videos.length === 0) {
        grid.innerHTML = '<p class="text-center">No has subido ningún video aún.</p>';
        return;
    }

    grid.innerHTML = ''; //limpia el mensaje de carga

    videos.forEach(function(video) {
        grid.innerHTML += crearTarjetaVideo(video);
    });
}



