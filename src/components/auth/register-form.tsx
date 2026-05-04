'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import { CheckCircle2 } from 'lucide-react';

import Input from '@/components/shared/form/input';
import PasswordInput from '@/components/shared/form/password-input';
import Button from '@/components/shared/button';
import Link from '@/components/shared/link';
import Logo from '@/components/shared/logo';
import CloseButton from '@/components/shared/close-button';

import { ROUTES } from '@/utils/routes';
import { usePanel } from '@/hooks/use-panel';
import { colorMap } from '@/data/color-settings';
import { useModal } from '@/hooks/use-modal';
import { useAuthModal } from '@/hooks/use-auth-hooks';
import { useRegisterMutation } from '@/store/authApi';

interface RegisterFormProps {
    className?: string;
    isPopup?: boolean;
}

export type RegisterInputType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

const extractErrorMessage = (err: unknown): string => {
    if (!err) return 'Registration failed. Please try again.';
    const e = err as {
        data?: { message?: string; error?: string } | string;
        status?: number;
        message?: string;
    };
    if (typeof e.data === 'string') return e.data;
    if (e.data?.message) return e.data.message;
    if (e.data?.error) return e.data.error;
    if (e.message) return e.message;
    return 'Registration failed. Please try again.';
};

export default function RegisterForm({
    className,
    isPopup = true,
}: RegisterFormProps) {
    const { selectedColor } = usePanel();
    const { closeModal } = useModal();
    const { handleLogin } = useAuthModal();
    const router = useRouter();

    const [registerMutation, { isLoading }] = useRegisterMutation();
    const [serverError, setServerError] = useState<string | null>(null);
    /** Set after the API returns 2xx — shows the success card. */
    const [createdEmail, setCreatedEmail] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RegisterInputType>({
        mode: 'all',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: RegisterInputType) => {
        setServerError(null);
        try {
            await registerMutation(values).unwrap();

            // Always show the success screen. We do NOT auto-sign-in even if
            // the backend issues a token — the user must sign in explicitly.
            const email = values.email;
            reset();

            if (isPopup) {
                closeModal();
                router.push(
                    `${ROUTES.LOGIN}?registered=1&email=${encodeURIComponent(email)}`,
                );
                return;
            }
            setCreatedEmail(email);
        } catch (err) {
            setServerError(extractErrorMessage(err));
        }
    };

    if (createdEmail) {
        return (
            <div className={cn('w-full md:w-[560px] relative', className)}>
                <div className="flex w-full mx-auto overflow-hidden rounded-lg bg-white">
                    <div className="w-full py-10 px-6 sm:px-12 rounded-md flex flex-col items-center text-center">
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <div
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 mb-5"
                            aria-hidden
                        >
                            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                        </div>

                        <h4 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-2">
                            Account created successfully!
                        </h4>
                        <p className="text-sm text-gray-600 max-w-sm mb-1">
                            Your account{' '}
                            <span className="font-medium text-brand-dark">
                                {createdEmail}
                            </span>{' '}
                            is ready.
                        </p>
                        <p className="text-sm text-gray-600 mb-6">
                            Please sign in to continue to your dashboard.
                        </p>

                        <Link
                            href={`${ROUTES.LOGIN}?registered=1&email=${encodeURIComponent(createdEmail)}`}
                            variant="button-black"
                            className="w-full max-w-xs"
                        >
                            <span className="py-0.5">Sign in</span>
                        </Link>

                        <p className="mt-4 text-xs text-gray-500">
                            Use your new credentials on the sign-in page.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('w-full md:w-[560px] relative', className)}>
            {isPopup === true && <CloseButton onClick={closeModal} />}
            <div className="flex w-full mx-auto overflow-hidden rounded-lg bg-white">
                <div className="w-full py-6 sm:py-10 px-4 sm:px-8 md:px-6 lg:px-8 xl:px-12 rounded-md flex flex-col justify-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <div className="text-center mb-8 pt-2.5">
                        <h4 className="text-xl font-semibold text-brand-dark sm:text-2xl sm:pb-2">
                            Create an account
                        </h4>
                        {/* <p className="text-sm text-gray-500">
                            Quick sign-up — only a few details.
                        </p> */}
                        {serverError && (
                            <div className="mt-3 text-center text-sm text-red-600">
                                {serverError}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col justify-center"
                        noValidate
                    >
                        <div className="flex flex-col space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="First name"
                                    type="text"
                                    variant="solid"
                                    {...register('firstName', {
                                        required: 'First name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'At least 2 characters',
                                        },
                                    })}
                                    error={errors.firstName?.message}
                                />
                                <Input
                                    label="Last name"
                                    type="text"
                                    variant="solid"
                                    {...register('lastName', {
                                        required: 'Last name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'At least 2 characters',
                                        },
                                    })}
                                    error={errors.lastName?.message}
                                />
                            </div>

                            <Input
                                label="Email address"
                                type="email"
                                variant="solid"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value:
                                            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                        message: 'Please provide a valid email',
                                    },
                                })}
                                error={errors.email?.message}
                            />

                            <PasswordInput
                                label="Password"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Use at least 6 characters',
                                    },
                                })}
                            />

                            <p className="text-xs text-gray-500 leading-relaxed">
                                By creating an account, you agree to our{' '}
                                <Link
                                    href={ROUTES.PRIVACY}
                                    className={cn(
                                        'hover:underline',
                                        colorMap[selectedColor].link,
                                    )}
                                >
                                    Privacy Policy
                                </Link>
                                {' '}and{' '}
                                <Link
                                    href={ROUTES.TERMS}
                                    className={cn(
                                        'hover:underline',
                                        colorMap[selectedColor].link,
                                    )}
                                >
                                    Terms of Service
                                </Link>
                                .
                            </p>

                            <Button
                                type="submit"
                                loading={isLoading}
                                disabled={isLoading}
                                className="w-full mt-2 tracking-normal h-11 md:h-12 font-15px md:font-15px"
                                variant="formButton"
                            >
                                Create account
                            </Button>

                            <div className="mt-2 text-sm text-center text-body">
                                Already have an account?
                                <Link
                                    href={ROUTES.LOGIN}
                                    onClick={isPopup ? handleLogin : undefined}
                                    className={cn(
                                        'ltr:pl-2 rtl:pr-2 text-heading hover:underline',
                                        colorMap[selectedColor].link,
                                    )}
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
