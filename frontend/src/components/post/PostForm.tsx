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
}

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

  useEffect(() => {
    // Generate image preview
    setImageUrl(URL.createObjectURL(image));

    // Get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
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
        tags: formData.tags ? formData.tags.split(",") : [] // Convert comma-separated string to array
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
          if (key === 'latitude' || key === 'longitude' || key === 'author') return null;
          if (key === 'title') return (
            <>
            <label htmlFor={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong></label>
            <input
              key={key}
              type="text"
              name={key}
              value={value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            />
            </>
          )
          if (key === 'description') return (
            <>
            <label htmlFor={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong></label>
            <textarea
              key={key}
              name={key}
              value={value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            />
            </>
          )
          else return (
            <>
            <label htmlFor={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong></label>
            <input
              key={key}
              type="text"
              name={key}
              value={value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              disabled
            />
            </>
          );
        })}

        {formData.latitude && formData.longitude && (
          <p className="text-sm text-gray-600">
            Location: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </p>
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
