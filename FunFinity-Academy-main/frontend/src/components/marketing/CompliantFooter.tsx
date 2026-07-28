import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "For Schools", href: "/schools" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Community", href: "/community" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Refund Policy", href: "/refunds" },
    ],
  },
];

const COMPLIANCE_COPY = {
  coppa: "FunFinity Academy is committed to protecting children's privacy. We comply with COPPA and do not collect personal information from children under 13 without verifiable parental consent.",
  gdpr: "We respect your privacy and are committed to protecting your personal data in accordance with the GDPR and other applicable privacy laws.",
  accessibility: "We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.",
};

export default function CompliantFooter() {
  return (
    <footer className="border-t border-border/30 bg-secondary/5">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-foreground text-lg mb-4">FunFinity Academy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering students to reach their full potential through personalized learning.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} FunFinity Academy. All rights reserved.
            </p>
          </div>

          {/* Footer Links */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Compliance Section */}
        <div className="border-t border-border/30 pt-8 space-y-4">
          {/* COPPA Compliance */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">COPPA Compliance:</span> {COMPLIANCE_COPY.coppa}
            </p>
          </div>

          {/* GDPR Compliance */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">GDPR Compliance:</span> {COMPLIANCE_COPY.gdpr}
            </p>
          </div>

          {/* Accessibility */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Accessibility:</span> {COMPLIANCE_COPY.accessibility}
            </p>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 pt-4 border-t border-border/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-xs text-muted-foreground hover:text-foreground">
              Cookie Settings
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
