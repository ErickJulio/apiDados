const express = require('express');
const faker = require('faker');
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();
const cpfCheck = require('cpf-check');
const cepPromise = require('cep-promise');
const bodyParser = require('body-parser');
const client = require('twilio')('AC53e0821f48f3d4541a0a446e13482882', '5201862225e53fdc8af97ad1f8677d0f');
const cors = require('cors'); // Importe o módulo cors

const app = express();
const port = 3000;

app.use(cors()); // Use o middleware cors

app.use(express.json());
app.use(bodyParser.json());

// Gerar dados fictícios
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

// Validar CPF
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

// Validar CEP
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

// Enviar SMS
app.post('/enviar-sms', (req, res) => {
  const { to, mensagem } = req.body;

  client.messages
    .create({
      body: mensagem,
      from: '+12293744579', // Seu número Twilio
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

// Defina a documentação Swagger
const outputFile = './swagger-output.json';
const endpointsFiles = [__filename]; // Use o caminho deste arquivo
const doc = {
  info: {
    title: 'Gerar Dados',
    version: '1.0.0'
  },
  servers: [  
    {
      url: 'http://teste-dados.onrender.com/api-docs/'
    },
    {
      url: `http://localhost:${port}`
    }
  ]
};

// Gere a documentação Swagger
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  const swaggerDocument = require(outputFile);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Adicione uma rota raiz para a documentação Swagger
  app.get('/', (req, res) => {
    res.redirect('/api-docs');
  });

  app.listen(port, () => {
    console.log('API rodando em http://teste-dados.onrender.com/api-docs');
  });
});
