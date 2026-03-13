"use client";

import { savePendingEmailAction } from "@/actions/set-pending-session.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { userLogin } from "@/types/signin/user-login.type";
import { useForm } from "@tanstack/react-form-nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SignInEmail() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: userLogin,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: value.email,
        type: "sign-in",
      });

      if (error || !data.success) {
        console.error("Failed to send OTP:", error);
        return;
      }

      await savePendingEmailAction(value.email);

      router.push("/signin/magic_link");
    },
  });
  return (
    <Card className="ring-0 ">
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="font-extrabold text-2xl">
          Get into Fizzy
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="signin-email"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your email address"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-4 text-center">
        <CardDescription>
          <span className="font-bold">New here?</span>{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>{" "}
          to create an account.
          <span className="font-bold"> Already have an account?</span> Enter
          your email and we’ll get you signed in.
        </CardDescription>
        <Button size="lg" className="w-1/2" type="submit" form="signin-email">
          Let's go
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
