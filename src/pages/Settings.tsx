
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Monitor, Palette, Type, Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = React.useState(() => 
    localStorage.getItem('font-size') || 'medium'
  );
  const [compactMode, setCompactMode] = React.useState(() => 
    localStorage.getItem('compact-mode') === 'true'
  );

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem('font-size', value);
    
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    switch (value) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
  };

  const handleCompactModeChange = (checked: boolean) => {
    setCompactMode(checked);
    localStorage.setItem('compact-mode', checked.toString());
    
    const root = document.documentElement;
    if (checked) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  };

  React.useEffect(() => {
    // Apply saved preferences on mount
    const root = document.documentElement;
    
    // Apply font size
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
    
    // Apply compact mode
    if (compactMode) {
      root.classList.add('compact-mode');
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your application preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the visual appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="font-size">Font Size</Label>
              <Select value={fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for a more compact layout
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={handleCompactModeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <CardTitle>Display</CardTitle>
            </div>
            <CardDescription>
              Configure how content is displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Current Theme</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {theme} mode is active
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {theme === 'light' && <Sun className="h-4 w-4" />}
                  {theme === 'dark' && <Moon className="h-4 w-4" />}
                  {theme === 'system' && <Monitor className="h-4 w-4" />}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Font Size Preview</Label>
                  <p className="text-sm text-muted-foreground">
                    Current: {fontSize} size
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    fontSize === 'small' ? 'text-sm' : 
                    fontSize === 'large' ? 'text-lg' : 'text-base'
                  }`}>
                    Sample text
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Layout Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    {compactMode ? 'Compact layout active' : 'Standard layout active'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {compactMode ? 'Compact' : 'Standard'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>About Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            These settings are saved locally in your browser and will persist across sessions. 
            Theme preferences will automatically apply based on your selection or system preference.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
