import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Bell } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Subtle background shape */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-8 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-accent" />
            AI-powered document intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6">
            Never miss a warranty
            <br />
            <span className="text-gradient">expiration again</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 text-pretty">
            Upload receipts and warranty documents. Our AI extracts key details, tracks expiry dates, and reminds you before coverage ends.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
              onClick={() => navigate(user ? "/dashboard" : "/signup")}
            >
              {user ? "Go to Dashboard" : "Start for free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-8 h-12 active:scale-[0.97]"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-auto mt-20 max-w-2xl animate-in-up-delay-2">
          <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card p-6 shadow-sm">
            {[
              { icon: Shield, value: "256-bit", label: "Encrypted storage" },
              { icon: Zap, value: "<3s", label: "AI extraction" },
              { icon: Bell, value: "30 days", label: "Early reminders" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 px-2">
                <Icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-xl sm:text-2xl font-bold">{value}</span>
                <span className="text-xs sm:text-sm text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
