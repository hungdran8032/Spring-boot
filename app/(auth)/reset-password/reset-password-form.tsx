"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { passwordService } from "@/lib/password-service";

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
      .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa" })
      .regex(/[a-z]/, { message: "Mật khẩu phải chứa ít nhất một chữ cái thường" })
      .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một số" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof formSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Token không hợp lệ. Vui lòng kiểm tra lại liên kết.",
      });
      router.push("/login");
      return;
    }

    // Kiểm tra token hợp lệ
    const validateToken = async () => {
      try {
        await passwordService.validateResetToken(tokenParam);
        setIsValidToken(true);
        setToken(tokenParam);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.",
        });
        router.push("/login");
      }
    };

    validateToken();
  }, [searchParams, router, toast]);

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy token. Vui lòng thử lại.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const message = await passwordService.resetPassword({
        token: token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      toast({
        title: "Đặt lại mật khẩu thành công",
        description: message,
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt lại mật khẩu.";
      toast({
        variant: "destructive",
        title: "Đặt lại mật khẩu thất bại",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang kiểm tra token...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Đặt lại mật khẩu
          </Button>
        </form>
      </Form>
    </div>
  );
}