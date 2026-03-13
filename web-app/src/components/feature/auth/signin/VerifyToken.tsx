"use client";

import { removePendingEmailAction } from "@/actions/remove-pending-session.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { verifyToken } from "@/types/signin/verify-token.type";
import { useForm } from "@tanstack/react-form-nextjs";
import { clear } from "console";
import { useRouter } from "next/navigation";

interface VerifyTokenProps {
  email: string;
}

export function VerifyToken({ email }: VerifyTokenProps) {
  const redirect = useRouter();

  const form = useForm({
    defaultValues: {
      token: "",
    },
    validators: {
      onSubmit: verifyToken,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.signIn.emailOtp({
        email: email,
        otp: value.token,
      });

      if (error) {
        form.setFieldValue("token", "");
        return;
      }

      await removePendingEmailAction();
      redirect.push("/workspace");
    },
  });

  return (
    <Card className="ring-0 ">
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="font-extrabold text-2xl">
          Check your email
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="signin-magic-link"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="token"
            children={(field) => (
              <Field>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    // Cập nhật giá trị mới vào form state
                    field.handleChange(e.target.value);

                    // Kiểm tra độ dài của giá trị MỚI
                    if (e.target.value.length === 6) {
                      setTimeout(() => {
                        form.handleSubmit();
                      }, 0);
                    }
                  }}
                  placeholder="* * * * * *"
                  autoComplete="off"
                  autoFocus
                  maxLength={6}
                  className="text-center"
                />
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-4 text-center">
        <CardDescription>
          <span>
            The code sent to{" "}
            <span className="font-semibold text-foreground">{email}</span> will
            work for 15 minutes.
          </span>
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
