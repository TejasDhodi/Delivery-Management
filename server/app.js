require('dotenv').config({ path: "./.env" });
const express = require('express');
const sequelize = require('./config/db.config');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const partnerRoutes = require('./routes/partnerRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/partners', partnerRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
    .then(() => {
        console.log("Connection Established");
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log("Database synced")
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log("DB Sync Error:", err));