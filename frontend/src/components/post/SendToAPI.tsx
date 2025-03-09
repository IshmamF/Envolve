import { useMutation } from "@tanstack/react-query";

const SendToAPI = ({ image, onComplete }: { image: File; onComplete: (data: any) => void }) => {
  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", image);
      // Need api endpoint
      const response = await fetch("/api/analyze-image", { method: "POST", body: formData });
      if (!response.ok) throw new Error("API Error");
      return response.json();
    },
    onSuccess: (data) => onComplete(data),
  });

  return mutation.isLoading ? <p className="text-lg text-blue-500">Processing...</p> : <h1>Done</h1>;
};

export default SendToAPI;
