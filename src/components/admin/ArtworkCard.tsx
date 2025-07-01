import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"

export type Artwork = {
  id: number
  title: string
  artist: string
  image: string
  description: string
  status: "pending" | "approved" | "rejected"
}

type Props = {
  artwork: Artwork
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export function ArtworkCard({ artwork, onApprove, onReject }: Props) {
  return (
    <Card className="w-full max-w-sm shadow">
      <CardHeader>
        <CardTitle>{artwork.title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
      </CardHeader>
      <CardContent>
        <img src={artwork.image} alt={artwork.title} className="rounded mb-3" />
        <p className="text-sm">{artwork.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="default" onClick={() => onApprove(artwork.id)}>Approve</Button>
        <Button variant="destructive" onClick={() => onReject(artwork.id)}>Reject</Button>
      </CardFooter>
    </Card>
  )
}
