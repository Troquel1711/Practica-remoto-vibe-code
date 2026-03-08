import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const userPayload = await verifyToken(token);
  if (!userPayload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { orderID } = await req.json();

    // @ts-ignore
    if (userPayload.plan === 'premium') {
      return NextResponse.json({ success: true, message: 'Ya eres premium' });
    }

    // In a real-world scenario, you would verify the orderID with PayPal's API here.
    // For this demonstration, we assume the frontend already completed the flow successfully
    // and we'll immediately convert the user to 'premium'.

    // @ts-ignore
    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId as string },
      data: { plan: 'premium' }
    });

    // Sign a new token to update the role/plan in the cookie if needed
    const newToken = await signToken({ 
      userId: updatedUser.id, 
      email: updatedUser.email, 
      role: updatedUser.role,
      plan: updatedUser.plan
    });

    const response = NextResponse.json({ success: true, user: { plan: updatedUser.plan } });
    
    // Update the cookie with the new token
    response.cookies.set('token', newToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      path: '/', 
      maxAge: 60 * 60 * 24 * 7 
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error interno o pago no verificado' }, { status: 500 });
  }
}
