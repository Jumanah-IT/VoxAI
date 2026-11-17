
"use client";
import Image from "next/image";
import { z } from "zod";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { auth } from "@/firebase/client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type AuthFormType = "sign-in" | "sign-up";

const authFormSchema = (type: AuthFormType) => {
  return z.object({
    name:
      type === "sign-up"
        ? z.string().trim().min(3, "Name must be at least 3 characters.")
        : z.string().optional(),

    email: z.string().trim().email("Please enter a valid email address."),

    password:
      type === "sign-up"
        ? z.string().min(8, "Password must be at least 8 characters.")
        : z.string().min(1, "Password is required."),
  });
};

type AuthFormValues = z.infer<ReturnType<typeof authFormSchema>>;

const getAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Please choose a stronger password.";

    case "auth/invalid-credential":
      return "The email or password is incorrect.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/operation-not-allowed":
      return "Email and password authentication is not enabled.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "Authentication failed. Please try again.";
  }
};

const AuthForm = ({ type }: { type: AuthFormType }) => {
  const router = useRouter();

  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    try {
      const email = data.email.trim().toLowerCase();

      if (type === "sign-up") {
        const name = data.name?.trim();

        if (!name) {
          form.setError("name", {
            type: "manual",
            message: "Please enter your name.",
          });
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          data.password
        );

        let profileUpdated = true;

        try {
          await updateProfile(userCredential.user, {
            displayName: name,
          });
        } catch {
          profileUpdated = false;
        }

        toast.add({
          title: "Account created successfully!",
          description: profileUpdated
            ? "Welcome to VoxAI. Your account is ready."
            : "Your account was created, but your profile name could not be saved.",
          type: profileUpdated ? "success" : "warning",
        });
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          data.password
        );

        toast.add({
          title: "Welcome back!",
          description: "You have signed in successfully.",
          type: "success",
        });
      }

      router.replace("/");
      router.refresh();

    } catch (error) {
  toast.add({
    title: "Authentication failed",
    description: getAuthErrorMessage(error),
    type: "error",
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-7 rounded-2xl border bg-card p-8 shadow-sm">

        <div className="space-y-2 text-center">
           <Link
  href="/"
  className="flex items-center justify-center gap-3"
>
  <Image src="/favicon.ico" alt="logo" height={32} width={38} />

  <span className="text-3xl font-bold tracking-tight">
    VoxAI
  </span>
</Link>

          <h2 className="text-2xl font-semibold">
            {isSignIn ? "Welcome Back" : "Create Your Account"}
          </h2>

          <p className="text-sm text-muted-foreground">
            {isSignIn
              ? "Sign in to continue your interview preparation."
              : "Start preparing for your next interview with AI."}
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <FieldGroup>

            {!isSignIn && (
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">
                      Full Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="name"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">
                    Email Address
                  </FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">
                    Password
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete={
                      isSignIn ? "current-password" : "new-password"
                    }
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

          </FieldGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Please wait..."
              : isSignIn
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignIn
            ? "Don't have an account yet?"
            : "Already have an account?"}

          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="ml-1 font-semibold text-primary hover:underline"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default AuthForm;
