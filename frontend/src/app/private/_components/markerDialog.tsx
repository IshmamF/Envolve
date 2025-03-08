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
                        {`Longitude: ${issue.long} Latitude: ${issue.lat}`}
                    </DialogDescription>
                </DialogHeader>
                <img
                    src={issue.img || "/placeholder.svg"}
                    className="w-full h-48"
                />
            </DialogContent>
        </Dialog>
    )
}

type info = {
    title: string,
    lat: number, 
    long: number
    img: string
}