import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useMsal } from "@azure/msal-react";

import { useAuth } from "../../context/AuthContext";

import { loginRequest } from "../../auth/msalConfig";

const Login = () => {

  const { instance } = useMsal();

  const { user, loading } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {

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
              src="https://c2stechs.com/wp-content/uploads/2023/11/logo-2-min.png"
              alt="logo"
              className="hero-logo"
            />

            <h1>PolicyHub</h1>

            <p>
              Secure access for employees
            </p>

          </div>

        </aside>

        <section className="login-panel">

          <div className="signin-card">

            <h2>
              Sign in with Microsoft
            </h2>

            <p>
              Use your corporate account
            </p>

            <button
              className="login-btn"
              onClick={handleLogin}
            >
              Sign in with Microsoft
            </button>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Login;