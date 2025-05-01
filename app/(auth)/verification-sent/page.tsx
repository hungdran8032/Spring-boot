import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerificationSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p>Please check your email inbox and click the verification link to activate your account.</p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder or request a new verification link.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/resend-verification">Resend Verification Email</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
