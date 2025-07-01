import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"

type Props = {
  artwork: any
  onDelete: (id: number) => void
}

export function MyArtworkCard({ artwork, onDelete }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{artwork.title}</CardTitle>
        <p className="text-sm text-muted-foreground">Status: {artwork.status}</p>
      </CardHeader>
      <CardContent>
        <img src={artwork.image} alt={artwork.title} className="rounded mb-3 w-full" />
        <p className="text-sm">{artwork.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={() => onDelete(artwork.id)}>Delete</Button>
      </CardFooter>
    </Card>
  )
}
