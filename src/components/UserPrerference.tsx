import { useEffect, useState } from "react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Field, FieldGroup } from "./ui/field"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useUser } from "../../Context/UserContext";

function isValidHex6(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value.trim())
}

export function UserPreferenceCard() {
  const { userName, setUserName, userColor, setUserColor, userID } = useUser()

  const [draftName, setDraftName] = useState(userName)
  const [draftColor, setDraftColor] = useState(userColor)

  useEffect(() => setDraftName(userName), [userName])
  useEffect(() => setDraftColor(userColor), [userColor])

  const safeColor = isValidHex6(draftColor) ? draftColor.trim() : "#22c55e"

  return (
    <Card className="w-80 shrink-0" size="sm">
        <CardHeader className="border-b">
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update anytime. Saved locally. (Your ID is {userID.slice(0, 8)}…)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Pick color"
                  type="color"
                  value={safeColor}
                  onChange={(e) => setDraftColor(e.target.value)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  id="color"
                  value={draftColor}
                  onChange={(e) => setDraftColor(e.target.value)}
                  placeholder="#c8a84b"
                />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="border-t justify-end">
          <Button type="submit" onClick={()=>{
            setUserName(draftName)
            setUserColor(draftColor)
          }}>Save</Button>
        </CardFooter>
    </Card>
  )
}