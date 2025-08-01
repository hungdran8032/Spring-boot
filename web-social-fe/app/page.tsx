"use client"

import FeedContent from "@/components/feed/feed-content"

export default function Home() {

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* content */}
        <div className="col-span-1 lg:col-span-3">
          <FeedContent />
        </div>
        {/* right sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <h3 className="font-medium mb-4">Đề xuất cho bạn</h3>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium">Tên người dùng</p>
                    <p className="text-sm text-muted-foreground">Tên</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
