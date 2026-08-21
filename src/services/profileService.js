// import api from "./api";

// export const getProfile = () =>
//   api.get("/auth/profile");

import api from "./api";

// View Profile
export const getProfile = () => {
  return api.get("/auth/profile");
};

// Edit Profile
export const updateProfile = (data) => {
  return api.put("/auth/profile", data);
};

// Change Password
export const changePassword = (data) => {
  return api.post("/auth/set-password", data);
};