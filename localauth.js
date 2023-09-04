const { Client, RemoteAuth, LocalAuth } = require('./index.js');
const qrcode = require('qrcode-terminal');

const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const md5 = require('md5');

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');

const getAllInstances = require('./src/db/allusers.js');
const insertInstancia = require('./src/db/insertuser.js');


require('dotenv').config();


app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor da API iniciado na porta ${PORT}`);
});

// mongoose.connect(process.env.MONGODB_URI).then(() => {
session = function (session) {
  console.log('session', session);

  const client = new Client({
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--no-first-run",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    },
    authStrategy: new LocalAuth({
      clientId: md5(session),
    })
  });

  client.initialize();

  client.on(`qr`, (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on(`authenticated`, async () => {
    console.log('Authenticated ' + session);
  });

  client.on(`auth_failure`, (msg) => {
    console.log(`auth_failure`, msg);
  });

  client.on(`ready`, () => {
    console.log(`Ready`);
  });

  client.on(`disconnected`, (reason) => {
    console.log(`disconnected`, reason);
  });

  return client;
}

app.post('/instancia/iniciar', async (req, res) => {
  const instance = req.query.instancia;

  await insertInstancia(instance);

  new session(instance)
  res.status(200).json({
    status: true,
    data: instance + ' iniciado com sucesso!'
  });
});

app.get('/instancia/listar', async (req, res) => {
  await getAllInstances().then(instances => {
    res.status(200).json({
      status: true,
      data: instances[0]
    })
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    })
  })
});

app.post('/instancia/restaurar', (req, res) => {
  const instance = req.query.instancia;
  session(instance);
  res.status(200).json({
    status: true,
    data: instance + ' restaurado com sucesso!'
  })
})
// function restaurar() {
//   getAllInstances().then(instances => {
//     instances[0].forEach(instance => {
//       new session(instance['instancia']);
//     })
//   })

// }

let sessoes = {

};

app.post('/mensagens/enviarMensagem', (req, res) => {
  const instance = req.query.instancia;
  const number = req.body.numero;
  const message = req.body.mensagem;

  sessoes[instance].sendMessage(number + '@c.us', message).then(response => {
    res.status(200).json({
      status: true,
      data: {
        remote: response['_data']['id']['remote'],
        id: response['_data']['id']['id'],
        body: response['_data']['body'],
      },
    });
  })
});