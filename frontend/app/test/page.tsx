import { Suspense } from "react"
import { TestContainer } from "@/components/test/test-container"

export default function TestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TestContainer />
    </Suspense>
  )
}
