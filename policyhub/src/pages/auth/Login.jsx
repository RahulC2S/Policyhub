import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useMsal } from "@azure/msal-react";

import { useAuth } from "../../context/AuthContext";

import { loginRequest } from "../../auth/msalConfig";

const Login = () => {

  const { instance } = useMsal();

  const { user, loading, isAuthenticating, startLogin } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticating && user) {
      navigate('/dashboard');
    }
  }, [user, loading, isAuthenticating, navigate]);

  const handleLogin = async () => {
    try {
      startLogin();
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <div className="login-page">
        <aside className="login-hero">
          <div className="hero-copy">
            <img
              src="/logo192.png"
              alt="C2S Logo"
              className="hero-logo"
            />
            <h1>PolicyHub</h1>
            <p>Secure access for employees</p>

            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>Secure & Trusted</strong>
                  <p>Enterprise-grade security to protect your data.</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">👤</span>
                <div>
                  <strong>Employee Access</strong>
                  <p>Streamlined access to policies, documents and resources.</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Fast & Reliable</strong>
                  <p>Built for performance and designed for productivity.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="login-panel">
          <div className="signin-card">
            <img
              src="/logo192.png"
              alt="C2S Logo"
              className="signin-logo"
            />

            <div className="signin-header">
              <h2>Sign in with Microsoft</h2>
              <p>Use your corporate account</p>
            </div>

            <button className="login-btn" onClick={handleLogin} disabled={loading || isAuthenticating}>
              Sign in with Microsoft
            </button>

            {/* <div className="divider">or</div> */}

            <div className="terms-box">
              By continuing, you agree to our{' '}
              <a href="#">Terms of Service</a> and{' '}
              <a href="#">Privacy Policy</a>.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;