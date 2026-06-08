import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/auth/authSlice";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser] = useLoginUserMutation();

     
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setMessage("Invalid credentials");
      return;
    }

    setLoading(true);

    try {
      // Use RTK Query mutation
      const result = await loginUser({ email, password }).unwrap();
      
      // Dispatch to Redux store
      dispatch(setUser({
        user: result.user,
        token: result.token
      }));

      navigate("/");
    } catch (err) {
      setMessage(err?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sign <span>In</span></h1>
          <p>Welcome back</p>
        </div>

        {message && <div className="error-message">{message}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="login-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
