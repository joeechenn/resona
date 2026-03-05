'use client';
import { useEffect, useState } from 'react';
import { formatRelativeTime } from '@/lib/utils/timeUtils';

export interface CommentProps {
    id: string;
    postId: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    content: string;
    createdAt: string;
}

export default function CommentSection({ postId }: { postId: string }) {
    const [comments, setComments] = useState<CommentProps[]>([]);
    const [input, setInput] = useState('');
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchComments = async () => {
            setIsCommentLoading(true);
            setErrorMessage(null);
            try {
                const response = await fetch(`/api/post/${postId}/comment`);
                const data = await response.json();
                if (response.ok) {
                    setComments(data.comments);
                } else {
                    setErrorMessage(data?.error ?? 'Failed to fetch comments');
                }
            } catch (error) {
                console.error('Failed to fetch comments:', error);
                setErrorMessage('Failed to fetch comments');
            } finally {
                setIsCommentLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/post/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: trimmedInput }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data?.error ?? 'Failed to add comment');
                return;
            }

            if (data?.newComment) {
                setComments((prev) => [...prev, data.newComment as CommentProps]);
                setInput('');
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            setErrorMessage('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-3 ml-10 rounded-xl bg-neutral-900/60 p-3">
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {isCommentLoading && <p className="text-sm text-neutral-400">Loading comments...</p>}

                {!isCommentLoading && comments.length === 0 && (
                    <p className="text-sm text-neutral-400">No comments yet.</p>
                )}

                {!isCommentLoading && comments.map((comment) => (
                    <div key={comment.id} className="rounded-md bg-neutral-800/80 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white truncate">
                                {comment.user.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {formatRelativeTime(comment.createdAt)}
                            </p>
                        </div>
                        <p className="text-sm text-neutral-200 mt-1 break-words">{comment.content}</p>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || input.trim().length === 0}
                    className="rounded-md border border-neutral-700 bg-neutral-700 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Posting...' : 'Post'}
                </button>
            </div>

            {errorMessage && (
                <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
            )}
        </div>
    );
}
