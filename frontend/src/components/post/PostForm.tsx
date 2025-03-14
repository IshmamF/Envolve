import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const supabase = createClient();

interface ApiData {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
}

interface PostFormProps {
  image: File;
  apiData: ApiData;
}

interface PostData {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
  author: string;
  latitude: number | null;
  longitude: number | null;
  location?: string;
}

// helper to turn coords into storeable data in supabase
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // city + state extract
      const placeName = data.features[0].place_name;
      // shit gets stored as "city_state" replace _ with comma and space for nicer formatting
      return placeName.replace(/_/g, ', ');
    }
    
    return "Unknown location";
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return "Unknown location";
  }
};

const PostForm = ({ image, apiData }: PostFormProps) => {
  const [formData, setFormData] = useState<PostData>({
    title: apiData.title,
    description: apiData.description,
    category: apiData.category,
    tags: apiData.tags,
    severity: apiData.severity,
    author: "anonymous",
    latitude: null,
    longitude: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [locationString, setLocationString] = useState<string | null>(null);

  useEffect(() => {
    // Generate image preview
    setImageUrl(URL.createObjectURL(image));

    // Get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
          }));
          
          // reverse geocode to get location string
          try {
            const location = await reverseGeocode(latitude, longitude);
            setLocationString(location);
          } catch (error) {
            console.error("Failed to get location name:", error);
          }
        },
        (error) => {
          console.error("Location error:", error.message);
        }
      );
    }

    // Cleanup
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [image]);

  const insertPost = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
  
      const formattedData = {
        ...formData,
        author: user?.user?.id || "anonymous",
        category: formData.category ? [formData.category] : [], // Ensure it's an array
        tags: formData.tags ? formData.tags.split(",") : [], // Convert comma-separated string to array
        location: locationString || "Unknown location" // Add the properly formatted location
      };
  
      const { data, error } = await supabase
        .from("posts")
        .insert([formattedData])
        .select("id")
        .single();
  
      if (error) throw error;
      return data.id;
    }
  });  

  const uploadImage = useMutation({
    mutationFn: async (postId: string) => {
      const fileName = `${postId}.jpg`;
      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, image);

      if (error) throw error;
      return supabase.storage
        .from("images")
        .getPublicUrl(fileName)
        .data.publicUrl;
    }
  });

  const updatePostImage = useMutation({
    mutationFn: async ({ postId, imageUrl }: { postId: string; imageUrl: string }) => {
      const { error } = await supabase
        .from("posts")
        .update({ image_url: imageUrl })
        .eq("id", postId);

      if (error) throw error;
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const postId = await insertPost.mutateAsync();
      const imageUrl = await uploadImage.mutateAsync(postId);
      await updatePostImage.mutateAsync({ postId, imageUrl });
      alert("Post created successfully!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Preview Your Post</h2>

      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="w-64 h-48 object-cover border rounded mb-4" 
        />
      )}

      <form className="w-full space-y-4" onSubmit={e => e.preventDefault()}>
        {Object.entries(formData).map(([key, value]) => {
          if (key === 'latitude' || key === 'longitude' || key === 'author' || key === 'location') return null;
          
          return key === 'description' ? (
            <textarea
              key={key}
              name={key}
              value={value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            />
          ) : (
            <input
              key={key}
              type="text"
              name={key}
              value={value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            />
          );
        })}

        {formData.latitude && formData.longitude && (
          <div className="text-sm text-gray-600">
            <p>Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
            {locationString && <p>Location: {locationString}</p>}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {loading ? "Creating post..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
