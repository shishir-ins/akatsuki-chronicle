import { useState } from "react";
import { Loader2, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AuthPanelProps {
  title: string;
  description: string;
}

export default function AuthPanel({ title, description }: AuthPanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const submit = async () => {
    if (!displayName.trim() || !password.trim()) {
      toast.error("Enter your display name and password");
      return;
    }

    setLoading(true);

    try {
      // Simulate network wait for nicer UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const usersRegistry = JSON.parse(localStorage.getItem("bloody_hell_users_registry") || "{}");
      const nameKey = displayName.trim().toLowerCase();

      if (mode === "signup") {
        if (usersRegistry[nameKey]) {
          throw new Error("Display name already taken. Please sign in or choose another name.");
        }
        
        usersRegistry[nameKey] = {
          password,
          originalName: displayName.trim(),
        };
        localStorage.setItem("bloody_hell_users_registry", JSON.stringify(usersRegistry));
        
        signIn({
          id: nameKey,
          user_metadata: { display_name: displayName.trim() }
        });
        
        toast.success("Account created! You are now in your private workspace.");
      } else {
        const userRec = usersRegistry[nameKey];
        if (!userRec || userRec.password !== password) {
          throw new Error("Invalid display name or password");
        }
        
        signIn({
          id: nameKey,
          user_metadata: { display_name: userRec.originalName }
        });
        
        toast.success(`Welcome back, ${userRec.originalName}!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-raised mx-auto max-w-lg p-7 md:p-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
        <LockKeyhole className="h-8 w-8" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-6 flex rounded-2xl border border-border bg-secondary p-1">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            mode === "signin" ? "bg-card text-foreground" : "text-muted-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            mode === "signup" ? "bg-card text-foreground" : "text-muted-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-5 space-y-4"
      >
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display Name"
          className="input-soft block w-full"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          name="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="input-soft block w-full"
        />

        {mode === "signin" && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-border accent-primary"
            />
            Keep me signed in
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            <LogIn className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
