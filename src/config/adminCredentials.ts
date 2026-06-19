export interface AdminCredential {
  id: string;
  password: string;
  role: 'superadmin' | 'admin';
  restaurantId?: string;
  name: string;
}

export const ADMIN_CREDENTIALS: AdminCredential[] = [
  { id: 'superadmin', password: 'superadmin123', role: 'superadmin', name: 'Platform Superadmin' },
  { id: 'admin_ishtaa', password: 'password123', role: 'admin', restaurantId: 'res_1', name: 'Ishtaa Pure Veg' },
  { id: 'admin_jain', password: 'password123', role: 'admin', restaurantId: 'res_2', name: 'Jain Bhoj Kitchen' },
  { id: 'admin_sattvik', password: 'password123', role: 'admin', restaurantId: 'res_3', name: 'Sattvik Kitchen' },
  { id: 'admin_green', password: 'password123', role: 'admin', restaurantId: 'res_4', name: 'Green Garden Bowls' },
  { id: 'admin_organic', password: 'password123', role: 'admin', restaurantId: 'res_5', name: 'Organic Roots' },
  { id: 'admin_prasadam', password: 'password123', role: 'admin', restaurantId: 'res_6', name: 'Prasadam Bhavan' },
  { id: 'admin_vrinda', password: 'password123', role: 'admin', restaurantId: 'res_7', name: 'Vrinda Veg Express' },
  { id: 'admin_ayur', password: 'password123', role: 'admin', restaurantId: 'res_8', name: 'Ayur Kitchen' },
];
