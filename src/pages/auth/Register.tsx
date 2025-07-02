import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Mail, Lock, User, ShieldCheck, Loader2 } from "lucide-react"
import API from "../../lib/api"
import { useNavigate } from "react-router-dom"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"
import { Link } from "react-router-dom"

// Registration validation schema
const registerSchema = z.object({
  first_name: z.string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be less than 50 characters" }),
  last_name: z.string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be less than 50 characters" }),
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must not exceed 32 characters" })
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    // Removed 'isValid' from destructuring here
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange"
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // 'response' is also still declared but not read if you removed the `isLoading` state.
      // If you truly don't need the `response` object itself, you can remove the assignment.
      // E.g., just `await API.post(...)` without assigning to 'response'.
      await API.post("/auth/registration/", { 
        ...data,
        role: "member",
        is_active: false
      })

      toast({
        title: "Registration successful",
        description: "Your account is pending approval. You'll receive an email when it's activated.",
      })

      setTimeout(() => navigate("/login"), 2000)

    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again."
      
      if (err.response) {
        if (err.response.data.email) {
          errorMessage = `Email: ${err.response.data.email.join(" ")}`
        } else if (err.response.data.password) {
          errorMessage = `Password: ${err.response.data.password.join(" ")}`
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(" ")
        }
      }

      toast({
        title: "Registration error",
        description: errorMessage,
        variant: "destructive"
      })
    } 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Join our community as a member
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    placeholder="John"
                    className={cn(
                      "pl-10",
                      errors.first_name && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    placeholder="Doe"
                    className={cn(
                      "pl-10",
                      errors.last_name && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  {...register("password")}
                  type="password"
                  placeholder="At least 8 characters"
                  className={cn(
                    "pl-10",
                    errors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {errors.password && (
                <div className="text-sm text-destructive">
                  {errors.password.message}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              size="sm"
              className="px-0 text-sm"
              asChild
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Accounts require admin approval before activation
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}