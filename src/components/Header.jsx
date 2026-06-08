import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import avatarImg from "../assets/avatar.png";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function Header() {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropDownOpen(false);
    navigate("/login");
  };

  return (
      <header>
         {/* Logo */}
         <h1>
          <span className="logo-icon">📝</span>
                   Keeper
             </h1>

      {/* Auth Section */}
      {isAuthenticated && user ? (
        <div className='nav__icons relative'>

          <button
                className="user-toggle"
                onClick={() => setIsDropDownOpen(prev => !prev)}
             >
            
          {/* Avatar */}
          <img
            src={user?.profileImage || avatarImg}
            alt="User Avatar"
            className="user-avatar"
            onClick={() => setIsDropDownOpen((prev) => !prev)}
             
          />
            <ArrowDropDownIcon
               className={`dropdownicon ${isDropDownOpen ? "open" : ""}`}
           />
           
          </button>

          {/* Dropdown */}
          {isDropDownOpen && (
            <div className="user-dropdown">
              <button
                onClick={handleLogout}
             //   className="dropdown-items"
              > 
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
       <button
          onClick={() => navigate("/login")}
          className="login-button"
       >
         👤 Login
         
      </button>
      )}
    </header>
  );
}

export default Header;

