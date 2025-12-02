import express from 'express';
import employee from './employees/employees.router';
// import cors from 'cors'

const initializeApp = ()=>{
const app = express();

//middleware
//  app.use(cors({
//         origin: '*',
//         methods: ["GET", "POST", "PUT", "DELETE"],
//     }));

app.use(express.json());


//routes
employee(app);

app.get('/', (req, res) => {
    res.send('Welcome to the Magnate API');
}
)
return app

}
const app = initializeApp()
export default app;


