import { ArrowLeft, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "light",
      label: "Claro",
      icon: Sun,
      description: "Tema claro para uso durante o dia"
    },
    {
      value: "dark", 
      label: "Escuro",
      icon: Moon,
      description: "Tema escuro para reduzir o cansaço visual"
    },
    {
      value: "system",
      label: "Sistema",
      icon: Monitor,
      description: "Segue as configurações do sistema"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 dark:from-background dark:to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/profile")}
            className="mr-4 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        {/* Theme Settings */}
        <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha como o LifeBee deve aparecer para você.
            </p>
            
            <div className="grid gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all hover:bg-accent/50 ${
                      theme === option.value
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border/50 hover:border-border"
                    }`}
                    onClick={() => setTheme(option.value as any)}
                  >
                    <Icon className={`h-5 w-5 ${
                      theme === option.value ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        theme === option.value ? "text-primary" : "text-foreground"
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {theme === option.value && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sobre o App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">LifeBee</p>
                <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">LB</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Conectando você aos melhores profissionais de saúde
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}