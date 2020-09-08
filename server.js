const mongoose = require('mongoose');
const app = require('./app');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
	'<password>',
	process.env.DATABASE_PASSWORd
);
mongoose
	.connect(DB, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((con) => {
		console.log('connection to dataBase successfuly');
	});
const server = app.listen(port, () => {
	console.log(`server start running in ${port}`);
});
process.on('SIGTERM', () => {
	console.log('SIGTERM is finish');
	server.close(() => {
		console.log('process finish');
	});
});
