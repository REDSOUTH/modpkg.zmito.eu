import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 — Page Not Found | MODPKG";
  }, []);

  return (
    <div className="w-full min-h-[calc(100dvh-65px)] flex flex-col justify-center items-center py-10 text-center px-6">

      {/* 404 Big Display */}
      <h1 className="text-8xl font-black tracking-tighter text-foreground mb-2 select-none">
        40<span className="text-[#FE5000]">4</span>
      </h1>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {t("notFound.title")}
      </h2>
      <p className="text-muted-foreground max-w-md text-sm mb-8 leading-relaxed text-center mx-auto">
        {t("notFound.desc")}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl h-9 px-4 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("notFound.goBack")}
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
            {t("notFound.returnHome")}
          </Link>
        </Button>
      </div>

    </div>
  );
}
