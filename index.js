const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const users = require('./users');

const TOKEN = 'asldkmasfjn349-859kqljn141235213lrkm';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.route('/api/health').get((req, res) => res.json({ data: 'API is running' }));
app.route('/api/users').get((req, res) => {
  console.log(req.headers);
  if (req.query.limit) {
    return res.json(users.slice(0, Number(req.query.limit)));
  }
  res.json(users);
});
app.route('/api/user/:id').get((req, res) => {
  const found = users.find(user => user.id === req.params.id);
  if (req.headers['full-user']) {
    found.address = 'Endereço do usuário ' + found.id;
  }
  res.json(found);
});

app.route('/api/auth').post((req, res) => {
  const { email, password } = req.body;
  if (typeof email === 'string' && typeof password === 'string') {
    return res.json({ token: TOKEN });
  }
  res.status(401).json({ message: 'Não autorizado! Usuário ou senha inválida' });
});

app.route('/api/user/create').post((req, res) => {
  const hasBody = Object.keys(req.body).length > 0;
  if (req.headers.authorization && hasBody) {
    const authData = req.headers.authorization.split(' ');
    if (authData[0] === 'JWT' && authData[1] === TOKEN) {
      /*
      * Processa a criação
      */
     return res.status(201).json({ status: 'OK', message: 'Dado persistido com sucesso'});
    }
    return res.status(403).json({ message: 'Sem permissão' });
  }
  return res.status(500).json({ message: 'Erro ao persistir! Dados não recebidos' });
});

http
  .createServer(app)
  .listen(5000)
  .on('listening', () => console.log('Rodando na porta 5000'));