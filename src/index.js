import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import App from "./components/App";
import Login from "./components/Login";
import Register from "./components/Register";
import "./styles.css";
import { store } from "./redux/store";

// Private Route component - redirects to login if not authenticated
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route component - redirects to app if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}> {/* ADD store prop here */}
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </Provider>
);