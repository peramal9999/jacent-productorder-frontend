import RegisterForm from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create account',
};

export default async function Page() {
    const backgroundBanner = '/assets/images/bg_auth.png';
    return (
        <div
            className="flex min-h-screen w-full items-center justify-center bg-center bg-cover py-10"
            style={{ backgroundImage: `url(${backgroundBanner})` }}
        >
            {/* <div className="drop-shadow-dropDown">
                <RegisterForm isPopup={false} />
            </div> */}
        </div>
    );
}
