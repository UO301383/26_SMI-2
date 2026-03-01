// Book model

// declare an array of book objects
const videos = [];

// Operations to manage the book objects
module.exports.create = (data) => {
    const id = videos.length + 1;
    const video = { 
        id: id, 
        title: data.title, 
        description: data.description,
        userId: data.userId,
        thumbnail: data.thumbnail,
        path: data.path,
        dash: data.dash
     }; 
    videos.push(video);
    return Promise.resolve(video);
};

module.exports.findAll = () => {
    return Promise.resolve(videos);    
};

module.exports.findById = (id) => {
    const video = videos.find(video => video.id == id);
    return Promise.resolve(video);
}

module.exports.drop = () => {
    videos.length = 0;
    return Promise.resolve();
}