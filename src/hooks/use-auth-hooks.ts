'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSignUpMutation, SignUpInputType } from '@/services/auth/use-signup';
import { useModal } from '@/hooks/use-modal';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/routes';
import { useLoginMutation } from '@/store/authApi';

type ForgetPasswordInputType = {
    email: string;
};

export type LoginInputType = {
    email: string;
    password: string;
    remember_me: boolean;
};

const SPLASH_DURATION_MS = 1500;

const extractErrorMessage = (err: unknown): string => {
    if (!err) return 'Login failed. Please check your credentials.';
    const e = err as {
        data?: { message?: string; error?: string } | string;
        status?: number;
        message?: string;
    };
    if (typeof e.data === 'string') return e.data;
    if (e.data?.message) return e.data.message;
    if (e.data?.error) return e.data.error;
    if (e.message) return e.message;
    return 'Login failed. Please check your credentials.';
};

export const useLoginForm = (isPopup: boolean = true) => {
    const [loginMutation] = useLoginMutation();
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { closeModal } = useModal();
    const navigate = useRouter();

    const formMethods = useForm<LoginInputType>({
        mode: 'all',
        defaultValues: {
            email: '',
            password: '',
            remember_me: true,
        },
    });

    const onSubmit = async ({ email, password, remember_me }: LoginInputType) => {
        setLoginError(null);
        setIsLoggingIn(true);
        try {
            // unwrap() turns the RTK Query result into a thrown error on failure.
            await loginMutation({ email, password, remember_me }).unwrap();

            if (isPopup) {
                closeModal();
                formMethods.reset();
                return;
            }
            navigate.push(ROUTES.CATEGORY);
            formMethods.reset();
        } catch (err) {
            setLoginError(extractErrorMessage(err));
        } finally {
            setIsLoggingIn(false);
        }
    };

    return {
        formMethods,
        loginError,
        isLoggingIn,
        handleSubmit: formMethods.handleSubmit(onSubmit),
    };
};

export const useSignUpForm = () => {
    const { mutate: signUp } = useSignUpMutation();
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const { closeModal } = useModal();

    const formMethods = useForm<SignUpInputType>({
        mode: 'all',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            remember_me: false,
        },
    });

    const onSubmit = ({ name, email, password, remember_me }: SignUpInputType) => {
        setSignUpError(null);
        signUp(
            { name, email, password, remember_me },
            {
                onSuccess: () => {
                    closeModal();
                    formMethods.reset();
                },
                onError: (err) => {
                    setSignUpError(err.message || 'Registration failed. Please try again.');
                },
            }
        );
    };

    return {
        formMethods,
        signUpError,
        handleSubmit: formMethods.handleSubmit(onSubmit),
    };
};

export const useForgetPasswordForm = () => {
    const [formError, setFormError] = useState<string | null>(null);
    const { closeModal } = useModal();

    const formMethods = useForm<ForgetPasswordInputType>({
        mode: 'all',
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async ({ email }: ForgetPasswordInputType) => {
        setFormError(null);
        try {
            // Placeholder for actual API call to send reset password email
            console.log({ email }, 'Sending password reset request');
            closeModal();
            formMethods.reset();
        } catch (err: any) {
            setFormError(err.message || 'Failed to send reset password email. Please try again.');
        }
    };

    return {
        formMethods,
        formError,
        handleSubmit: formMethods.handleSubmit(onSubmit),
    };
};

export const useSocialLogin = () => {
    const [login] = useLoginMutation();
    const { closeModal } = useModal();
    const { reset } = useForm<LoginInputType>();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useRouter();

    const handleSocialLogin = async (isPopup: boolean = true) => {
        try {
            await login({
                email: 'guest@demo.com',
                password: 'admin',
                remember_me: true,
            }).unwrap();
            if (isPopup) {
                closeModal();
                reset();
                return;
            }
            setIsLoggingIn(true);
            setTimeout(() => {
                navigate.push(ROUTES.CATEGORY);
                reset();
            }, SPLASH_DURATION_MS);
        } catch {
            // No-op — error UI is owned by the form (or could be added here).
        }
    };

    return { handleSocialLogin, isLoggingIn };
};

export const useAuthModal = () => {
    const { openModal,closeModal } = useModal();
    
    const handleForgetPassword = () => {
        openModal('FORGET_PASSWORD');
    };
    
    const handleSignUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        openModal('SIGNUP_VIEW');
    };
    
    const handleLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        openModal('LOGIN_VIEW');
    };
    
    const handleCloseModal = () => {
        closeModal();
    };
    
    return { handleForgetPassword, handleSignUp, handleLogin,handleCloseModal };
};