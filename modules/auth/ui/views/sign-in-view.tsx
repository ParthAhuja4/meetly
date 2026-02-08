"use client";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  Form,
  FormField,
  FormLabel,
  FormItem,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/icons/google";
import { GithubIcon } from "@/components/icons/github";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, { message: "Password Is Required" }),
});

export default function SignInView() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const submitHandler = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      },
    );
  };
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="flex flex-col gap-6 p-6 md:p-8"
              onSubmit={form.handleSubmit(submitHandler)}
            >
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground text-balance">
                  Login To Your Account
                </p>
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@gmail.com"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
              </div>
              {!!error && (
                <Alert className="bg-destructive/10 border-none">
                  <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                  <AlertTitle>Error</AlertTitle>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={pending}>
                Sign In
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or Continue With
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={pending}
                  onClick={() => {
                    setError(null);
                    setPending(true);
                    authClient.signIn.social(
                      { provider: "google", callbackURL: "/" },
                      {
                        onError: ({ error }) => {
                          setError(error.message);
                          setPending(false);
                        },
                      },
                    );
                  }}
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={pending}
                  onClick={() => {
                    setError(null);
                    setPending(true);
                    authClient.signIn.social(
                      { provider: "github", callbackURL: "/" },
                      {
                        onError: ({ error }) => {
                          setError(error.message);
                          setPending(false);
                        },
                      },
                    );
                  }}
                >
                  <GithubIcon />
                  GitHub
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an Account?{" "}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign Up
                </Link>
              </div>
            </form>
          </Form>
          <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <Image src="/logo.svg" alt="Meetly" height={92} width={92} />
            <p className="text-2xl font-semibold text-white">Meetly</p>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service </a>
        and <a href="#">Privacy Policy</a>
      </div>
    </div>
  );
}
