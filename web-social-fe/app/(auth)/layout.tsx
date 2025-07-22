import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <div className="items-center justify-center">{children}</div>
      </div>
    </div>
  )
}
