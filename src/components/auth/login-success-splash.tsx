'use client';

import Image from 'next/image';
import JacentLogo from '@/assets/jacent/logo-dark.svg';

const LoginSuccessSplash: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            <div className="w-64 md:w-80 lg:w-96 mb-10 animate-[fadeIn_400ms_ease-out]">
                <Image
                    src={JacentLogo}
                    alt="Jacent"
                    priority
                    className="w-full h-auto"
                />
            </div>

            <div
                role="status"
                aria-label="Loading"
                className="relative w-12 h-12"
            >
                <span className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ffc609] animate-spin" />
            </div>

            <p className="mt-5 text-sm text-gray-500 tracking-wide">
                Signing you in…
            </p>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginSuccessSplash;
