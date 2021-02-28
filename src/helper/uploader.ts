import cloudinary from 'cloudinary';

const cloudBucket  = cloudinary.v2;

cloudBucket.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
});