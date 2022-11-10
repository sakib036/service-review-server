const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cez8utx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req,res,next){
    const authHeader=(req.headers.authorization)
    if(!authHeader){
        res.status(401).send ({message:'unauthorized access'})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err,decoded){
        if(err){
            res.status(401).send ({message:'unauthorized access'})
        }
        req.decoded=decoded;
        next();

    })
}



async function run() {
    try {
        const serviceCollection = client.db('perfect-engineering').collection('services');
        const commentCollection = client.db('perfect-engineering').collection('comments');


        app.post('/jwt', (req, res)=>{
            const user=req.body;
            const token=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({token})
        })




        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/home/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).limit(3).sort({"_id":-1});
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });


        app.post('/services',async(req,res)=>{
            const service=req.body;
            const result=await serviceCollection.insertOne(service);
            res.send(result);
          });


        app.get('/comments', verifyJWT, async (req, res) => {
            const decoded=req.decoded;
            
            if(decoded.email !==req.query.email){
                req.status(403).send({message:'Forbidden access'})
            }
            let query = {};
            if(req.query.email){
                query={
                    email:req.query.email
                }
               
            }
            const cursor = commentCollection.find(query);
            const comment = await cursor.toArray();
            res.send(comment);
        });

        app.get('/comments/newComment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const comment = await commentCollection.findOne(query);
            res.send(comment);
        });

        app.put('/comments/newComment/:id', async(req, res)=>{
            const id=req.params.id;
            const filter={_id:ObjectId(id)};
            const newComment=req.body;
           
            const option={upsert:true};
            const updateComment={
              $set:{
                comment:newComment.comment,
              }
            }
           
            const result=await commentCollection.updateOne(filter, updateComment, option);
            res.send(result);
          })
       


        app.post('/comments', async (req, res) => {
            const comment=req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        });




        app.get('/comments/:service', async (req, res) => {
        //    const service=(req.params.service);
            let query = {};
        
            if (req.params.service){
                query={
                    service:req.params.service
                }
            } 
           
            const cursor = commentCollection.find(query).sort({"_id":-1});
            const comment = await cursor.toArray();
            res.send(comment);
        });


        app.delete('/comments/:id',async(req,res)=>{
            const id=req.params.id;
           
            const query={_id:ObjectId(id)}
            const result=await commentCollection.deleteOne(query);
            console.log(result)
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
    console.log(`perfect-engineering server running on port ${port}`);
})