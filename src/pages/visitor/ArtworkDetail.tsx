import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

// Dummy artworks — same as Gallery
const artworks = [
  {
    id: 1,
    title: "Dreamscape",
    artist: "Liya Tesfaye",
    description: "A surreal landscape blending dreams with color.",
    image: "https://via.placeholder.com/600x350?text=Dreamscape",
    uploaded: "2025-06-01"
  },
  {
    id: 2,
    title: "Golden Hour",
    artist: "Musa Bekele",
    description: "Capturing the serenity of sunset moments.",
    image: "https://via.placeholder.com/600x350?text=Golden+Hour",
    uploaded: "2025-06-10"
  },
  {
    id: 3,
    title: "Roots and Wings",
    artist: "Sara Ali",
    description: "An abstract about heritage and freedom.",
    image: "https://via.placeholder.com/600x350?text=Roots+%26+Wings",
    uploaded: "2025-06-18"
  }
]

export default function ArtworkDetail() {
  const { id } = useParams()
  const artwork = artworks.find((a) => a.id === Number(id))

  if (!artwork) {
    return <p className="text-center text-muted-foreground py-10">Artwork not found.</p>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{artwork.title}</CardTitle>
          <p className="text-sm text-muted-foreground">by {artwork.artist} · Uploaded on {artwork.uploaded}</p>
        </CardHeader>
        <CardContent>
          <img src={artwork.image} alt={artwork.title} className="rounded mb-4 w-full" />
          <p className="text-sm">{artwork.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
