import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCheck, KeyRound } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import StylistRegisterForm from "./StylistRegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import GoogleSignInButton from "./GoogleSignInButton";

interface AuthTabsProps {
  defaultTab?: "login" | "register" | "stylist" | "forgot";
}

const AuthTabs = ({ defaultTab = "login" }: AuthTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register" | "stylist" | "forgot")} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="login" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Client</span>
          </TabsTrigger>
          <TabsTrigger value="stylist" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Specialist</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to manage your bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoginForm />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">Or continue with</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton />
              </div>

              <div className="text-center text-sm space-y-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setActiveTab("forgot")}
                  className="text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Create Client Account</CardTitle>
              <CardDescription>
                Join us to start booking appointments with our specialists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RegisterForm />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">Or continue with</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton label="Continue with Google" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stylist" className="space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Specialist Registration</CardTitle>
              <CardDescription>
                Join our platform to connect with clients and grow your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StylistRegisterForm />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">Or continue with</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton isStylist />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forgot" className="space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Reset Your Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ForgotPasswordForm />
              
              <div className="text-center text-sm pt-4">
                <button 
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-primary hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTabs;