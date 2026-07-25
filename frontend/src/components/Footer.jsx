import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>&copy; {new Date().getFullYear()} ShopHub. Built for Full Stack Developer Internship.</p>
        <p className="footer-note">Razorpay Test Mode | Role-Based E-Commerce Platform</p>
      </div>
    </footer>
  );
}
