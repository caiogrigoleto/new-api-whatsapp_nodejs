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


require('dotenv').config();


// mongoose.connect(process.env.MONGODB_URI).then(() => {
  session = function (session) {
    console.log('session', session);

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: md5(session),
      })
    });

    client.initialize();

    client.on(`qr`, (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on(`authenticated`, async (session) => {
      console.log('Authenticated');
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
  }

  const restoreSession = function (session) {
    console.log('session', session);

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: md5(session),
      })
    });
    client.initialize();

    client.on(`authenticated`, async (session) => {
      console.log('Authenticated');
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


  app.use(bodyParser.json());
  app.use(cors());

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Servidor da API iniciado na porta ${PORT}`);
  });

  app.post('/instancia/iniciar', (req, res) => {
    const instance = req.query.instancia;

    new session(instance).then(response => {
      res.status(200).json({
        status: true,
        data: response
      });
    })
  });

  let sessions = {
    //1: restoreSession('TESTE'),
    2: restoreSession('TESTE1')
  };

  app.post('/mensagens/enviarMensagem', (req, res) => {
    const instance = req.query.instancia;
    const number = req.body.numero;
    const message = req.body.mensagem;

    sessions[instance].sendMessage(number + '@c.us', message).then(response => {
      res.status(200).json({
        status: true,
        data: {
          remote: response['_data']['id']['remote'],
          id: response['_data']['id']['id'],
          body: response['_data']['body'],
        },
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    })
  });

  app.get('/instancia/listar', async (req, res) => {
    res.status(200).json({
      status: true
    })
  });
// });
// 