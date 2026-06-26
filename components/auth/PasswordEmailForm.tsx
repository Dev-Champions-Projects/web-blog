"use client"

import { PasswordEmailSchema, PasswordEmailSchemaType } from "@/schemas/PasswordEmailSchema"
import { useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Heading from "../common/Heading"
import FormField from "../common/FormField"
import Alert from "../common/Alert"
import Button from "../common/Button"
import { passwordEmail } from "@/actions/auth/password-email"

const PasswordEmailForm = () => {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>('')
    const [success, setSuccess] = useState<string | undefined>('')
    const { register, handleSubmit, formState: { errors } } = useForm<PasswordEmailSchemaType>({ resolver: zodResolver(PasswordEmailSchema) })

    const onSubmit: SubmitHandler<PasswordEmailSchemaType> = (data) => {
        setError('')
        startTransition(() => {
            passwordEmail(data).then(res => {
                if (res?.error) {
                    setError(res.error)
                }

                if (res?.success) {
                    setSuccess(res.success)
                }
            })
        })
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-[500px] m-auto mt-8 gap-2">
            <Heading title="Forgot your WEBDEV.blog password?" lg center />
            <FormField
                id='email'
                register={register}
                errors={errors}
                placeholder="email"
                disabled={isPending}
            />
            {error && <Alert message={error} error />}
            {success && <Alert message={success} success />}
            <Button type="submit" label={isPending ? "Submitting..." : "Send Reset Email"} disabled={isPending} />
        </form>
    );
}

export default PasswordEmailForm;