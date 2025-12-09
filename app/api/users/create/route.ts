import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email, password, displayName, role } = await request.json();

        // 1. Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
        });

        // 2. Create user document in Firestore with role
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name: displayName,
            role,
            createdAt: new Date(),
            photoURL: null,
            provider: 'password',
        });

        // 3. Generate verification link and send email
        const verificationLink = await adminAuth.generateEmailVerificationLink(email);
        await sendVerificationEmail(email, verificationLink);

        return NextResponse.json({ uid: userRecord.uid, message: 'User created successfully. Verification email sent.' });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
