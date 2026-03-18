const path = require('path');

const storageRoot = process.env.STORAGE_ROOT || path.join(process.cwd(), 'storage');

module.exports = {
    root: storageRoot,
    uploadsDir: process.env.UPLOADS_DIR || path.join(storageRoot, 'uploads'),
    videosDir: process.env.VIDEOS_DIR || path.join(storageRoot, 'videos'),
    usersDir: process.env.USERS_DIR || path.join(storageRoot, 'users')
};
