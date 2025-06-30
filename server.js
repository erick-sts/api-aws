require("dotenv").config();
const express = require("express");
const app = express();
//BD
const mongoose = require("mongoose");
//swagger
const swaggerDocs = require("./swagger");
//S3
const AWS = require("aws-sdk");

//Log
const { logInfo, logError } = require("./logger");

app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: CRUD MongoDb
 *     description: Operações de CRUD para usuários no MongoDb.
 *   - name: CRUD MySQL
 *     description: Operações de CRUD para produtos no MySQL.
 *   - name: Buckets
 *     description: Operações de Listar buckets, upload e remoção de arquivo para um bucket S3.
 */

//#region CRUD MongoDb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logInfo("MongoDB conectado", null))
  .catch((err) => logError("Erro ao logar mongodb" + err, null, err));

const UserSchema = new mongoose.Schema({
  nome: String,
  email: String,
});

const User = mongoose.model("Usuario", UserSchema);

/**
 * @swagger
 * /mongodb/testar-conexao:
 *   get:
 *     tags:
 *       - CRUD MongoDb
 *     summary: Testa a conexão com o MongoDB
 *     description: Verifica se a aplicação consegue se conectar ao MongoDB.
 *     responses:
 *       200:
 *         description: Conexão bem-sucedida
 *       500:
 *         description: Erro na conexão com o MongoDB
 */
app.get("/mongodb/testar-conexao", async (req, res) => {
  try {
    //Tentando conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = await User.findOne(); //Consulta simples (primeiro usuário encontrado)

    logInfo("Conexão com o MongoDB efetuada com sucesso", req);

    if (user) {
      res
        .status(200)
        .send("Conexão com o MongoDB bem-sucedida e usuário encontrado!");
    } else {
      res
        .status(200)
        .send(
          "Conexão com o MongoDB bem-sucedida, mas nenhum usuário encontrado."
        );
    }
  } catch (error) {
    await logError("Erro ao conectar no MongoDb" + error, req, error);
    res.status(500).send("Erro na conexão com o MongoDB");
  }
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     tags:
 *       - CRUD MongoDb
 *     summary: Criar um novo usuário
 *     description: Este endpoint cria um novo usuário no sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *             required:
 *               - nome
 *               - email
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID do usuário
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Requisição inválida.
 */
app.post("/usuarios", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    logInfo("Usuário criado", req);
    res.status(201).send(user);
  } catch (error) {
    logError("Erro ao criar usuário", req, error);
    res.status(500).send("Ocorreu um erro interno");
  }
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     tags:
 *       - CRUD MongoDb
 *     summary: Listar todos os usuários
 *     description: Este endpoint retorna todos os usuários cadastrados no sistema.
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 */
app.get("/usuarios", async (req, res) => {
  try {
    const users = await User.find();
    logInfo("Usuários encontrados", req, users);
    res.send(users);
  } catch (error) {
    logError("Erro ao buscar usuários", req, error);
    res.status(500).send("Ocorreu um erro interno");
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     tags:
 *       - CRUD MongoDb
 *     summary: Obter um usuário específico
 *     description: Este endpoint retorna um usuário baseado no ID fornecido.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado.
 */
app.get("/usuarios/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("Usuário não encontrado");

    logInfo("Usuário encontrado", req, user);
    res.send(user);
  } catch (error) {
    logError("Erro ao buscar usuário", req, error);
    res.status(500).send("Ocorreu um erro interno");
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     tags:
 *       - CRUD MongoDb
 *     summary: Atualizar um usuário específico
 *     description: Este endpoint atualiza um usuário baseado no ID fornecido.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado.
 */
app.put("/usuarios/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).send("Usuário não encontrado");

    logInfo("Usuário atualizado", req, user);
    res.send(user);
  } catch (error) {
    logError("Erro ao atualizar usuário", req, error);
    res.status(500).send("Ocorreu um erro interno");
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     tags:
 *       - CRUD MongoDb
 *     summary: Remover um usuário específico
 *     description: Este endpoint remove um usuário baseado no ID fornecido.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado.
 */
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    logInfo("Usuário removido", req);
    res.send({ message: "Usuário removido com sucesso" });
  } catch (error) {
    logError("Erro ao remover usuário", req, error);
    res.status(500).send("Ocorreu um erro interno");
  }
});
//#endregion

//#region MySQL
const mysql = require("mysql2");

// Configuração do pool de conexão MySQL
const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  })
  .promise();

/**
 * @swagger
 * /mysql/testar-conexao:
 *   get:
 *     tags:
 *       - CRUD MySQL
 *     summary: Testa a conexão com o MySQL
 *     description: Verifica se a aplicação consegue se conectar ao MySQL RDS.
 *     responses:
 *       200:
 *         description: Conexão bem-sucedida
 *       500:
 *         description: Erro na conexão com o MySQL
 */
app.get("/mysql/testar-conexao", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as test");
    logInfo("Conexão com o MySQL efetuada com sucesso", req);
    res.status(200).send("Conexão com o MySQL bem-sucedida!");
  } catch (error) {
    await logError("Erro ao conectar no MySQL: " + error, req, error);
    res.status(500).send("Erro na conexão com o MySQL");
  }
});

