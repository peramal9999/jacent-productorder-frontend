'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import Input from '@/components/shared/form/input';
import PasswordInput from '@/components/shared/form/password-input';
import Button from '@/components/shared/button';
import {useModal} from "@/hooks/use-modal";
import Switch from '@/components/shared/switch';
import { FaFacebook,FaTiktok, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import cn from 'classnames';
import {ROUTES} from "@/utils/routes";
import { usePanel } from "@/hooks/use-panel";
import { colorMap } from "@/data/color-settings";
import Link from "@/components/shared/link";
import Logo from "@/components/shared/logo";
import CloseButton from "@/components/shared/close-button";
import {useAuthModal, useLoginForm, useSocialLogin} from '@/hooks/use-auth-hooks';
import LoginSuccessSplash from '@/components/auth/login-success-splash';

interface LoginFormProps {
	isPopup?: boolean;
	className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
												 className,
												 isPopup = true
											 }) => {
	const { closeModal } = useModal();
	const [remember, setRemember] = useState(false);
	const { selectedColor } = usePanel();
	const {formMethods, loginError, handleSubmit, isLoggingIn} = useLoginForm(isPopup);
	const { handleSocialLogin, isLoggingIn: isSocialLoggingIn } = useSocialLogin();
	const { handleForgetPassword, handleSignUp } = useAuthModal();
	const { register, formState: { errors }, setValue } = formMethods;

	// "?registered=1&email=…" arrives after a successful sign-up so we can
	// confirm the account creation and pre-fill the email field.
	const searchParams = useSearchParams();
	const justRegistered = !isPopup && searchParams?.get('registered') === '1';
	const prefillEmail = !isPopup ? searchParams?.get('email') ?? '' : '';

	useEffect(() => {
		if (prefillEmail) setValue('email', prefillEmail);
	}, [prefillEmail, setValue]);

	if (!isPopup && (isLoggingIn || isSocialLoggingIn)) {
		return <LoginSuccessSplash />;
	}

	return (
		<div
			className={cn(
				'w-full md:w-[560px]  relative',
				className,
			)}
		>
			{isPopup === true && <CloseButton onClick={closeModal} />}
			<div className="flex mx-auto overflow-hidden rounded-lg bg-white">
				<div
					className="w-full py-6 sm:py-10 px-4 sm:px-8 md:px-6 lg:px-8 xl:px-16 rounded-md flex flex-col justify-center">
					<div className="flex justify-center mb-4">
						<Logo />
					</div>
					<div className="text-center mb-8 pt-2.5">
						<h4 className="text-xl font-semibold text-brand-dark sm:text-2xl sm:pb-1 ">
							Log Into Your Account
						</h4>
						{justRegistered && (
							<div className="mt-4 mb-2 flex items-start gap-2 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-left">
								<CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
								<span>
									<strong>Account created.</strong> Please sign in with your new credentials below.
								</span>
							</div>
						)}
						{loginError && (
							<div className="mt-4 text-center text-sm text-red-600">
								{loginError}
							</div>
						)}
					</div>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col justify-center"
						noValidate
					>
						<div className="flex flex-col space-y-4">
							<Input
 								id="login-email"
								label={"Email Address"}
								type="email"
								variant="solid"
								{...register('email', {
							         	required: `You must need to provide your email address`,
									pattern: {
										value:
											/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
										message: "Please provide valid email address",
									},
								})}
								error={errors.email?.message}
							/>

							<PasswordInput
								label={"Password"}
								error={errors.password?.message}
								{...register('password', {
									required: `You must need to provide your password`,
								})}
							/>

							<div className="flex items-center justify-center py-2">
								<div className="flex items-center shrink-0">
									<label className="relative inline-block cursor-pointer switch">
										<Switch checked={remember} onChange={setRemember}/>
									</label>
									<label
										onClick={() => setRemember(!remember)}
										className="mt-1 text-sm cursor-pointer shrink-0 text-heading ltr:pl-2.5 rtl:pr-2.5"
									>
										{"Remember me"}
									</label>
								</div>
								<div className="flex ltr:ml-auto rtl:mr-auto mt-[3px]">
									<button
										type="button"
										onClick={handleForgetPassword}
										className={cn("text-sm ltr:text-right rtl:text-left text-heading ltr:pl-3 lg:rtl:pr-3 hover:underline focus:outline-none focus:text-brand-dark", colorMap[selectedColor].link)}
									>
										Forgot password?
									</button>
								</div>
							</div>
							<div className="relative">
								<Button
									type="submit"
									disabled={isLoggingIn}
									loading={isLoggingIn}
									className="w-full mt-2 tracking-normal h-11 md:h-12 font-15px md:font-15px"
									variant="formButton"
								>
									{isLoggingIn ? 'Signing in…' : 'Log In'}
								</Button>
							</div>
						</div>
					</form>
					
					{/* <div className="flex justify-center mt-10 space-x-2.5">
						<button
							className={cn("flex items-center justify-center w-10 h-10 transition-all border rounded-full cursor-pointer group border-border-one focus:outline-none",colorMap[selectedColor].hoverBorder)}
							onClick={() => handleSocialLogin(isPopup)}
						>
							<FaFacebook className={cn("w-4 h-4 transition-all text-gray-500  ",colorMap[selectedColor].groupHoverLink)}/>
						</button>
						<button
							className={cn("flex items-center justify-center w-10 h-10 transition-all border rounded-full cursor-pointer group border-border-one focus:outline-none",colorMap[selectedColor].hoverBorder)}
							onClick={() => handleSocialLogin(isPopup)}
						>
							<FaTiktok className={cn("w-4 h-4 transition-all text-gray-500  ",colorMap[selectedColor].groupHoverLink)}/>
						</button>
						<button
							className={cn("flex items-center justify-center w-10 h-10 transition-all border rounded-full cursor-pointer group border-border-one focus:outline-none",colorMap[selectedColor].hoverBorder)}
							onClick={() => handleSocialLogin(isPopup)}
						>
							<FaXTwitter className={cn("w-4 h-4 transition-all text-gray-500  ",colorMap[selectedColor].groupHoverLink)}/>
						</button>
						<button
							className={cn("flex items-center justify-center w-10 h-10 transition-all border rounded-full cursor-pointer group border-border-one focus:outline-none",colorMap[selectedColor].hoverBorder)}
							onClick={() => handleSocialLogin(isPopup)}
						>
							<FaInstagram className={cn("w-4 h-4 transition-all text-gray-500  ",colorMap[selectedColor].groupHoverLink)}/>
						</button>
					</div> */}
					
					{/* <div className="mt-6 text-sm text-center sm:text-15px text-body">
						Don&apos;t have an account?
						<Link
							href={ROUTES.REGISTER}
							onClick={isPopup ? handleSignUp : undefined}
							className={cn(
								'ltr:pl-2 rtl:pr-2 text-heading hover:underline font-medium',
								colorMap[selectedColor].link,
							)}
						>
							Create Account
						</Link>
					</div> */}
				
				
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
