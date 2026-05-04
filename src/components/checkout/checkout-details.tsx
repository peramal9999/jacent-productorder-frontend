'use client';

import { useState } from 'react';
import Heading from '@/components/shared/heading';
import ContactForm from '@/components/checkout/contact-form';
import { CircleUserRound } from 'lucide-react';

type CheckoutStep = 'contact';

const CheckoutDetails: React.FC = () => {
    const [activeStep, setActiveStep] = useState<CheckoutStep>('contact');
    const [formData, setFormData] = useState<{ contact: any }>({ contact: null });

    const handleContactComplete = (data: any) => {
        setFormData({ contact: data });
        // Nothing else to do — the "Order Now" button in the summary
        // card handles order placement.
    };

    const steps = [
        {
            id: 1,
            icon: <CircleUserRound strokeWidth={1} size={30} />,
            title: 'Contact information',
            sub: 'Luhan Nguyen +855 - 445 - 6644',
            component: <ContactForm onComplete={handleContactComplete} />,
            key: 'contact' as CheckoutStep,
        },
    ];

    return (
        <div className="overflow-hidden space-y-6">
            {steps.map((step) => (
                <div
                    key={step.id}
                    className="accordion__panel expanded overflow-hidden rounded-md border border-border-base"
                >
                    <div className="bg-white flex items-center p-4  cursor-pointer sm:pt-5 sm:px-6 pb-7">
                        <span className="flex  justify-center h-9 w-9 text-brand-dark ltr:mr-5 rtl:ml-5">
                            {step.icon}
                        </span>
                        <div>
                            <Heading variant={'checkoutHeading'}>{step.title}</Heading>
                            <div className="font-medium  text-sm text-brand-dark">
                                {step.sub}
                            </div>
                        </div>
                        {formData[step.key] && (
                            <button
                                onClick={() => setActiveStep(step.key)}
                                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-200  mt-5 sm:mt-0 sm:ms-auto text-sm  rounded-lg"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {activeStep === step.key && (
                        <div className="pb-6 ltr:pl-5 rtl:pr-5 sm:ltr:pl-5 sm:rtl:pr-5 lg:ltr:pl-7 lg:rtl:pr-7  ltr:pr-7 rtl:pl-5 bg-white">
                            <div className="border-t border-border-two pt-7">
                                {step.component}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CheckoutDetails;
