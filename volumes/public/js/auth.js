
//Redirige a la pagina de login si el usuario no esta logueado
function requiereAuth(){
    if (!isLoggedIn()){
        window.location.href = 'auth.html';
    }
}

//Pinta los botones de inicio se sesion o cerrar sesión dependiendo de si el usuario esta logueado o no
function botonesAuth(){
    const nav = document.getElementById('nav-auth');
    if(!nav){
        return;
    }
    if (isLoggedIn()){ //Si hay sesión, muestra el botón de perfil y cerrar sesión
        nav.innerHTML = '<a href="profile.html" class="btn btn-outline-danger btn-sm">Mi perfil</a>' +
        '<button onclick="logout()" class="btn btn-outline-danger btn-sm">Cerrar sesión</button>';
    } else { //Si no hay sesión, muestra el botón de iniciar sesión
        nav.innerHTML = '<a href="auth.html" class="btn btn-outline-danger btn-sm">Iniciar sesión</a>';
    }

}


//guarda sesión en localStorage después de iniciar sesión o registrarse
function saveSession(token, user){
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

//cerrar sesión
function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

//devuelve el usuario en sesión (si hay token, devuelve el usuario almacenado en localStorage, de lo contrario devuelve null)
function getSessionUser(){
    const user = localStorage.getItem('user');
    if (user){
        return JSON.parse(user);
    }
    return null;
}

//devuelve true si hay sesion activa, false si no
function isLoggedIn(){
    return !!localStorage.getItem('token');
}


