import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../redux/features/auth/authApi";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [registerUser] = useRegisterUserMutation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (username.trim().length < 3) {
      setMessage("Username must be at least 3 characters");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Invalid email address");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Use RTK Query mutation
      const result = await registerUser({ username, email, password }).unwrap();
      
      // Show success message
      setIsSuccess(true);
      setMessage("Registration successful! Redirecting to login...");
      
      // Wait 2 seconds, then redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setMessage(err?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Create <span>Account</span></h1>
          <p>Join Keeper</p>
        </div>

        {message && (
          <div className={`message ${isSuccess ? "success-message" : "error-message"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          <input
            className="form-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSuccess} // Disable form after success
          />

          <input
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSuccess}
          />

          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSuccess}
          />

          <input
            type="password"
            className="form-input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSuccess}
          />

          <button className="login-btn" disabled={loading || isSuccess}>
            {loading ? "Creating..." : isSuccess ? "Registration Successful!" : "Create Account"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already registered?{" "}
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
