import { Suspense } from "react"
import { MemorySimulator } from "@/components/memory-simulator"

export default function MemoryPage() {
  return (
    <Suspense fallback={null}>
      <MemorySimulator />
    </Suspense>
  )
}
