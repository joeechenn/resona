import { put } from '@vercel/blob'
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    // validate user
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // FormData is used to handle file uploads, so we can get the avatar image if it exists
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch {
            return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
        }

        const name = formData.get('name');
        const bio = formData.get('bio');
        const imageFile = formData.get('image');

        // build the update data object based on what fields were provided
        const updateData: { name?: string; bio?: string; image?: string } = {};

        if (name !== null) {
            if (typeof name !== 'string') {
                return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
            }

            if (name.trim().length === 0) {
                return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
            }

            if (name.trim().length > 50) {
                return NextResponse.json({ error: 'Name must be 50 characters or less' }, { status: 400 });
            }

            updateData.name = name.trim();
        }

        if (bio !== null) {
            if (typeof bio !== 'string') {
                return NextResponse.json({ error: 'Invalid bio' }, { status: 400 });
            }

            if (bio.length > 160) {
                return NextResponse.json({ error: 'Bio must be 160 characters or less' }, { status: 400 });
            }

            updateData.bio = bio;
        }

        if (imageFile !== null) {
            if (!(imageFile instanceof File) || imageFile.size === 0) {
                return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
            }

            if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
                return NextResponse.json({ error: 'Profile image must be a JPG, PNG, or WebP file' }, { status: 400 });
            }

            if (imageFile.size > MAX_PROFILE_IMAGE_SIZE) {
                return NextResponse.json({ error: 'Profile image must be 2MB or smaller' }, { status: 400 });
            }

            const blob = await put(`avatars/${userId}`, imageFile, {
                access: 'public',
            });
            updateData.image = blob.url;
        }

        // if no fields were provided, return an error
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                bio: true,
                image: true,
            }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
