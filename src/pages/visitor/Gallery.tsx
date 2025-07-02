import { useEffect, useState } from "react";
import { ArtworkPublicCard } from "../../components/visitor/ArtworkPublicCard";
import API from "../../lib/api";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";
import { Filter } from "lucide-react";
import { useDebounce } from "../../hooks/use-debounce";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "../../components/ui/button";

interface Artwork {
  id: number;
  title: string;
  artist_name: string;
  image: string;
  category: string;
  description: string;
  submission_date: string;
  approval_status: string;
  likes_count: number;
  is_liked: boolean; // Changed to required field for clarity
}

export default function VisitorGallery() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchArtworks = async (pageNum: number = 1, append: boolean = false) => {
    try {
      let url = `/artwork/?approval_status=approved&page=${pageNum}&page_size=20`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (categoryFilter !== "all") url += `&category=${categoryFilter}`;
      if (sortBy) url += `&sort=${sortBy === "date" ? "-submission_date" : "-likes_count"}`;

      const res = await API.get(url);
      // Explicitly type the results from the API response
      let artworksData: Artwork[] = res.data.results;

      // Fetch liked artworks for authenticated users
      let likedArtworkIds = new Set<number>();
      if (user) {
        try {
          const likedRes = await API.get("/artworks/liked/");
          likedArtworkIds = new Set(likedRes.data.map((art: { id: number }) => art.id));
        } catch (error) {
          console.error("Failed to fetch liked artworks:", error);
          toast.error("Failed to load liked artworks");
        }
      }

      // Ensure is_liked is set for all artworks
      artworksData = artworksData.map((art) => ({ // 'art' is already inferred as Artwork
        ...art,
        is_liked: likedArtworkIds.has(art.id),
      }));

      setArtworks((prev) => (append ? [...prev, ...artworksData] : artworksData));
      setHasMore(res.data.next !== null);

      // Extract unique categories on first page
      if (pageNum === 1) {
        // Explicitly cast the result of map to string to ensure the Set contains strings
        const uniqueCategories = Array.from(
          new Set(artworksData.map((art) => art.category).filter(Boolean))
        ) as string[]; // <-- Type assertion added here
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Failed to load artworks:", err);
      setError("Failed to load artworks");
      toast.error("Failed to load artworks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchArtworks(1);
  }, [debouncedSearch, categoryFilter, sortBy, user]);

  const handleLike = async (artworkId: number) => {
    if (!user) {
      toast.error("Please login to like artworks");
      return;
    }

    const artwork = artworks.find((art) => art.id === artworkId);
    if (!artwork) return;

    try {
      if (artwork.is_liked) {
        await API.delete(`/artwork/${artworkId}/unlike/`);
        setArtworks((prev) =>
          prev.map((art) =>
            art.id === artworkId
              ? { ...art, likes_count: art.likes_count - 1, is_liked: false }
              : art
          )
        );
        toast.success("Artwork unliked");
      } else {
        await API.post(`/artwork/${artworkId}/like/`);
        setArtworks((prev) =>
          prev.map((art) =>
            art.id === artworkId
              ? { ...art, likes_count: art.likes_count + 1, is_liked: true }
              : art
          )
        );
        toast.success("Artwork liked!");
      }
    } catch (error: any) {
      console.error("Failed to update like status:", error);
      toast.error(error.response?.data?.detail || "Failed to update like status");
    }
  };

  // Define breakpoints for responsive masonry columns
  const breakpointColumnsObj = {
    default: 5,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 animate-[fadeIn_0.5s_ease-in]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artwork Gallery</h1>
      <p className="text-gray-600 dark:text-gray-400">Discover our collection of inspiring artworks</p>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search artworks by title, artist, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg"
          aria-label="Search artworks"
        />
        <div className="flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger
              className="w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg"
              aria-label="Filter artworks by category"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span>{categoryFilter === "all" ? "All Categories" : categoryFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg"
              aria-label="Sort artworks"
            >
              <div className="flex items-center gap-2">
                <span>Sort by: {sortBy === "date" ? "Date" : "Likes"}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="likes">Likes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Loading artworks...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(1);
                fetchArtworks(1);
              }}
              className="mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg"
              aria-label="Retry loading artworks"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : artworks.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-400">No approved artworks found</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={artworks.length}
          next={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchArtworks(nextPage, true);
          }}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-600 dark:text-gray-400">Loading more artworks...</p>
            </div>
          }
        >
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="mb-4 animate-[fadeInUp_0.5s_ease-in] hover:scale-[1.02] transition-transform duration-200"
              >
                <ArtworkPublicCard
                  artwork={{
                    id: artwork.id,
                    title: artwork.title,
                    artist: artwork.artist_name,
                    image: artwork.image,
                    description: artwork.description,
                    category: artwork.category,
                    date: artwork.submission_date,
                    likes: artwork.likes_count,
                    isLiked: artwork.is_liked,
                  }}
                  onLike={() => handleLike(artwork.id)}
                />
              </div>
            ))}
          </Masonry>
        </InfiniteScroll>
      )}
    </div>
  );
}