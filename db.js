var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

module.exports.getImages = function getImages() {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 10`);
};
//subquery to determine end of images (hacky way where id is 1 or not hacky get lowest id)

module.exports.getMoreImages = function getMoreImages(imageId) {
    return db.query(
        `SELECT * FROM images WHERE id < $1 ORDER BY id DESC LIMIT 10`,
        [imageId]
    );
};

module.exports.insertFormData = function insertFormData(
    title,
    description,
    username,
    url
) {
    return db.query(
        `INSERT INTO images (title, description, username, url)
    VALUES ($1, $2, $3, $4) RETURNING id, url, username, title, description`,
        [title || null, description || null, username || null, url || null]
    );
};

module.exports.getImageById = function getImageById(imageId) {
    return db.query(`SELECT * FROM images WHERE id = $1`, [imageId]);
};

module.exports.getCommentsByImageId = function getCommentsByImageId(imageId) {
    return db.query(`SELECT * FROM comments WHERE img_id = $1`, [imageId]);
};

module.exports.insertComment = function insertComment(
    comment,
    userName,
    imageId
) {
    return db.query(
        `INSERT INTO comments (comment, username, img_id) VALUES ($1, $2, $3) RETURNING comment, username`,
        [comment || null, userName || null, imageId || null]
    );
};
