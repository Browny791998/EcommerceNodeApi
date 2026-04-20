const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/prodcategoryRoute');
const blogcategoryRouter = require('./routes/blogCatRoute');
const brandRouter = require('./routes/brandRoute');
const couponRouter = require('./routes/couponRoute');
const colorRouter = require('./routes/colorRoute');
const enqRouter = require('./routes/enqRoute');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

const { errorHandler,notFound } = require('./middlewares/errorHandler');
dbConnect();
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use('/api/user',authRouter);
app.use('/api/product',productRouter);
app.use('/api/blog',blogRouter);
app.use('/api/category',categoryRouter);
app.use('/api/blogcategory',blogcategoryRouter);
app.use('/api/brand',brandRouter);
app.use('/api/color',colorRouter);
app.use('/api/coupon',couponRouter);
app.use('/api/enquiry',enqRouter);

app.use(notFound)
app.use(errorHandler)
const server = app.listen(PORT, () => {
  console.log(`Servr is running at PORT ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use — retrying in 1s...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 1000);
  } else {
    throw err;
  }
});