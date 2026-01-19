"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Cpu, HardDrive, Database } from "lucide-react"
import type { TopicSelectorProps } from "@/types/test"

const topics = [
  { id: "cpu" as const, label: "CPU Scheduling", icon: Cpu, description: "Process scheduling algorithms" },
  { id: "memory" as const, label: "Memory Management", icon: Database, description: "Page replacement algorithms" },
  { id: "disk" as const, label: "Disk Scheduling", icon: HardDrive, description: "Disk arm scheduling algorithms" },
]

export function TopicSelector({ selectedTopics, onTopicChange }: TopicSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Select Topics</Label>
      <div className="grid gap-3">
        {topics.map((topic) => {
          const Icon = topic.icon
          const isSelected = selectedTopics[topic.id]
          return (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
              }`}
              onClick={() => onTopicChange(topic.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Checkbox checked={isSelected} onCheckedChange={() => onTopicChange(topic.id)} />
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{topic.label}</p>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
