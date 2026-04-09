//espera a que el HTML esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', async function(){

    botonesAuth(); //inicializa los botones de login y registro

    await cargarVideos(); //carga los videos en la página

    const busquedaForm = document.getElementById('busqueda-form');
    if (busquedaForm){
        busquedaForm.addEventListener('submit', async function(e){
            e.preventDefault();
            const termino = document.getElementById('busqueda-input').value;
            await cargarVideos(termino); //carga los videos filtrados por el término de búsqueda
        });
    }
});

// función para cargar los videos en el grid de la página principal
async function cargarVideos(busqueda){
    const grid = document.getElementById('video-grid'); // El div donde van las tarjetas
    grid.innerHTML = '<p class="text-muted">Cargando videos...</p>';  // Limpia el contenido del grid antes de cargar los videos
    const videos = await obtenerVideos(busqueda); //llama a api.js para obtener los videos, con el término de búsqueda si se proporcionó
    if(!videos || videos.length === 0){
        grid.innerHTML = '<p class="text-muted">No se encontraron videos</p>';
        return;
    }
    grid.innerHTML = ''; // Limpia el contenido del grid antes de cargar los videos

    videos.forEach(function(video){
        grid.innerHTML += crearTarjeta(video); // Agrega cada tarjeta al grid
    });
}

//función para generar el HTML de una tarjeta de video a partir de los datos del video
// Genera el HTML de una tarjeta de vídeo
function crearTarjeta(video) {
  let thumbnail;
  if (video.thumbnail) {
    thumbnail = baseURL + video.thumbnail; // Si tiene thumbnail, lo usa
  } else {
    thumbnail = ''; // Si no, imagen por defecto
  }

  return (
    '<div class="col">' +
        '<a href="player.html?id=' + video.id + '" class="text-decoration-none">' +
            '<div class="card h-100 border-0">' +
                /* Miniatura del vídeo */
                '<img src="' + thumbnail + '" class="card-img-top" style="aspect-ratio:16/9; object-fit:cover;">' +
                '<div class="card-body px-1">' +
                    /* Título */
                    '<p class="card-title fw-semibold text-dark mb-1" style="font-size:0.9rem;">' + video.title + '</p>' +
                    /* Fecha */
                    '<p class="text-muted mb-0" style="font-size:0.8rem;">' +
                        new Date(video.createdAt).toLocaleDateString('es-ES') + /* Formatea la fecha en español */
                    '</p>' +
                '</div>' +
            '</div>' +
        '</a>' +
    '</div>'
);
}
