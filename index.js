const express = require('express')
const cors = require('cors')
const app = express()
const mongoDB = require('./db')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const admin = require("firebase-admin");
const http = require('http');
const { Server } = require('socket.io');

const ProductSchema = require('./models/Product')

const serviceAccount = require("./constants/darwintrade-faa9b-firebase-adminsdk-3ujco-1264e70cad.json");
const authRoutes = require('./routes/authRoutes')
const shopRoutes = require('./routes/shopRoutes')
const cartRoutes = require('./routes/cartRoutes')
const checkoutRoutes = require('./routes/checkoutRoutes')
const adminRoutes = require('./routes/adminRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const { requireAuth, checkEmployee } = require('./miiddleware/authMiddleware')
const indexControllers = require('./controllers/indexControllers')


require('dotenv').config();
mongoDB()

const server = http.createServer(app);
const io = new Server(server)
const PORT = process.env.PORT || 5000;

const listen = () => {
  server.listen(PORT, () => console.log(PORT))
  io.on('connection', (socket) => {
    console.log('User connected')
  })
}

listen()

const changeStream = async () => {
  const stream = await ProductSchema.dummyProduct.watch();
  stream.on('change', async (change) => {
    if (change.operationType === 'insert') {
      const newProduct = change.fullDocument;
      const message = `New product in ${newProduct.category} has been added!`;
      io.emit('new-product', { message });
      console.log('emitted')
    }
  });
}

changeStream()

app.use(cors({ origin: `http://localhost:${process.env.port}`, credentials: true }))
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', 0);
  next();
});

app.set('view engine', 'ejs')

app.get('/', indexControllers.getLogin)

app.get('/home', requireAuth, checkEmployee, indexControllers.getHome)

app.get("/about", requireAuth, checkEmployee, indexControllers.getAbout)

app.get("/contact", requireAuth, checkEmployee, indexControllers.getContact)

app.get('/vendor', requireAuth, checkEmployee, indexControllers.getVendor)

app.get('/pageNotFound', requireAuth, checkEmployee, indexControllers.getPageNotFound)

app.use(authRoutes)
app.use(shopRoutes)
app.use(cartRoutes)
app.use(checkoutRoutes)
app.use(adminRoutes)
app.use(vendorRoutes)


const app1 =  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// app.post('/sendNotification', (req, res) =>{
//     const { data, token } = req.body;
//     app1.messaging().send({ data, token})
//     .then(response => {
//       res.json(response);
//     })
//     .catch(error => {
//       res.json(error);
//     })
// })

module.exports = { app, changeStream }