const baseURL = 'http://192.168.1.129:3000'; // Dirección del backend Express

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
        url = baseURL + '/videos?search=' + encodeURIComponent(search);
    } else{
        url = baseURL + '/videos';
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
    const response = await fetch(baseURL + '/playlist');
    return response.json();
}

//obtener todos los usuarios
async function obtenerUsuarios() {
    const response = await fetch(baseURL + '/users');
    return response.json();
}

//obtener un usuario por su ID
async function obtenerUsuarioId(id) {
    const response = await fetch(baseURL + '/user/' + id);
    return response.json();
}

//actualizar nombre y username del usuario en sesión (requiere autenticación)
async function actualizarUsuario(id, userData) {
    const res = await fetch(baseURL + '/user/' + id, {
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


