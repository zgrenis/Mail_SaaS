const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// --- YENİ ---
const gmailRoutes = require('./routes/gmail.routes');
app.use('/api/gmail', gmailRoutes);

const { startMailPoller } = require('./jobs/mailPoller');
startMailPoller();
// --- YENİ SON ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));