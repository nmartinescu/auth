"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Play } from "lucide-react"
import { toast } from "sonner"
import { TopicSelector } from "./topic-selector"
import { TestParameters } from "./test-parameters"
import { testSessionManager } from "@/lib/services/test-session-manager"
import type { TestConfigurationProps, Difficulty } from "@/types/test"

export function TestConfiguration({ onTestStart }: TestConfigurationProps) {
  const [selectedTopics, setSelectedTopics] = useState({ cpu: false, memory: false, disk: false })
  const [questionCount, setQuestionCount] = useState(5) // Default to 5 questions (within 1-10 range)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [isLoading, setIsLoading] = useState(false)

  const handleTopicChange = (topic: "cpu" | "memory" | "disk") => {
    setSelectedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }))
  }

  const hasSelectedTopic = Object.values(selectedTopics).some(Boolean)

  const handleStartTest = async () => {
    if (!hasSelectedTopic) {
      toast.error("Please select at least one topic")
      return
    }

    setIsLoading(true)
    try {
      const topics: ("cpu" | "memory" | "disk")[] = []
      if (selectedTopics.cpu) topics.push("cpu")
      if (selectedTopics.memory) topics.push("memory")
      if (selectedTopics.disk) topics.push("disk")

      const session = await testSessionManager.startTest({
        topics,
        questionCount,
        difficulty,
      })
      onTestStart(session)
    } catch (error) {
      toast.error("Failed to start test. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Test</CardTitle>
          <CardDescription>Select topics and configure test parameters to begin your assessment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TopicSelector selectedTopics={selectedTopics} onTopicChange={handleTopicChange} />
          <TestParameters
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
          <Button className="w-full" size="lg" onClick={handleStartTest} disabled={!hasSelectedTopic || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Test...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
