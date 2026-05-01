import supabase from '../config/supabase.js';
import prisma from '../config/prisma.js';

export const createEmployee = async (req, res) => {
  try {
    const { 
      prefix, firstName, lastName, nickname, 
      email, password, role, department, salary 
    } = req.body;

    if (!email || !password || !prefix || !firstName || !lastName) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    // 1. Check if email already exists in our database to prevent orphaned Auth users
    const existingEmployee = await prisma.employee.findUnique({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' });
    }

    // 2. Create User in Supabase Auth (Admin API bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth Error:', authError);
      return res.status(400).json({ error: 'ไม่สามารถสร้างบัญชีผู้ใช้ได้: ' + authError?.message });
    }

    // 3. Create Employee in Prisma using the Supabase User ID
    const newEmployee = await prisma.employee.create({
      data: {
        id: authData.user.id, // Link directly to Supabase Auth User
        prefix,
        firstName,
        lastName,
        nickname,
        email,
        role: role || 'STAFF',
        department,
        salary: salary ? parseFloat(salary) : null,
        status: 'ACTIVE',
      }
    });

    // 4. Return success
    return res.status(201).json({
      message: 'สร้างบัญชีพนักงานสำเร็จ',
      employee: newEmployee,
    });

  } catch (error) {
    console.error('Create Employee Error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง' });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        firstName: 'asc'
      }
    });
    
    return res.json(employees);
  } catch (error) {
    console.error('Get Employees Error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน' });
  }
};
