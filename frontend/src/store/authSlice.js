// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Token'dan user bilgisini çıkar
const decodeToken = (token) => {
  try {
    return jwtDecode(token); // { email, id, iat, exp, ... }
  } catch {
    return null;
  }
};

// Sayfa yenilemede localStorage'dan user'ı yükle
const savedToken = localStorage.getItem('token');
const savedUser = savedToken ? decodeToken(savedToken) : null;

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, { email, password });
      return res.data; // { token }
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data?.error || err.response.data?.message || 'Giriş yapılamadı.');
      } else if (err.request) {
        return rejectWithValue('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
      }
      return rejectWithValue('Beklenmeyen bir hata oluştu.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/users/register`, {
        email,
        password,
        plan: 'Free',
      });
      return res.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data?.error || 'Kayıt sırasında bir hata oluştu.');
      } else if (err.request) {
        return rejectWithValue('Sunucuya bağlanılamıyor.');
      }
      return rejectWithValue('Beklenmeyen bir hata oluştu.');
    }
  }
);

export const connectGmail = createAsyncThunk(
  'auth/connectGmail',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get(`${BASE_URL}/api/gmail/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // { url: "https://accounts.google.com/..." }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Gmail bağlantısı kurulamadı.');
    }
  }
);

export const disconnectGmail = createAsyncThunk(
  'auth/disconnectGmail',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.delete(`${BASE_URL}/api/users/disconnect-gmail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Gmail bağlantısı kesilemedi.');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.delete(`${BASE_URL}/api/users/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Hesap silinemedi.');
    }
  }
);
export const fetchEmails = createAsyncThunk(
  'auth/fetchEmails',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get(`${BASE_URL}/api/gmail/get-emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('fetchEmails response:', res.data); // ← ekle
      return res.data.data;
    } catch (err) {
      console.log('fetchEmails error:', err); // ← ekle
      return rejectWithValue(err.response?.data?.error || 'Mailler yüklenemedi.');
    }
  }
);

export const resolveComplaint = createAsyncThunk(
  'auth/resolveComplaint',
  async (messageId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.patch(
        `${BASE_URL}/api/gmail/emails/${messageId}/complaint`,
        { complaint: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { messageId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Güncelleme başarısız.');
    }
  }
);


// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken || null,
    user: savedUser || null,       // JWT decode'dan gelen { email, id, ... }
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
    successMessage: null,
    emails: [],
    emailsLoading: false,
    emailsError: null,
  },
  reducers: {
    setCredentials(state, action) {
      const { token } = action.payload;
      const user = decodeToken(token);
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
        localStorage.setItem('token', token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem('token');
    },
    clearAuthMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { token } = action.payload;
        const user = decodeToken(token); // email burada çıkıyor
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('token', token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── Register ───────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Gmail Connect
    builder
      .addCase(connectGmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectGmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(connectGmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Disconnect Gmail
    builder
      .addCase(disconnectGmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(disconnectGmail.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Gmail bağlantısı başarıyla kaldırıldı.';
      })
      .addCase(disconnectGmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Hesap başarıyla silindi. Yönlendiriliyorsunuz...';
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchEmails.pending, (state) => {
        state.emailsLoading = true;
        state.emailsError = null;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.emailsLoading = false;
    state.emails = action.payload;
  })
  .addCase(fetchEmails.rejected, (state, action) => {
    state.emailsLoading = false;
    state.emailsError = action.payload;
  });

builder
  .addCase(resolveComplaint.fulfilled, (state, action) => {
    const email = state.emails.find(e => e.message_id === action.payload.messageId);
    if (email) email.complaint = false;
  });
  },
});

export const { setCredentials, logout, clearAuthMessages } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.successMessage;
export const selectEmails = (state) => state.auth.emails;
export const selectEmailsLoading = (state) => state.auth.emailsLoading;
export const selectEmailsError = (state) => state.auth.emailsError;