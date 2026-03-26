"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useDemo } from "@/components/providers/demo-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AuthPanel() {
  const router = useRouter();
  const { snapshot, login, signup, isLiveMode } = useDemo();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  return (
    <Card className="mx-auto max-w-3xl">
      <div className="mb-6 flex gap-3">
        <Button variant={mode === "login" ? "primary" : "outline"} onClick={() => setMode("login")}>
          Login
        </Button>
        <Button variant={mode === "signup" ? "primary" : "outline"} onClick={() => setMode("signup")}>
          Signup
        </Button>
      </div>
      {mode === "login" ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            void (async () => {
              const result = await login(
                String(formData.get("email")),
                String(formData.get("password"))
              );
              if (!result.ok) {
                setMessage(result.error ?? "Unable to log in.");
                return;
              }
              router.push("/dashboard");
            })();
          }}
        >
          <input name="email" placeholder="Email" className="rounded-2xl border border-ink/10 px-4 py-3" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="rounded-2xl border border-ink/10 px-4 py-3"
          />
          <Button type="submit" variant="accent">
            {isLiveMode ? "Login with Supabase" : "Enter platform"}
          </Button>
          <p className="text-sm text-slate">
            {isLiveMode
              ? "Supabase mode is active. Use an account created in your configured project."
              : "Demo subscriber: `mia@golfcharity.demo` / `demo123`, admin: `admin@golfcharity.demo` / `admin123`"}
          </p>
        </form>
      ) : (
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            void (async () => {
              const result = await signup({
                name: String(formData.get("name")),
                email: String(formData.get("email")),
                password: String(formData.get("password")),
                charityId: String(formData.get("charityId")),
                plan: String(formData.get("plan")) as "monthly" | "yearly"
              });
              if (!result.ok) {
                setMessage(result.error ?? "Unable to sign up.");
                return;
              }
              if (result.needsEmailConfirmation) {
                setMessage("Signup created. Confirm the email in Supabase, then log in.");
                return;
              }
              router.push("/dashboard");
            })();
          }}
        >
          <input name="name" placeholder="Full name" className="rounded-2xl border border-ink/10 px-4 py-3" />
          <input name="email" placeholder="Email" className="rounded-2xl border border-ink/10 px-4 py-3" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="rounded-2xl border border-ink/10 px-4 py-3"
          />
          <select name="plan" className="rounded-2xl border border-ink/10 px-4 py-3">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select name="charityId" className="rounded-2xl border border-ink/10 px-4 py-3 md:col-span-2">
            {snapshot.charities.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="accent" className="md:col-span-2">
            {isLiveMode ? "Create account in Supabase" : "Start subscription demo"}
          </Button>
        </form>
      )}
      {message ? <p className="mt-4 text-sm text-ember">{message}</p> : null}
    </Card>
  );
}
