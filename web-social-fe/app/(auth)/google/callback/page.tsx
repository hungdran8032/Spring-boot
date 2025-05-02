"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");

    if (!token || !refreshToken) {
      toast({ variant: "destructive", title: "Đăng nhập thất bại", description: "Không tìm thấy token" });
      router.replace("/login");
      return;
    }

    try {
      // Lưu token vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      toast({ title: "Đăng nhập thành công", description: "Chào mừng bạn!" });
      router.replace("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Đăng nhập thất bại" });
      router.replace("/login");
    }
  }, [params, router, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin h-8 w-8" />
      <span className="ml-2">Đang hoàn tất xác thực...</span>
    </div>
  );
}