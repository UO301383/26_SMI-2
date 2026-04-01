const URL = 'http://localhost:3000'; // Dirección del backend Express

//devuelve los headers necesarios para las peticiones, si withAuth es true, incluye el token de autenticación en los headers.
function getHearders(withAuth = false) {
    const token = localStorage.getItem('token');
    if(withAuth){
        const headers = { 'Content-Type': 'application/json' };
        if(token){
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
}

// Obtener todos los videos (con búsqueda opcional))
async function getVideos(search) {
    let url;
    if (search) {
        url = URL + '/videos?search=' + encodeURIComponent(search);
    } else{
        url = URL + '/videos';
    }
    const response = await fetch(url);
    return response.json();
}

//Obtener un video por su ID
async function getVideoById(id) {
    const response = await fetch(URL + '/video/' + id);
    return response.json();
}

//Obtener videos de un usuario concreto
async function getVideosByUser(userId) {
    const response = await fetch(URL + '/video/user/' + userId);
    return response.json();
}

//Obtener playlist
async function getPlaylist(){
    const response = await fetch(URL + '/playlist');
    return response.json();
}

//Obtener todos los usuarios
async function getUsers() {
    const response = await fetch(URL + '/users');
    return response.json();
}

//Obtener un usuario por su ID
async function getUserById(id) {
    const response = await fetch(URL + '/user/' + id);
    return response.json();
}

//Actualizar nombre y username del usuario en sesión (requiere autenticación)
async function updateUser(id, userData) {
    const res = await fetch(URL + /user/, {
        method: 'PUT',
        headers: getHearders(true),
        body: JSON.stringify(userData)
    });
    return res.json();
}