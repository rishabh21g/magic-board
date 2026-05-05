 export const CLICK_SOUND = "/audio/mouse-click.mp3"
 export let clickSound : HTMLAudioElement | null = null

export function getClickSound(){
  if (clickSound) return clickSound
  clickSound = new Audio(CLICK_SOUND)
  clickSound.preload = "auto"
  clickSound.volume = 0.1
  return clickSound
}