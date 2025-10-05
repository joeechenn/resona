import AnimatedContent from './AnimatedContent'
import { loginWithGoogle, loginWithSpotify } from "@/lib/auth-actions";
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <AnimatedContent
        distance={80}
        direction="vertical"
        reverse={false}
        duration={1.2}
        initialOpacity={0.0}
        animateOpacity
        scale={1}
        threshold={0.1}
        delay={0.5}>
            <div className="text-8xl font-extrabold mb-4">Resona</div>
        </AnimatedContent>
        <div className="flex gap-3 items-center justify-center mb-8">
            <AnimatedContent
            distance={80}
            direction="vertical"
            reverse={false}
            duration={1.0}
            initialOpacity={0.0}
            animateOpacity
            scale={1}
            threshold={0.1}
            delay={1.0}>
            <div className="text-3xl font-bold">Rate.</div>
            </AnimatedContent>
            <AnimatedContent
            distance={80}
            direction="vertical"
            reverse={false}
            duration={1.0}
            initialOpacity={0.0}
            animateOpacity
            scale={1}
            threshold={0.1}
            delay={1.5}>
            <div className="text-3xl font-bold">Rank.</div>
            </AnimatedContent>
            <AnimatedContent
            distance={80}
            direction="vertical"
            reverse={false}
            duration={1.0}
            initialOpacity={0.0}
            animateOpacity
            scale={1}
            threshold={0.1}
            delay={2.0}>
            <div className="text-3xl font-bold">Rediscover.</div>
            </AnimatedContent>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
            <AnimatedContent
            distance={80}
            direction="vertical"
            reverse={false}
            duration={1.0}
            initialOpacity={0.0}
            animateOpacity
            scale={1}
            threshold={0.1}
            delay={2.5}>
            <button
            className="flex items-center justify-center bg-transparent hover:bg-neutral-800 text-white w-80 px-6 py-2 rounded-sm cursor-pointer border border-gray-700"
            onClick={loginWithGoogle}
            >
                <Image 
                src="/google.svg" 
                alt="Google" 
                width={20} 
                height={20}
                className="mr-2"/>
                Sign in with Google
            </button>
            </AnimatedContent>
            <AnimatedContent
            distance={80}
            direction="vertical"
            reverse={false}
            duration={1.0}
            initialOpacity={0.0}
            animateOpacity
            scale={1}
            threshold={0.1}
            delay={3.0}>
            <button
            className="flex items-center justify-center bg-transparent hover:bg-neutral-800 text-white w-80 px-6 py-2 rounded-sm cursor-pointer border border-gray-700"
            onClick={loginWithSpotify}
            >
                <Image 
                src="/spotify.svg" 
                alt="Google" 
                width={20} 
                height={20}
                className="mr-2"/>
                Sign in with Spotify
            </button>
            </AnimatedContent>
            <AnimatedContent
            distance={80}
            direction="vertical"
            reverse={false}
            duration={1.0}
            initialOpacity={0.0}
            animateOpacity
            scale={1}
            threshold={0.1}
            delay={3.5}>
                <a 
                href="https://joeechenn.github.io/resona/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline">
                    What's Resona?
                    </a>
            </AnimatedContent>
        </div>
    </div>
  );
}