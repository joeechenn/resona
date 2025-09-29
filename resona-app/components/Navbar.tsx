"use client";

import Image from "next/image";
import Link from "next/link";
import { login } from "@/lib/auth-actions";


export default function Navbar () {
    return (
    <nav className="bg-white shadow-md py-4 border-b border-gray-200">
        <div className ="container mx-auto flex justify-between items-center px-6 lg:px-8">
            <Link href={""} className="flex items-center space-x-3">
            <Image src={"/icon.png"} alt="icon" width={50} height={50}/>
            <span className="text-2xl font-bold text-gray-800"> Resona </span>
            </Link>
            <div className="flex items-center space-x-4">
                <Link href={"/analytics"} className="text-slate-900 hover:text-sky-500">
                <button className="flex items-center justify-center bg-black hover:bg-gray-900 text-white py-2 px-4 rounded-2xl cursor-pointer">
                    Analytics
                </button>
                </Link>
                <Link href={"/discover"} className="text-slate-900 hover:text-sky-500">
                <button className="flex items-center justify-center bg-black hover:bg-gray-900 text-white py-2 px-4 rounded-2xl cursor-pointer">
                    Disocver
                </button>
                </Link>
                <button className="flex items-center justify-center bg-black hover:bg-gray-900 text-white py-2 px-4 rounded-2xl cursor-pointer"
                onClick={login}
                >
                    Sign In
                    <Image src="/Primary_Logo_White_RGB.svg" 
                    alt="Spotify" 
                    width={18} 
                    height={18}
                    className="ml-2"/>
                    </button>
            </div>
        </div>
    </nav>
    );
}