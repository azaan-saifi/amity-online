"use client";
import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-hard py-10">
      {/* Background gradient effects */}
      <div className="absolute inset-x-0 -top-40 h-[500px] w-full bg-dark-hard bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-100/20 via-background/5 to-transparent"></div>
      <div className="absolute inset-x-0 -bottom-40 h-[500px] w-full bg-dark-hard bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/20 via-background/5 to-transparent"></div>

      {/* Content */}
      <motion.div
        className="z-10 grid w-full max-w-md items-center justify-center px-4 text-white"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <SignUp.Root>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <div className="flex h-screen items-center justify-center">
                <SignUp.Step name="start">
                  <Card className="relative w-full overflow-hidden border border-zinc-700/50 bg-dark-200/90 text-white backdrop-blur-sm sm:w-full">
                    {/* Decorative element */}
                    <div className="absolute -right-20 -top-20 size-40 rounded-full bg-gradient-yellow opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-primary-100 opacity-20 blur-3xl"></div>

                    <CardHeader className="pb-4">
                      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-gradient-yellow">
                        <Icons.logo className="size-7 text-dark-hard" />
                      </div>
                      <CardTitle className="flex flex-col text-center text-3xl">
                        <p>
                          <span className="text-yellow-400">Your</span>
                          <span className="ml-1">Logo</span>
                        </p>
                      </CardTitle>
                      <CardDescription className="text-center text-zinc-400">
                        Create an account to start your learning journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-y-5 pb-4">
                      <div className="grid grid-cols-2 gap-x-4">
                        <Clerk.Connection name="google" asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            disabled={isGlobalLoading}
                            className="rounded-md border-zinc-700 bg-dark-300 text-white transition-all hover:bg-dark-300/70 hover:text-white"
                          >
                            <Clerk.Loading scope="provider:google">
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <Icons.google className="mr-2 size-4" />
                                    Google
                                  </>
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </Clerk.Connection>
                        <Clerk.Connection name="apple" asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            disabled={isGlobalLoading}
                            className="rounded-md border-zinc-700 bg-dark-300 text-white transition-all hover:bg-dark-300/70 hover:text-white"
                          >
                            <Clerk.Loading scope="provider:apple">
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <Icons.apple className="mr-2 size-4" />
                                    Apple
                                  </>
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </Clerk.Connection>
                      </div>
                      <div className="relative flex items-center py-2">
                        <div className="grow border-t border-zinc-700"></div>
                        <span className="mx-3 shrink text-sm text-zinc-500">
                          or sign up with email
                        </span>
                        <div className="grow border-t border-zinc-700"></div>
                      </div>
                      <Clerk.Field name="emailAddress" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-zinc-400">Email address</Label>
                        </Clerk.Label>
                        <Clerk.Input type="email" required asChild>
                          <Input
                            className="rounded-md border-zinc-700 bg-dark-300 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
                            placeholder="your.email@example.com"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="block text-sm text-destructive" />
                      </Clerk.Field>
                      <Clerk.Field name="password" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-zinc-400">Password</Label>
                        </Clerk.Label>
                        <Clerk.Input type="password" required asChild>
                          <Input
                            className="rounded-md border-zinc-700 bg-dark-300 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
                            placeholder="Create a strong password"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="block text-sm text-destructive" />
                      </Clerk.Field>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pb-6">
                      <SignUp.Captcha className="empty:hidden" />
                      <SignUp.Action submit asChild>
                        <Button
                          disabled={isGlobalLoading}
                          className="relative w-full overflow-hidden rounded-md bg-gradient-yellow text-dark-hard transition-all hover:bg-gradient-yellow-hover"
                        >
                          <span className="relative z-10 flex items-center justify-center font-medium">
                            <Clerk.Loading>
                              {(isLoading) => {
                                return isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  "Create Account"
                                );
                              }}
                            </Clerk.Loading>
                          </span>
                        </Button>
                      </SignUp.Action>
                      <div className="text-center text-sm">
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="text-zinc-400 hover:text-yellow-400"
                        >
                          <Link href="/sign-in">
                            Already have an account?{"  "}
                            <span className="ml-1 font-medium text-yellow-400">
                              {" "}
                              Sign in
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </SignUp.Step>

                <SignUp.Step name="continue">
                  <Card className="w-full border border-zinc-700/50 bg-dark-200/90 backdrop-blur-sm sm:w-full">
                    <CardHeader>
                      <CardTitle>Complete Your Profile</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Just one more step to personalize your experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Clerk.Field name="username" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-zinc-400">Username</Label>
                        </Clerk.Label>
                        <Clerk.Input type="text" required asChild>
                          <Input
                            className="rounded-md border-zinc-700 bg-dark-300 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
                            placeholder="Choose a username"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="block text-sm text-destructive" />
                      </Clerk.Field>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pb-6">
                      <SignUp.Action submit asChild>
                        <Button
                          disabled={isGlobalLoading}
                          className="w-full rounded-md bg-gradient-yellow text-dark-hard transition-all hover:bg-gradient-yellow-hover"
                        >
                          <Clerk.Loading>
                            {(isLoading) => {
                              return isLoading ? (
                                <Icons.spinner className="size-4 animate-spin" />
                              ) : (
                                "Continue"
                              );
                            }}
                          </Clerk.Loading>
                        </Button>
                      </SignUp.Action>
                    </CardFooter>
                  </Card>
                </SignUp.Step>

                <SignUp.Step name="verifications">
                  <SignUp.Strategy name="email_code">
                    <Card className="w-full border border-zinc-700/50 bg-dark-200/90 backdrop-blur-sm sm:w-full">
                      <CardHeader>
                        <CardTitle>Verify Your Email</CardTitle>
                        <CardDescription className="text-zinc-400">
                          We&apos;ve sent a verification code to your email
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-y-4">
                        <div className="grid items-center gap-y-4">
                          <Clerk.Field name="code" className="space-y-4">
                            <Clerk.Label className="sr-only">
                              Verification code
                            </Clerk.Label>
                            <div className="flex justify-center">
                              <Clerk.Input
                                type="otp"
                                className="flex justify-center"
                                autoSubmit
                                render={({ value, status }) => {
                                  return (
                                    <div
                                      data-status={status}
                                      className={cn(
                                        "relative flex size-10 items-center justify-center rounded-md border border-zinc-700 bg-dark-300 text-sm font-medium transition-all",
                                        {
                                          "z-10 border-yellow-400 bg-dark-300 ring-2 ring-yellow-400/20":
                                            status === "cursor" ||
                                            status === "selected",
                                        }
                                      )}
                                    >
                                      {value}
                                      {status === "cursor" && (
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                          <div className="h-4 w-px animate-caret-blink bg-yellow-400 duration-1000" />
                                        </div>
                                      )}
                                    </div>
                                  );
                                }}
                              />
                            </div>
                            <Clerk.FieldError className="block text-center text-sm text-destructive" />
                          </Clerk.Field>
                          <SignUp.Action
                            resend
                            asChild
                            className="text-center text-sm text-muted-foreground"
                            fallback={({ resendableAfter }) => (
                              <p className="text-center text-sm text-zinc-500">
                                Resend code in{" "}
                                <span className="tabular-nums text-yellow-400">
                                  {resendableAfter}
                                </span>{" "}
                                seconds
                              </p>
                            )}
                          >
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="mx-auto text-zinc-400 hover:text-yellow-400"
                            >
                              Didn&apos;t receive a code? Resend
                            </Button>
                          </SignUp.Action>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-4">
                        <SignUp.Action submit asChild>
                          <Button
                            disabled={isGlobalLoading}
                            className="w-full rounded-md bg-gradient-yellow text-dark-hard transition-all hover:bg-gradient-yellow-hover"
                          >
                            <Clerk.Loading>
                              {(isLoading) => {
                                return isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  "Verify Email"
                                );
                              }}
                            </Clerk.Loading>
                          </Button>
                        </SignUp.Action>
                      </CardFooter>
                    </Card>
                  </SignUp.Strategy>
                </SignUp.Step>
              </div>
            )}
          </Clerk.Loading>
        </SignUp.Root>
      </motion.div>
    </main>
  );
}
