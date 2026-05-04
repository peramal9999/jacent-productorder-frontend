import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';
import Loading from '@/components/shared/loading';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
};

export default async function Page() {
    const backgroundBanner = '/assets/images/bg_auth.png';
    return (
        <div
            className="flex min-h-screen w-full items-center justify-center bg-center bg-cover"
            style={{ backgroundImage: `url(${backgroundBanner})` }}
        >
            <div className="py-10 drop-shadow-dropDown">
                {/* Suspense wraps the form because LoginForm uses
                    useSearchParams() to detect the post-registration banner. */}
                <Suspense fallback={<Loading />}>
                    <LoginForm isPopup={false} />
                </Suspense>
            </div>
        </div>
    );
}
