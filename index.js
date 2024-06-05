const express = require("express");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
const e = require("express");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.8wzbur6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("designWorldDB");
    const servicesCollection = database.collection("services");
    const usersCollection = database.collection("allUser");
    const allOrderRequestCollection = database.collection("AllOrderRequest");

    app.get("/roleOfUser/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      res.send(user);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({ role: "user" }).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const query = { email: req.body.email };
      const status = await usersCollection.findOne(query);

      if (!status) {
        const result = await usersCollection.insertOne({
          email: req.body.email,
          name: req.body.name,
          role: "user",
        });
        res.send(result);
      } else {
        res.send({ status: "User data store already!" });
      }
    });

    app.get("/services/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    app.delete("/myOrderList/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await allOrderRequestCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/myOrderList/:email", async (req, res) => {
      const email = req.params.email;
      const result = await allOrderRequestCollection
        .find({ email: email })
        .toArray(); 
      res.send(result);
    });

    app.get("/AllOrderList", async (req, res) => {});

    app.post("/AllOrderList", async (req, res) => {
      const {
        userName,
        email,
        serviceName,
        serviceId,
        price,
        deliveryLocation,
      } = req.body;
      const result = await allOrderRequestCollection.insertOne({
        userName,
        email,
        serviceName,
        serviceId,
        price,
        deliveryLocation,
      });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch((e) => console.log(e));

app.get("/", (req, res) => {
  res.send("Welcome to Design World Server!");
});

app.listen(port, () => {
  console.log(`The app listening on port ${port}`);
});
