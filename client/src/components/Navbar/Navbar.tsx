import { Link, useNavigate } from 'react-router-dom';
import './Navbar.scss';

interface NavbarProps {
    user?: { name: string; email: string } | null;
    onLogout?: () => void;
}

function Navbar({ user, onLogout }: NavbarProps) {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar__inner">
                <Link to="/" className="navbar__brand">
                    <div className="navbar__brand-icon">⟨/⟩</div>
                    <div className="navbar__brand-text">
                        Cipher<span>SQL</span>Studio
                    </div>
                </Link>

                <div className="navbar__actions">
                    {user ? (
                        <>
                            <div className="navbar__user">
                                <div className="navbar__user-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{user.name}</span>
                            </div>
                            <button className="navbar__btn navbar__btn--logout" onClick={onLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="navbar__btn navbar__btn--login"
                                onClick={() => navigate('/login')}
                            >
                                Log in
                            </button>
                            <button
                                className="navbar__btn navbar__btn--signup"
                                onClick={() => navigate('/register')}
                            >
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
