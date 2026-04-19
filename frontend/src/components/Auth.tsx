import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { Lock, Eye, EyeOff, User, UserPlus, X, Check, Clock, Shield, AlertCircle } from 'lucide-react';
import { useCompany } from '../i18n/CompanyContext';

const STORAGE_KEY = 'clinica_auth';
const API_URL = import.meta.env.VITE_API_URL || '';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

interface AuthUser {
  id: number;
  username: string;
  is_admin: number;
  status: string;
  created_at: string;
}

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Un número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Un carácter especial (!@#$%^&*)');
  }
  
  return { valid: errors.length === 0, errors };
};

export function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loginImage, setLoginImage] = useState('');
  const [showLock, setShowLock] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const { companyName } = useCompany();
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/settings/login-image`)
      .then(res => res.json())
      .then(data => {
        setLoginImage(data.image || '');
        setShowLock(data.showLock !== false);
      })
      .catch(() => {});
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    try {
      const resp = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await resp.json();
      
      if (data.success) {
        if (data.debug && data.code) {
          setResetSuccess(`Código de prueba: ${data.code} (no se envió email, el usuario no tiene email configurado)`);
        } else {
          setResetSuccess('Si el usuario existe, recibirás un código de recuperación');
        }
        setResetStep('code');
      }
    } catch {
      setResetError('Error de conexión');
    }
    setResetLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    
    if (newPassword !== confirmNewPassword) {
      setResetError('Las contraseñas no coinciden');
      return;
    }

    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
      setResetError('La contraseña debe tener: ' + errors.join(', '));
      return;
    }

    setResetLoading(true);

    try {
      const resp = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          code: resetCode, 
          newPassword 
        })
      });
      const data = await resp.json();
      
      if (data.success) {
        setResetSuccess('¡Contraseña actualizada! Ya puedes iniciar sesión.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetStep('email');
          setResetCode('');
          setNewPassword('');
          setConfirmNewPassword('');
          setResetSuccess('');
          setPassword('');
        }, 2000);
      } else {
        setResetError(data.error || 'Error al restablecer contraseña');
      }
    } catch {
      setResetError('Error de conexión');
    }
    setResetLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || 'Credenciales incorrectas');
        return;
      }
      const lastActivity = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        authenticated: true, 
        username: username.trim(),
        password: password,
        isAdmin: data.isAdmin,
        userId: data.userId,
        lastActivity 
      }));
      onLogin();
    } catch {
      setError('Error de conexión con la API');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (showRegister) {
      const { errors } = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.trim().length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      return;
    }

    const { valid, errors } = validatePassword(password);
    if (!valid) {
      setError('La contraseña debe tener: ' + errors.join(', '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || 'No se pudo crear el usuario');
        return;
      }
      setSuccess(data.message || 'Usuario creado correctamente.');
      setTimeout(() => {
        setShowRegister(false);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setPasswordErrors([]);
      }, 2000);
    } catch {
      setError('Error de conexión con la API');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans">
      {/* LEFT SECTION - Visible on md and up */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-emerald-400 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
            {loginImage ? (
              <img src={loginImage} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <Lock className="w-5 h-5 text-emerald-300" />
            )}
            <span className="font-semibold tracking-wide">{companyName}</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Gestiona tu clínica con <span className="text-emerald-300">excelencia</span>.
          </h1>
          <p className="text-lg text-indigo-100 mb-8 leading-relaxed font-medium">
            Una plataforma integral diseñada para optimizar tus citas, clientes y finanzas con una experiencia de uso inigualable.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-indigo-200 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} {companyName}. Todos los derechos reservados.
        </div>
      </div>

      {/* RIGHT SECTION - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white relative">
        <div className="w-full max-w-md mx-auto relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden text-center mb-8">
            {loginImage ? (
              <img src={loginImage} alt="Login" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-xl ring-4 ring-indigo-50" />
            ) : showLock ? (
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                <Lock className="text-white" size={28} />
              </div>
            ) : null}
            <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-2 tracking-tight">
              {showRegister ? 'Crea tu cuenta' : showForgotPassword ? 'Recupera tu acceso' : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-gray-500 font-medium">
              {showRegister ? 'Ingresa tus datos para registrarte.' : showForgotPassword ? 'Sigue los pasos para restablecer.' : 'Introduce tus credenciales para acceder al sistema.'}
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm flex items-start gap-3 shadow-sm font-medium">
              <Check className="mt-0.5 shrink-0" size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-3 shadow-sm font-medium">
              <X className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* REGISTER FORM */}
          {showRegister ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Escribe tu usuario"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-3 text-xs space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    {passwordErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-2 text-red-500">
                        <X size={12} className="shrink-0" />
                        <span className="font-medium">{err}</span>
                      </div>
                    ))}
                    {passwordErrors.length === 0 && (
                      <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <Check size={12} className="shrink-0" />
                        <span>Contraseña segura y fuerte</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Check size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 tracking-wide text-[15px]"
              >
                Crear Mi Cuenta
              </button>

              <div className="text-center mt-6">
                <span className="text-gray-500 text-sm font-medium">¿Ya tienes cuenta? </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors text-sm ml-1"
                >
                  Inicia sesión
                </button>
              </div>
            </form>
          ) : !showForgotPassword ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Escribe tu usuario"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                      setSuccess('');
                      setResetStep('email');
                    }}
                    className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors text-sm"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 tracking-wide text-[15px]"
                >
                  Acceder a mi panel
                </button>
              </div>

              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">o</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setError('');
                  setSuccess('');
                  setUsername('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300 font-bold flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Crear una cuenta nueva
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD FORM */
            <div className="space-y-6">
              {resetSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm shadow-sm flex gap-3 font-medium">
                   <Check className="shrink-0 mt-0.5" size={18} />
                   <span>{resetSuccess}</span>
                </div>
              )}

              {resetError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm shadow-sm flex gap-3 font-medium">
                  <X className="shrink-0 mt-0.5" size={18} />
                  <span>{resetError}</span>
                </div>
              )}

              {resetStep === 'email' ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario registrado</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Tu usuario"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading || !username.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:hover:translate-y-0 tracking-wide text-[15px]"
                  >
                    {resetLoading ? 'Procesando...' : 'Enviar código de recuperación'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Código de recuperación</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                      placeholder="Código de 6 dígitos"
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white text-center text-xl tracking-[0.5em] font-mono uppercase"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva contraseña</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar nueva contraseña</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <Check size={18} />
                      </div>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 text-gray-900 placeholder-gray-400 rounded-xl transition-all duration-300 outline-none shadow-sm hover:bg-gray-100 focus:hover:bg-white font-medium"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={resetLoading || !resetCode || !newPassword || !confirmNewPassword}
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg shadow-emerald-200 disabled:opacity-70 transform hover:-translate-y-0.5 disabled:hover:translate-y-0 tracking-wide text-[15px]"
                  >
                    {resetLoading ? 'Guardando...' : 'Cambiar contraseña segura'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('email');
                      setResetCode('');
                      setResetError('');
                    }}
                    className="w-full text-indigo-600 font-bold py-3 hover:text-indigo-800 transition-colors text-sm"
                  >
                    ¿Problemas? Reenviar código
                  </button>
                </form>
              )}
              
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep('email');
                    setResetCode('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setResetError('');
                    setResetSuccess('');
                  }}
                  className="text-gray-500 font-bold hover:text-gray-800 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
                >
                  <X size={16} /> Cancelar y volver
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const { username, password } = JSON.parse(stored);

    try {
      const resp = await fetch(`${API_URL}/api/auth/admin/users`, {
        headers: { username, password }
      });
      if (!resp.ok) {
        setError('No tienes permisos de administrador');
        return;
      }
      const data = await resp.json();
      setUsers(data);
    } catch {
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: number) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const { username, password } = JSON.parse(stored);

    try {
      await fetch(`${API_URL}/api/auth/admin/approve/${id}`, {
        method: 'POST',
        headers: { username, password }
      });
      fetchUsers();
    } catch {
      setError('Error aprobando usuario');
    }
  };

  const handleReject = async (id: number) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const { username, password } = JSON.parse(stored);

    try {
      await fetch(`${API_URL}/api/auth/admin/reject/${id}`, {
        method: 'POST',
        headers: { username, password }
      });
      fetchUsers();
    } catch {
      setError('Error rechazando usuario');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Shield className="text-primary" />
        Gestión de Usuarios
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fecha</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    {user.username}
                    {user.is_admin === 1 && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Admin</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {user.status === 'approved' && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Check size={14} /> Aprobado
                    </span>
                  )}
                  {user.status === 'pending' && (
                    <span className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Clock size={14} /> Pendiente
                    </span>
                  )}
                  {user.status === 'rejected' && (
                    <span className="flex items-center gap-1 text-red-600 text-sm">
                      <X size={14} /> Rechazado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Aprobar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Rechazar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>
    </div>
  );
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  getAuth: () => { username: string; password: string } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredAuth() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { authenticated: false, isAdmin: false };
  const parsed = JSON.parse(stored);
  return parsed;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return getStoredAuth().authenticated;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return getStoredAuth().isAdmin;
  });

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('clinica_lastPage');
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.dispatchEvent(new Event('storage'));
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const auth = getStoredAuth();
      setIsAuthenticated(auth.authenticated);
      setIsAdmin(auth.isAdmin);
    };
    
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setTimeout>;

    const checkInactivity = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth = JSON.parse(stored);
        const lastActivity = auth.lastActivity || 0;
        const now = Date.now();
        
        if (now - lastActivity >= INACTIVITY_TIMEOUT) {
          logout();
          return true;
        }
      }
      return false;
    };

    const resetTimer = () => {
      if (checkInactivity()) return;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const auth = JSON.parse(stored);
        auth.lastActivity = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      }
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Al volver a la app, comprobamos si el tiempo ha expirado en "tiempo real"
        if (!checkInactivity()) {
          resetTimer();
        }
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Verificación periódica cada 30 segundos como respaldo
    intervalId = setInterval(checkInactivity, 30000);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, logout]);

  const login = () => {
    const stored = getStoredAuth();
    setIsAdmin(!!stored.isAdmin);
    setIsAuthenticated(!!stored.authenticated);
  };

  const getAuth = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { username: parsed.username, password: parsed.password };
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, getAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
