const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();          
const corsOptions = {
  // .env'den gelen değerin sonunda slash varsa onu temizleyelim (garantiye alalım)
  origin: process.env.FRONTEND_URL?.replace(/\/$/, ""), 
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));             // Enable requests for all routes
app.use(bodyParser.json());     // Parse JSON bodies for all routes

app.use(bodyParser.urlencoded({ extended: true })); //!test

const userRoutes = require('./routes/user.routes');     //import user routes
app.use('/api/users', userRoutes);                      // Use user routes with /api/users prefix

const gmailRoutes = require('./routes/gmail.routes');   //import gmail routes
app.use('/api/gmail', gmailRoutes);                     // Use gmail routes with /api/gmail prefix

const contactRoutes = require("./routes/contact.routes");
app.use("/api/contact", contactRoutes);

const chatRoutes = require("./routes/chat.routes");
app.use("/api/chat", chatRoutes);


const { startMailPoller } = require('./jobs/mailPoller');  // Start the mail poller cron job 
startMailPoller();           // Start the mail poller cron job to check for new emails every 5 minutes


const PORT = process.env.PORT || 5000;  
const HOST = process.env.HOST || '0.0.0.0'; 

app.listen(PORT, HOST, () => {
    console.log(`🚀 Sunucu başarıyla başlatıldı!`);
    console.log(`🌍 Adres: http://${HOST}:${PORT}`);
});  // Start the server and listen on the specified port