import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, LoginFormData } from '@/validations/auth';
import { Utensils, Lock, User as UserIcon, AlertCircle, Clock } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isSessionExpired = searchParams.get('expired') === 'true';

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: 'admin',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 403) {
        setServerError(axiosErr.response.data?.message || 'Account is inactive. Please contact administrator.');
      } else if (axiosErr.response?.status === 401) {
        setServerError('Invalid username or password.');
      } else {
        setServerError(axiosErr.response?.data?.message || 'Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (user: string, pass: string) => {
    setValue('usernameOrEmail', user, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-800">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 shadow-inner">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">RestoMaster POS</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise Multi-Outlet Restaurant Management</p>
        </div>

        {/* Session Expired Banner */}
        {isSessionExpired && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username or Email"
            {...register('usernameOrEmail')}
            error={errors.usernameOrEmail?.message}
            leftIcon={<UserIcon className="w-4 h-4" />}
            placeholder="admin / cashier / kitchen"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
            Sign In to Terminal
          </Button>
        </form>

        {/* Quick Fill Test Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickFill('admin', 'Admin@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill('manager', 'Manager@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => quickFill('cashier', 'Cashier@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Cashier
            </button>
            <button
              type="button"
              onClick={() => quickFill('kitchen', 'Kitchen@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Kitchen
            </button>
            <button
              type="button"
              onClick={() => quickFill('waiter', 'Waiter@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Waiter
            </button>
            <button
              type="button"
              onClick={() => quickFill('inventory', 'Inventory@123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              Inventory
            </button>
          </div>
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => quickFill('inactive_user', 'Inactive@123')}
              className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline"
            >
              Test Inactive Account (inactive_user)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
