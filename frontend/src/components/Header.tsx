import { ConnectButton } from "@mysten/dapp-kit-react/ui";

const NAV_LINKS = [
  { label: "Home", href: "#", active: true },
  { label: "Collections", href: "#" },
  { label: "Create", href: "#" },
  { label: "Launchpad", href: "#" },
];

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="#" className="header-logo">
          <span className="pulse-dot" />
          PULSAR
        </a>
        <nav className="header-nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={link.active ? "active" : ""}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
}
