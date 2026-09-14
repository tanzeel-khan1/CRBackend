const COMPANY_ACCESS_ROLES = [
  'owner',
  'admin',
  'investor',
  'finance_manager',
  'accountant',
  'auditor',
  'viewer',
];

const getCompanyAccessRoles = () => [...COMPANY_ACCESS_ROLES];

module.exports = {
  COMPANY_ACCESS_ROLES,
  getCompanyAccessRoles,
};
