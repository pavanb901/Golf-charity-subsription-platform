import { AuthPanel } from "@/components/forms/auth-panel";

export default function LoginPage() {
  return (
    <section className="px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember">Access</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Subscriber and admin demo access</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate">
          This assignment version uses seeded demo accounts and a local persistence layer so the full flow
          can be reviewed instantly on Vercel.
        </p>
        <div className="mt-8">
          <AuthPanel />
        </div>
      </div>
    </section>
  );
}
