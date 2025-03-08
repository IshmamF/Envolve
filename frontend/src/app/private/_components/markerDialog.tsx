import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  

interface Props {
    issue: info 
    openDialog: boolean
    setOpenDialog: (open: boolean) => void
}


export default function MarkerDialog({issue, openDialog, setOpenDialog}: Props) {

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{issue.title}</DialogTitle>
                    <DialogDescription>
                        {`Longitude: ${issue.longitude} Latitude: ${issue.latitude}`}
                    </DialogDescription>
                </DialogHeader>
                <img
                    src={issue.image_url || "/placeholder.svg"}
                    className="w-full h-48"
                />
            </DialogContent>
        </Dialog>
    )
}

type info = {
    description: string;
    image_url: string;
    title: string;
    latitude: number | null;
    longitude: number | null;
    severity: string;
    id: number;
  };