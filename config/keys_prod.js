module.exports = {
    mongoURI: process.env.MONGO_URI,
    secret: process.env.SECRET,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    awsBucketName: process.env.AWS_BUCKET_NAME,
    mailerHost: process.env.MAILER_HOST,
    mailerPort: process.env.MAILER_PORT,
    mailerAuthUser: process.env.MAILER_AUTH_USER,
    mailerAuthPass: process.env.MAILER_AUTH_PASS,
    myName: process.env.MY_NAME,
    myPosition: process.env.MY_POSITION,
    myPhone: process.env.MY_PHONE,
    apiUrl: process.env.API_URL,
    nodeOptions: process.env.NODE_OPTIONS
};