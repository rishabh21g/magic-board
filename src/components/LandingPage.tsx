import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { toast } from "sonner"

export function LandingPage({
  onStart,
}: {
  onStart: () => void
}) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Magic Board</CardTitle>
          <CardDescription>
            Claim cells in real-time. Your color persists after reload.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="text-muted-foreground">
            Tips:
            <ul className="list-disc pl-5">
              <li>Click a cell to claim it.</li>
              <li>If you click too fast, you’ll get rate limited.</li>
            </ul>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-full">
                How it works
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              Board updates stream over WebSockets.
            </TooltipContent>
          </Tooltip>
        </CardContent>

        <CardFooter className="gap-2">
          <Button
            className="w-full"
            onClick={() => {
              toast.success("Joining the board…")
              onStart()
            }}
          >
            Start
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}