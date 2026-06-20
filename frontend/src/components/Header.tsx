import { useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";

export type Tab = "home" | "collections" | "create" | "launchpad";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links: { label: string; tab: Tab }[] = [
    { label: "Home", tab: "home" },
    { label: "Collections", tab: "collections" },
    { label: "Create", tab: "create" },
    { label: "Launchpad", tab: "launchpad" },
  ];

  const handleNav = (tab: Tab) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <a
          href="#"
          className="header-logo"
          onClick={(e) => { e.preventDefault(); handleNav("home"); }}
        >
          <span className="pulse-dot" />
          PULSAR
        </a>

        {/* Desktop nav */}
        <nav className="header-nav">
          {links.map((link) => (
            <a
              key={link.tab}
              href={`#${link.tab}`}
              className={activeTab === link.tab ? "active" : ""}
              onClick={(e) => { e.preventDefault(); handleNav(link.tab); }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-right">
          <ConnectButton />
          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`ham-bar ${menuOpen ? "open" : ""}`} />
            <span className={`ham-bar ${menuOpen ? "open" : ""}`} />
            <span className={`ham-bar ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <a
              key={link.tab}
              href={`#${link.tab}`}
              className={`mobile-menu-link ${activeTab === link.tab ? "active" : ""}`}
              onClick={(e) => { e.preventDefault(); handleNav(link.tab); }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
