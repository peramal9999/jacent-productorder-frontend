"use client";
import Input from '@/components/shared/form/input';
import Button from '@/components/shared/button';
import Heading from '@/components/shared/heading';
import {Controller, useForm} from 'react-hook-form';
import {UpdateUserType, useUpdateUserMutation,} from '@/services/customer/use-update-customer';
import { User } from "lucide-react";
import React, { useEffect } from "react";

import Divider from "@/components/shared/divider";
import SearchableSelect, {
    SearchableSelectOption,
} from '@/components/shared/form/searchable-select';
import { storeLocations } from '@/data/locations';
import { useMeQuery } from '@/store/authApi';
import Loading from '@/components/shared/loading';

// Build the dropdown options from the raw CSV data: each option exposes
// the LOCATION_ID as the form value, with the full ADDRESS rendered as
// the visible label and store code in the sub-line.
const locationOptions: SearchableSelectOption[] = storeLocations.map((l) => ({
    value: l.locationId,
    label: `${l.street}, ${l.cityStateZip}`,
    sub: `${l.code} · ID ${l.locationId}`,
}));

const AccountInfo: React.FC = () => {
    const {mutate: updateUser} = useUpdateUserMutation();
    const { data: me, isLoading: meLoading } = useMeQuery();

    const u = (me ?? {}) as Record<string, unknown>;
    const fullName =
        (u.name as string) ||
        [u.firstName, u.lastName].filter(Boolean).join(' ') ||
        (u.userName as string) ||
        '';
    const email = (u.email as string) ?? '';
    const phoneNumber =
        (u.phoneNumber as string) ?? (u.phone as string) ?? '';
    const locationId =
        u.locationId != null ? String(u.locationId) : (u.location as string) ?? '';

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<UpdateUserType & { location: string }>({
        defaultValues: { location: '' },
    });

    // Once /auth/me arrives, hydrate the form fields with the real user.
    useEffect(() => {
        if (!me) return;
        reset({
            userName: fullName,
            email,
            phoneNumber,
            location: locationId,
        } as UpdateUserType & { location: string });
    }, [me, fullName, email, phoneNumber, locationId, reset]);

    function onSubmit(input: UpdateUserType) {
        updateUser(input);
    }

    if (meLoading) return <Loading />;

    return (
        <div className="flex flex-col w-full">

            <div className="dashboard__main-top">
                <div className="flex flex-col sm:flex-row flex-wrap">
                    <div className="w-full sm:w-1/2">
                        <div className="flex items-center gap-5">
                            <div
                                aria-label={`${fullName || email || 'User'} avatar`}
                                className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                            >
                                <User className="w-10 h-10" />
                            </div>

                            <div className="dashboard__main-content">
                                <h4 className="text-brand-dark text-xl font-semibold mb-1">
                                    Welcome {fullName || email || 'back'}.
                                </h4>
                                <p className="text-base  mb-0">
                                    {[email, (u.locationName as string) || (u.city as string)]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2"></div>
                </div>
            </div>
            <Divider />
            <Heading variant="titleMedium" className="mb-5 md:mb-6 lg:mb-7 ">
                Account infomation
            </Heading>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col justify-center w-full mx-auto"
                noValidate
            >
                <div className="pb-7 md:pb-8 lg:pb-10">
                    <div className="flex flex-col space-y-4 sm:space-y-5">
                        <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
                            <Input
                                id={"account-username"}
                                label={'User Name'}
                                {...register('userName', {
                                    required: 'User name is required',
                                })}
                                variant="solid"
                                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                                error={errors.userName?.message}
                            />
                            <Input
                                id={"account-email"}
                                type="email"
                                label={('Email') as string}
                                {...register('email', {
                                    required: 'You must need to provide your email address',
                                    pattern: {
                                        value:
                                            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                        message: 'Please provide valid email address',
                                    },
                                })}
                                variant="solid"
                                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                                error={errors.email?.message}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
                           <div className="w-full sm:w-1/2 px-1.5 md:px-2.5">
                                <Controller
                                    control={control}
                                    name="location"
                                    rules={{ required: 'Please select a location' }}
                                    render={({ field, fieldState }) => (
                                        <SearchableSelect
                                            id="account-location"
                                            label="Select location"
                                            placeholder="Choose a store location"
                                            searchPlaceholder="Search by city or region…"
                                            options={locationOptions}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>
                            <Input
                                type="tel"
                                label={"Phone number"}
                                {...register('phoneNumber', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                                        message: 'Please enter a valid phone number',
                                    },
                                    minLength: {
                                        value: 7,
                                        message: 'Phone number must be at least 7 digits',
                                    },
                                    maxLength: {
                                        value: 15,
                                        message: 'Phone number must be no more than 15 digits',
                                    },
                                })}
                                variant="solid"
                                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                                error={errors.phoneNumber?.message}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
                            
                            <div className="hidden sm:block sm:w-1/2 px-1.5 md:px-2.5" />
                        </div>
                    </div>
                </div>


                <div className="relative flex pb-2 mt-5 sm:ltr:ml-auto sm:rtl:mr-auto lg:pb-0">
                    <Button
                        type="submit"
                        variant="formButton"
                        className="w-full sm:w-auto"
                    >
                        Update Account
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AccountInfo;
