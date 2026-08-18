import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] =
    useState(
      localStorage.getItem("accessToken")
    );

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // SAVE SESSION
  // ==================================================

  const saveSession = ({
    accessToken,
    refreshToken,
    user,
  }) => {
    localStorage.setItem(
      "accessToken",
      accessToken
    );

    if (refreshToken) {
      localStorage.setItem(
        "refreshToken",
        refreshToken
      );
    }

    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }

    setAccessToken(accessToken);
    setUser(user || null);
  };

  // ==================================================
  // CLEAR SESSION
  // ==================================================

  const clearSession = () => {
    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    localStorage.removeItem("user");

    setAccessToken(null);
    setUser(null);
  };

  // ==================================================
  // LOGIN
  // POST /auth/login
  // ==================================================

  const login = async (
    email,
    password
  ) => {
    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      const result = response?.data;

      /*
        Backend response can be:

        {
          success: true,
          statusCode: 201,
          message: "Success",
          data: {
            ...
          }
        }

        OR:

        data: {
          data: {
            tokens: {}
          }
        }

        We support both.
      */

      const outerData =
        result?.data || {};

      const innerData =
        outerData?.data ||
        outerData;

      // ------------------------------------------
      // FIND TOKENS
      // ------------------------------------------

      const tokens =
        innerData?.tokens ||
        outerData?.tokens ||
        result?.tokens ||
        {};

      const newAccessToken =
        tokens?.accessToken ||
        tokens?.access_token ||
        innerData?.accessToken ||
        innerData?.access_token ||
        outerData?.accessToken ||
        outerData?.access_token ||
        result?.accessToken ||
        result?.access_token;

      const newRefreshToken =
        tokens?.refreshToken ||
        tokens?.refresh_token ||
        innerData?.refreshToken ||
        innerData?.refresh_token ||
        outerData?.refreshToken ||
        outerData?.refresh_token ||
        result?.refreshToken ||
        result?.refresh_token;

      // ------------------------------------------
      // FIND USER
      // ------------------------------------------

      const loggedInUser =
        innerData?.user ||
        outerData?.user ||
        result?.user ||
        null;

      // ------------------------------------------
      // DEBUG - SAFE
      // Does NOT print token
      // ------------------------------------------

      console.log(
        "LOGIN SUCCESS:",
        response.status
      );

      console.log(
        "ACCESS TOKEN FOUND:",
        Boolean(newAccessToken)
      );

      console.log(
        "REFRESH TOKEN FOUND:",
        Boolean(newRefreshToken)
      );

      // ------------------------------------------
      // TOKEN CHECK
      // ------------------------------------------

      if (!newAccessToken) {
        console.error(
          "Login response did not contain an access token."
        );

        throw new Error(
          "Login response received, but access token could not be found."
        );
      }

      // ------------------------------------------
      // SAVE SESSION
      // ------------------------------------------

      saveSession({
        accessToken:
          newAccessToken,

        refreshToken:
          newRefreshToken,

        user:
          loggedInUser,
      });

      // ------------------------------------------
      // GET PROFILE
      // ------------------------------------------

      try {
        const profileResponse =
          await api.get(
            "/auth/profile"
          );

        const profile =
          profileResponse?.data
            ?.data?.user ||
          profileResponse?.data
            ?.data?.data?.user ||
          profileResponse?.data
            ?.user ||
          profileResponse?.data
            ?.data ||
          null;

        if (profile) {
          setUser(profile);

          localStorage.setItem(
            "user",
            JSON.stringify(profile)
          );
        }
      } catch (profileError) {
        /*
          Login is already successful.
          Profile failure should not destroy
          the valid login session.
        */

        console.warn(
          "Profile could not be loaded after login:",
          profileError
        );
      }

      return result;
    } catch (error) {
      console.error(
        "LOGIN API ERROR:",
        error
      );

      throw error;
    }
  };

  // ==================================================
  // GET PROFILE
  // GET /auth/profile
  // ==================================================

  const getProfile = async () => {
    const response =
      await api.get(
        "/auth/profile"
      );

    const result =
      response?.data;

    const profile =
      result?.data?.data?.user ||
      result?.data?.user ||
      result?.data?.data ||
      result?.user ||
      result?.data ||
      result;

    if (profile) {
      setUser(profile);

      localStorage.setItem(
        "user",
        JSON.stringify(profile)
      );
    }

    return profile;
  };

  // ==================================================
  // REFRESH TOKEN
  // POST /auth/refresh
  // ==================================================

  const refreshSession =
    async () => {
      const refreshToken =
        localStorage.getItem(
          "refreshToken"
        );

      if (!refreshToken) {
        throw new Error(
          "Refresh token not found."
        );
      }

      const response =
        await api.post(
          "/auth/refresh",
          {
            refreshToken,
          }
        );

      const result =
        response?.data;

      const outerData =
        result?.data || {};

      const innerData =
        outerData?.data ||
        outerData;

      const tokens =
        innerData?.tokens ||
        outerData?.tokens ||
        result?.tokens ||
        {};

      const newAccessToken =
        tokens?.accessToken ||
        tokens?.access_token ||
        innerData?.accessToken ||
        innerData?.access_token ||
        outerData?.accessToken ||
        outerData?.access_token ||
        result?.accessToken ||
        result?.access_token;

      const newRefreshToken =
        tokens?.refreshToken ||
        tokens?.refresh_token ||
        innerData?.refreshToken ||
        innerData?.refresh_token ||
        outerData?.refreshToken ||
        outerData?.refresh_token ||
        result?.refreshToken ||
        result?.refresh_token;

      if (!newAccessToken) {
        throw new Error(
          "Refresh response did not contain an access token."
        );
      }

      localStorage.setItem(
        "accessToken",
        newAccessToken
      );

      if (newRefreshToken) {
        localStorage.setItem(
          "refreshToken",
          newRefreshToken
        );
      }

      setAccessToken(
        newAccessToken
      );

      return result;
    };

  // ==================================================
  // LOGOUT
  // POST /auth/logout
  // ==================================================

  const logout = async () => {
    try {
      await api.post(
        "/auth/logout"
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      clearSession();
    }
  };

  // ==================================================
  // LOGOUT ALL
  // POST /auth/logout-all
  // ==================================================

  const logoutAll = async () => {
    try {
      await api.post(
        "/auth/logout-all"
      );
    } catch (error) {
      console.error(
        "LOGOUT ALL ERROR:",
        error
      );
    } finally {
      clearSession();
    }
  };

  // ==================================================
  // RESTORE SESSION
  // ==================================================

  useEffect(() => {
    const initializeSession =
      async () => {
        const token =
          localStorage.getItem(
            "accessToken"
          );

        if (!token) {
          setLoading(false);
          return;
        }

        try {
          await getProfile();
        } catch (error) {
          console.error(
            "SESSION RESTORE ERROR:",
            error
          );

          /*
            If access token expired, try
            refresh token.
          */

          try {
            await refreshSession();

            await getProfile();
          } catch (refreshError) {
            console.error(
              "REFRESH SESSION ERROR:",
              refreshError
            );

            clearSession();
          }
        } finally {
          setLoading(false);
        }
      };

    initializeSession();
  }, []);

  // ==================================================
  // CONTEXT
  // ==================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,

        loading,

        isAuthenticated:
          Boolean(accessToken),

        login,
        logout,
        logoutAll,

        refreshSession,
        getProfile,

        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==================================================
// useAuth
// ==================================================

export function useAuth() {
  return useContext(
    AuthContext
  );
}