// Department-to-admin email mapping
export const DEPARTMENT_ADMINS = {
  "ICT/Portal": "ict@run.edu.ng",
  "Payment/Bursary": "studentaccount@run.edu.ng",
  "Exams/Results": "ict@run.edu.ng",
  "Hostel/Accommodation": "dssscomplaints@run.edu.ng",
  "Library": "library@run.edu.ng",
  "Registrar": "registrar@run.edu.ng",
  "Others": "ict@run.edu.ng"
};

// Super admins have access to all departments
export const SUPER_ADMIN_EMAILS = ["ict@run.edu.ng", "shawolhorizon@gmail.com"];

// Get all departments managed by an email
export function getDepartmentsForEmail(email) {
  // Check if super admin
  if (SUPER_ADMIN_EMAILS.includes(email)) {
    return null; // null means all departments
  }
  
  // Find departments for this email
  return Object.entries(DEPARTMENT_ADMINS)
    .filter(([_, adminEmail]) => adminEmail === email)
    .map(([dept, _]) => dept);
}

// Check if email is authorized for a department
export function isAuthorizedForDepartment(email, department) {
  if (SUPER_ADMIN_EMAILS.includes(email)) return true;
  return DEPARTMENT_ADMINS[department] === email;
}

// Check if email is authorized as admin at all
export function isAuthorizedAdmin(email) {
  if (SUPER_ADMIN_EMAILS.includes(email)) return true;
  return Object.values(DEPARTMENT_ADMINS).includes(email);
}
