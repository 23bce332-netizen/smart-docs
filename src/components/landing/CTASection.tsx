import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-primary px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden animate-in-up">
          {/* Decorative circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground mb-4">
              Ready to take control of your warranties?
            </h2>
            <p className="mx-auto max-w-lg text-primary-foreground/80 text-lg mb-8">
              Join thousands of users who never miss a claim. Free to start, no credit card required.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8 h-12 font-semibold shadow-lg active:scale-[0.97] transition-transform"
              onClick={() => navigate(user ? "/dashboard" : "/signup")}
            >
              {user ? "Open Dashboard" : "Create free account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
