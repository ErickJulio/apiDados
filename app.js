const express = require('express');
const faker = require('faker');
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();
const cpfCheck = require('cpf-check');
const cepPromise = require('cep-promise');
const bodyParser = require('body-parser');
const client = require('twilio')('AC53e0821f48f3d4541a0a446e13482882', '3ad67d33d78ec8c717e66bd744132b37');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());
app.use(bodyParser.json());

app.get('/gerar-dadosAleatorios', (req, res) => {
  const nome = faker.name.findName();
  const cpf = faker.random.number({ min: 10000000000, max: 99999999999 }).toString();
  const dataNascimento = faker.date.between('1950-01-01', '2003-12-31').toLocaleDateString();

  res.status(200).json({
    nome: nome,
    cpf: cpf,
    dataNascimento: dataNascimento
  });
});

app.post('/validar-cpf', (req, res) => {
  const cpf = req.body.cpf;

  if (!cpf) {
    return res.status(400).json({ mensagem: 'Corpo da solicitação inválido. Deve conter a propriedade "cpf".' });
  }

  if (cpfCheck.validate(cpf)) {
    res.status(200).json({ mensagem: 'CPF válido' });
  } else {
    return res.status(400).json({ mensagem: 'CPF inválido' });
  }
});

app.post('/validar-cep', async (req, res) => {
  const cep = req.body.cep;

  if (!cep) {
    return res.status(400).json({ mensagem: 'Corpo da solicitação inválido. Deve conter a propriedade "cep".' });
  }

  try {
    const endereco = await cepPromise(cep);
    res.status(200).json(endereco);
  } catch (error) {
    res.status(400).json({ mensagem: 'CEP não encontrado' });
  }
});

app.post('/enviar-sms', (req, res) => {
  const { to, mensagem } = req.body;

  client.messages
    .create({
      body: mensagem,
      from: '+12293744579',
      to: to
    })
    .then(message => {
      console.log('Mensagem enviada SID:', message.sid);
      res.status(200).json({ mensagem: 'SMS enviado com sucesso' });
    })
    .catch(error => {
      console.error('Erro ao enviar SMS:', error);
      res.status(400).json({ erro: 'Erro ao enviar SMS' });
    });
});

const outputFile = './swagger-output.json';
const endpointsFiles = [__filename];
const doc = {
  info: {
    title: 'Gerar Dados',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'https://api-teste-dados.onrender.com/api-docs'
    }
  ]
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  const swaggerDocument = require(outputFile);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get('/', (req, res) => {
    res.redirect('/api-docs');
  });
});
