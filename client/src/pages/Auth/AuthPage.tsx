import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../../services/api';
import './Auth.scss';

interface AuthPageProps {
    mode: 'login' | 'register';
    onAuth: (user: { name: string; email: string }, token: string) => void;
}

function AuthPage({ mode, onAuth }: AuthPageProps) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (mode === 'register') {
                res = await register(name, email, password);
            } else {
                res = await login(email, password);
            }

            const { token, user } = res.data.data;
            onAuth(user, token);
            navigate('/');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth">
            <div className="auth__card">
                <h2 className="auth__title">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="auth__subtitle">
                    {mode === 'login'
                        ? 'Sign in to continue practicing SQL'
                        : 'Start your SQL learning journey'}
                </p>

                <form className="auth__form" onSubmit={handleSubmit}>
                    {error && <div className="auth__error">{error}</div>}

                    {mode === 'register' && (
                        <div className="auth__field">
                            <label className="auth__label" htmlFor="auth-name">Full Name</label>
                            <input
                                id="auth-name"
                                className="auth__input"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="auth__field">
                        <label className="auth__label" htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            className="auth__input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth__field">
                        <label className="auth__label" htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            className="auth__input"
                            type="password"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button className="auth__submit" type="submit" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : mode === 'login'
                                ? 'Sign In'
                                : 'Create Account'}
                    </button>
                </form>

                <p className="auth__footer">
                    {mode === 'login' ? (
                        <>
                            Don't have an account? <Link to="/register">Sign up</Link>
                        </>
                    ) : (
                        <>
                            Already have an account? <Link to="/login">Sign in</Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default AuthPage;
