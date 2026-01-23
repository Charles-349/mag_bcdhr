import db from './db'; 
import { modules, permissions } from './schema';

// List of modules, descriptions, and their permissions with descriptions
const seedData = [
  {
    moduleName: 'Company',
    description: 'Manage company information and details',
    permissions: [
      { name: 'create_company', description: 'Create a new company' },
      { name: 'view_company', description: 'View company details' },
      { name: 'update_company', description: 'Update company information' },
      { name: 'delete_company', description: 'Delete a company' },
    ],
  },
  {
    moduleName: 'Department',
    description: 'Manage departments within companies',
    permissions: [
      { name: 'create_department', description: 'Create a new department' },
      { name: 'view_department', description: 'View department details' },
      { name: 'update_department', description: 'Update department information' },
      { name: 'delete_department', description: 'Delete a department' },
      { name: 'view_department_employees', description: 'View employees of a department' },
    ],
  },
  {
    moduleName: 'Employee',
    description: 'Manage employee profiles and information',
    permissions: [
      { name: 'create_employee', description: 'Create a new employee' },
      { name: 'view_employee', description: 'View employee details' },
      { name: 'update_employee', description: 'Update employee information' },
      { name: 'delete_employee', description: 'Delete an employee' },
      { name: 'view_employee_profile', description: 'View employee profile' },
      { name: 'reset_employee_password', description: 'Reset an employee password' },
      { name: 'upload_employee', description: 'Upload employees via file' },
    ],
  },
  {
    moduleName: 'Leave Type',
    description: 'Manage different types of leaves',
    permissions: [
      { name: 'create_leave_type', description: 'Create a new leave type' },
      { name: 'view_leave_type', description: 'View leave type details' },
      { name: 'update_leave_type', description: 'Update leave type information' },
      { name: 'delete_leave_type', description: 'Delete a leave type' },
    ],
  },
  {
    moduleName: 'Leave Request',
    description: 'Manage leave requests submitted by employees',
    permissions: [
      { name: 'create_leave_request', description: 'Submit a leave request' },
      { name: 'view_leave_request', description: 'View leave requests' },
      { name: 'update_leave_request', description: 'Update a leave request' },
      { name: 'delete_leave_request', description: 'Delete a leave request' },
      { name: 'approve_leave_request', description: 'Approve or reject leave requests' },
      { name: 'view_team_leave_requests', description: 'View leave requests of team members' },
    ],
  },
  {
    moduleName: 'Leave Balance',
    description: 'Manage employee leave balances',
    permissions: [
      { name: 'manage_leave_balance', description: 'Allocate and manage leave balances' },
    ],
  },
  {
    moduleName: 'Role',
    description: 'Manage user roles and their permissions',
    permissions: [
      { name: 'create_role', description: 'Create a new role' },
      { name: 'view_role', description: 'View roles' },
      { name: 'update_role', description: 'Update role information' },
      { name: 'delete_role', description: 'Delete a role' },
      { name: 'assign_permissions', description: 'Assign permissions to roles' },
      { name: 'view_permissions', description: 'View permissions of a role' },
    ],
  },
  {
    moduleName: 'Permission',
    description: 'Manage system permissions',
    permissions: [
      { name: 'create_permission', description: 'Create a new permission' },
      { name: 'view_permission', description: 'View permissions' },
      { name: 'update_permission', description: 'Update permission information' },
      { name: 'delete_permission', description: 'Delete a permission' },
    ],
  },
  {
    moduleName: 'Module',
    description: 'Manage system modules',
    permissions: [
      { name: 'create_module', description: 'Create a new module' },
      { name: 'view_module', description: 'View modules' },
      { name: 'update_module', description: 'Update module information' },
      { name: 'delete_module', description: 'Delete a module' },
    ],
  },
  {
    moduleName: 'User Role',
    description: 'Assign and manage roles for users',
    permissions: [
      { name: 'assign_role', description: 'Assign a role to a user' },
      { name: 'view_user_roles', description: 'View user roles' },
      { name: 'update_user_role', description: 'Update a user role' },
      { name: 'delete_user_role', description: 'Remove a role from a user' },
    ],
  },
  {
    moduleName: 'Role Permission',
    description: 'Manage permissions assigned to roles',
    permissions: [
      { name: 'assign_permission', description: 'Assign a permission to a role' },
      { name: 'view_role_permissions', description: 'View permissions assigned to roles' },
      { name: 'remove_permission', description: 'Remove a permission from a role' },
      { name: 'view_employee_permissions', description: 'View all permissions an employee has through roles' },
    ],
  },
];

export const seedModulesAndPermissions = async () => {
  for (const mod of seedData) {
    // Insert module with description
    const moduleInsert = await db.insert(modules).values({ name: mod.moduleName, description: mod.description }).returning({ id: modules.id });
    const moduleId = moduleInsert[0].id;

    // Insert permissions for the module with descriptions
    const permissionInserts = mod.permissions.map((perm) => ({ moduleId, name: perm.name, description: perm.description }));
    await db.insert(permissions).values(permissionInserts);

    console.log(`Seeded module: ${mod.moduleName} with permissions: ${mod.permissions.map(p => p.name).join(', ')}`);
  }
};

// Run seed
seedModulesAndPermissions()
  .then(() => console.log('Seeding completed!'))
  .catch((err) => console.error('Seeding failed:', err));