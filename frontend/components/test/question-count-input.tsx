"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import type { QuestionCountInputProps } from "@/types/test"

export function QuestionCountInput({ value, onChange, min = 1, max = 10 }: QuestionCountInputProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Number of Questions</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDecrement} disabled={value <= min}>
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const val = Number.parseInt(e.target.value)
            if (!isNaN(val) && val >= min && val <= max) onChange(val)
          }}
          className="w-20 text-center"
          min={min}
          max={max}
        />
        <Button variant="outline" size="icon" onClick={handleIncrement} disabled={value >= max}>
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          ({min}-{max})
        </span>
      </div>
    </div>
  )
}
