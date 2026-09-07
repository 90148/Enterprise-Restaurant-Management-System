import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Utensils, Lock, User, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ usernameOrEmail, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 shadow-inner">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">RestoMaster POS</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise Multi-Outlet Restaurant Management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username or Email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            leftIcon={<User className="w-4 h-4" />}
            placeholder="admin / cashier"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
            Sign In to Terminal
          </Button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Roles
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickFill('admin', 'Admin@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-600 font-medium transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill('cashier', 'Cashier@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-600 font-medium transition-colors"
            >
              Cashier
            </button>
            <button
              type="button"
              onClick={() => quickFill('kitchen', 'Kitchen@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-600 font-medium transition-colors"
            >
              Kitchen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
