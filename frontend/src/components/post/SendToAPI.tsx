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
  const { isPending, error } = useMutation({
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

  if (isPending) {
    return (
      <div className="flex items-center space-x-2 text-blue-500">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Analyzing image...</span>
      </div>
    );
  }

  return null;
};

export default SendToAPI;
