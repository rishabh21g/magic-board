import { useEffect, useState } from "react"
import { useUser } from "../../Context/UserContext"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Field, FieldGroup } from "./ui/field"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export function UserPreferenceDialog() {
  const { userName, setUserName, userColor, setUserColor, userID } = useUser()

  const [draftName, setDraftName] = useState(userName)
  const [draftColor, setDraftColor] = useState(userColor)

  useEffect(() => setDraftName(userName), [userName])
  useEffect(() => setDraftColor(userColor), [userColor])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUserName(draftName.trim())
    setUserColor(draftColor.trim())
  }

  return (
    <Dialog>
      <form onSubmit={onSubmit}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Saved locally on this device. (Your ID is {userID.slice(0, 8)}…)
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. DarkKnight"
              />
            </Field>

            <Field>
              <Label htmlFor="color">Color (hex)</Label>
              <Input
                id="color"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
                placeholder="#c8a84b"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}