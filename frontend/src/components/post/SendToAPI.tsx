import { useMutation } from "@tanstack/react-query";

interface ApiResponse {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
}

interface SendToAPIProps {
  image: File;
  onComplete: (data: ApiResponse) => void;
}

const SendToAPI = ({ image, onComplete }: SendToAPIProps) => {
  const { error } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json() as Promise<ApiResponse>;
    },
    onSuccess: (data) => {
      onComplete(data);
    },
  });

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-md bg-red-50">
        Error: {error instanceof Error ? error.message : 'Something went wrong'}
      </div>
    );
  }

  return null;
};

export default SendToAPI;
