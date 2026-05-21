import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'verify') {
      const { email } = body;
      
      const userList = await db.query.users.findMany({
        where: eq(users.email, email)
      });
      
      if (userList.length > 0) {
        return NextResponse.json({ userId: userList[0].id });
      } else {
        return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
      }
    }
    
    if (action === 'reset') {
      const { userId, newPassword } = body;
      
      if (!userId || !newPassword) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
      }
      
      const hashedPassword = await hash(newPassword, 10);
      
      await db.update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.id, userId));
        
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
