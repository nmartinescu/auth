"use client"

import React from "react"

import { useRef, useState, useEffect } from "react"
import { Copy, Upload, FolderOpen, Download, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { tokenService } from "@/lib/services/token-service"
import { simulationService } from "@/lib/services/simulation-service"
import { toast } from "sonner"

interface NameInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  title: string
  placeholder: string
}

function NameInputModal({ isOpen, onClose, onSubmit, title, placeholder }: NameInputModalProps) {
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim())
      setName("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export interface ActionModalProps<T> {
  exportDataCallback: () => T
  importDataCallback: (data: T) => void
  filename?: string
  buttonText?: string
  modalTitle?: string
  simulationType?: "process" | "memory" | "disk"
}

export function ActionModal<T>({
  exportDataCallback,
  importDataCallback,
  filename = "simulation-data.json",
  buttonText = "Actions",
  modalTitle = "Simulation Actions",
  simulationType = "process",
}: ActionModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsLoggedIn(tokenService.isAuthenticated())
  }, [])

  const copyFormData = () => {
    navigator.clipboard.writeText(JSON.stringify(exportDataCallback(), null, 2))
    toast.success("Copied to clipboard")
  }

  const importFormData = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const data = JSON.parse(text) as T
      importDataCallback(data)
      toast.success("Imported successfully")
      setIsOpen(false)
    } catch (err) {
      console.error("Clipboard import failed", err)
      toast.error("Invalid clipboard data or permission denied")
    }
  }

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (!e.target || typeof e.target.result !== "string") {
          throw new Error("File read error")
        }
        const data = JSON.parse(e.target.result) as T
        importDataCallback(data)
        toast.success("File imported successfully")

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        setIsOpen(false)
      } catch (err) {
        toast.error("Invalid JSON file format")
      }
    }
    reader.readAsText(file)
  }

  const downloadJson = () => {
    const dataStr = JSON.stringify(exportDataCallback(), null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }

  const handleSaveToAccount = async (name: string) => {
    try {
      const data = exportDataCallback()
      const result = await simulationService.createSimulation({
        name,
        type: simulationType,
        data,
      })

      if (result) {
        toast.success("Simulation saved successfully")
        setIsNameModalOpen(false)
        setIsOpen(false)
      } else {
        toast.error("Failed to save simulation")
      }
    } catch (error) {
      console.error("Error saving to account:", error)
      toast.error("Failed to save simulation")
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              onClick={copyFormData}
              className="w-full justify-start gap-2 bg-transparent"
            >
              <Copy className="h-4 w-4" />
              Copy to clipboard
            </Button>

            <Button
              variant="outline"
              onClick={importFormData}
              className="w-full justify-start gap-2 bg-transparent"
            >
              <Upload className="h-4 w-4" />
              Import from clipboard
            </Button>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Import from file
            </Button>

            <Button
              variant="outline"
              onClick={downloadJson}
              className="w-full justify-start gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </Button>

            {isLoggedIn && (
              <>
                <div className="my-2 border-t border-border pt-4">
                  <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    Account Features
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsNameModalOpen(true)}
                    className="w-full justify-start gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save to Account
                  </Button>
                </div>
              </>
            )}

            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              ref={fileInputRef}
              onChange={importFromFile}
            />
          </div>
        </DialogContent>
      </Dialog>

      <NameInputModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSubmit={handleSaveToAccount}
        title="Save Simulation"
        placeholder="Enter simulation name"
      />
    </>
  )
}
