const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cez8utx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('perfect-engineering').collection('services');
        const commentCollection = client.db('perfect-engineering').collection('comments');
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/home/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });



        app.post('/comments', async (req, res) => {
            const comment=req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        });
    }
    finally {

    }
}
run().catch(error => console.log(error));



app.get('/', (req, res) => {
    res.send('server is running')
});


app.listen(port, () => {
    console.log(`node-mongo server running on port ${port}`);
})