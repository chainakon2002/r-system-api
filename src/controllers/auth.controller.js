import supabase from '../config/supabase.js';
import prisma from '../config/prisma.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }
    
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // 2. Fetch Employee Profile from Prisma
    const employee = await prisma.employee.findUnique({
      where: { email: authData.user.email },
    });

    if (!employee) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงานในระบบ' });
    }

    // 3. Log the login action
    await prisma.authLog.create({
      data: {
        userId: employee.id,
        action: 'LOGIN',
        ipAddress: req.ip || null,
      }
    });

    // 4. Return the response
    return res.json({
      accessToken: authData.session.access_token,
      user: authData.user,
      employee,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' });
  }
};
