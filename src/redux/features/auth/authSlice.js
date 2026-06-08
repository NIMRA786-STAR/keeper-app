// File: redux/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const loadUserFromLocalStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    return {
      user: user,
      token: token,
      isAuthenticated: !!token
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
};

const initialState = loadUserFromLocalStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;