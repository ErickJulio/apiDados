const express = require('express');
const faker = require('faker');
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();
const cpfCheck = require('cpf-check');
const cepPromise = require('cep-promise');

const app = express();
const port = 3000;

// Defina o endpoint de geração de dados fictícios
app.get('/gerar-dadosAleatorios', (req, res) => {
  const nome = faker.name.findName();
  const cpf = faker.random.number({ min: 10000000000, max: 99999999999 }).toString();
  const dataNascimento = faker.date.between('1950-01-01', '2003-12-31').toLocaleDateString();

  res.status(200).json({
    nome: nome,
    cpf: cpf,
    dataNascimento: dataNascimento
  });
  res.status(400).json({
    mensagem: 'Recurso não encontrado'
  });
  res.status(401).json({
    mensagem: 'Não autorizado'
  });
  res.status(500).json({
    mensagem: 'Erro interno do servidor'
  });
});
app.use(express.json());
app.post('/validar-cpf', (req, res) => {
  const cpf = req.body.cpf;

  if (cpf) {
    if (cpfCheck.validate(cpf)) {
      res.status(200).json({ mensagem: 'CPF válido' });
    } else {
      res.status(404).json({ mensagem: 'CPF inválido' });
    }
  } else {
    res.status(400).json({ mensagem: 'Corpo da solicitação inválido. Deve conter a propriedade "cpf".' });
  }
});
app.use(express.json());
app.post('/validar-cep', async (req, res) => {
  const cep = req.body.cep;

  if (!cep) {
    return res.status(400).json({ mensagem: 'Corpo da solicitação inválido. Deve conter a propriedade "cep".' });
  }

  try {
    const endereco = await cepPromise(cep);
    res.status(200).json(endereco);
  } catch (error) {
    res.status(404).json({ mensagem: 'CEP não encontrado' });
  }
});
// Defina a documentação Swagger
const outputFile = './swagger-output.json';
const endpointsFiles = [__filename]; // Use o caminho deste arquivo
const doc = {
  info: {
    title: 'Gerar Dados',
    version: '1.0.0'
  },
  host: 'localhost:3000'
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
    console.log(`API rodando em http://localhost:${port}`);
  });
});
