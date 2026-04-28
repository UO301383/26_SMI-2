const baseURL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.protocol + '//' + window.location.hostname + ':3000';

//devuelve los headers necesarios para las peticiones, si withAuth es true, incluye el token de autenticación en los headers.
function obtenerHeaders(withAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if(withAuth){
        const token = localStorage.getItem('token');
        if(token){
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
}

// obtener todos los videos (con búsqueda opcional))
async function obtenerVideos(search) {
    let url;
    if (search) {
        url = baseURL + '/video?search=' + encodeURIComponent(search);
    } else{
        url = baseURL + '/video';
    }
    const response = await fetch(url);
    return response.json();
}

//obtener un video por su ID
async function obtenerVideosPorId(id) {
    const response = await fetch(baseURL + '/video/' + id);
    return response.json();
}

//obtener videos de un usuario concreto
async function obtenerVideosPorUsuario(userId) {
    const response = await fetch(baseURL + '/video/user/' + userId);
    return response.json();
}

//obtener playlist
async function obtenerPlaylist(){
    const response = await fetch(baseURL + '/video/playlist');
    return response.json();
}

//obtener todos los usuarios
async function obtenerUsuarios() {
    const response = await fetch(baseURL + '/user');
    return response.json();
}

//obtener un usuario por su ID
async function obtenerUsuarioId(id) {
    const response = await fetch(baseURL + '/user/' + id);
    return response.json();
}

//actualizar nombre y username del usuario en sesión (requiere autenticación)
async function actualizarUsuario(id, userData) {
    const res = await fetch(baseURL + '/user', {
        method: 'PUT',
        headers: obtenerHeaders(true),
        body: JSON.stringify(userData)
    });
    return res.json();
}

//inicar sesión
async function login(email, password) {
    const res = await fetch(baseURL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

//registrar usuario
async function registro(username, email, password) {
    const res = await fetch(baseURL + '/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, username, email, password })
    });
    return res.json();
}

//subir foto del usuario en sesión (PUT /user/upload)
async function subirArchivoAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const respuesta = await fetch(baseURL + '/user/upload', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
    });
    return respuesta.json();
}

//obtener comentarios de un vídeo
async function obtenerComentarios(videoId) {
    const response = await fetch(baseURL + '/comment/video/' + videoId);
    return response.json();
}

//publicar comentario
async function publicarComentario(videoId, text) {
    const res = await fetch(baseURL + '/comment', {
        method: 'POST',
        headers: obtenerHeaders(true),
        body: JSON.stringify({ videoId, text })
    });
    return res.json();
}

//borrar comentario
async function borrarComentario(commentId) {
    const res = await fetch(baseURL + '/comment/' + commentId, {
        method: 'DELETE',
        headers: obtenerHeaders(true)
    });
    return res;
}

//crear un nuevo video (POST /video) devolviendo el id del video creado para luego subir el archivo de video 
 async function crearVideo(titulo, descripcion) {  
    const res = await fetch(baseURL + '/video', {
        method: 'POST',
        headers: obtenerHeaders(true),
        body: JSON.stringify({ title: titulo, description: descripcion })
    });
    return res.json();
}

//subir un archivo de video a un video ya creado (POST /video/:id/upload)
async function subirArchivoVideo(idVideo, file) {
    const formData = new FormData();
    formData.append('video', file);
    
    const res = await fetch(baseURL +'/video/' + idVideo + '/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
    });
    return res.json();
}   
function crearTarjeta(video) {
    let thumbnail;
    if (video.thumbnail) {
        thumbnail = baseURL + video.thumbnail;
    } else {
        thumbnail = '';
    }
    return (
        '<div class="col">' +
            '<a href="player.html?id=' + video.id + '" class="text-decoration-none">' +
                '<div class="card h-100 border-0">' +
                    '<img src="' + thumbnail + '" class="card-img-top" style="aspect-ratio:16/9; object-fit:cover;">' +
                    '<div class="card-body px-1">' +
                        '<p class="card-title fw-semibold text-dark mb-1" style="font-size:0.9rem;">' + video.title + '</p>' +
                        '<p class="text-muted mb-0" style="font-size:0.8rem;">' +
                            new Date(video.createdAt).toLocaleDateString('es-ES') +
                        '</p>' +
                    '</div>' +
                '</div>' +
            '</a>' +
        '</div>'
    );
}

function obtenerUsuarioLocal(){
    const usuarioLocal = localStorage.getItem('user');
    if (!usuarioLocal){
        return null;
    }
    try{
        return JSON.parse(usuarioLocal)
    }catch{
        return null;
    }
}

function esAdmin(){
    const user = obtenerUsuarioLocal()
    return user && user.role === 'admin';
}
