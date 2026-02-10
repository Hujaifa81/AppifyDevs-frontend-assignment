import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../_data';
import { COOKIE_NAME, verifyToken } from '@/lib/token';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import sharp from 'sharp';
import { sanitizeString } from '../../../../lib/sanitizers';

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  contactNumber: z.string().min(3).max(30).optional(),
  avatar: z.string().optional(), 
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
  }

  try {
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      body = {};
      for (const [key, value] of form.entries()) {
        if (value instanceof File) {
          body[key] = value; // File object
        } else {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
    }

    const parse = updateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, message: 'Invalid payload', error: parse.error.format() }, { status: 400 });
    }

    const user = db.profiles.find((p) => p.id === payload.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { name, contactNumber, avatar } = parse.data;

    if (body.avatar instanceof File) {
      const file: File = body.avatar;
      const maxBytes = 5 * 1024 * 1024; 
      if (file.size > maxBytes) {
        return NextResponse.json({ success: false, message: 'Avatar too large (max 5MB)' }, { status: 400 });
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json({ success: false, message: `Unsupported image type: ${file.type}` }, { status: 415 });
      }

      const arrayBuffer = await file.arrayBuffer();
      let buffer = Buffer.from(arrayBuffer);

      try {
        const out = await sharp(buffer).resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
        buffer = Buffer.from(out);
      } catch (err) {
        console.warn('sharp processing failed, continuing with original buffer', err);
      }

      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const ext = file.type.split('/')[1] || 'jpg';
        const filename = `${user.id}-avatar-${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);
        (user as any).avatar = `/uploads/${filename}`;
      } catch (err) {
        console.error('avatar save error', err);
      }
    } else if (avatar && typeof avatar === 'string' && avatar.startsWith('data:')) {
      try {
        const matches = avatar.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const mime = matches[1];
          const ext = mime.split('/')[1] || 'png';
          const data = matches[2];
          const buffer = Buffer.from(data, 'base64');
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          const filename = `${user.id}-avatar-${Date.now()}.${ext}`;
          const filePath = path.join(uploadsDir, filename);
          await fs.writeFile(filePath, buffer);
          (user as any).avatar = `/uploads/${filename}`;
        } else {
          (user as any).avatar = avatar;
        }
      } catch (err) {
        console.error('avatar dataurl save error', err);
      }
    } else if (avatar) {
      (user as any).avatar = avatar;
    }

    if (name) (user as any).name = sanitizeString(name);
    if (contactNumber) (user as any).contactNumber = sanitizeString(contactNumber);

    try {
      const dbPath = path.join(process.cwd(), 'server', 'db.json');
      await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not persist db to disk:', err);
    }

    return NextResponse.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Update failed' }, { status: 500 });
  }
}
