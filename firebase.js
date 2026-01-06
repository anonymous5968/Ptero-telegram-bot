const admin = require('firebase-admin');

// --- HARDCODED FIREBASE KEY ---
const serviceAccount = {
  "type": "service_account",
  "project_id": "pterobot-d58b5",
  "private_key_id": "220fa8753fc8a9725475b89f7f23c0ae978e4f85",
  // Added .replace() here to ensure the string is read correctly by Node
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKxkICyZWTjwoV\nxpqYFjXc2Jzj+jhfZsnZw+L0g0N/ULqga/LiNklsFDZnSQK2+QSxS41HZvJHNpY/\n85wZWsrL5g9EQ8ttX2MhlfmDMQQERw+ecy47ML/ET024tRZSQn34CV8StxPh/WTN\nsEAjePrIsA+7c90vvoNR1xJiMU+RoyRBBhm8BejMztT69AHhQMHe5DSS+rs5TM9+\n8I6zw7vmcUX+35ZcgUvi/dwa5jTO1e1THkdXL8+FW0qSWtrijtAKOUYwrtsEjyV4\nDBzaveHpkUaadNL7xCCWC3Z+5TBsX13oPzP1keCZAvrJyez7byHj0yOUObn9lRVL\nN5eW5kNTAgMBAAECggEADXXswt+b4NBBhKGK+Kacy7zLaWzeWiLqKl0RD1c5X1W+\nFdEkrfSZmiWbWO7lUb0lHRndVoyUb7rFbZhf1+UJilCK2ebANdH7tCqPBjD2Scxn\n0oZl3sMFL+RtzeGjijFkyFbi60yg8sMN8oONNm2dBD5/xNtTpww4DnI/A6qvVAUI\nnSoHpq25uxZK8PGg1H/GQgxSTwQGVvPPkCRMNWsyERsg8BizTx194shghEIO2DJf\ngkC2WF8iYDTmKvEfy4ZN7wgXYDuiOvE9fuSI6htgKzBrp9xEo9W3I/h72HMXQyHr\n0jvb+Px+tOO3ScGkDDnR0G273mx0hW+jU5Ohv4cn+QKBgQDztyx/ECvlpGpv2d+p\n60VtUjHumisSqFeLwGauY5pNOfIklW+jjFvciC8X9cniTV/VIOhubogUnw0HedqK\nXEBrhiniSUBeQdmsMvc8QYoKLeR6hN/1tH+0RGUVZuzBgR7IhjLWYcLmpXTO3Z4q\nJ+/wb7eZ8WHtGtLNJnjUBeSYqwKBgQDU/ssrPP9EC0ric95eIcjqWNIlSzPKKtru\nXV3Ajd1+x36RpKfL/KxdIFw9D6DVH70ExTBtixhBGjCVMTLNpbGMAnwNAIclIz5v\nsy0w8Pr7veBaf8yPXPWxCZ4m5qm/I6w2KiLU6/VcUMxFULWz1C5tfTI0VS3zb1PR\nB/GOc1NP+QKBgQDD9ZmChSc2m0+1pbJwNqr5LqjVWAKgGtlhlg850v5jb98hyUId\nd6L5HEr5cfikzF/sx2v8N0WVhxl71F+C9pAZpKOSviFSaJI0IjqmqW/rpWDbnnFR\nZ5NzB7dbUQm2wTJWO4ku1SZYO9tC5fDhpoEHi1xOHEcH1ZR/vZpTqHVYxwKBgA39\nwrjPY/FDUKL5e4TxcTI7rWo3u2ovUHxR88OfTgpy7lSA3Wjf6y6e3pBAQ49ca10x\n2tGHTouQPdq/BZhOpxAMZbuw6i+9Ve+edHx/h+0bdu5a8MQGFjmP6SyjAEmG/Vv9\nfpY//bkXsaNn/teWO4qDq9WWNtOD35yeifaSisl5AoGAZok08xFgkQEOu+UI3hWo\n+rsg518mHwvIXqVjnCbnJ3oVzrRabCde7ZtGS1KwoVh+AcgN84leVTG2vExo6vGX\nC23UPmnuQXd3uxrZz0kIwRavpfRmEXz06ZCEKKhcXjNymqim3ZTQ5nfgW3OaBkxh\nvhT3kBjYcxlUn9+Ou5ys+rE=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@pterobot-d58b5.iam.gserviceaccount.com",
  "client_id": "104739432239903992461",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;

