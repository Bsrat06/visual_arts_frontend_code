import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card" // Card components are usually grouped
import { Checkbox } from "../../components/ui/checkbox"
import { Separator } from "../../components/ui/separator"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import API from "../../lib/api"
import { useNavigate } from "react-router-dom"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"

// Simplified login validation schema
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSSOAvailable, setIsSSOAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  // Check for saved credentials and SSO availability
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setValue("email", savedEmail)
      setValue("rememberMe", true)
    }

    // Check SSO availability
    API.get("/auth/sso/available")
      .then(() => setIsSSOAvailable(true))
      .catch(() => setIsSSOAvailable(false))
  }, [setValue])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    
    try {
      const res = await API.post("/auth/login/", {
        email: data.email,
        password: data.password
      })
      
      const { token, role, user } = res.data

      // Store credentials if "Remember me" is checked
      if (data.rememberMe) {
        localStorage.setItem("rememberedEmail", data.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      // Store auth data
      localStorage.setItem("token", token)
      localStorage.setItem("role", role)
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.email}!`,
      })

      // Redirect with slight delay for better UX
      setTimeout(() => {
        if (role === "admin") navigate("/admin/dashboard")
        else if (role === "member") navigate("/member/dashboard")
        else navigate("/")
      }, 500)

    } catch (err: any) {
      const msg = err?.response?.data?.error || "Invalid email or password. Please try again."
      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => navigate("/auth/forgot-password")
  const handleSSOLogin = (provider: string) => {
    window.location.href = `http://localhost:8000/api/auth/sso/${provider}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-sm">
            {isSSOAvailable ? "Choose your preferred login method" : "Enter your credentials to continue"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSSOAvailable && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSSOLogin("google")}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSSOLogin("microsoft")}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M12 1h10v10H12z" />
                    <path fill="#7fba00" d="M1 12h10v10H1z" />
                    <path fill="#ffb900" d="M12 12h10v10H12z" />
                  </svg>
                  Microsoft
                </Button>
              </div>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-sm text-muted-foreground">
                    OR CONTINUE WITH EMAIL
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "pl-10",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 text-sm text-muted-foreground hover:text-primary h-auto"
                  onClick={handleForgotPassword}
                  type="button"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn(
                    "pl-10 pr-10",
                    errors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <div className="text-sm text-destructive">
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={watch("rememberMe")}
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
              />
              <Label htmlFor="remember-me" className="text-sm font-medium leading-none">
                Remember me
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              size="sm"
              className="px-0 text-sm"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our{" "}
            <Button variant="link" size="sm" className="px-0 text-xs h-auto">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" size="sm" className="px-0 text-xs h-auto">
              Privacy Policy
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}