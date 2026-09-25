function Header({ onHome }) {
  return (
    <header className="top-header">
      <div className="brand" onClick={onHome}>
        <div className="brand-mark">SA</div>

        <div>
          <h1>SAT-SA</h1>
          <p>Security Assessment & Supervisory Analytics</p>
        </div>
      </div>

      <div className="header-status">
        <span className="online-dot"></span>
        System Online
      </div>
    </header>
  );
}

export default Header;
