import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();


const PostForm = ({ image, apiData }: { image: File; apiData: { title: string; description: string; category: string; tags: string; severity: string } }) => {
  const insertPostMutation = useMutation({
    mutationFn: async () => {
      const author = await supabase.auth.getUser()
      // need location/latitude/longitude info
      const { data, error } = await supabase.from("posts").insert([{ title: apiData.title, description: apiData.description, category: apiData.category, tags: apiData.tags, severity: apiData.severity, author: author}]).select("id").single();
      if (error) throw new Error(error.message);
      return data.id;
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (postId: string) => {
      const fileName = `${postId}.jpg`;
      const { error } = await supabase.storage.from("images").upload(fileName, image);
      if (error) throw new Error(error.message);
      return { postId, imageUrl: supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl };
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, imageUrl }: { postId: string; imageUrl: string }) => {
      await supabase.from("posts").update({ image_url: imageUrl }).eq("id", postId);
    },
  });

  const handlePost = async () => {
    const postId = await insertPostMutation.mutateAsync();
    const { imageUrl } = await uploadImageMutation.mutateAsync(postId);
    await updatePostMutation.mutateAsync({ postId, imageUrl });
    console.log("Post Created!");
  };

  return <button onClick={handlePost} className="bg-blue-500 text-white px-4 py-2 rounded">Post</button>;
};

export default PostForm;
