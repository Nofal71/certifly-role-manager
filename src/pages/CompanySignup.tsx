
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupCompany } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const CompanySignup: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signupCompany({
        companyName: formData.companyName,
        ownerName: formData.ownerName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      });
      toast.success('Company registered successfully! Please login to continue.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create company account');
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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Company Account</CardTitle>
          <CardDescription className="text-center">
            Sign up your company and get started with certificate management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Enter owner full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                name="adminEmail"
                type="email"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="Enter admin email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                required
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Create a password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Company Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySignup;
