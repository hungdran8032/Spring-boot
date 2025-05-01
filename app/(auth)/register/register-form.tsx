"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/lib/auth-service";

const formSchema = z
  .object({
    firstName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    lastName: z.string().min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
    userName: z.string().min(3, { message: "Tên người dùng phải có ít nhất 3 ký tự" }),
    email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ" }),
    password: z
      .string()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa" })
      .regex(/[a-z]/, { message: "Mật khẩu phải chứa ít nhất một chữ cái thường" })
      .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một số" }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với các điều khoản và điều kiện",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);

    try {
      await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        userName: values.userName,
        email: values.email,
        password: values.password,
      });

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác minh tài khoản của bạn.",
      });

      router.push("/verification-sent");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Có lỗi xảy ra khi tạo tài khoản.";
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleRegister = () => {
    setIsGoogleLoading(true);
    try {
      authService.loginGoogle(); // Chuyển hướng đến backend
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng ký Google thất bại",
        description: "Có lỗi xảy ra với xác thực Google.",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        type="button"
        disabled={isGoogleLoading}
        className="w-full"
        onClick={handleGoogleRegister}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="48px"
            height="48px"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
        )}
        Đăng ký với Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc tiếp tục với</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên người dùng</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Tôi đồng ý với{" "}
                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                      điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                      chính sách bảo mật
                    </Link>
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Tạo tài khoản
          </Button>
        </form>
      </Form>
    </div>
  );
}