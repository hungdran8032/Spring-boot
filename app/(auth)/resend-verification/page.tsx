"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail } from "lucide-react"
import { resendVerification } from "@/lib/auth-service"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function ResendVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const message = await resendVerification(values.email)

      toast({
        title: "Verification email sent",
        description: message,
      })

      router.push("/verification-sent")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to resend verification",
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Resend Verification Email</CardTitle>
          <CardDescription className="text-center">
            Enter your email address to receive a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Resend Verification Email
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
