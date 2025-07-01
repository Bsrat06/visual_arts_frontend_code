import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";

interface ArtworkPublicCardProps {
  artwork: {
    id: number;
    title: string;
    artist: string;
    image: string;
    description: string;
    category: string;
    date: string;
    likes: number;
    isLiked: boolean;
  };
  onLike: () => void;
}

export function ArtworkPublicCard({ artwork, onLike }: ArtworkPublicCardProps) {
  const [showHeart, setShowHeart] = useState<"like" | "unlike" | null>(null);

  const handleDoubleClick = () => {
    setShowHeart(artwork.isLiked ? "unlike" : "like");
    onLike();
    setTimeout(() => setShowHeart(null), 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-auto object-cover rounded-t-xl cursor-pointer"
          loading="lazy"
          onDoubleClick={handleDoubleClick}
          aria-label={`Double-tap to ${artwork.isLiked ? "unlike" : "like"} ${artwork.title}`}
        />
        {showHeart && (
          <div
            className={`absolute inset-0 flex items-center justify-center animate-[pulse_0.5s_ease-out] ${
              showHeart === "unlike" ? "opacity-60" : ""
            }`}
            aria-hidden="true"
          >
            <Heart
              className={`w-16 h-16 ${
                showHeart === "like" ? "text-white fill-white opacity-80" : "text-gray-400 fill-gray-400 opacity-60"
              }`}
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLike}
          className="absolute top-2 right-2 h-8 w-8 bg-white/80 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-900"
          aria-label={artwork.isLiked ? `Unlike ${artwork.title}` : `Like ${artwork.title}`}
        >
          <Heart
            className={`w-5 h-5 ${artwork.isLiked ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"}`}
          />
        </Button>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1">{artwork.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">by {artwork.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{artwork.category}</span>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {artwork.likes} {artwork.likes === 1 ? "like" : "likes"}
          </span>
        </div>
      </div>
    </div>
  );
}