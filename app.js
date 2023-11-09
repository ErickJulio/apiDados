const express = require('express');
const faker = require('faker');
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();
const cpfCheck = require('cpf-check');
const cepPromise = require('cep-promise');
const bodyParser = require('body-parser');
const client = require('twilio')('AC53e0821f48f3d4541a0a446e13482882', '3ad67d33d78ec8c717e66bd744132b37');
const cors = require('cors'); 
const pgp = require('pg-promise')();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

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

// Rota para verificar o login e senha
// Rota para verificar o login e senha
app.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  const client = new Client(dbConfig);
  await client.connect();

  try {
    const query = 'SELECT login, senha FROM cadastro_user WHERE login = $1';
    const result = await client.query(query, [login]);

    if (result.rows.length === 0) {
      // Usuário não encontrado, solicite o cadastro
      res.status(401).json({ message: 'Usuário não encontrado. Por favor, cadastre-se.' });
    } else if (result.rows[0].senha !== senha) {
      // Senha incorreta
      res.status(401).json({ message: 'Senha incorreta.' });
    } else {
      // Usuário encontrado e senha correta, você pode autenticar o usuário aqui
      res.json({ message: 'Login bem-sucedido!' });
    }
  } catch (error) {
    console.error('Erro na consulta:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  } finally {
    await client.end();
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
      host: 'api-teste-dados.onrender.com',
      schemes: ['https'],
      description: 'Teste'
};

// Configuração do banco de dados PostgreSQL
const dbConfig = {
  host: 'motty.db.elephantsql.com',
  database: 'qfjzpbuq',
  user: 'qfjzpbuq',
  password: 'GSsKmhQ-QHHNhgDrACUZXLmCqyjEhr8d'
};

const db = pgp(dbConfig);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Rota para inserir dados no banco de dados
app.post('/inserir-dados', async (req, res) => {
  try {
    const { login, senha, ddd, celular, rua, numero, cep, cidade, estado } = req.body;

    if (!login || !senha || !ddd || !celular || !rua || !numero || !cep || !cidade || !estado) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios estão faltando' });
    }

    // Executa a consulta SQL para inserção de dados
    const insertQuery = `INSERT INTO cadastro_user (login, senha, ddd, celular, rua, numero, cep, cidade, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await db.none(insertQuery, [login, senha, ddd, celular, rua, numero, cep, cidade, estado]);

    res.status(200).json({ mensagem: 'Dados inseridos com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).json({ erro: 'Erro ao inserir dados' });
  }
});

app.post('/esqueci-senha', async (req, res) => {
  const { login, senha, confirmarSenha } = req.body;

  // Verifica se a senha e a confirmação de senha coincidem
  if (senha !== confirmarSenha) {
    return res.status(400).json({ message: 'Senha e confirmação de senha não coincidem.' });
  }

  try {
    // Consulta o login na tabela cadastro_user
    const result = await pool.query('SELECT login FROM cadastro_user WHERE login = $1', [login]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Login não encontrado' });
    }

    // Atualiza a senha no banco de dados
    const hashedNovaSenha = await bcrypt.hash(senha, 10);
    await pool.query('UPDATE cadastro_user SET senha = $1 WHERE login = $2', [hashedNovaSenha, login]);

    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao consultar ou atualizar o banco de dados:', error);
    res.status(500).json({ message: 'Erro ao consultar ou atualizar o banco de dados' });
  }
});


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
