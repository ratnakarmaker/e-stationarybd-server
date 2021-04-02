const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const objectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.send('Hello Everyone!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vdydn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const itemCollection = client.db(`${process.env.DB_NAME}`).collection("item");
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");

  app.get('/events', (req, res)=> {
    itemCollection.find({})
    .toArray((err, document)=> {
      res.send(document)
    })
  })

  app.get('/selelctedProduct/:id', (req, res)=> {
    itemCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, document)=> {
      res.send(document)
    })
  })

  app.post('/addEvent', (req, res)=> {
    const eventDetails = req.body;
    itemCollection.insertOne(eventDetails)
    .then(result => {
      res.status(200).send('Inserted');
      console.log('inserted :' , result.insertedCount);
    })
  })

  // create new user
  app.post('/signup', (req, res)=> {
    const userData = req.body;
    usersCollection.insertOne(userData)
    .then(result => res.status(200).send('User Created'))
  })

  // login user
  app.get('/signin', (req, res)=> {
    const userData = req.query;
    usersCollection.find(userData)
    .toArray((err, user)=> {
      if(user.length === 0){
        res.status(400)
        res.send({"error": "Wrong Eamil Or Password"})
      }
      res.status(200);
      res.send(user[0]);
      
    })
  })

});


app.listen(process.env.PORT || port)