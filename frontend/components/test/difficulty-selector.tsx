"use client"

import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { DifficultySelectorProps, Difficulty } from "@/types/test"

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "data-[state=on]:bg-green-500/20 data-[state=on]:text-green-500" },
  { value: "medium", label: "Medium", color: "data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-500" },
  { value: "hard", label: "Hard", color: "data-[state=on]:bg-red-500/20 data-[state=on]:text-red-500" },
]

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Difficulty Level</Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as Difficulty)}
        className="justify-start"
      >
        {difficulties.map((diff) => (
          <ToggleGroupItem key={diff.value} value={diff.value} className={diff.color}>
            {diff.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
