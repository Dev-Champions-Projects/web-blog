"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../common/FormField";
import Button from "../common/Button";
import Heading from "../common/Heading";
import SocialAuth from "./SocialAuth";
import { RegisterSchema, RegisterSchemaType } from "@/schemas/RegisterSchema";
import { signUp } from "@/actions/auth/register";
import { useState, useTransition } from "react";
import Alert from "../common/Alert";
import { trackEvent } from "@/lib/analytics";

const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit: SubmitHandler<RegisterSchemaType> = (data) => {
    setSuccess("");
    setError("");

    trackEvent("register_start", {
      method: "email",
      page: "register",
    });

    startTransition(() => {
      signUp(data).then((res) => {
        if (res.error) {
          setError(res.error);
          trackEvent("register_failed", {
            method: "email",
            error: res.error,
            page: "register",
          });
          return;
        }

        setSuccess(res.success);
        trackEvent("register_success", {
          method: "email",
          page: "register",
        });
      });
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col max-w-[500px] m-auto mt-8 gap-2"
    >
      <Heading title="Create a Tech Path Account" lg center />
      <FormField
        id="name"
        register={register}
        errors={errors}
        placeholder="name"
        disabled={isPending}
      />
      <FormField
        id="email"
        register={register}
        errors={errors}
        placeholder="email"
        disabled={isPending}
      />
      <FormField
        id="password"
        register={register}
        errors={errors}
        placeholder="password"
        type="password"
        disabled={isPending}
      />
      <FormField
        id="confirmPassword"
        register={register}
        errors={errors}
        placeholder="confirmPassword"
        type="password"
        disabled={isPending}
      />
      {error && <Alert message={error} error />}
      {success && <Alert message={success} success />}
      <Button
        type="submit"
        label={isPending ? "Submitting..." : "Register"}
        disabled={isPending}
      />
      <div className="flex justify-center my-2">Or</div>
      <SocialAuth />
    </form>
  );
};

export default RegisterForm;
