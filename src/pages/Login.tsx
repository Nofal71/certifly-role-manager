
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, resetPassword } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        await resetPassword(formData.email);
        toast.success('Password reset email sent! Check your inbox.');
        setResetMode(false);
      } else {
        await loginUser(formData.email, formData.password);
        toast.success('Login successful!');
        navigate('/certificates');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {resetMode ? 'Reset Password' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center">
            {resetMode 
              ? 'Enter your email to receive a password reset link'
              : 'Enter your credentials to access your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
            
            {!resetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (resetMode ? 'Sending Reset Link...' : 'Signing In...') 
                : (resetMode ? 'Send Reset Link' : 'Sign In')
              }
            </Button>
          </form>
          
          <div className="mt-4 space-y-2 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setResetMode(!resetMode)}
              className="text-sm"
            >
              {resetMode ? 'Back to Sign In' : 'Forgot Password?'}
            </Button>
            
            <p className="text-sm text-gray-600">
              Don't have a company account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
