const express = require('express');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
//start express app
const app = express();
app.use(express.static(path.join('public')));
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use((req, res, next) => {
	next();
});
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/post', postRoutes);
app.use((req, res, next) => {
	res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.use('*', (req, res, next) => {
	return res.status(404).json({
		status: 'fail',
		error: `we cant find ${req.originalUrl} in your app routing`,
	});
});
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'eRror';
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		name: err.name,
	});
});
module.exports = app;
