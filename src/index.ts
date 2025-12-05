import express from 'express';
import employee from './employees/employees.router';
import roleRoutes from './roles/roles.router';
import permissionRoutes from './permissions/permissions.router';
import rolePermissionRoutes from './rolePermissions/rolePermissions.router';
import department from './departments/department.router';
import cors from 'cors'
import userRole from './userRole/userRole.router';
import modulesRoute from './modules/module.router';
import leaveTypes from './leaveTypes/leaveTypes.router';
import company from './company/company.router';

const initializeApp = ()=>{
const app = express();

//middleware
 app.use(cors({
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
    }));

app.use(express.json());


//routes
employee(app);
roleRoutes(app);
permissionRoutes(app);
rolePermissionRoutes(app);
department(app);
userRole(app);
modulesRoute(app);
leaveTypes(app);
company(app);

app.get('/', (req, res) => {
    res.send('Welcome to the Magnate API');
}
)
return app

}
const app = initializeApp()
export default app;


