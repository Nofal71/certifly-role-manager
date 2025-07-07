
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Please contact your administrator if you believe this is an error.
          </p>
          <Link to="/certificates">
            <Button>
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
