import { Link } from "react-router-dom";

export default function BrandMark() {
  return (
    <Link to="/" className="brand-mark" aria-label="FlameSeek home" style={{ textDecoration: "none" }}>
      <img className="brand-logo" src="/branding/flameseek-logo.png?v=3" width="52" height="52" alt="" />
      <div>
        <h1>FlameSeek</h1>
        <p className="eyebrow">Global Fire Intelligence</p>
      </div>
    </Link>
  );
}
