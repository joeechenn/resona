'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getInitial } from '@/lib/utils/utils';

// props passed in from the profile page
interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentName: string | null;
    currentBio: string | null;
    currentImage: string | null;
    currentSpotifyId: string | null;
    onSave: (updatedUser: {
        id: string;
        name: string | null;
        bio: string | null;
        image: string | null;
    }) => void;
}

// user data returned after a successful edit
type UpdatedUser = {
    id: string;
    name: string | null;
    bio: string | null;
    image: string | null;
};

// api response shape for the edit route
type EditProfileResponse = {
    user?: UpdatedUser;
    error?: string;
};

export default function EditProfileModal({
    isOpen,
    onClose,
    userId,
    currentName,
    currentBio,
    currentImage,
    currentSpotifyId,
    onSave,
}: EditProfileModalProps) {
    const [nameInput, setNameInput] = useState('');
    const [bioInput, setBioInput] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isSpotifyConnected = Boolean(currentSpotifyId);

    // reset the form when the modal opens
    useEffect(() => {
        if (!isOpen) return;

        setNameInput(currentName ?? '');
        setBioInput(currentBio ?? '');
        setSelectedImageFile(null);
        setErrorMessage(null);
    }, [isOpen, currentName, currentBio]);

    const handleSubmit = async () => {
        const normalizedCurrentName = currentName ?? '';
        const normalizedNextName = nameInput.trim();
        const isNameChanged = normalizedNextName !== normalizedCurrentName;
        const isBioChanged = bioInput !== (currentBio ?? '');
        const hasImageChange = selectedImageFile !== null;

        if (!isNameChanged && !isBioChanged && !hasImageChange) {
            setErrorMessage('No changes provided.');
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const formData = new FormData();

            if (isNameChanged) {
                formData.append('name', normalizedNextName);
            }

            if (isBioChanged) {
                formData.append('bio', bioInput);
            }

            if (selectedImageFile) {
                formData.append('image', selectedImageFile);
            }

            const response = await fetch(`/api/profile/${userId}/edit`, {
                method: 'PATCH',
                body: formData,
            });

            let data: EditProfileResponse = {};

            try {
                data = await response.json();
            } catch {
                // keep fallback message below when json parsing fails
            }

            if (!response.ok) {
                setErrorMessage(data.error ?? 'Failed to update profile.');
                return;
            }

            if (data.user) {
                onSave(data.user);
                onClose();
                return;
            }

            setErrorMessage('Unexpected response format from edit profile api.');
        } catch (error) {
            console.error('Failed to update profile:', error);
            setErrorMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    // keep the modal unmounted while closed
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xl mx-4 rounded-2xl bg-neutral-800 px-8 py-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                    aria-label="Close edit profile modal"
                >
                    <X size={20} />
                </button>

                {/* modal header */}
                <div className="flex items-center gap-4 mb-8 pr-8">
                    {currentImage ? (
                        <img
                            src={currentImage}
                            alt={currentName || 'Profile'}
                            className="h-14 w-14 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-700 text-lg font-semibold text-white">
                            {getInitial(currentName)}
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
                        <p className="text-sm text-neutral-400">Update your name, bio, and profile image.</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-neutral-300 mb-2">
                            Name
                        </label>
                        <input
                            id="profile-name"
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            maxLength={50}
                            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                            placeholder="Your name"
                        />
                        <p className="mt-2 text-xs text-neutral-400">
                            {nameInput.length}/50
                        </p>
                    </div>

                    <div>
                        <label htmlFor="profile-bio" className="block text-sm font-medium text-neutral-300 mb-2">
                            Bio
                        </label>
                        <textarea
                            id="profile-bio"
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            rows={4}
                            maxLength={160}
                            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                            placeholder="Tell people a little about your taste"
                        />
                        <p className="mt-2 text-xs text-neutral-400">
                            {bioInput.length}/160
                        </p>
                    </div>

                    <div>
                        <label htmlFor="profile-image" className="block text-sm font-medium text-neutral-300 mb-2">
                            Profile Image
                        </label>
                        <input
                            id="profile-image"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => setSelectedImageFile(e.target.files?.[0] ?? null)}
                            className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-600"
                        />
                        {selectedImageFile && (
                            <p className="mt-2 text-xs text-neutral-400">
                                Selected: {selectedImageFile.name}
                            </p>
                        )}
                    </div>

                </div>

                {errorMessage && (
                    <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
                )}

                {/* modal actions */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-neutral-600 bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                    {isSpotifyConnected ? (
                        <div className="inline-flex items-center gap-3 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-white">
                            <Image
                                src="/spotify.svg"
                                alt="Spotify"
                                width={20}
                                height={20}
                            />
                            Spotify Connected
                        </div>
                    ) : (
                        <>
                            <a
                                href="/api/spotify/connect"
                                className="inline-flex items-center gap-3 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                            >
                                <Image
                                    src="/spotify.svg"
                                    alt="Spotify"
                                    width={20}
                                    height={20}
                                />
                                Connect with Spotify
                            </a>
                            <p className="mt-3 max-w-lg text-xs leading-5 text-neutral-400">
                                Enhance your experience with more features by connecting your Resona
                                <br />
                                account with your Spotify account. Your niche taste stays niche. Probably.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
