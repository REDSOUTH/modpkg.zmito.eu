import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 — Page Not Found | MODPKG";
  }, []);

  return (
    <div className="w-full min-h-[calc(100dvh-65px)] flex flex-col justify-center items-center py-10 text-center px-6">

      {/* 404 Big Display */}
      <h1 className="text-8xl font-black tracking-tighter text-white mb-2 select-none">
        40<span className="text-[#FE5000]">4</span>
      </h1>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold text-white mb-3">
        Page Not Found
      </h2>
      <p className="text-white/40 max-w-md text-sm mb-8 leading-relaxed text-center mx-auto">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="gap-2 text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl h-9 px-4 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>

        <Button
          asChild
          className="gap-2 bg-[#FE5000] hover:bg-[#FE5000] text-white rounded-xl h-9 px-4 text-sm font-semibold transition-all active:scale-95 border-0 [&:hover]:!outline-[#FE5000] [&:hover]:!outline-offset-2"
          style={{
            outline: "2px solid transparent",
            outlineOffset: "0px",
            transition: "all 0.2s ease",
          }}
        >
          <Link to="/">
            <Home className="w-4 h-4 text-white" />
            Return Home
          </Link>
        </Button>
      </div>

    </div>
  );
}
