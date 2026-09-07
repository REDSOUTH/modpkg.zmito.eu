import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ComingSoonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isDocs = location.pathname.startsWith("/docs");
  const sectionName = isDocs ? t("nav.docs") : t("nav.discover");

  useEffect(() => {
    document.title = `${sectionName} — ${t("comingSoon.badge")} | MODPKG`;
  }, [sectionName, t]);

  return (
    <div className="w-full min-h-[calc(100dvh-65px)] flex flex-col justify-center items-center py-10 text-center px-6">

      {/* Clock Icon & Coming Soon Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FE5000]/10 border border-[#FE5000]/25 text-[#FE5000] text-xs font-semibold uppercase tracking-wider mb-4">
        <Clock className="w-3.5 h-3.5 text-[#FE5000]" />
        <span>{t("comingSoon.badge")}</span>
      </div>

      {/* MODPKG / Section Name Big Display */}
      <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-foreground mb-2 select-none">
        {sectionName}
      </h1>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {t("comingSoon.title")}
      </h2>
      <p className="text-muted-foreground max-w-md text-sm mb-8 leading-relaxed text-center mx-auto">
        {t("comingSoon.desc")}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl h-9 px-4 text-sm font-medium transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("comingSoon.goBack")}
        </Button>

        <Button
          asChild
          className="gap-2 bg-[#FE5000] hover:bg-[#FE5000] text-white rounded-xl h-9 px-4 text-sm font-semibold transition-all active:scale-95 border-0 [&:hover]:!outline-[#FE5000] [&:hover]:!outline-offset-2 cursor-pointer"
          style={{
            outline: "2px solid transparent",
            outlineOffset: "0px",
            transition: "all 0.2s ease",
          }}
        >
          <Link to="/">
            <Home className="w-4 h-4 text-white" />
            {t("comingSoon.returnHome")}
          </Link>
        </Button>
      </div>

    </div>
  );
}

