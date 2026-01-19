"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, Plus, Save, Loader2 } from "lucide-react"
import type { ResultsActionsProps } from "@/types/test"

export function ResultsActions({ onRetakeTest, onNewTest, onSaveResults, isSaving }: ResultsActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button variant="outline" onClick={onRetakeTest}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Retake Test
      </Button>
      <Button variant="outline" onClick={onNewTest}>
        <Plus className="h-4 w-4 mr-2" />
        New Test
      </Button>
      {onSaveResults && (
        <Button onClick={onSaveResults} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Results
        </Button>
      )}
    </div>
  )
}
