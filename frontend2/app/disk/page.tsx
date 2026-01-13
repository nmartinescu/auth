import { Suspense } from "react"
import { DiskSimulator } from "@/components/disk-simulator"

export default function DiskPage() {
  return (
    <Suspense fallback={<DiskPageSkeleton />}>
      <DiskSimulator />
    </Suspense>
  )
}

function DiskPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto w-[90%] max-w-5xl animate-pulse">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-2 h-9 w-80 rounded bg-muted" />
          <div className="mx-auto h-6 w-64 rounded bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[600px] rounded-xl bg-card" />
          <div className="h-[400px] rounded-xl bg-card" />
        </div>
      </div>
    </div>
  )
}