/**
 * @swagger
 * /init-db:
 *   post:
 *     tags:
 *       - CRUD MySQL
 *     summary: Cria o banco de dados e a tabela produto
 *     description: Inicializa a estrutura do banco de dados MySQL.
 *     responses:
 *       200:
 *         description: Banco de dados e tabela criados com sucesso
 *       500:
 *         description: Erro ao criar estrutura do banco
 */
app.post("/init-db", async (req, res) => {
  try {
    const createTable = `
            CREATE TABLE IF NOT EXISTS produto (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao VARCHAR(255) NOT NULL,
                preco DECIMAL(10,2) NOT NULL
            )
        `;
    await pool.query(createTable);
    logInfo("Banco de dados e tabela criados com sucesso", req);
    res.send("Banco de dados e tabela criados com sucesso.");
  } catch (error) {
    logError("Erro ao criar estrutura do banco: " + error, req, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /produtos:
 *   get:
 *     tags:
 *       - CRUD MySQL
 *     summary: Listar todos os produtos
 *     description: Este endpoint retorna todos os produtos cadastrados no MySQL.
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do produto
 *                   nome:
 *                     type: string
 *                     description: Nome do produto
 *                   descricao:
 *                     type: string
 *                     description: Descrição do produto
 *                   preco:
 *                     type: number
 *                     format: float
 *                     description: Preço do produto
 */
app.get("/produtos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM produto");
    logInfo("Produtos encontrados", req, rows);
    res.json(rows);
  } catch (error) {
    logError("Erro ao buscar produtos", req, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     tags:
 *       - CRUD MySQL
 *     summary: Obter um produto específico
 *     description: Este endpoint retorna um produto baseado no ID fornecido.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do produto
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 descricao:
 *                   type: string
 *                 preco:
 *                   type: number
 *                   format: float
 *       404:
 *         description: Produto não encontrado.
 */
app.get("/produtos/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM produto WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    logInfo("Produto encontrado", req, rows[0]);
    res.json(rows[0]);
  } catch (error) {
    logError("Erro ao buscar produto", req, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /produtos:
 *   post:
 *     tags:
 *       - CRUD MySQL
 *     summary: Criar um novo produto
 *     description: Este endpoint cria um novo produto no sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do produto
 *               descricao:
 *                 type: string
 *                 description: Descrição do produto
 *               preco:
 *                 type: number
 *                 format: float
 *                 description: Preço do produto
 *             required:
 *               - nome
 *               - descricao
 *               - preco
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID do produto criado
 *       400:
 *         description: Requisição inválida.
 */
app.post("/produtos", async (req, res) => {
  const { nome, descricao, preco } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO produto (nome, descricao, preco) VALUES (?, ?, ?)",
      [nome, descricao, preco]
    );
    logInfo("Produto criado", req, { id: result.insertId });
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    logError("Erro ao criar produto", req, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     tags:
 *       - CRUD MySQL
 *     summary: Atualizar um produto específico
 *     description: Este endpoint atualiza um produto baseado no ID fornecido.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do produto
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *                 format: float
 *             required:
 *               - nome
 *               - descricao
 *               - preco
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       404:
 *         description: Produto não encontrado.
 */
app.put("/produtos/:id", async (req, res) => {
  const { nome, descricao, preco } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE produto SET nome = ?, descricao = ?, preco = ? WHERE id = ?",
      [nome, descricao, preco, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    logInfo("Produto atualizado", req);
    res.json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    logError("Erro ao atualizar produto", req, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     tags:
 *       - CRUD MySQL
 *     summary: Remover um produto específico
 *     description: Este endpoint remove um produto baseado no ID fornecido.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do produto
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto removido
 *       404:
 *         description: Produto não encontrado.
 */
app.delete("/produtos/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM produto WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    logInfo("Produto removido", req);
    res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    logError("Erro ao remover produto", req, error);
    res.status(500).json({ error: error.message });
  }
});
//#endregion

//#region S3
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  sessionToken: process.env.SESSION_TOKEN,
});

const s3 = new AWS.S3();

/**
 * @swagger
 * /buckets:
 *   get:
 *     summary: Lista todos os buckets
 *     tags:
 *       - Buckets
 *     responses:
 *       200:
 *         description: Lista de todos os buckets
 */
app.get("/buckets", async (req, res) => {
  try {
    const data = await s3.listBuckets().promise();
    logInfo("Buckets encontrados", req, data.Buckets);
    res.status(200).json(data.Buckets);
  } catch (error) {
    logError("Erro ao buscar buckets", req, error);
    res.status(500).json({ error: "Erro ao listar buckets", details: error });
  }
});

/**
 * @swagger
 * /buckets/{bucketName}:
 *   get:
 *     summary: Lista os objetos de um bucket
 *     tags:
 *       - Buckets
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         description: Nome do bucket
 *     responses:
 *       200:
 *         description: Lista dos objetos do bucket
 */
app.get("/buckets/:bucketName", async (req, res) => {
  const { bucketName } = req.params;
  const params = {
    Bucket: bucketName,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    logInfo("Objetos encontrados", req, data.Contents);
    res.status(200).json(data.Contents);
  } catch (error) {
    logError("Erro ao buscar objetos", req, error);
    res
      .status(500)
      .json({ error: "Erro ao listar objetos do bucket", details: error });
  }
});

/**
 * @swagger
 * /buckets/{bucketName}/upload:
 *   post:
 *     summary: Faz o upload de um arquivo para um bucket
 *     tags:
 *       - Buckets
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         description: Nome do bucket
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Arquivo enviado com sucesso
 */
//Utilizar alguma lib para fazer o upload/strem de arquivos, sugestão: multer
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

app.post(
  "/buckets/:bucketName/upload",
  upload.single("file"),
  async (req, res) => {
    const { bucketName } = req.params;

    const params = {
      Bucket: bucketName,
      Key: req.file.originalname,
      Body: req.file.buffer,
    };

    try {
      const data = await s3.upload(params).promise();
      logInfo("Upload efetuado", req, data);
      res.status(200).json({ message: "Upload realizado com sucesso", data });
    } catch (error) {
      logError("Erro ao efetuar upload", req, error);
      res.status(500).json({ error: "Erro ao fazer upload", details: error });
    }
  }
);

/**
 * @swagger
 * /buckets/{bucketName}/file/{fileName}:
 *   delete:
 *     summary: Deleta um arquivo específico de um bucket
 *     tags:
 *       - Buckets
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         description: Nome do bucket
 *       - in: path
 *         name: fileName
 *         required: true
 *         description: Nome do arquivo a ser deletado
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 */
app.delete("/buckets/:bucketName/file/:fileName", async (req, res) => {
  const { bucketName, fileName } = req.params;

  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    await s3.headObject(params).promise(); // Verifica se o arquivo existe
    await s3.deleteObject(params).promise(); // Deleta
    logInfo(`Arquivo ${fileName} deletado do bucket ${bucketName}`, req);
    res
      .status(200)
      .json({
        message: `Arquivo '${fileName}' deletado com sucesso do bucket '${bucketName}'`,
      });
  } catch (error) {
    if (error.code === "NotFound") {
      res.status(404).json({ error: "Arquivo não encontrado no bucket" });
    } else {
      logError("Erro ao deletar arquivo do bucket", req, error);
      res
        .status(500)
        .json({ error: "Erro ao deletar o arquivo", details: error });
    }
  }
});
//#endregion

swaggerDocs(app);
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
